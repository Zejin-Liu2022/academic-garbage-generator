/**
 * AI 写作助手 - 逻辑脚本
 */

// --- Storage Manager ---
const StorageManager = {
    STORAGE_KEY: 'writer_articles',
    SETTINGS_KEY: 'writer_settings',

    // 获取所有文章
    getArticles: function() {
        const json = localStorage.getItem(this.STORAGE_KEY);
        return json ? JSON.parse(json) : [];
    },

    // 保存文章列表
    saveArticles: function(articles) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(articles));
    },

    // 获取单篇文章
    getArticle: function(id) {
        const articles = this.getArticles();
        return articles.find(a => a.id === id);
    },

    // 保存/更新单篇文章
    saveArticle: function(article) {
        const articles = this.getArticles();
        const index = articles.findIndex(a => a.id === article.id);
        
        article.lastModified = Date.now();
        
        if (index !== -1) {
            articles[index] = { ...articles[index], ...article };
        } else {
            article.createdAt = Date.now();
            articles.unshift(article); // 新文章排在前面
        }
        
        this.saveArticles(articles);
        return article;
    },

    // 删除文章
    deleteArticle: function(id) {
        const articles = this.getArticles();
        const newArticles = articles.filter(a => a.id !== id);
        this.saveArticles(newArticles);
    },

    // 保存设置
    saveSettings: function(settings) {
        const current = this.getSettings();
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify({ ...current, ...settings }));
    },

    // 获取设置
    getSettings: function() {
        const json = localStorage.getItem(this.SETTINGS_KEY);
        return json ? JSON.parse(json) : {};
    }
};

// --- Prompt Manager ---
const BASE_SYSTEM_PROMPT = `你是一个专业的学术写作助手。请严格遵循中国学术论文排版规范（GB/T 7714）返回 HTML 代码。

结构与标签要求：
1. 论文标题：使用 <h1> 标签包裹，不要包含"标题："字样。
2. 摘要：使用 <p class='abstract'><strong>摘要：</strong>[摘要内容]</p>。
3. 关键词：使用 <p class='keywords'><strong>关键词：</strong>[关键词内容]</p>。
4. 正文章节：
   - 一级标题（如"一、引言"）使用 <h2> 标签。
   - 二级标题（如"1.1 研究背景"）使用 <h3> 标签。
   - 正文段落使用 <p> 标签。
5. 参考文献：
   - 必须使用 <div class='references'> 包裹整个区域。
   - 区域标题使用 <h4>参考文献</h4>。
   - 每条文献使用 <p> 标签，格式严格遵循 GB/T 7714 (例如: [1] 作者. 标题[J]. 期刊, 年份...)。

排版注意：
- 不要返回 Markdown，只返回纯 HTML。
- 重点概念可使用 <strong> 加粗。
- 确保内容学术严谨，逻辑清晰。`;

const PromptManager = {
    STORAGE_KEY: 'writer_prompts',
    
    DEFAULT_PROMPTS: {
        outline: BASE_SYSTEM_PROMPT + "\n\n任务指令：请为用户生成一份详细的论文提纲，包含一级、二级标题。",
        write: BASE_SYSTEM_PROMPT + "\n\n任务指令：请根据用户的主题撰写一段高质量的学术内容，包含引言和正文部分。",
        polish: BASE_SYSTEM_PROMPT + "\n\n任务指令：请对用户提供的文本进行润色，使其更加学术、严谨、流畅。"
    },

    MODE_LABELS: {
        outline: "思路引导 (提纲)",
        write: "快速成文 (内容)",
        polish: "内容润色 (修改)"
    },

    // 获取所有用户 Prompt
    getUserPrompts: function() {
        const json = localStorage.getItem(this.STORAGE_KEY);
        return json ? JSON.parse(json) : {};
    },

    // 获取特定模式的 Prompt (用户自定义 > 默认)
    getPrompt: function(mode) {
        const userPrompts = this.getUserPrompts();
        return userPrompts[mode] || this.DEFAULT_PROMPTS[mode];
    },

    // 保存特定模式的 Prompt
    setPrompt: function(mode, text) {
        const userPrompts = this.getUserPrompts();
        userPrompts[mode] = text;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userPrompts));
    },

    // 重置特定模式的 Prompt
    resetPrompt: function(mode) {
        const userPrompts = this.getUserPrompts();
        delete userPrompts[mode];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userPrompts));
        return this.DEFAULT_PROMPTS[mode];
    },

    // 初始化 UI
    initUI: function() {
        const modeSelect = document.getElementById('modeSelect');
        const promptInput = document.getElementById('modePromptInput');
        const label = document.getElementById('currentModeLabel');

        if (!modeSelect || !promptInput) return;

        // 监听模式切换
        modeSelect.addEventListener('change', () => {
            this.updateUI();
        });

        // 监听输入保存
        promptInput.addEventListener('input', (e) => {
            const mode = modeSelect.value;
            this.setPrompt(mode, e.target.value);
        });

        // 初始化显示
        this.updateUI();
    },

    // 更新 UI 显示
    updateUI: function() {
        const modeSelect = document.getElementById('modeSelect');
        const promptInput = document.getElementById('modePromptInput');
        const label = document.getElementById('currentModeLabel');
        
        const mode = modeSelect.value;
        
        // 更新 Label
        if (label) label.innerText = this.MODE_LABELS[mode] || mode;
        
        // 更新 Textarea
        promptInput.value = this.getPrompt(mode);
    }
};

// 全局暴露重置函数给 HTML 按钮调用
window.resetCurrentPrompt = function() {
    const modeSelect = document.getElementById('modeSelect');
    const promptInput = document.getElementById('modePromptInput');
    const mode = modeSelect.value;
    
    const defaultText = PromptManager.resetPrompt(mode);
    promptInput.value = defaultText;
};

