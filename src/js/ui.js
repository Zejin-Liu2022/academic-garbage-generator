/**
 * UI 交互模块
 * 负责侧边栏、设置面板等 UI 控制
 */

// 全局变量
let currentFolderId = null; // 当前选中的文件夹
let searchKeyword = ''; // 搜索关键词
let sortBy = 'modified'; // 排序方式: modified, created, title

// 导航侧边栏控制
function openNavSidebar() {
    const sidebar = document.getElementById('navSidebar');
    const overlay = document.getElementById('navOverlay');
    
    renderArticleList();
    
    overlay.classList.remove('hidden');
    setTimeout(() => {
        overlay.classList.remove('opacity-0');
        sidebar.classList.remove('-translate-x-full');
    }, 10);
}

function closeNavSidebar() {
    const sidebar = document.getElementById('navSidebar');
    const overlay = document.getElementById('navOverlay');
    
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('opacity-0');
    
    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 300);
}

// 设置侧边栏控制
function openSettings() {
    const sidebar = document.getElementById('settingsSidebar');
    const overlay = document.getElementById('settingsOverlay');
    
    if (typeof PromptManager !== 'undefined' && PromptManager.updateUI) {
        PromptManager.updateUI();
    }
    
    // 渲染模板列表
    if (typeof renderTemplateList === 'function') {
        renderTemplateList();
    }

    sidebar.classList.add('shadow-2xl');
    overlay.classList.remove('hidden');
    setTimeout(() => {
        overlay.classList.remove('opacity-0');
        sidebar.classList.remove('translate-x-full');
    }, 10);
}

function closeSettings() {
    const sidebar = document.getElementById('settingsSidebar');
    const overlay = document.getElementById('settingsOverlay');
    
    sidebar.classList.add('translate-x-full');
    overlay.classList.add('opacity-0');
    
    setTimeout(() => {
        overlay.classList.add('hidden');
        sidebar.classList.remove('shadow-2xl');
    }, 300);
}

