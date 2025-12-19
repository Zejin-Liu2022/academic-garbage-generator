/**
 * 数据存储管理模块
 * 负责 localStorage 的读写操作
 */

const StorageManager = {
    STORAGE_KEY: 'writer_articles',
    SETTINGS_KEY: 'writer_settings',
    FOLDERS_KEY: 'writer_folders',
    TEMPLATES_KEY: 'writer_templates',

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
    },

    // 引导提示状态 - 计数模式
    getChatGuideCount: function() {
        const count = localStorage.getItem('chat_guide_count');
        return count ? parseInt(count) : 0;
    },

    incrementChatGuideCount: function() {
        const count = this.getChatGuideCount();
        localStorage.setItem('chat_guide_count', (count + 1).toString());
        return count + 1;
    },

    shouldShowChatGuide: function() {
        return this.getChatGuideCount() < 8;
    },

    // 文件夹管理
    getFolders: function() {
        const json = localStorage.getItem(this.FOLDERS_KEY);
        return json ? JSON.parse(json) : [{ id: 'default', name: '未分类', createdAt: Date.now() }];
    },

    saveFolders: function(folders) {
        localStorage.setItem(this.FOLDERS_KEY, JSON.stringify(folders));
    },

    createFolder: function(name) {
        const folders = this.getFolders();
        const newFolder = {
            id: 'folder_' + Date.now(),
            name: name,
            createdAt: Date.now()
        };
        folders.push(newFolder);
        this.saveFolders(folders);
        return newFolder;
    },

    deleteFolder: function(folderId) {
        if (folderId === 'default') return false; // 不能删除默认文件夹
        
        const folders = this.getFolders().filter(f => f.id !== folderId);
        this.saveFolders(folders);
        
        // 将该文件夹下的文章移到未分类
        const articles = this.getArticles();
        articles.forEach(article => {
            if (article.folderId === folderId) {
                article.folderId = 'default';
            }
        });
        this.saveArticles(articles);
        return true;
    },

    renameFolder: function(folderId, newName) {
        const folders = this.getFolders();
        const folder = folders.find(f => f.id === folderId);
        if (folder) {
            folder.name = newName;
            this.saveFolders(folders);
            return true;
        }
        return false;
    },

    // 模板管理
    getTemplates: function() {
        const json = localStorage.getItem(this.TEMPLATES_KEY);
        if (json) {
            return JSON.parse(json);
        }
        return this.getDefaultTemplates();
    },

    getDefaultTemplates: function() {
        return [
            {
                id: 'template_undergraduate',
                name: '本科论文',
                isSystem: true,
                config: {
                    mode: 'write',
                    citation: 'GB/T 7714',
                    style: '学术严谨',
                    wordCount: '8000'
                },
                createdAt: Date.now()
            },
            {
                id: 'template_internship',
                name: '实习总结',
                isSystem: true,
                config: {
                    mode: 'write',
                    citation: 'GB/T 7714',
                    style: '通俗易懂',
                    wordCount: '3000'
                },
                createdAt: Date.now()
            },
            {
                id: 'template_academic',
                name: '学术论文',
                isSystem: true,
                config: {
                    mode: 'write',
                    citation: 'APA 7th',
                    style: '学术严谨',
                    wordCount: '6000'
                },
                createdAt: Date.now()
            }
        ];
    },

    saveTemplates: function(templates) {
        localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(templates));
    },

    createTemplate: function(name, config) {
        const templates = this.getTemplates();
        const newTemplate = {
            id: 'template_' + Date.now(),
            name: name,
            isSystem: false,
            config: config,
            createdAt: Date.now()
        };
        templates.push(newTemplate);
        this.saveTemplates(templates);
        return newTemplate;
    },

    deleteTemplate: function(templateId) {
        const templates = this.getTemplates().filter(t => t.id !== templateId);
        this.saveTemplates(templates);
    },

    updateTemplate: function(templateId, name, config) {
        const templates = this.getTemplates();
        const template = templates.find(t => t.id === templateId);
        if (template && !template.isSystem) {
            template.name = name;
            template.config = config;
            this.saveTemplates(templates);
        }
    },

    exportTemplates: function() {
        const templates = this.getTemplates().filter(t => !t.isSystem);
        return JSON.stringify(templates, null, 2);
    },

    importTemplates: function(jsonString) {
        try {
            const importedTemplates = JSON.parse(jsonString);
            if (!Array.isArray(importedTemplates)) {
                throw new Error('Invalid format');
            }
            const templates = this.getTemplates();
            importedTemplates.forEach(t => {
                t.id = 'template_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                t.isSystem = false;
                templates.push(t);
            });
            this.saveTemplates(templates);
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    }
};