// 生成 UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// --- Navigation Sidebar Control ---
function openNavSidebar() {
    const sidebar = document.getElementById('navSidebar');
    const overlay = document.getElementById('navOverlay');
    
    // 每次打开时刷新列表
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

// --- Article Management ---

// 渲染文章列表
function renderArticleList() {
    const listContainer = document.getElementById('articleList');
    if (!listContainer) return;
    
    const articles = StorageManager.getArticles();
    listContainer.innerHTML = '';
    
    if (articles.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-8 text-slate-400 text-sm">
                <i class="fas fa-file-alt text-2xl mb-2 opacity-50"></i>
                <p>暂无历史文档</p>
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
        
        const isActive = article.id === currentArticleId;
        const activeClass = isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'hover:bg-slate-100 dark:hover:bg-slate-700 border-transparent hover:border-slate-200 dark:hover:border-slate-600';
        
        const item = document.createElement('div');
        item.className = `group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors border ${activeClass}`;
        item.onclick = () => loadArticle(article.id);
        
        item.innerHTML = `
            <div class="flex-1 min-w-0">
                <div class="font-medium text-slate-700 dark:text-slate-200 truncate">${article.title || '无标题文档'}</div>
                <div class="text-xs text-slate-400 mt-1">${date}</div>
            </div>
            <button onclick="deleteArticle(event, '${article.id}')" class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-2 transition-opacity" title="删除">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        
        listContainer.appendChild(item);
    });
}

// 加载文章
function loadArticle(id) {
    const article = StorageManager.getArticle(id);
    if (!article) return;
    
    currentArticleId = article.id;
    
    // 更新 UI
    const titleInput = document.getElementById('headerTitle');
    const container = document.getElementById('pages-container');
    
    if (titleInput) titleInput.value = article.title || '无标题文档';
    if (container) container.innerHTML = article.content || '';
    
    // 恢复侧边栏参考文献
    const sidebarRefs = document.getElementById('sidebarReferences');
    if (sidebarRefs) {
        sidebarRefs.innerHTML = '';
        let refsToDisplay = [];
        
        if (article.references && Array.isArray(article.references) && article.references.length > 0) {
            refsToDisplay = article.references;
        } else {
            // Fallback: 尝试从内容中提取已存在的参考文献
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = article.content || '';
            const ps = tempDiv.querySelectorAll('p');
            ps.forEach(p => {
                // 匹配 [1] 或 [10] 开头的段落
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
                    } else {
                        console.error('insertCitation function not found');
                    }
                };
                
                sidebarRefs.appendChild(refItem);
            });
        }
    }
    
    // 如果内容为空，初始化一页
    if (!container.innerHTML.trim()) {
        container.innerHTML = `
            <div id="documentEditor" class="paper-page content-editable outline-none" contenteditable="true">
                <h1 style="text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 24px;">${article.title || '此处将生成论文标题'}</h1>
                <p class="text-slate-400 italic text-center" id="placeholder-text">
                    在左侧输入主题并点击“开始生成”，AI 将为您辅助写作...<br>
                    支持自动排版和参考文献插入。
                </p>
                <div id="generated-content" class="text-justify"></div>
            </div>
        `;
    }
    
    // 调整标题宽度
    if (typeof adjustHeaderTitleWidth === 'function') {
        adjustHeaderTitleWidth();
    }
    
    // 检查格式
    validateHeadingLevels();
    // 更新大纲
    if (typeof updateOutline === 'function') {
        updateOutline();
    }
    // 更新统计
    if (typeof updateDocStats === 'function') {
        updateDocStats();
    }
    
    // 关闭侧边栏
    closeNavSidebar();
    
    // 更新保存状态
    updateSaveStatus('已加载');
}

// 新建文章
function createNewArticle() {
    // 如果当前有未保存的内容，先保存
    if (currentArticleId) {
        saveCurrentArticle();
    }
    
    // 重置 ID
    currentArticleId = generateUUID();
    
    // 重置 UI
    const titleInput = document.getElementById('headerTitle');
    const container = document.getElementById('pages-container');
    
    if (titleInput) titleInput.value = '无标题文档';
    if (container) {
        container.innerHTML = `
            <div id="documentEditor" class="paper-page content-editable outline-none" contenteditable="true">
                <h1 style="text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 24px;">此处将生成论文标题</h1>
                <p class="text-slate-400 italic text-center" id="placeholder-text">
                    在左侧输入主题并点击“开始生成”，AI 将为您辅助写作...<br>
                    支持自动排版和参考文献插入。
                </p>
                <div id="generated-content" class="text-justify"></div>
            </div>
        `;
    }
    
    if (typeof adjustHeaderTitleWidth === 'function') {
        adjustHeaderTitleWidth();
    }
    closeNavSidebar();
    
    // 立即保存一个初始状态
    saveCurrentArticle();
    updateSaveStatus('新建文档');
}

// 删除文章
function deleteArticle(event, id) {
    event.stopPropagation();
    if (!confirm('确定要删除这篇文档吗？此操作无法撤销。')) return;
    
    StorageManager.deleteArticle(id);
    renderArticleList();
    
    // 如果删除的是当前文章，新建一篇
    if (id === currentArticleId) {
        createNewArticle();
    }
}

// 自动保存逻辑
let saveTimeout;
function triggerAutoSave() {
    const status = document.getElementById('saveStatus');
    if (status) status.innerText = '保存中...';
    
    // 实时检查格式
    validateHeadingLevels();
    // 实时更新大纲
    if (typeof updateOutline === 'function') {
        updateOutline();
    }
    // 实时更新统计
    if (typeof updateDocStats === 'function') {
        updateDocStats();
    }
    
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveCurrentArticle();
    }, 1000); // 1秒防抖
}

function saveCurrentArticle() {
    if (!currentArticleId) {
        currentArticleId = generateUUID();
    }
    
    const titleInput = document.getElementById('headerTitle');
    const container = document.getElementById('pages-container');
    
    // 获取侧边栏的参考文献列表
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
        references: references, // 保存参考文献列表
        type: 'paper' // 默认为 paper
    };
    
    StorageManager.saveArticle(article);
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

// Settings Sidebar Control
function openSettings() {
    const sidebar = document.getElementById('settingsSidebar');
    const overlay = document.getElementById('settingsOverlay');
    
    // 每次打开设置时，强制刷新 Prompt UI，确保显示最新状态
    if (typeof PromptManager !== 'undefined' && PromptManager.updateUI) {
        PromptManager.updateUI();
    }

    sidebar.classList.add('shadow-2xl');
    overlay.classList.remove('hidden');
    // Small delay to allow display:block to apply before opacity transition
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

// 格式化文档
function formatDoc(cmd, value = null) {
    if (value) {
        document.execCommand(cmd, false, value);
    } else {
        document.execCommand(cmd);
    }
    // 聚焦回编辑器
    const editor = document.getElementById('documentEditor');
    if (editor) editor.focus();
}

// 全局变量用于控制请求中止
let abortController = null;
// 全局变量记录上一次执行成功的 Prompt，用于润色模式判断
let lastExecutedPrompt = "";

// 撤销功能历史栈
let historyStack = [];
const MAX_HISTORY_SIZE = 20;

function saveState() {
    const container = document.getElementById('pages-container');
    if (!container) return;
    
    // 保存当前的 HTML 内容
    historyStack.push(container.innerHTML);
    if (historyStack.length > MAX_HISTORY_SIZE) {
        historyStack.shift(); // 移除最早的记录
    }
}

function undoOperation() {
    if (historyStack.length === 0) {
        alert("没有可撤销的操作");
        return;
    }
    
    const container = document.getElementById('pages-container');
    if (!container) return;
    
    const previousState = historyStack.pop();
    container.innerHTML = previousState;
}

// 2. AI内容生成 (Editor页面 - 真实API调用)
async function generateContent() {
    const btn = document.querySelector('button[onclick="generateContent()"]');
    
    // 如果正在生成，点击按钮则中止请求
    if (abortController) {
        abortController.abort();
        abortController = null;
        return;
    }

    // 保存当前状态，以便撤销
    saveState();

    let prompt = document.getElementById('promptInput').value;
    const mode = document.getElementById('modeSelect').value;
    const outputArea = document.getElementById('generated-content');
    const placeholder = document.getElementById('placeholder-text');
    const title = document.querySelector('#documentEditor h1');
    
    // 获取 API 配置
    const apiKey = document.getElementById('apiKey').value;
    // 移除末尾斜杠，确保格式正确
    const baseUrl = (document.getElementById('apiBaseUrl').value || "https://api.openai.com/v1").replace(/\/+$/, '');
    const modelName = document.getElementById('apiModel').value || "gpt-3.5-turbo";

    if (!apiKey) {
        alert("请先在右上角设置中填入 API Key！");
        openSettings();
        return;
    }

    // 特殊模式处理：内容润色
    if (mode === 'polish') {
        // 获取当前文档的纯文本内容
        const cleanContainer = getCleanContentContainer();
        const currentContent = cleanContainer.innerText.trim();
        
        if (!currentContent) {
            alert("文档内容为空，无法进行润色。请先输入或生成一些内容。");
            return;
        }
        
        // 智能判断：
        // 1. 如果输入框内容与上一次生成时使用的 Prompt 完全一致 (残留)
        // 2. 如果输入框内容与 Placeholder 提示文本完全一致 (误填或默认提示)
        // 则忽略，使用默认润色指令。
        
        const promptInputElem = document.getElementById('promptInput');
        const placeholderText = promptInputElem ? promptInputElem.getAttribute('placeholder') : "";

        let userInstruction = "";
        if (prompt && prompt !== lastExecutedPrompt && prompt !== placeholderText) {
            userInstruction = prompt;
        } else {
            userInstruction = "请对上述内容进行学术润色，使其更加严谨、流畅，并保持原有结构。";
        }
        
        // 构建最终 Prompt
        prompt = `【待润色原文】：\n${currentContent}\n\n【任务指令】：${userInstruction}`;
        
    } else {
        // 非润色模式，必须有 prompt
        if (!prompt) {
            alert("请输入写作主题或指令！");
            return;
        }
    }

    // 记录本次使用的 Prompt (如果是润色模式，这里记录的是构建后的 prompt，
    // 但我们需要记录的是用户输入框里的原始值，以便下次比较)
    // 所以我们在修改 prompt 变量之前，先保存原始输入值
    const originalInputPrompt = document.getElementById('promptInput').value;
    if (originalInputPrompt) {
        lastExecutedPrompt = originalInputPrompt;
    }

    // 隐藏占位符
    if(placeholder) placeholder.style.display = 'none';

    // 设置加载状态
    const originalBtnText = '<i class="fas fa-magic"></i> 开始生成'; 
    
    // 切换为停止按钮状态
    btn.disabled = false;
    btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    btn.classList.add('bg-red-500', 'hover:bg-red-600');
    btn.innerHTML = '<i class="fas fa-stop"></i> 停止生成';
    
    abortController = new AbortController();

    // 显示等待动画
    const loadingHtml = `
        <div class="flex flex-col items-center justify-center py-12 text-slate-400">
            <div class="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p class="text-sm animate-pulse">AI 正在思考与撰写中...</p>
        </div>
    `;
    
    // 临时显示在第一页
    const container = document.getElementById('pages-container');
    if(container) {
        container.innerHTML = '';
        const page = createNewPage();
        page.innerHTML = loadingHtml;
        container.appendChild(page);
    }

    try {
        // 构建系统提示词 (System Prompt)
        // 优先使用 PromptManager 中的配置 (包含基础排版规则 + 模式指令)
        let systemRole = PromptManager.getPrompt(mode);
        
        // 获取风格和字数设置
        const style = document.getElementById('styleSelect').value;
        const wordCount = document.getElementById('wordCountInput').value;
        const citationStyle = document.getElementById('citationSelect').value;

        // 添加风格要求
        if (style) {
            systemRole += `\n\n写作风格要求：${style}。`;
        }

        // 添加字数要求
        if (wordCount) {
            systemRole += `\n目标字数要求：大约 ${wordCount} 字。请尽量满足此长度要求。`;
        }

        // 添加引用要求
        if (citationStyle) {
            systemRole += `\n引用规范要求：严格遵守 ${citationStyle} 格式。请在文中适当位置插入引用，并在文末列出参考文献列表。重要提示：请务必引用真实存在的学术文献，不要编造虚假引用。`;
        }
        
        // 发起 API 请求
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: modelName, 
                messages: [
                    { role: "system", content: systemRole },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            }),
            signal: abortController.signal
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || `请求失败: ${response.status}`);
        }

        const data = await response.json();
        let aiContent = data.choices[0].message.content;

        // 1. 提取并更新标题
        const titleMatch = aiContent.match(/<h1>(.*?)<\/h1>/);
        let newTitle = ""; // 新增变量保存提取的标题
        if (titleMatch) {
            newTitle = titleMatch[1];
            const sanitizedTitle = newTitle.replace(/<\/?[^>]+(>|$)/g, ""); // 去除 HTML 标签
            
            // 更新编辑器内的标题
            if (title) title.innerText = sanitizedTitle;
            // 更新顶部工具栏的标题输入框
            const headerTitle = document.getElementById('headerTitle');
            if (headerTitle) {
                headerTitle.value = sanitizedTitle;
                adjustHeaderTitleWidth();
            }
            
            // 从正文中移除标题，避免重复显示
            aiContent = aiContent.replace(titleMatch[0], '');
        } else {
            // 如果 AI 没返回标题，使用 Prompt 作为标题
             if (title && (title.innerText === "此处将生成论文标题" || title.innerText.includes("无标题"))) {
                 title.innerText = prompt;
                 const headerTitle = document.getElementById('headerTitle');
                 if (headerTitle) {
                     headerTitle.value = prompt;
                     adjustHeaderTitleWidth();
                 }
             }
        }

        // 2. 处理上标引用 [1] -> <sup>[1]</sup>
        aiContent = aiContent.replace(/\[(\d+)\]/g, '<sup>[$1]</sup>');

        // 3. 提取参考文献并更新侧边栏
        const sidebarRefs = document.getElementById('sidebarReferences');
        if (sidebarRefs) {
            // 创建临时 DOM 解析参考文献
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = aiContent;
            const refDiv = tempDiv.querySelector('.references');
            
            if (refDiv) {
                const refs = refDiv.querySelectorAll('p');
                if (refs.length > 0) {
                    sidebarRefs.innerHTML = ''; // 清空现有推荐
                    refs.forEach(ref => {
                        const refText = ref.innerText;
                        // 构建侧边栏样式
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
                        
                        // 绑定点击事件
                        const btn = refItem.querySelector('button');
                        btn.onmousedown = (e) => e.preventDefault(); // 防止点击时失去焦点
                        btn.onclick = (e) => {
                            e.stopPropagation();
                            insertCitation(refText);
                        };
                        
                        sidebarRefs.appendChild(refItem);
                    });
                }
            }
        }

        // 渲染内容
        // 如果 AI 返回的内容没有 HTML 标签，我们简单处理一下换行
        let finalHtml = aiContent;
        if (!aiContent.includes('<p>')) {
            finalHtml = aiContent.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('');
        }
        
        // 使用分页渲染
        // 优先使用 AI 生成的新标题，否则使用原有标题或 Prompt
        const displayTitle = newTitle || (title ? title.innerText : prompt);
        renderWithPagination(displayTitle, finalHtml);

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('生成已中止');
            // 移除加载动画，显示中止状态
            const container = document.getElementById('pages-container');
            if(container) {
                const page = container.querySelector('.paper-page');
                if(page) {
                    // 使用 Flex 布局实现完全居中
                    page.classList.add('flex', 'flex-col', 'justify-center', 'items-center');
                    page.innerHTML = `
                        <div class="text-center">
                            <i class="fas fa-stop-circle text-6xl mb-6 text-red-200"></i>
                            <h2 class="text-2xl font-bold text-slate-600 mb-2">生成已中止</h2>
                            <p class="text-slate-400">您可以修改要求后重新点击“开始生成”</p>
                        </div>
                    `;
                }
            }
        } else {
            console.error(error);
            alert("生成出错: " + error.message);
            // 如果出错，可以在内容区显示错误信息
            outputArea.innerHTML = `<div class="text-red-500 p-4 border border-red-200 bg-red-50 rounded">生成失败: ${error.message}</div>`;
        }
    } finally {
        // 重置控制器
        abortController = null;
        // 恢复按钮状态
        btn.disabled = false;
        btn.innerHTML = originalBtnText;
        btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        btn.classList.remove('bg-red-500', 'hover:bg-red-600');
    }
}

// 3. 标题自适应宽度
function adjustHeaderTitleWidth() {
    const input = document.getElementById('headerTitle');
    if (!input) return;

    // 创建临时 span 测量宽度
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.fontSize = window.getComputedStyle(input).fontSize;
    span.style.fontWeight = window.getComputedStyle(input).fontWeight;
    span.style.fontFamily = window.getComputedStyle(input).fontFamily;
    span.style.whiteSpace = 'pre';
    span.innerText = input.value || input.placeholder;

    document.body.appendChild(span);
    // +30px 留出一点余量 (padding + cursor)
    const width = span.offsetWidth + 30; 
    document.body.removeChild(span);

    input.style.width = width + 'px';
}

// 4. 自动分页逻辑
function renderWithPagination(titleText, htmlContent) {
    const container = document.getElementById('pages-container');
    if (!container) return;
    
    container.innerHTML = ''; // 清空现有页面

    // 创建第一页
    let currentPage = createNewPage();
    container.appendChild(currentPage);

    // 添加标题
    const h1 = document.createElement('h1');
    h1.style.textAlign = 'center';
    h1.style.fontSize = '22px';
    h1.style.fontWeight = 'bold';
    h1.style.marginBottom = '24px';
    h1.innerText = titleText;
    currentPage.appendChild(h1);

    // 解析 HTML 内容
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // 特殊处理：打散 references 容器以支持分页
    const refDiv = tempDiv.querySelector('.references');
    if (refDiv) {
        const fragment = document.createDocumentFragment();
        Array.from(refDiv.children).forEach((child) => {
            // 迁移样式，因为移出容器后会丢失 .references 下的级联样式
            if (child.tagName === 'H4') {
                child.style.textAlign = 'center';
                child.style.marginTop = '2em';
                child.style.borderTop = '1px solid #000';
                child.style.paddingTop = '1em';
                child.style.fontSize = '12pt';
                child.style.fontWeight = 'bold';
                child.style.marginBottom = '0.5em';
            } else if (child.tagName === 'P') {
                child.style.setProperty('text-indent', '0', 'important');
                child.style.marginBottom = '8px';
                child.style.fontSize = '14px';
                child.style.lineHeight = '1.6';
                child.style.color = '#334155';
                child.style.textAlign = 'left';
            }
            fragment.appendChild(child);
        });
        refDiv.parentNode.replaceChild(fragment, refDiv);
    }

    const children = Array.from(tempDiv.children);

    // A4 纸像素高度 (96dpi): 1123px
    // 上下 padding 各 20mm (approx 75px) -> 内容区域起始 ~75px, 结束 ~1048px
    // 我们设定一个内容底部的阈值，超过这个值就换页
    const PAGE_CONTENT_BOTTOM_LIMIT = 1040; 

    children.forEach(child => {
        currentPage.appendChild(child);
        
        // 使用 getBoundingClientRect 计算相对位置，避免 min-height 干扰 scrollHeight
        const pageRect = currentPage.getBoundingClientRect();
        const childRect = child.getBoundingClientRect();
        
        // 计算子元素底部相对于页面顶部的距离
        const relativeBottom = childRect.bottom - pageRect.top;

        if (relativeBottom > PAGE_CONTENT_BOTTOM_LIMIT) {
            // 移出当前页
            currentPage.removeChild(child);
            
            // 创建新页
            currentPage = createNewPage();
            container.appendChild(currentPage);
            
            // 放入新页
            currentPage.appendChild(child);
        }
    });
    
    // 检查格式
    validateHeadingLevels();
    // 更新大纲
    if (typeof updateOutline === 'function') {
        updateOutline();
    }
}

function createNewPage() {
    const div = document.createElement('div');
    div.className = 'paper-page content-editable outline-none';
    div.contentEditable = true;
    return div;
}

// 页面加载时的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化标题宽度
    adjustHeaderTitleWidth();

    // 获取URL参数自动填充标题 (从Dashboard跳转过来)
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
            // 检查选区是否在编辑器页面内
            let container = range.commonAncestorContainer;
            if (container.nodeType === 3) container = container.parentNode; // 文本节点取父级
            if (container.closest('.paper-page')) {
                lastSelection = range;
            }
        }
    });

    // 监听内容变化，自动分页 (使用 MutationObserver 以获得更强的鲁棒性)
    const pagesContainer = document.getElementById('pages-container');
    if (pagesContainer) {
        const observer = new MutationObserver((mutations) => {
            let changedPages = new Set();
            mutations.forEach(mutation => {
                let target = mutation.target;
                // 向上查找最近的 .paper-page
                if (target.nodeType === Node.TEXT_NODE) {
                    target = target.parentNode;
                }
                if (target && target.closest) {
                    const page = target.closest('.paper-page');
                    if (page) {
                        changedPages.add(page);
                    }
                }
            });
            
            changedPages.forEach(page => {
                // 防抖，避免频繁计算
                clearTimeout(page.checkTimeout);
                page.checkTimeout = setTimeout(() => {
                    checkPageOverflow(page);
                }, 300);
            });
        });
        
        observer.observe(pagesContainer, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    // 初始化侧边栏现有引用的点击事件 (针对静态 HTML 中的模拟数据)
    const existingRefButtons = document.querySelectorAll('#sidebarReferences button');
    existingRefButtons.forEach(btn => {
        btn.onmousedown = (e) => e.preventDefault(); // 防止点击时失去焦点
        btn.onclick = (e) => {
            e.stopPropagation();
            // 获取同级的前一个 p 元素的内容
            const p = btn.previousElementSibling;
            if (p && p.tagName === 'P') {
                insertCitation(p.innerText);
            }
        };
    });

// --- New Initialization Logic ---
    
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
        // 按最后修改时间排序
        articles.sort((a, b) => b.lastModified - a.lastModified);
        loadArticle(articles[0].id);
    } else {
        createNewArticle();
    }
    
    // 渲染侧边栏列表
    renderArticleList();
});

// --- Settings Persistence ---
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
        // Trigger theme change if needed
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

// --- Chat Window Control ---
function toggleChatWindow() {
    const win = document.getElementById('chatWindow');
    if (win.classList.contains('hidden')) {
        win.classList.remove('hidden');
        // 简单的动画效果
        setTimeout(() => {
            win.classList.remove('scale-95', 'opacity-0');
        }, 10);
        document.getElementById('chatInput').focus();
    } else {
        win.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            win.classList.add('hidden');
        }, 300);
    }
}

function handleChatInput(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
    }
}

async function sendChatMessage() {
    try {
        const input = document.getElementById('chatInput');
        if (!input) {
            console.error("找不到输入框 #chatInput");
            return;
        }
        
        const msg = input.value.trim();
        if (!msg) return;

        // 获取 API 配置
        const settings = StorageManager.getSettings();
        const apiKey = settings.apiKey || document.getElementById('apiKey').value;
        const baseUrl = (settings.apiBaseUrl || document.getElementById('apiBaseUrl').value || "https://api.openai.com/v1").replace(/\/+$/, '');
        const modelName = settings.apiModel || document.getElementById('apiModel').value || "gpt-3.5-turbo";

        if (!apiKey) {
            alert("请先在设置中配置 API Key！");
            openSettings();
            return;
        }

        // 1. 显示用户消息
        appendChatMessage('user', msg);
        input.value = '';

        // 2. 获取当前文章内容作为上下文
        // 兼容分页场景：合并所有页面的内容
        let articleContent = "";
        const pages = document.querySelectorAll('.paper-page');
        if (pages.length > 0) {
            pages.forEach(page => {
                articleContent += page.innerText + "\n";
            });
        } else {
            // Fallback if no pages found (unlikely)
            const editorEl = document.getElementById('documentEditor');
            articleContent = editorEl ? editorEl.innerText : "";
        }
        
        // 3. 显示 AI 思考中
        const loadingId = appendChatMessage('ai', '<i class="fas fa-circle-notch fa-spin mr-2"></i>思考中...', true);

        // 4. 真实 API 调用
        const systemPrompt = `你是一个专业的学术写作助手。
        你的任务是回答用户关于当前文章的问题，或者根据用户的指令提供修改建议。

        【重要格式要求】：
        请务必返回纯文本格式，严禁使用 Markdown 语法（如 **加粗**、# 标题、[链接] 等）。
        如果需要列表，请使用 "1. " 或 "• " 等纯文本符号。
        
        【当前文章内容】：
        ${articleContent.substring(0, 10000)} 
        (注意：如果文章过长，以上仅为前10000字符)
        
        请基于上述文章内容进行回答。如果用户要求修改，请给出具体的修改建议或范例。`;

        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: modelName,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: msg }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || `请求失败: ${response.status}`);
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;
        
        // 移除 loading 消息
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();

        // 显示 AI 回复
        appendChatMessage('ai', reply);

    } catch (error) {
        console.error(error);
        alert("发送消息时发生错误: " + error.message);
        // 尝试移除 loading
        const loadingEls = document.querySelectorAll('.fa-circle-notch');
        loadingEls.forEach(el => {
            const container = el.closest('[id^="msg-"]');
            if (container) container.innerHTML = `<span class="text-red-500">发生错误: ${error.message}</span>`;
        });
    }
}

function appendChatMessage(role, text, isLoading = false) {
    const container = document.getElementById('chatMessages');
    const id = 'msg-' + Date.now();
    
    const isUser = role === 'user';
    const alignClass = isUser ? 'flex-row-reverse' : '';
    const bgClass = isUser ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700';
    const iconHtml = isUser 
        ? '<div class="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-user text-white text-sm"></i></div>'
        : '<div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-robot text-blue-600 dark:text-blue-400 text-sm"></i></div>';

    const html = `
        <div id="${id}" class="flex gap-3 ${alignClass} animate-fade-in">
            ${iconHtml}
            <div class="${bgClass} p-3 rounded-lg ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'} shadow-sm text-sm max-w-[85%] leading-relaxed whitespace-pre-wrap">${text}</div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
    container.scrollTop = container.scrollHeight;
    
    return id;
}

// --- Zoom Control ---
let currentZoom = 100;

function updateZoom(value) {
    // Clamp value between 60 and 500
    let zoom = Math.max(60, Math.min(500, parseInt(value)));
    currentZoom = zoom;
    
    // Update UI
    const slider = document.getElementById('zoomSlider');
    const input = document.getElementById('zoomInput');
    
    if (slider) slider.value = zoom;
    if (input) input.value = zoom;
    
    // Apply transform
    const container = document.getElementById('pages-container');
    if (container) {
        container.style.transform = `scale(${zoom / 100})`;
        container.style.transformOrigin = 'top center';
        // Adjust margin to handle empty space when zooming out
        // or scrolling when zooming in
    }
}

// Initialize Zoom Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Ctrl + Wheel Zoom
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
        mainContainer.addEventListener('wheel', (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                
                // Determine direction
                // e.deltaY > 0 means scrolling down (zooming out)
                // e.deltaY < 0 means scrolling up (zooming in)
                const delta = e.deltaY > 0 ? -10 : 10;
                const newZoom = currentZoom + delta;
                
                updateZoom(newZoom);
            }
        }, { passive: false });
    }
});