// 渲染文章列表
function renderArticleList() {
    const listContainer = document.getElementById('articleList');
    if (!listContainer) return;
    
    let articles = StorageManager.getArticles();
    
    // 按文件夹筛选
    if (currentFolderId) {
        articles = articles.filter(a => (a.folderId || 'default') === currentFolderId);
    }
    
    // 按关键词搜索
    if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        articles = articles.filter(a => {
            const title = (a.title || '').toLowerCase();
            const content = (a.content || '').toLowerCase();
            return title.includes(keyword) || content.includes(keyword);
        });
    }
    
    // 排序
    articles.sort((a, b) => {
        if (sortBy === 'modified') {
            return b.lastModified - a.lastModified;
        } else if (sortBy === 'created') {
            return b.createdAt - a.createdAt;
        } else if (sortBy === 'title') {
            return (a.title || '').localeCompare(b.title || '');
        }
        return 0;
    });
    
    listContainer.innerHTML = '';
    
    if (articles.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-8 text-slate-400 text-sm">
                <i class="fas fa-file-alt text-2xl mb-2 opacity-50"></i>
                <p>${searchKeyword ? '未找到匹配的文档' : '暂无历史文档'}</p>
            </div>
        `;
        return;
    }
    
    articles.forEach(article => {
        const date = new Date(article.lastModified).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // 计算字数和段落数
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = article.content || '';
        const text = tempDiv.innerText || '';
        const wordCount = text.replace(/\s+/g, '').length;
        const paraCount = (article.content || '').match(/<p[^>]*>/g)?.length || 0;
        
        const isActive = article.id === currentArticleId;
        const activeClass = isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'hover:bg-slate-100 dark:hover:bg-slate-700 border-transparent hover:border-slate-200 dark:hover:border-slate-600';
        
        const item = document.createElement('div');
        item.className = `group relative p-3 rounded-lg cursor-pointer transition-colors border ${activeClass}`;
        
        item.innerHTML = `
            <div class="pr-20">
                <div class="font-medium text-slate-700 dark:text-slate-200 truncate text-sm mb-2">${article.title || '无标题文档'}</div>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-slate-400">
                <i class="far fa-clock" style="font-size: 10px;"></i>
                <span class="whitespace-nowrap">${date}</span>
                <span class="text-slate-300 dark:text-slate-600">|</span>
                <i class="fas fa-font" style="font-size: 9px;"></i>
                <span class="whitespace-nowrap">${wordCount}</span>
                <span class="text-slate-300 dark:text-slate-600">|</span>
                <i class="fas fa-paragraph" style="font-size: 9px;"></i>
                <span class="whitespace-nowrap">${paraCount}</span>
            </div>
            <div class="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="move-folder-btn text-slate-400 hover:text-blue-500 p-1.5 transition-colors" title="移动到文件夹">
                    <i class="fas fa-folder-open text-xs"></i>
                </button>
                <button class="delete-btn text-slate-400 hover:text-red-500 p-1.5 transition-colors" title="删除">
                    <i class="fas fa-trash-alt text-xs"></i>
                </button>
            </div>
        `;
        
        // 绑定点击加载文章事件（只在非按钮区域触发）
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.delete-btn') && !e.target.closest('.move-folder-btn')) {
                loadArticle(article.id);
            }
        });
        
        // 绑定移动到文件夹按钮事件
        const moveFolderBtn = item.querySelector('.move-folder-btn');
        moveFolderBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showFolderSelectMenu(article.id, e.currentTarget);
        });
        
        // 绑定删除按钮事件
        const deleteBtn = item.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteArticle(e, article.id);
        });
        
        listContainer.appendChild(item);
    });
}

// 渲染文件夹列表
function renderFolderList() {
    const folderContainer = document.getElementById('folderList');
    if (!folderContainer) return;
    
    const folders = StorageManager.getFolders();
    const articles = StorageManager.getArticles();
    
    folderContainer.innerHTML = '';
    
    // 添加"全部文档"选项
    const allCount = articles.length;
    const isAllActive = currentFolderId === null;
    const allActiveClass = isAllActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700';
    
    const allItem = document.createElement('div');
    allItem.className = `flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${allActiveClass}`;
    allItem.innerHTML = `
        <div class="flex items-center gap-2 flex-1 min-w-0">
            <i class="fas fa-list text-sm"></i>
            <span class="text-sm font-medium">全部文档</span>
            <span class="text-xs opacity-60">(${allCount})</span>
        </div>
    `;
    allItem.addEventListener('click', () => {
        currentFolderId = null;
        renderFolderList();
        renderArticleList();
    });
    folderContainer.appendChild(allItem);
    
    // 添加分隔线
    const divider = document.createElement('div');
    divider.className = 'h-px bg-slate-200 dark:bg-slate-600 my-2';
    folderContainer.appendChild(divider);
    
    // 渲染文件夹列表
    folders.forEach(folder => {
        const count = articles.filter(a => (a.folderId || 'default') === folder.id).length;
        const isActive = currentFolderId === folder.id;
        const activeClass = isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700';
        
        const item = document.createElement('div');
        item.className = `flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${activeClass}`;
        
        item.innerHTML = `
            <div class="flex items-center gap-2 flex-1 min-w-0">
                <i class="fas fa-folder text-sm"></i>
                <span class="text-sm truncate">${folder.name}</span>
                <span class="text-xs opacity-60">(${count})</span>
            </div>
            ${folder.id !== 'default' ? `
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="rename-folder-btn p-1 hover:text-blue-500" title="重命名">
                        <i class="fas fa-edit text-xs"></i>
                    </button>
                    <button class="delete-folder-btn p-1 hover:text-red-500" title="删除">
                        <i class="fas fa-trash-alt text-xs"></i>
                    </button>
                </div>
            ` : ''}
        `;
        
        item.classList.add('group');
        
        // 点击选择文件夹
        item.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                currentFolderId = folder.id;
                renderFolderList();
                renderArticleList();
            }
        });
        
        // 重命名
        if (folder.id !== 'default') {
            const renameBtn = item.querySelector('.rename-folder-btn');
            renameBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                const newName = prompt('请输入新的文件夹名称:', folder.name);
                if (newName && newName.trim()) {
                    StorageManager.renameFolder(folder.id, newName.trim());
                    renderFolderList();
                }
            });
            
            const deleteBtn = item.querySelector('.delete-folder-btn');
            deleteBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`确定要删除文件夹"${folder.name}"吗？文件夹内的文档将移至"未分类"`)) {
                    StorageManager.deleteFolder(folder.id);
                    if (currentFolderId === folder.id) {
                        currentFolderId = null;
                    }
                    renderFolderList();
                    renderArticleList();
                }
            });
        }
        
        folderContainer.appendChild(item);
    });
}

// 创建新文件夹
function createNewFolder() {
    const name = prompt('请输入文件夹名称:');
    if (name && name.trim()) {
        StorageManager.createFolder(name.trim());
        renderFolderList();
    }
}

// 搜索文档
function searchArticles(keyword) {
    searchKeyword = keyword.trim();
    renderArticleList();
}

// 切换排序方式
function changeSortBy(sort) {
    sortBy = sort;
    renderArticleList();
}

// 显示文件夹选择菜单
function showFolderSelectMenu(articleId, buttonElement) {
    // 移除已存在的菜单
    const existingMenu = document.getElementById('folderSelectMenu');
    if (existingMenu) existingMenu.remove();
    
    const folders = StorageManager.getFolders();
    const article = StorageManager.getArticle(articleId);
    const currentFolder = article.folderId || 'default';
    
    // 创建菜单
    const menu = document.createElement('div');
    menu.id = 'folderSelectMenu';
    menu.className = 'fixed bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 py-2 z-50 min-w-[150px]';
    
    folders.forEach(folder => {
        const isSelected = folder.id === currentFolder;
        const item = document.createElement('div');
        item.className = `px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer text-sm flex items-center gap-2 ${isSelected ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-200'}`;
        item.innerHTML = `
            <i class="fas fa-folder text-xs"></i>
            <span>${folder.name}</span>
            ${isSelected ? '<i class="fas fa-check ml-auto text-xs"></i>' : ''}
        `;
        
        item.addEventListener('click', () => {
            moveArticleToFolder(articleId, folder.id);
            menu.remove();
        });
        
        menu.appendChild(item);
    });
    
    // 智能定位菜单，避免溢出
    document.body.appendChild(menu);
    
    const rect = buttonElement.getBoundingClientRect();
    const menuHeight = menu.offsetHeight;
    const menuWidth = menu.offsetWidth;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // 垂直定位：优先向下，空间不足则向上
    let top = rect.bottom + 5;
    if (top + menuHeight > viewportHeight && rect.top - menuHeight - 5 > 0) {
        top = rect.top - menuHeight - 5;
    }
    
    // 水平定位：优先靠左，溢出则靠右
    let left = rect.left;
    if (left + menuWidth > viewportWidth) {
        left = Math.max(10, viewportWidth - menuWidth - 10);
    }
    
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    
    // 点击其他地方关闭菜单
    setTimeout(() => {
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        document.addEventListener('click', closeMenu);
    }, 10);
}

