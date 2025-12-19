/**
 * 主入口文件
 * 负责初始化和事件绑定
 */

// 页面加载时的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化标题宽度
    adjustHeaderTitleWidth();

    // 获取URL参数自动填充标题
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const editorTitle = document.querySelector('#documentEditor h1');
    
    if(editorTitle) {
        if(type === 'paper') editorTitle.innerText = "无标题课程论文";
        if(type === 'report') editorTitle.innerText = "无标题结课报告";
        if(type === 'creative') editorTitle.innerText = "无标题创意写作";
    }

    // 监听光标位置，用于插入引用
    document.addEventListener('selectionchange', () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            let container = range.commonAncestorContainer;
            if (container.nodeType === 3) container = container.parentNode;
            if (container.closest('.paper-page')) {
                lastSelection = range;
            }
        }
    });

    // 监听内容变化，自动分页和自动保存
    const pagesContainer = document.getElementById('pages-container');
    if (pagesContainer) {
        const observer = new MutationObserver((mutations) => {
            let changedPages = new Set();
            let shouldSave = false;
            
            mutations.forEach(mutation => {
                let target = mutation.target;
                if (target.nodeType === Node.TEXT_NODE) {
                    target = target.parentNode;
                }
                if (target && target.closest) {
                    const page = target.closest('.paper-page');
                    if (page) {
                        changedPages.add(page);
                        shouldSave = true;
                    }
                }
            });
            
            changedPages.forEach(page => {
                clearTimeout(page.checkTimeout);
                page.checkTimeout = setTimeout(() => {
                    checkPageOverflow(page);
                }, 300);
            });
            
            // 触发自动保存（防抖）
            if (shouldSave) {
                clearTimeout(pagesContainer.saveTimeout);
                pagesContainer.saveTimeout = setTimeout(() => {
                    if (typeof triggerAutoSave === 'function') {
                        triggerAutoSave();
                    }
                }, 1000);
            }
        });
        
        observer.observe(pagesContainer, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    // 初始化侧边栏现有引用的点击事件
    const existingRefButtons = document.querySelectorAll('#sidebarReferences button');
    existingRefButtons.forEach(btn => {
        btn.onmousedown = (e) => e.preventDefault();
        btn.onclick = (e) => {
            e.stopPropagation();
            const p = btn.previousElementSibling;
            if (p && p.tagName === 'P') {
                insertCitation(p.innerText);
            }
        };
    });

    // 绑定输入事件
    const headerTitleInput = document.getElementById('headerTitle');
    if(headerTitleInput) {
        headerTitleInput.addEventListener('input', () => {
            if (typeof adjustHeaderTitleWidth === 'function') {
                adjustHeaderTitleWidth();
            }
            triggerAutoSave();
        });
    }
    
    // 绑定内容编辑事件用于自动保存
    const container = document.getElementById('pages-container');
    if (container) {
        container.addEventListener('input', triggerAutoSave);
    }

    // 加载最近的文章或新建
    const articles = StorageManager.getArticles();
    if (articles.length > 0) {
        articles.sort((a, b) => b.lastModified - a.lastModified);
        loadArticle(articles[0].id);
    } else {
        createNewArticle();
    }
    
    // 渲染侧边栏列表
    renderArticleList();
    renderFolderList();
    
    // 渲染模板列表
    if (typeof renderTemplateList === 'function') {
        renderTemplateList();
    }
});

// 设置持久化
document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const apiBaseUrlInput = document.getElementById('apiBaseUrl');
    const apiModelInput = document.getElementById('apiModel');
    const themeSelect = document.getElementById('themeSelect');
    
    // Load settings
    const settings = StorageManager.getSettings();
    if (settings.apiKey) apiKeyInput.value = settings.apiKey;
    if (settings.apiBaseUrl) apiBaseUrlInput.value = settings.apiBaseUrl;
    if (settings.apiModel) apiModelInput.value = settings.apiModel;
    if (settings.theme) {
        themeSelect.value = settings.theme;
        if (typeof handleThemeChange === 'function') {
            handleThemeChange(settings.theme);
        }
    }
    
    // Save settings on change
    function saveSettings() {
        StorageManager.saveSettings({
            apiKey: apiKeyInput.value,
            apiBaseUrl: apiBaseUrlInput.value,
            apiModel: apiModelInput.value,
            theme: themeSelect.value
        });
    }
    
    if (apiKeyInput) apiKeyInput.addEventListener('change', saveSettings);
    if (apiBaseUrlInput) apiBaseUrlInput.addEventListener('change', saveSettings);
    if (apiModelInput) apiModelInput.addEventListener('change', saveSettings);
    if (themeSelect) themeSelect.addEventListener('change', () => {
        saveSettings();
    });
});

// 初始化缩放事件监听
document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
        mainContainer.addEventListener('wheel', (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                
                const delta = e.deltaY > 0 ? -10 : 10;
                const newZoom = currentZoom + delta;
                
                updateZoom(newZoom);
            }
        }, { passive: false });
    }
});

// 侧边栏调整大小功能
document.addEventListener('DOMContentLoaded', () => {
    const resizerSettings = document.getElementById('resizerSettings');
    const resizerInput = document.getElementById('resizerInput');
    const sidebarSettings = document.getElementById('sidebarSettings');
    const sidebarInput = document.getElementById('sidebarInput');
    
    function initResize(resizer, targetElement) {
        if (!resizer || !targetElement) return;

        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            
            const startY = e.clientY;
            const startHeight = targetElement.offsetHeight;
            
            if (targetElement.style.height === 'auto' || !targetElement.style.height) {
                targetElement.style.height = `${startHeight}px`;
            }

            function onMouseMove(e) {
                const dy = e.clientY - startY;
                const newHeight = startHeight - dy;
                
                if (newHeight > 100 && newHeight < 800) {
                    targetElement.style.height = `${newHeight}px`;
                }
            }

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.body.style.cursor = '';
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.body.style.cursor = 'row-resize';
        });
    }

    initResize(resizerSettings, sidebarSettings);
    initResize(resizerInput, sidebarInput);
});

// 初始化 Prompt Manager
document.addEventListener('DOMContentLoaded', () => {
    if (typeof PromptManager !== 'undefined' && PromptManager.initUI) {
        PromptManager.initUI();
    }
});