// --- Helper Functions for Pagination and Citation ---

function insertCitation(refText) {
    // 1. 尝试获取当前有效选区
    let rangeToUse = null;
    const currentSelection = window.getSelection();
    
    // 优先检查当前选区是否在编辑器内
    if (currentSelection.rangeCount > 0) {
        const range = currentSelection.getRangeAt(0);
        let container = range.commonAncestorContainer;
        if (container.nodeType === 3) container = container.parentNode;
        if (container.closest('.paper-page')) {
            rangeToUse = range;
            lastSelection = range; // 更新全局记录
        }
    }

    // 如果当前选区无效（例如焦点在按钮上），尝试使用历史记录
    if (!rangeToUse && typeof lastSelection !== 'undefined' && lastSelection) {
        // 验证 lastSelection 是否还连接在文档中
        if (lastSelection.commonAncestorContainer && lastSelection.commonAncestorContainer.isConnected) {
            rangeToUse = lastSelection;
        }
    }

    if (!rangeToUse) {
        alert("请先在正文中点击您想插入引用的位置");
        return;
    }

    // 2. 清理引用文本 (移除可能存在的 [x] 前缀)
    const cleanText = refText.replace(/^\[\d+\]\s*/, '').trim();

    // 3. 查找文档中已有的引用
    const allPs = document.querySelectorAll('.paper-page p');
    let existingIndex = -1;
    let maxIndex = 0;
    let lastRefNode = null;
    let refHeaderNode = null;

    allPs.forEach(p => {
        // 假设引用段落以 [数字] 开头
        const match = p.innerText.match(/^\[(\d+)\]/);
        if (match) {
            const idx = parseInt(match[1]);
            if (idx > maxIndex) maxIndex = idx;
            lastRefNode = p;
            
            // 检查是否是同一条引用
            if (p.innerText.includes(cleanText)) {
                existingIndex = idx;
            }
        }
    });
    
    // 如果没找到引用段落，尝试找标题
    if (!lastRefNode) {
        const allH3s = document.querySelectorAll('.paper-page h3, .paper-page h4'); // Allow H4 too
        allH3s.forEach(h => {
            if (h.innerText.includes('参考文献') || h.innerText.includes('References')) {
                refHeaderNode = h;
            }
        });
    }

    // 4. 确定序号
    const indexToUse = existingIndex !== -1 ? existingIndex : (maxIndex + 1);

    // 5. 在光标处插入上标
    try {
        // 恢复选区（如果使用的是历史记录）
        currentSelection.removeAllRanges();
        currentSelection.addRange(rangeToUse);

        const sup = document.createElement('sup');
        sup.innerText = `[${indexToUse}]`;
        
        rangeToUse.deleteContents(); // 删除选中内容（如果有）
        rangeToUse.insertNode(sup);
        
        // 移动光标到插入节点之后
        rangeToUse.setStartAfter(sup);
        rangeToUse.setEndAfter(sup);
        
        // 更新选区和全局记录
        currentSelection.removeAllRanges();
        currentSelection.addRange(rangeToUse);
        lastSelection = rangeToUse;
    } catch (e) {
        console.error("插入引用时发生微小错误（通常可忽略）:", e);
    }

    // 6. 如果是新引用，添加到文末
    if (existingIndex === -1) {
        const newRefP = document.createElement('p');
        // 应用样式
        newRefP.style.setProperty('text-indent', '0', 'important');
        newRefP.style.marginBottom = '8px';
        newRefP.style.fontSize = '14px';
        newRefP.style.lineHeight = '1.6';
        newRefP.style.color = '#334155';
        newRefP.style.textAlign = 'left';
        newRefP.innerText = `[${indexToUse}] ${cleanText}`;

        if (lastRefNode) {
            // 追加到最后一条引用之后
            insertAfter(newRefP, lastRefNode);
            checkPageOverflow(newRefP.closest('.paper-page'));
        } else if (refHeaderNode) {
            // 追加到标题之后
            insertAfter(newRefP, refHeaderNode);
            checkPageOverflow(refHeaderNode.closest('.paper-page'));
        } else {
            // 没有参考文献区域，创建新的
            const container = document.getElementById('pages-container');
            let lastPage = container.lastElementChild;
            
            // 如果最后一页没有空间，可能需要新页，这里简化处理，先加进去再检查
            const h4 = document.createElement('h4'); // Use H4 as per prompt
            h4.innerText = "参考文献";
            h4.style.marginTop = '24px';
            h4.style.paddingTop = '16px';
            h4.style.borderTop = '1px solid #e2e8f0';
            h4.style.fontSize = '16px';
            h4.style.fontWeight = 'bold';
            h4.style.marginBottom = '12px';
            
            lastPage.appendChild(h4);
            lastPage.appendChild(newRefP);
            
            checkPageOverflow(lastPage);
        }
    }
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

// 检查页面溢出并移动内容
function checkPageOverflow(page) {
    if (!page) return;
    
    // 0. 预处理：规范化页面内容
    Array.from(page.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
            const p = document.createElement('p');
            p.innerText = node.textContent;
            p.style.textIndent = '2em';
            p.style.textAlign = 'justify';
            p.style.marginBottom = '1em';
            p.style.fontSize = '12pt';
            p.style.fontFamily = '"Times New Roman", "SimSun", serif';
            page.replaceChild(p, node);
        }
    });

    // 使用 offsetTop/Height 计算，不受缩放影响
    // A4 高度 297mm ≈ 1123px
    // padding-bottom 20mm ≈ 75px
    // 内容区域底部 ≈ 1048px
    const PAGE_CONTENT_BOTTOM_LIMIT = 1040;
    const children = Array.from(page.children);
    
    let nextPageChildren = [];
    
    // 找到溢出的元素
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        
        // 计算元素底部相对于页面顶部的距离 (CSS 像素)
        // 因为 .paper-page 设置了 position: relative，offsetTop 就是相对于页面的
        const relativeBottom = child.offsetTop + child.offsetHeight;
        
        if (relativeBottom > PAGE_CONTENT_BOTTOM_LIMIT) {
            // 如果是第一个元素就溢出，说明该元素本身超高，需要拆分
            if (i === 0) {
                // 计算可用高度
                // child.offsetTop 包含了 padding-top (75px)
                const availableH = PAGE_CONTENT_BOTTOM_LIMIT - child.offsetTop;
                
                // 尝试拆分
                let splitSuccess = false;
                
                // 扩大支持拆分的标签范围
                const splittableTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE'];
                
                if (splittableTags.includes(child.tagName)) {
                    splitSuccess = splitLongElement(child, availableH);
                } else if (child.tagName === 'UL' || child.tagName === 'OL') {
                    splitSuccess = splitListElement(child, availableH);
                }

                if (splitSuccess) {
                    // 拆分成功后，重新获取 children 并移动剩余部分
                    const newChildren = Array.from(page.children);
                    nextPageChildren = newChildren.slice(i + 1);
                } else {
                    // 无法拆分，只能让它溢出
                    break;
                }
            } else {
                nextPageChildren = children.slice(i);
            }
            break;
        }
    }
    
    if (nextPageChildren.length > 0) {
        const container = document.getElementById('pages-container');
        let nextPage = page.nextElementSibling;
        if (!nextPage) {
            nextPage = createNewPage();
            container.appendChild(nextPage);
        }
        
        // 将溢出元素移动到下一页开头
        if (nextPage.firstChild) {
            nextPageChildren.reverse().forEach(child => {
                nextPage.insertBefore(child, nextPage.firstChild);
            });
        } else {
            nextPageChildren.forEach(child => {
                nextPage.appendChild(child);
            });
        }
        
        // 递归检查下一页
        setTimeout(() => {
            checkPageOverflow(nextPage);
        }, 50);
    }
}