// 移动文章到文件夹
function moveArticleToFolder(articleId, folderId) {
    const article = StorageManager.getArticle(articleId);
    if (article) {
        article.folderId = folderId;
        StorageManager.saveArticle(article);
        renderFolderList();
        renderArticleList();
    }
}

// 加载文章
function loadArticle(id, closeSidebar = true) {
    const article = StorageManager.getArticle(id);
    if (!article) return;
    
    currentArticleId = article.id;
    
    const titleInput = document.getElementById('headerTitle');
    const container = document.getElementById('pages-container');
    
    if (titleInput) titleInput.value = article.title || '无标题文档';
    if (container) container.innerHTML = article.content || '';
    
    const sidebarRefs = document.getElementById('sidebarReferences');
    if (sidebarRefs) {
        sidebarRefs.innerHTML = '';
        let refsToDisplay = [];
        
        if (article.references && Array.isArray(article.references) && article.references.length > 0) {
            refsToDisplay = article.references;
        } else {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = article.content || '';
            const ps = tempDiv.querySelectorAll('p');
            ps.forEach(p => {
                if (/^\[\d+\]/.test(p.innerText)) {
                    refsToDisplay.push(p.innerText);
                }
            });
        }

        if (refsToDisplay.length > 0) {
            refsToDisplay.forEach(refText => {
                const refItem = document.createElement('div');
                refItem.className = 'group cursor-pointer mb-4';
                refItem.innerHTML = `
                    <p class="text-xs text-slate-800 hover:text-blue-600 font-medium leading-relaxed">
                        ${refText}
                    </p>
                    <button class="mt-1 text-xs text-blue-500 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition">
                        <i class="fas fa-plus"></i> 插入引用
                    </button>
                `;
                
                const btn = refItem.querySelector('button');
                btn.onmousedown = (e) => e.preventDefault();
                btn.onclick = (e) => {
                    e.stopPropagation();
                    if (typeof insertCitation === 'function') {
                        insertCitation(refText);
                    }
                };
                
                sidebarRefs.appendChild(refItem);
            });
        }
    }
    
    if (!container.innerHTML.trim()) {
        container.innerHTML = `
            <div id="documentEditor" class="paper-page content-editable outline-none" contenteditable="true">
                <h1 style="text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 24px;">${article.title || '此处将生成论文标题'}</h1>
                <p class="text-slate-400 italic text-center" id="placeholder-text">
                    在左侧输入主题并点击"开始生成"，AI 将为您辅助写作...<br>
                    支持自动排版和参考文献插入。
                </p>
                <div id="generated-content" class="text-justify"></div>
            </div>
        `;
    }
    
    if (typeof adjustHeaderTitleWidth === 'function') {
        adjustHeaderTitleWidth();
    }
    
    validateHeadingLevels();
    if (typeof updateOutline === 'function') {
        updateOutline();
    }
    if (typeof updateDocStats === 'function') {
        updateDocStats();
    }
    
    if (closeSidebar) {
        closeNavSidebar();
    }
    updateSaveStatus('已加载');
}

