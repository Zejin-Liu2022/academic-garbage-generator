/**
 * 编辑器核心功能模块
 * 负责文档编辑、分页、格式检查、大纲生成等
 */

// 全局变量
let currentArticleId = null;
let lastSelection = null;

// 撤销功能历史栈
let historyStack = [];
const MAX_HISTORY_SIZE = 20;

function saveState() {
    const container = document.getElementById('pages-container');
    if (!container) return;
    
    historyStack.push(container.innerHTML);
    if (historyStack.length > MAX_HISTORY_SIZE) {
        historyStack.shift();
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

// 格式化文档
function formatDoc(cmd, value = null) {
    if (value) {
        document.execCommand(cmd, false, value);
    } else {
        document.execCommand(cmd);
    }
    const editor = document.getElementById('documentEditor');
    if (editor) editor.focus();
}

// 创建新页面
function createNewPage() {
    const div = document.createElement('div');
    div.className = 'paper-page content-editable outline-none';
    div.contentEditable = true;
    return div;
}

// 自动分页渲染
function renderWithPagination(titleText, htmlContent) {
    const container = document.getElementById('pages-container');
    if (!container) return;
    
    container.innerHTML = '';

    let currentPage = createNewPage();
    container.appendChild(currentPage);

    const h1 = document.createElement('h1');
    h1.style.textAlign = 'center';
    h1.style.fontSize = '22px';
    h1.style.fontWeight = 'bold';
    h1.style.marginBottom = '24px';
    h1.innerText = titleText;
    currentPage.appendChild(h1);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // 特殊处理：打散 references 容器以支持分页
    const refDiv = tempDiv.querySelector('.references');
    if (refDiv) {
        const fragment = document.createDocumentFragment();
        Array.from(refDiv.children).forEach((child) => {
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
    const PAGE_CONTENT_BOTTOM_LIMIT = 1040;

    children.forEach(child => {
        currentPage.appendChild(child);
        
        const pageRect = currentPage.getBoundingClientRect();
        const childRect = child.getBoundingClientRect();
        const relativeBottom = childRect.bottom - pageRect.top;

        if (relativeBottom > PAGE_CONTENT_BOTTOM_LIMIT) {
            currentPage.removeChild(child);
            currentPage = createNewPage();
            container.appendChild(currentPage);
            currentPage.appendChild(child);
        }
    });
    
    validateHeadingLevels();
    if (typeof updateOutline === 'function') {
        updateOutline();
    }
}

// 检查页面溢出
function checkPageOverflow(page) {
    if (!page) return;
    
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

    const PAGE_CONTENT_BOTTOM_LIMIT = 1040;
    const children = Array.from(page.children);
    let nextPageChildren = [];
    
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const relativeBottom = child.offsetTop + child.offsetHeight;
        
        if (relativeBottom > PAGE_CONTENT_BOTTOM_LIMIT) {
            if (i === 0) {
                const availableH = PAGE_CONTENT_BOTTOM_LIMIT - child.offsetTop;
                let splitSuccess = false;
                
                const splittableTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE'];
                
                if (splittableTags.includes(child.tagName)) {
                    splitSuccess = splitLongElement(child, availableH);
                } else if (child.tagName === 'UL' || child.tagName === 'OL') {
                    splitSuccess = splitListElement(child, availableH);
                }

                if (splitSuccess) {
                    const newChildren = Array.from(page.children);
                    nextPageChildren = newChildren.slice(i + 1);
                } else {
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
        
        if (nextPage.firstChild) {
            nextPageChildren.reverse().forEach(child => {
                nextPage.insertBefore(child, nextPage.firstChild);
            });
        } else {
            nextPageChildren.forEach(child => {
                nextPage.appendChild(child);
            });
        }
        
        setTimeout(() => {
            checkPageOverflow(nextPage);
        }, 50);
    }
}

// 拆分列表元素
function splitListElement(list, availableHeight) {
    const items = Array.from(list.children);
    if (items.length === 0) return false;
    
    const listRect = list.getBoundingClientRect();
    let splitIndex = -1;
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemRect = item.getBoundingClientRect();
        if ((itemRect.bottom - listRect.top) > availableHeight) {
            splitIndex = i;
            break;
        }
    }
    
    if (splitIndex <= 0) return false;
    
    const newList = list.cloneNode(false);
    const itemsToMove = items.slice(splitIndex);
    
    itemsToMove.forEach(item => newList.appendChild(item));
    
    if (list.nextSibling) {
        list.parentNode.insertBefore(newList, list.nextSibling);
    } else {
        list.parentNode.appendChild(newList);
    }
    
    return true;
}

// 拆分超长元素
function splitLongElement(element, availableHeight) {
    const text = element.innerText;
    if (text.length < 50) return false;
    
    const totalHeight = element.offsetHeight;
    if (totalHeight <= 0) return false;
    
    const ratio = availableHeight / totalHeight;
    let splitIndex = Math.floor(text.length * ratio * 0.9);
    
    if (splitIndex <= 0 || splitIndex >= text.length) return false;
    
    const safeSplit = text.lastIndexOf('。', splitIndex);
    if (safeSplit > splitIndex * 0.8) {
        splitIndex = safeSplit + 1;
    } else {
        const safeComma = text.lastIndexOf('，', splitIndex);
        if (safeComma > splitIndex * 0.8) splitIndex = safeComma + 1;
    }

    const firstPart = text.substring(0, splitIndex);
    const secondPart = text.substring(splitIndex);
    
    element.innerText = firstPart;
    
    const newElement = element.cloneNode(false);
    newElement.innerText = secondPart;
    newElement.removeAttribute('id');
    
    if (element.nextSibling) {
        element.parentNode.insertBefore(newElement, element.nextSibling);
    } else {
        element.parentNode.appendChild(newElement);
    }
    
    return true;
}

// 格式检查
function validateHeadingLevels() {
    const statusEl = document.getElementById('headingCheckStatus');
    if (!statusEl) return;

    const container = document.getElementById('pages-container');
    if (!container) return;

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
            hasH1 = true;
        }

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

// 生成大纲
function updateOutline() {
    const outlineContainer = document.getElementById('articleOutline');
    if (!outlineContainer) return;

    const container = document.getElementById('pages-container');
    if (!container) return;

    const headers = container.querySelectorAll('h1, h2, h3');
    
    if (headers.length === 0) {
        outlineContainer.innerHTML = '<p class="text-xs text-slate-400 text-center mt-4">暂无大纲内容</p>';
        return;
    }

    outlineContainer.innerHTML = '';
    
    headers.forEach((header) => {
        if (!header.innerText.trim()) return;
        
        const level = parseInt(header.tagName.substring(1));
        const item = document.createElement('div');
        const indent = (level - 1) * 12;
        
        item.className = 'text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer py-1 truncate transition-colors';
        item.style.paddingLeft = `${indent}px`;
        item.innerText = header.innerText;
        item.title = header.innerText;
        
        item.onclick = () => {
            header.scrollIntoView({ behavior: 'smooth', block: 'center' });
            header.classList.add('bg-yellow-100', 'dark:bg-yellow-900/30');
            setTimeout(() => {
                header.classList.remove('bg-yellow-100', 'dark:bg-yellow-900/30');
            }, 2000);
        };
        
        outlineContainer.appendChild(item);
    });
}

// 文档统计
function updateDocStats() {
    const container = document.getElementById('pages-container');
    if (!container) return;

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
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
        let node;
        let stop = false;
        
        while (node = walker.nextNode()) {
            if (refHeader.contains(node)) {
                stop = true;
            }
            if (node.compareDocumentPosition(refHeader) & Node.DOCUMENT_POSITION_PRECEDING) {
                stop = true;
            }
            
            if (stop) break;
            
            textToCount += node.textContent;
        }
    } else {
        textToCount = container.innerText || "";
    }
    
    const cleanText = textToCount.replace(/\s+/g, '');
    const wordCount = cleanText.length;

    const paragraphs = container.querySelectorAll('p');
    let paraCount = 0;
    paragraphs.forEach(p => {
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
    
    const wordCountEl = document.getElementById('wordCount');
    const paraCountEl = document.getElementById('paraCount');
    
    if (wordCountEl) wordCountEl.innerText = wordCount;
    if (paraCountEl) paraCountEl.innerText = paraCount;
}

// 缩放控制
let currentZoom = 100;

function updateZoom(value) {
    let zoom = Math.max(60, Math.min(500, parseInt(value)));
    currentZoom = zoom;
    
    const slider = document.getElementById('zoomSlider');
    const input = document.getElementById('zoomInput');
    
    if (slider) slider.value = zoom;
    if (input) input.value = zoom;
    
    const container = document.getElementById('pages-container');
    if (container) {
        container.style.transform = `scale(${zoom / 100})`;
        container.style.transformOrigin = 'top center';
    }
}

// 插入引用
function insertCitation(refText) {
    let rangeToUse = null;
    const currentSelection = window.getSelection();
    
    if (currentSelection.rangeCount > 0) {
        const range = currentSelection.getRangeAt(0);
        let container = range.commonAncestorContainer;
        if (container.nodeType === 3) container = container.parentNode;
        if (container.closest('.paper-page')) {
            rangeToUse = range;
            lastSelection = range;
        }
    }

    if (!rangeToUse && typeof lastSelection !== 'undefined' && lastSelection) {
        if (lastSelection.commonAncestorContainer && lastSelection.commonAncestorContainer.isConnected) {
            rangeToUse = lastSelection;
        }
    }

    if (!rangeToUse) {
        alert("请先在正文中点击您想插入引用的位置");
        return;
    }

    const cleanText = refText.replace(/^\[\d+\]\s*/, '').trim();

    const allPs = document.querySelectorAll('.paper-page p');
    let existingIndex = -1;
    let maxIndex = 0;
    let lastRefNode = null;
    let refHeaderNode = null;

    allPs.forEach(p => {
        const match = p.innerText.match(/^\[(\d+)\]/);
        if (match) {
            const idx = parseInt(match[1]);
            if (idx > maxIndex) maxIndex = idx;
            lastRefNode = p;
            
            if (p.innerText.includes(cleanText)) {
                existingIndex = idx;
            }
        }
    });
    
    if (!lastRefNode) {
        const allH3s = document.querySelectorAll('.paper-page h3, .paper-page h4');
        allH3s.forEach(h => {
            if (h.innerText.includes('参考文献') || h.innerText.includes('References')) {
                refHeaderNode = h;
            }
        });
    }

    const indexToUse = existingIndex !== -1 ? existingIndex : (maxIndex + 1);

    try {
        currentSelection.removeAllRanges();
        currentSelection.addRange(rangeToUse);

        const sup = document.createElement('sup');
        sup.innerText = `[${indexToUse}]`;
        
        rangeToUse.deleteContents();
        rangeToUse.insertNode(sup);
        
        rangeToUse.setStartAfter(sup);
        rangeToUse.setEndAfter(sup);
        
        currentSelection.removeAllRanges();
        currentSelection.addRange(rangeToUse);
        lastSelection = rangeToUse;
    } catch (e) {
        console.error("插入引用时发生微小错误（通常可忽略）:", e);
    }

    if (existingIndex === -1) {
        const newRefP = document.createElement('p');
        newRefP.style.setProperty('text-indent', '0', 'important');
        newRefP.style.marginBottom = '8px';
        newRefP.style.fontSize = '14px';
        newRefP.style.lineHeight = '1.6';
        newRefP.style.color = '#334155';
        newRefP.style.textAlign = 'left';
        newRefP.innerText = `[${indexToUse}] ${cleanText}`;

        if (lastRefNode) {
            insertAfter(newRefP, lastRefNode);
            checkPageOverflow(newRefP.closest('.paper-page'));
        } else if (refHeaderNode) {
            insertAfter(newRefP, refHeaderNode);
            checkPageOverflow(refHeaderNode.closest('.paper-page'));
        } else {
            const container = document.getElementById('pages-container');
            let lastPage = container.lastElementChild;
            
            const h4 = document.createElement('h4');
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