// 辅助函数：拆分列表元素
function splitListElement(list, availableHeight) {
    const items = Array.from(list.children);
    if (items.length === 0) return false;
    
    const listRect = list.getBoundingClientRect();
    let splitIndex = -1;
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemRect = item.getBoundingClientRect();
        // 修正：availableHeight 是从 childRect.top 开始算的剩余高度
        // 所以我们看 item 是否在这个高度内
        if ((itemRect.bottom - listRect.top) > availableHeight) {
            splitIndex = i;
            break;
        }
    }
    
    if (splitIndex <= 0) return false; // 第一个就放不下，或者都能放下
    
    // 创建新列表存放剩余项
    const newList = list.cloneNode(false);
    const itemsToMove = items.slice(splitIndex);
    
    itemsToMove.forEach(item => newList.appendChild(item));
    
    // 插入到当前列表后面
    if (list.nextSibling) {
        list.parentNode.insertBefore(newList, list.nextSibling);
    } else {
        list.parentNode.appendChild(newList);
    }
    
    return true;
}

// 辅助函数：拆分超长元素
function splitLongElement(element, availableHeight) {
    const text = element.innerText;
    if (text.length < 50) return false; // 太短不拆
    
    // 使用 offsetHeight 估算
    const totalHeight = element.offsetHeight;
    if (totalHeight <= 0) return false;
    
    const ratio = availableHeight / totalHeight;
    // 保守估计，只取 90%
    let splitIndex = Math.floor(text.length * ratio * 0.9);
    
    if (splitIndex <= 0 || splitIndex >= text.length) return false;
    
    // 寻找最近的标点符号
    const safeSplit = text.lastIndexOf('。', splitIndex);
    if (safeSplit > splitIndex * 0.8) {
        splitIndex = safeSplit + 1;
    } else {
        const safeComma = text.lastIndexOf('，', splitIndex);
        if (safeComma > splitIndex * 0.8) splitIndex = safeComma + 1;
    }

    const firstPart = text.substring(0, splitIndex);
    const secondPart = text.substring(splitIndex);
    
    // 修改当前元素
    element.innerText = firstPart;
    
    // 创建新元素存放剩余部分
    // 使用 cloneNode(false) 复制标签和属性，但不复制内容
    const newElement = element.cloneNode(false);
    newElement.innerText = secondPart;
    newElement.removeAttribute('id'); // 避免 ID 冲突
    
    // 插入到当前元素后面
    if (element.nextSibling) {
        element.parentNode.insertBefore(newElement, element.nextSibling);
    } else {
        element.parentNode.appendChild(newElement);
    }
    
    return true;
}

