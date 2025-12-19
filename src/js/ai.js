/**
 * AI 功能模块
 * 负责 AI 内容生成和聊天功能
 */

// 全局变量
let abortController = null;
let lastExecutedPrompt = "";

// AI 内容生成
async function generateContent() {
    const btn = document.querySelector('button[onclick="generateContent()"]');
    
    if (abortController) {
        abortController.abort();
        abortController = null;
        return;
    }

    saveState();

    let prompt = document.getElementById('promptInput').value;
    const mode = document.getElementById('modeSelect').value;
    const outputArea = document.getElementById('generated-content');
    const placeholder = document.getElementById('placeholder-text');
    const title = document.querySelector('#documentEditor h1');
    
    const apiKey = document.getElementById('apiKey').value;
    const baseUrl = (document.getElementById('apiBaseUrl').value || "https://api.openai.com/v1").replace(/\/+$/, '');
    const modelName = document.getElementById('apiModel').value || "gpt-3.5-turbo";

    if (!apiKey) {
        alert("请先在右上角设置中填入 API Key！");
        openSettings();
        return;
    }

    // 特殊模式处理：内容润色
    if (mode === 'polish') {
        const cleanContainer = getCleanContentContainer();
        const currentContent = cleanContainer.innerText.trim();
        
        if (!currentContent) {
            alert("文档内容为空，无法进行润色。请先输入或生成一些内容。");
            return;
        }
        
        const promptInputElem = document.getElementById('promptInput');
        const placeholderText = promptInputElem ? promptInputElem.getAttribute('placeholder') : "";

        let userInstruction = "";
        if (prompt && prompt !== lastExecutedPrompt && prompt !== placeholderText) {
            userInstruction = prompt;
        } else {
            userInstruction = "请对上述内容进行学术润色，使其更加严谨、流畅，并保持原有结构。";
        }
        
        prompt = `【待润色原文】：\n${currentContent}\n\n【任务指令】：${userInstruction}`;
    } else {
        if (!prompt) {
            alert("请输入写作主题或指令！");
            return;
        }
    }

    const originalInputPrompt = document.getElementById('promptInput').value;
    if (originalInputPrompt) {
        lastExecutedPrompt = originalInputPrompt;
    }

    if(placeholder) placeholder.style.display = 'none';

    const originalBtnText = '<i class="fas fa-magic"></i> 开始生成'; 
    
    btn.disabled = false;
    btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    btn.classList.add('bg-red-500', 'hover:bg-red-600');
    btn.innerHTML = '<i class="fas fa-stop"></i> 停止生成';
    
    abortController = new AbortController();

    const loadingHtml = `
        <div class="flex flex-col items-center justify-center py-12 text-slate-400">
            <div class="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p class="text-sm animate-pulse">AI 正在思考与撰写中...</p>
        </div>
    `;
    
    const container = document.getElementById('pages-container');
    if(container) {
        container.innerHTML = '';
        const page = createNewPage();
        page.innerHTML = loadingHtml;
        container.appendChild(page);
    }

    try {
        let systemRole = PromptManager.getPrompt(mode);
        
        const style = document.getElementById('styleSelect').value;
        const wordCount = document.getElementById('wordCountInput').value;
        const citationStyle = document.getElementById('citationSelect').value;

        if (style) {
            systemRole += `\n\n写作风格要求：${style}。`;
        }

        if (wordCount) {
            systemRole += `\n目标字数要求：大约 ${wordCount} 字。请尽量满足此长度要求。`;
        }

        if (citationStyle) {
            systemRole += `\n引用规范要求：严格遵守 ${citationStyle} 格式。请在文中适当位置插入引用，并在文末列出参考文献列表。重要提示：请务必引用真实存在的学术文献，不要编造虚假引用。`;
        }
        
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

        const titleMatch = aiContent.match(/<h1>(.*?)<\/h1>/);
        let newTitle = "";
        if (titleMatch) {
            newTitle = titleMatch[1];
            const sanitizedTitle = newTitle.replace(/<\/?[^>]+(>|$)/g, "");
            
            if (title) title.innerText = sanitizedTitle;
            const headerTitle = document.getElementById('headerTitle');
            if (headerTitle) {
                headerTitle.value = sanitizedTitle;
                adjustHeaderTitleWidth();
            }
            
            aiContent = aiContent.replace(titleMatch[0], '');
        } else {
             if (title && (title.innerText === "此处将生成论文标题" || title.innerText.includes("无标题"))) {
                 title.innerText = prompt;
                 const headerTitle = document.getElementById('headerTitle');
                 if (headerTitle) {
                     headerTitle.value = prompt;
                     adjustHeaderTitleWidth();
                 }
             }
        }

        aiContent = aiContent.replace(/\[(\d+)\]/g, '<sup>[$1]</sup>');

        const sidebarRefs = document.getElementById('sidebarReferences');
        if (sidebarRefs) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = aiContent;
            const refDiv = tempDiv.querySelector('.references');
            
            if (refDiv) {
                const refs = refDiv.querySelectorAll('p');
                if (refs.length > 0) {
                    sidebarRefs.innerHTML = '';
                    refs.forEach(ref => {
                        const refText = ref.innerText;
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
                            insertCitation(refText);
                        };
                        
                        sidebarRefs.appendChild(refItem);
                    });
                }
            }
        }

        let finalHtml = aiContent;
        if (!aiContent.includes('<p>')) {
            finalHtml = aiContent.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('');
        }
        
        const displayTitle = newTitle || (title ? title.innerText : prompt);
        renderWithPagination(displayTitle, finalHtml);

        // AI 生成完成后，触发自动保存和更新统计
        if (typeof saveCurrentArticle === 'function') {
            saveCurrentArticle();
        }
        if (typeof updateDocStats === 'function') {
            updateDocStats();
        }
        
        // 每篇文章首次生成后显示AI对话引导（最多8次）
        const article = StorageManager.getArticle(currentArticleId);
        if (!article.hasGenerated && StorageManager.shouldShowChatGuide()) {
            // 标记文章已生成过
            article.hasGenerated = true;
            StorageManager.saveArticle(article);
            
            // 显示引导并增加计数
            if (typeof showChatGuide === 'function') {
                setTimeout(() => {
                    showChatGuide();
                    StorageManager.incrementChatGuideCount();
                }, 1000);
            }
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('生成已中止');
            const container = document.getElementById('pages-container');
            if(container) {
                const page = container.querySelector('.paper-page');
                if(page) {
                    page.classList.add('flex', 'flex-col', 'justify-center', 'items-center');
                    page.innerHTML = `
                        <div class="text-center">
                            <i class="fas fa-stop-circle text-6xl mb-6 text-red-200"></i>
                            <h2 class="text-2xl font-bold text-slate-600 mb-2">生成已中止</h2>
                            <p class="text-slate-400">您可以修改要求后重新点击"开始生成"</p>
                        </div>
                    `;
                }
            }
        } else {
            console.error(error);
            alert("生成出错: " + error.message);
            outputArea.innerHTML = `<div class="text-red-500 p-4 border border-red-200 bg-red-50 rounded">生成失败: ${error.message}</div>`;
        }
    } finally {
        abortController = null;
        btn.disabled = false;
        btn.innerHTML = originalBtnText;
        btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        btn.classList.remove('bg-red-500', 'hover:bg-red-600');
    }
}

