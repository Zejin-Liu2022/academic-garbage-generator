/**
 * 主题管理脚本
 * 处理深色/浅色模式切换
 */

// 配置 Tailwind 使用 class 模式
// 注意：此配置需在 Tailwind CDN 加载前或加载后尽快执行
window.tailwind = window.tailwind || {};
window.tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            // 可以在这里扩展颜色
        }
    }
};

const ThemeManager = {
    // 获取当前存储的主题
    getStoredTheme: function() {
        return localStorage.getItem('theme') || 'system';
    },

    // 应用主题
    applyTheme: function(theme) {
        // 如果没有传入 theme，则从存储中获取
        if (!theme) {
            theme = this.getStoredTheme();
        }

        // 保存设置
        localStorage.setItem('theme', theme);

        // 处理 DOM 类名
        const html = document.documentElement;
        html.classList.remove('dark');

        if (theme === 'dark') {
            html.classList.add('dark');
        } else if (theme === 'system') {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                html.classList.add('dark');
            }
        }

        // 同步更新下拉框（如果存在）
        const select = document.getElementById('themeSelect');
        if (select) {
            select.value = theme;
        }
    },

    // 初始化
    init: function() {
        // 1. 应用当前主题
        this.applyTheme();

        // 2. 监听系统主题变化 (仅在 system 模式下生效)
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (this.getStoredTheme() === 'system') {
                if (e.matches) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        });
    }
};

// 立即执行初始化
ThemeManager.init();

// 导出给全局使用 (用于 onchange)
window.handleThemeChange = function(value) {
    ThemeManager.applyTheme(value);
};