// --- Format Check Logic ---
function validateHeadingLevels() {
    const statusEl = document.getElementById('headingCheckStatus');
    if (!statusEl) return;

    const container = document.getElementById('pages-container');
    if (!container) return;

    // Get all headers in order
    const headers = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    if (headers.length === 0) {
        updateCheckStatus(statusEl, 'warning', '未检测到标题');
        return;
    }

    let isValid = true;
    let errorMsg = '';
    let previousLevel = 0;
    let hasH1 = false;

    for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        const currentLevel = parseInt(header.tagName.substring(1));

        if (currentLevel === 1) {
            if (hasH1) {
                // Multiple H1s might be okay in some contexts, but usually one title.
                // Let's allow it but maybe warn? For now, standard check.
            }
            hasH1 = true;
        }

        // Check for skipping levels (e.g. H2 -> H4)
        // Exception: The very first header can be H1 or H2? 
        // Usually starts with H1.
        
        // 特殊处理：参考文献通常作为 H4 或其他层级出现，允许跳级
        const isReferences = header.innerText.includes('参考文献');

        if (i === 0) {
            if (currentLevel > 2) {
                isValid = false;
                errorMsg = `首个标题层级过深 (H${currentLevel})`;
                break;
            }
        } else {
            if (!isReferences && currentLevel > previousLevel + 1) {
                isValid = false;
                errorMsg = `标题层级跳跃 (H${previousLevel} -> H${currentLevel})`;
                break;
            }
        }

        previousLevel = currentLevel;
    }

    if (isValid) {
        if (!hasH1) {
            updateCheckStatus(statusEl, 'warning', '缺少一级标题(论文题目)');
        } else {
            updateCheckStatus(statusEl, 'success', '标题层级已规范');
        }
    } else {
        updateCheckStatus(statusEl, 'error', errorMsg);
    }
}