// 聊天窗口控制
function openChatWindow() {
    const win = document.getElementById('chatWindow');
    if (!win || !win.classList.contains('hidden')) return;
    win.classList.remove('hidden');
    setTimeout(() => {
        win.classList.remove('scale-95', 'opacity-0');
    }, 10);
    const input = document.getElementById('chatInput');
    if (input) input.focus();
}

function closeChatWindow() {
    const win = document.getElementById('chatWindow');
    if (!win || win.classList.contains('hidden')) return;
    win.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        win.classList.add('hidden');
    }, 300);
}

function toggleChatWindow() {
    const win = document.getElementById('chatWindow');
    if (win && win.classList.contains('hidden')) {
        openChatWindow();
    } else {
        closeChatWindow();
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

        const settings = StorageManager.getSettings();
        const apiKey = settings.apiKey || document.getElementById('apiKey').value;
        const baseUrl = (settings.apiBaseUrl || document.getElementById('apiBaseUrl').value || "https://api.openai.com/v1").replace(/\/+$/, '');
        const modelName = settings.apiModel || document.getElementById('apiModel').value || "gpt-3.5-turbo";

        if (!apiKey) {
            alert("请先在设置中配置 API Key！");
            openSettings();
            return;
        }

        appendChatMessage('user', msg);
        input.value = '';

        let articleContent = "";
        const pages = document.querySelectorAll('.paper-page');
        if (pages.length > 0) {
            pages.forEach(page => {
                articleContent += page.innerText + "\n";
            });
        } else {
            const editorEl = document.getElementById('documentEditor');
            articleContent = editorEl ? editorEl.innerText : "";
        }
        
        const loadingId = appendChatMessage('ai', '<i class="fas fa-circle-notch fa-spin mr-2"></i>思考中...', true);

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
        
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();

        appendChatMessage('ai', reply);

    } catch (error) {
        console.error(error);
        alert("发送消息时发生错误: " + error.message);
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
