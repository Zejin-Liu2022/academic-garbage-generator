/**
 * 工具函数模块
 * 包含通用的辅助函数
 */

// 生成 UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 标题自适应宽度
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
    const width = span.offsetWidth + 30; 
    document.body.removeChild(span);

    input.style.width = width + 'px';
}

// 辅助函数：在节点后插入新节点
function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

// 切换 API Key 可见性
window.toggleApiKeyVisibility = function() {
    const input = document.getElementById('apiKey');
    const icon = document.getElementById('apiKeyIcon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
};