function updateCheckStatus(el, type, msg) {
    let colorClass = '';
    let iconClass = '';

    if (type === 'success') {
        colorClass = 'text-green-600 dark:text-green-400';
        iconClass = 'fa-check-circle';
    } else if (type === 'warning') {
        colorClass = 'text-orange-500';
        iconClass = 'fa-exclamation-circle';
    } else {
        colorClass = 'text-red-500';
        iconClass = 'fa-times-circle';
    }

    el.className = `flex items-center gap-2 text-xs ${colorClass}`;
    el.innerHTML = `<i class="fas ${iconClass}"></i> ${msg}`;
}

// --- Outline Generation ---
function updateOutline() {
    const outlineContainer = document.getElementById('articleOutline');
    if (!outlineContainer) return;

    const container = document.getElementById('pages-container');
    if (!container) return;

    // Get all headers
    const headers = container.querySelectorAll('h1, h2, h3');
    
    if (headers.length === 0) {
        outlineContainer.innerHTML = '<p class="text-xs text-slate-400 text-center mt-4">暂无大纲内容</p>';
        return;
    }

    outlineContainer.innerHTML = '';
    
    headers.forEach((header, index) => {
        // Skip empty headers
        if (!header.innerText.trim()) return;
        
        const level = parseInt(header.tagName.substring(1));
        const item = document.createElement('div');
        
        // Indentation based on level
        // H1: 0px, H2: 12px, H3: 24px
        const indent = (level - 1) * 12;
        
        item.className = 'text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer py-1 truncate transition-colors';
        item.style.paddingLeft = `${indent}px`;
        item.innerText = header.innerText;
        item.title = header.innerText; // Tooltip for full text
        
        item.onclick = () => {
            header.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight the header temporarily
            header.classList.add('bg-yellow-100', 'dark:bg-yellow-900/30');
            setTimeout(() => {
                header.classList.remove('bg-yellow-100', 'dark:bg-yellow-900/30');
            }, 2000);
        };
        
        outlineContainer.appendChild(item);
    });
}