// 新建文章
function createNewArticle(closeSidebar = true) {
    if (currentArticleId) {
        saveCurrentArticle();
    }
    
    currentArticleId = generateUUID();
    
    const titleInput = document.getElementById('headerTitle');
    const container = document.getElementById('pages-container');
    
    if (titleInput) titleInput.value = '无标题文档';
    if (container) {
        container.innerHTML = `
            <div id="documentEditor" class="paper-page content-editable outline-none" contenteditable="true">
                <h1 style="text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 24px;">此处将生成论文标题</h1>
                <p class="text-slate-400 italic text-center" id="placeholder-text">
                    在左侧输入主题并点击"开始生成"，AI 将为您辅助写作...<br>
                    支持自动排版和参考文献插入。
                </p>
                <div id="generated-content" class="text-justify"></div>
            </div>
        `;
    }
    
    // 清空参考文献侧边栏
    const sidebarRefs = document.getElementById('sidebarReferences');
    if (sidebarRefs) {
        sidebarRefs.innerHTML = '<p id="no-ref-hint" class="text-xs text-slate-400 text-center mt-4">暂无可用文献</p>';
    }
    
    if (typeof adjustHeaderTitleWidth === 'function') {
        adjustHeaderTitleWidth();
    }
    
    // 清空大纲
    if (typeof updateOutline === 'function') {
        updateOutline();
    }
    
    if (closeSidebar) {
        closeNavSidebar();
    }
    
    saveCurrentArticle();
    updateSaveStatus('新建文档');
}

// 删除文章
function deleteArticle(event, id) {
    event.stopPropagation();
    if (!confirm('确定要删除这篇文档吗？此操作无法撤销。')) return;
    
    const isDeletingCurrent = (id === currentArticleId);
    
    // 如果删除的是当前文档，需要找到下一个要显示的文档
    let nextArticleId = null;
    if (isDeletingCurrent) {
        const articles = StorageManager.getArticles();
        const currentIndex = articles.findIndex(a => a.id === id);
        
        if (articles.length > 1) {
            // 有多个文档，选择下一个或上一个
            if (currentIndex < articles.length - 1) {
                // 如果删除的不是最后一个，选择下一个
                nextArticleId = articles[currentIndex + 1].id;
            } else {
                // 如果删除的是最后一个，选择上一个
                nextArticleId = articles[currentIndex - 1].id;
            }
        }
        // 如果只有一个文档（即将删除的），nextArticleId 保持为 null，后续会创建新文档
    }
    
    // 执行删除
    StorageManager.deleteArticle(id);
    
    // 处理删除后的文档切换
    if (isDeletingCurrent) {
        if (nextArticleId) {
            // 加载下一个文档，不关闭侧边栏
            loadArticle(nextArticleId, false);
        } else {
            // 没有其他文档了，创建新文档，不关闭侧边栏
            createNewArticle(false);
        }
    }
    
    // 切换完成后再刷新列表，确保选中状态正确
    renderArticleList();
}

// 自动保存逻辑
let saveTimeout;
function triggerAutoSave() {
    const status = document.getElementById('saveStatus');
    if (status) status.innerText = '保存中...';
    
    validateHeadingLevels();
    if (typeof updateOutline === 'function') {
        updateOutline();
    }
    if (typeof updateDocStats === 'function') {
        updateDocStats();
    }
    
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveCurrentArticle();
    }, 1000);
}

function saveCurrentArticle() {
    if (!currentArticleId) {
        currentArticleId = generateUUID();
    }
    
    const titleInput = document.getElementById('headerTitle');
    const container = document.getElementById('pages-container');
    
    const sidebarRefs = document.getElementById('sidebarReferences');
    let references = [];
    if (sidebarRefs) {
        const refItems = sidebarRefs.querySelectorAll('.group p');
        refItems.forEach(p => {
            references.push(p.innerText);
        });
    }
    
    const article = {
        id: currentArticleId,
        title: titleInput ? titleInput.value : '无标题文档',
        content: container ? container.innerHTML : '',
        references: references,
        type: 'paper',
        folderId: currentFolderId || 'default'
    };
    
    StorageManager.saveArticle(article);
    
    // 如果侧边栏是打开的，更新文章列表显示
    const navSidebar = document.getElementById('navSidebar');
    if (navSidebar && !navSidebar.classList.contains('-translate-x-full')) {
        renderArticleList();
    }
    
    updateSaveStatus('已保存');
}

