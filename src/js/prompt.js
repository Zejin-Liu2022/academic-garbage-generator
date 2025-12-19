/**
 * Prompt 管理模块
 * 负责 AI 提示词的管理和自定义
 */

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