// --- Sidebar Resizing Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const resizerSettings = document.getElementById('resizerSettings');
    const resizerInput = document.getElementById('resizerInput');
    const sidebarSettings = document.getElementById('sidebarSettings');
    const sidebarInput = document.getElementById('sidebarInput');
    
    // Helper to handle resize
    function initResize(resizer, targetElement, isBottomResizer) {
        if (!resizer || !targetElement) return;

        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            
            const startY = e.clientY;
            const startHeight = targetElement.offsetHeight;
            
            // Set explicit height if it was auto
            if (targetElement.style.height === 'auto' || !targetElement.style.height) {
                targetElement.style.height = `${startHeight}px`;
            }

            function onMouseMove(e) {
                const dy = e.clientY - startY;
                // If resizing top edge (dragging down increases height of element below? No)
                // Resizer 1 is ABOVE Settings. Dragging DOWN moves top edge DOWN -> Height DECREASES.
                // Resizer 2 is ABOVE Input. Dragging DOWN moves top edge DOWN -> Height DECREASES.
                
                // Wait, let's visualize:
                // [Outline]
                // [Resizer 1]
                // [Settings]
                // [Resizer 2]
                // [Input]
                
                // If I drag Resizer 1 DOWN: Outline grows, Settings shrinks.
                // So newHeight = startHeight - dy.
                
                // If I drag Resizer 2 DOWN: Settings (and Outline) grows? No, Input shrinks.
                // So newHeight = startHeight - dy.
                
                const newHeight = startHeight - dy;
                
                // Min height constraint
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

    // Resizer 1 controls Settings height (dragging down shrinks settings)
    initResize(resizerSettings, sidebarSettings);
    
    // Resizer 2 controls Input height (dragging down shrinks input)
    initResize(resizerInput, sidebarInput);
});

// --- Document Statistics ---
function updateDocStats() {
    const container = document.getElementById('pages-container');
    if (!container) return;

    // 1. 识别参考文献区域的位置
    // 我们假设“参考文献”或“References”标题之后的内容都不算正文字数
    const headers = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let refHeader = null;
    
    for (let h of headers) {
        if (h.innerText.includes('参考文献') || h.innerText.includes('References')) {
            refHeader = h;
            break;
        }
    }

    let textToCount = "";
    
    if (refHeader) {
        // 如果找到了参考文献标题，我们需要获取它之前的所有文本
        // 这比较复杂，因为 DOM 是树状的。
        // 简单方法：遍历所有文本节点，如果在 refHeader 之前则累加
        
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
        let node;
        let stop = false;
        
        while (node = walker.nextNode()) {
            // 检查当前节点是否是 refHeader 或其后代
            if (refHeader.contains(node)) {
                stop = true;
            }
            // 或者当前节点在 refHeader 之后
            if (node.compareDocumentPosition(refHeader) & Node.DOCUMENT_POSITION_PRECEDING) {
                stop = true;
            }
            
            if (stop) break;
            
            textToCount += node.textContent;
        }
    } else {
        // 没找到参考文献，计算全部
        textToCount = container.innerText || "";
    }
    
    // Calculate word count (Chinese characters + English words)
    // Remove whitespace
    const cleanText = textToCount.replace(/\s+/g, '');
    const wordCount = cleanText.length;

    // Calculate paragraph count
    // Count non-empty p tags BEFORE the reference header
    const paragraphs = container.querySelectorAll('p');
    let paraCount = 0;
    paragraphs.forEach(p => {
        // Check if this p is inside or after references
        let isRef = false;
        if (refHeader) {
            if (refHeader.contains(p) || (refHeader.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING)) {
                isRef = true;
            }
        }
        
        if (!isRef && p.innerText.trim().length > 0) {
            paraCount++;
        }
    });
    
    // Update UI
    const wordCountEl = document.getElementById('wordCount');
    const paraCountEl = document.getElementById('paraCount');
    
    if (wordCountEl) wordCountEl.innerText = wordCount;
    if (paraCountEl) paraCountEl.innerText = paraCount;
}

// --- Export & Utility Functions ---

// 辅助函数：获取去分页后的纯净内容容器
function getCleanContentContainer() {
    const container = document.createElement('div');
    container.className = 'paper-page'; // 复用样式以保持字体和宽度
    
    // 重置干扰导出的样式
    container.style.minHeight = 'auto';
    container.style.height = 'auto';
    container.style.margin = '0';
    container.style.boxShadow = 'none';
    container.style.padding = '20mm'; // 保持内边距
    container.style.width = '210mm';  // 保持宽度
    container.style.backgroundColor = 'white';
    
    // 提取所有页面的内容并合并
    const pages = document.querySelectorAll('.paper-page');
    pages.forEach(page => {
        // 克隆所有子节点
        Array.from(page.children).forEach(child => {
            // 排除加载动画或临时元素（如果有）
            if (child.id !== 'placeholder-text') {
                container.appendChild(child.cloneNode(true));
            }
        });
    });
    
    return container;
}