function updateSaveStatus(msg) {
    const status = document.getElementById('saveStatus');
    if (status) {
        status.innerText = msg;
        status.classList.remove('text-slate-400');
        status.classList.add('text-green-500');
        setTimeout(() => {
            status.classList.remove('text-green-500');
            status.classList.add('text-slate-400');
        }, 2000);
    }
}

// 模板管理功能
function renderTemplateList() {
    const container = document.getElementById('templateList');
    if (!container) return;
    
    const templates = StorageManager.getTemplates();
    container.innerHTML = '';
    
    templates.forEach(template => {
        const item = document.createElement('div');
        item.className = 'group flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors border border-slate-200 dark:border-slate-600 mb-2';
        
        item.innerHTML = `
            <div class="flex-1 min-w-0" onclick="applyTemplate('${template.id}')">
                <div class="font-medium text-slate-700 dark:text-slate-200 text-sm">${template.name}</div>
                <div class="text-xs text-slate-400 mt-1">
                    ${template.config.citation} · ${template.config.style} · ${template.config.wordCount}字
                </div>
            </div>
            ${!template.isSystem ? `
                <button onclick="deleteTemplate(event, '${template.id}')" class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 transition-opacity" title="删除">
                    <i class="fas fa-trash-alt text-xs"></i>
                </button>
            ` : `
                <span class="text-xs text-blue-500 dark:text-blue-400 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded">系统</span>
            `}
        `;
        
        container.appendChild(item);
    });
}

function applyTemplate(templateId) {
    const templates = StorageManager.getTemplates();
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    const config = template.config;
    
    // 应用配置到UI
    const modeSelect = document.getElementById('modeSelect');
    const citationSelect = document.getElementById('citationSelect');
    const styleSelect = document.getElementById('styleSelect');
    const wordCountInput = document.getElementById('wordCountInput');
    
    if (modeSelect) modeSelect.value = config.mode || 'write';
    if (citationSelect) citationSelect.value = config.citation || 'GB/T 7714';
    if (styleSelect) styleSelect.value = config.style || '学术严谨';
    if (wordCountInput) wordCountInput.value = config.wordCount || '2000';
    
    // 更新模式标签
    if (typeof PromptManager !== 'undefined' && PromptManager.updateUI) {
        PromptManager.updateUI();
    }
    
    // 关闭设置侧边栏
    closeSettings();
    
    // 提示
    alert(`已应用模板：${template.name}`);
}

function saveAsTemplate() {
    const name = prompt('请输入模板名称：');
    if (!name || !name.trim()) return;
    
    // 获取当前配置
    const modeSelect = document.getElementById('modeSelect');
    const citationSelect = document.getElementById('citationSelect');
    const styleSelect = document.getElementById('styleSelect');
    const wordCountInput = document.getElementById('wordCountInput');
    
    const config = {
        mode: modeSelect ? modeSelect.value : 'write',
        citation: citationSelect ? citationSelect.value : 'GB/T 7714',
        style: styleSelect ? styleSelect.value : '学术严谨',
        wordCount: wordCountInput ? wordCountInput.value : '2000'
    };
    
    StorageManager.createTemplate(name.trim(), config);
    renderTemplateList();
    alert(`模板"${name.trim()}"已保存！`);
}

function deleteTemplate(event, templateId) {
    event.stopPropagation();
    if (!confirm('确定要删除此模板吗？')) return;
    
    StorageManager.deleteTemplate(templateId);
    renderTemplateList();
}

function exportTemplates() {
    const json = StorageManager.exportTemplates();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `writing-templates-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importTemplates() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const success = StorageManager.importTemplates(event.target.result);
            if (success) {
                renderTemplateList();
                alert('模板导入成功！');
            } else {
                alert('导入失败，请检查文件格式！');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// AI对话引导弹窗
function showChatGuide() {
    const guide = document.getElementById('chatGuide');
    if (!guide) return;
    
    guide.classList.remove('hidden');
    setTimeout(() => {
        guide.classList.add('opacity-100', 'scale-100');
    }, 10);
    
    // 5秒后自动隐藏
    setTimeout(() => {
        hideChatGuide();
    }, 8000);
}

function hideChatGuide() {
    const guide = document.getElementById('chatGuide');
    if (!guide) return;
    
    guide.classList.remove('opacity-100', 'scale-100');
    setTimeout(() => {
        guide.classList.add('hidden');
    }, 300);
}