function exportToWord() {
    const headerTitle = document.getElementById('headerTitle').value || 'document';
    
    // 1. 获取合并后的纯净内容
    const cleanContainer = getCleanContentContainer();
    
    // 修复：手动标记参考文献段落，并使用内联样式强制覆盖，确保 Word 导出时生效
    let isRef = false;
    Array.from(cleanContainer.children).forEach(child => {
        if (child.tagName === 'H4' && (child.innerText.includes('参考文献') || child.innerText.includes('References'))) {
            isRef = true;
            // 强制内联样式：标题四号 (14pt)，黑体，居中
            child.style.cssText = 'font-family: "SimHei", sans-serif !important; font-size: 14pt !important; text-align: center; margin-top: 2em; border-top: 1px solid #000; padding-top: 1em;';
        } else if (isRef) {
            // 如果遇到新的大标题，可能参考文献结束了
            if (['H1', 'H2', 'H3'].includes(child.tagName)) {
                isRef = false;
            } else if (child.tagName === 'P') {
                // 强制内联样式：内容五号 (10.5pt)，宋体，无缩进
                child.style.cssText = 'font-family: "Times New Roman", "SimSun", serif !important; font-size: 10.5pt !important; text-indent: 0 !important; margin-bottom: 4px;';
            }
        }
    });

    const contentHtml = cleanContainer.innerHTML;

    // 2. 构建带有样式的 HTML 文档
    // 修复：严格按照中国学位论文格式规范调整字体和字号
    const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                /* 全局设置：西文 Times New Roman，中文宋体 (SimSun) */
                body { 
                    font-family: "Times New Roman", serif; 
                    mso-fareast-font-family: "SimSun"; /* 强制中文使用宋体 */
                    font-size: 12pt; /* 正文小四 */
                    line-height: 1.5; 
                }
                
                /* 正文段落：小四 (12pt)，首行缩进2字符 */
                p { 
                    font-family: "Times New Roman", serif;
                    mso-fareast-font-family: "SimSun";
                    font-size: 12pt; /* 小四 */
                    text-indent: 2em; 
                    text-align: justify; 
                    margin-bottom: 0; /* 标准论文段间距通常较小，主要靠行高 */
                    line-height: 1.5; 
                }

                /* 论文大标题：二号 (22pt)，黑体 (SimHei)，居中 */
                h1 { 
                    font-family: "SimHei", sans-serif; 
                    mso-fareast-font-family: "SimHei"; /* 强制中文使用黑体 */
                    font-size: 22pt; /* 二号 */
                    font-weight: bold; 
                    text-align: center; 
                    margin-bottom: 24px; 
                    text-indent: 0 !important; 
                }

                /* 一级标题：三号 (16pt)，黑体 (SimHei) */
                h2 { 
                    font-family: "SimHei", sans-serif; 
                    mso-fareast-font-family: "SimHei"; 
                    font-size: 16pt; /* 三号 */
                    font-weight: bold; 
                    margin-top: 18pt; 
                    margin-bottom: 12pt; 
                    text-indent: 0 !important; 
                }

                /* 二级标题：四号 (14pt)，黑体 (SimHei) */
                h3 { 
                    font-family: "SimHei", sans-serif; 
                    mso-fareast-font-family: "SimHei"; 
                    font-size: 14pt; /* 四号 */
                    font-weight: bold; 
                    margin-top: 12pt; 
                    margin-bottom: 6pt; 
                    text-indent: 0 !important; 
                }

                /* 三级标题：小四 (12pt)，黑体 (SimHei) */
                h4 { 
                    font-family: "SimHei", sans-serif; 
                    mso-fareast-font-family: "SimHei"; 
                    font-size: 12pt; /* 小四 */
                    font-weight: bold; 
                    margin-top: 12pt; 
                    margin-bottom: 6pt; 
                    text-indent: 0 !important; 
                }

                /* 摘要与关键词：小四 (12pt)，宋体 */
                .abstract, .keywords { 
                    font-family: "Times New Roman", serif;
                    mso-fareast-font-family: "SimSun";
                    font-size: 12pt; /* 小四 */
                    margin-bottom: 1em; 
                    padding: 0 2em; 
                    text-indent: 0; 
                }

                /* 参考文献标题：四号 (14pt)，黑体 */
                h4.ref-title { 
                    font-family: "SimHei", sans-serif;
                    mso-fareast-font-family: "SimHei";
                    font-size: 14pt; /* 四号 */
                    text-align: center; 
                    margin-top: 2em; 
                    border-top: 1px solid #000; 
                    padding-top: 1em; 
                }

                /* 参考文献内容：五号 (10.5pt)，宋体 */
                p.ref-content { 
                    font-family: "Times New Roman", serif;
                    mso-fareast-font-family: "SimSun";
                    font-size: 10.5pt; /* 五号 */
                    text-indent: 0 !important; 
                    margin-bottom: 4px; 
                }
                
                sup { vertical-align: super; font-size: smaller; }
            </style>
        </head>
        <body>
            ${contentHtml}
        </body>
        </html>
    `;

    // 3. 转换为 Blob 并下载
    if (window.htmlDocx) {
        const converted = window.htmlDocx.asBlob(fullHtml);
        saveAs(converted, `${headerTitle}.docx`);
    } else {
        alert("导出插件加载失败，请检查网络连接");
    }
}

function exportToPDF() {
    const headerTitle = document.getElementById('headerTitle').value || 'document';
    
    // 1. 创建并显示加载遮罩
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.innerHTML = `
        <div style="font-size: 18px; color: #333; margin-bottom: 10px; font-weight: bold;">正在生成 PDF...</div>
        <div style="font-size: 14px; color: #666;">请稍候，文档较长时可能需要几秒钟</div>
    `;
    document.body.appendChild(overlay);

    // 2. 获取纯净内容
    const element = getCleanContentContainer();
    
    // 3. 调整容器样式以适配 PDF 页面
    // 关键调整：移除容器内边距，改用 PDF 页面边距
    element.style.padding = '0'; 
    // 关键调整：宽度设为 A4 宽度减去左右边距 (210mm - 20mm*2 = 170mm)
    // 这样 html2pdf 不需要缩放内容，字体大小能保持一致
    element.style.width = '170mm'; 
    element.style.margin = '0 auto'; 
    element.style.backgroundColor = 'white';
    
    // 将临时容器添加到 body (放在遮罩层之下，但在视口内)
    // 为了避免视觉干扰，我们可以把它放在绝对定位的遮罩层下面，或者直接放在文档流最后
    // 由于有全屏遮罩，用户看不到底部的这个元素
    document.body.appendChild(element);
    
    // 配置 html2pdf
    const opt = {
        // 设置统一的页边距 (上, 右, 下, 左) 单位 mm
        // 这样每一页都会有留白，不会顶头
        margin:       [15, 20, 15, 20], 
        filename:     `${headerTitle}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true }, 
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // 调用库生成
    if (window.html2pdf) {
        window.scrollTo(0, 0);
        
        html2pdf().set(opt).from(element).save().then(() => {
            // 成功后清理
            document.body.removeChild(element);
            document.body.removeChild(overlay);
        }).catch(err => {
            console.error("PDF Export Error:", err);
            alert("导出出错: " + err.message);
            // 出错也要清理
            if (document.body.contains(element)) document.body.removeChild(element);
            if (document.body.contains(overlay)) document.body.removeChild(overlay);
        });
    } else {
        alert("导出插件加载失败，请检查网络连接");
        document.body.removeChild(element);
        document.body.removeChild(overlay);
    }
}

function copyFullText() {
    // 1. 获取纯净内容
    const cleanContainer = getCleanContentContainer();
    
    // 2. 获取文本内容
    // 为了保持一定的格式（如换行），我们处理一下
    // innerText 通常会保留换行，但可能包含多余的空白
    const text = cleanContainer.innerText;
    
    // 3. 写入剪贴板
    navigator.clipboard.writeText(text).then(() => {
        // 简单的提示
        const btn = document.querySelector('button[onclick="copyFullText()"]');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check text-green-600"></i> 已复制';
        setTimeout(() => {
            btn.innerHTML = originalHtml;
        }, 2000);
    }).catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
    });
}