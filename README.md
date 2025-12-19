# Academic Garbage Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

你是否也有以下烦恼：

* 水课作业太多😨
* 写不完的论文接二连三😫

现在你有救了！这是一个基于 AI 的学术写作辅助工具，支持文件夹分类、关键词搜索、模板管理和智能文档管理。

[English](README_EN.md) | 简体中文

## ✨ 主要特性

### 📝 智能写作
- AI 辅助生成论文提纲、正文内容
- 内容润色和扩写
- 引用规范支持（GB/T 7714、APA、MLA）
- 自动格式检查和排版

### 📁 文件夹管理
- 创建多层级文件夹分类
- 拖拽移动文档到文件夹
- 文件夹重命名和删除
- 智能文档计数

### 🔍 搜索与筛选
- 实时关键词搜索
- 按文件夹筛选文档
- 多种排序方式（修改时间/创建时间/标题）

### 📊 文档元数据
- 自动统计字数
- 段落数计数
- 修改时间记录

### 💾 数据管理
- 自动保存（实时）
- 本地存储（localStorage）
- 导出为 Word/PDF

## 项目结构

```
academic-garbage-generator/
├── LICENSE
├── README.md            # 项目说明（中文）
├── README_EN.md         # 项目说明（英文）
├── CONTRIBUTING.md      # 贡献指南
├── CODE_OF_CONDUCT.md   # 行为准则
├── QUICKSTART.md        # 快速开始
├── TESTING_GUIDE.md     # 测试指南
├── docs/                # 开发文档
│   └── debug.js         # 调试工具
└── src/                 # 源代码
    ├── editor.html      # 主编辑器页面
    └── js/              # JavaScript 模块
        ├── theme.js     # 主题管理
        ├── utils.js     # 工具函数
        ├── storage.js   # 数据持久化（含文件夹管理）
        ├── prompt.js    # AI 提示词
        ├── editor.js    # 编辑器核心
        ├── ai.js        # AI 生成
        ├── export.js    # 文档导出
        ├── ui.js        # UI 控制（含搜索、排序）
        └── main.js      # 应用入口
```

## 模块说明

### 核心模块

- **theme.js**: 主题切换（深色/浅色/跟随系统）
- **utils.js**: 通用工具（UUID、格式化等）
- **storage.js**: 数据持久化
  - 文章 CRUD 操作
  - 文件夹 CRUD 操作
  - 设置管理
- **prompt.js**: AI 提示词管理

### 功能模块

- **editor.js**: 编辑器
  - 自动分页
  - 格式检查
  - 大纲生成
  - 引用插入

- **ai.js**: AI 功能
  - 内容生成（提纲/正文/润色）
  - 聊天助手
  - 流式响应

- **export.js**: 导出
  - Word 文档
  - PDF 文档
  - 全文复制

- **ui.js**: 界面控制
  - 侧边栏管理
  - 文章列表（带搜索、筛选）
  - 文件夹列表
  - 设置面板

- **main.js**: 应用初始化
  - 模块加载
  - 事件绑定
  - 自动保存

## 使用方法

### 快速开始
1. 使用我们的[网站](https://app.jasonliu.ggff.net/aiwriter)或打开 `src/editor.html`
2. 配置 API（设置 → API 配置）
3. 开始写作

### 文件夹管理
1. 点击左上角菜单打开侧边栏
2. 点击文件夹区域的 `+` 创建文件夹
3. 点击文档的文件夹图标移动文档
4. 点击文件夹名称查看该分类下的文档

### 搜索文档
1. 在侧边栏搜索框输入关键词
2. 实时过滤匹配的文档
3. 结合文件夹筛选使用

### 排序文档
使用排序下拉菜单选择：
- 按修改时间（默认）
- 按创建时间
- 按标题排序

## 技术栈

- **前端框架**: 纯 HTML/CSS/JavaScript（无依赖框架）
- **样式**: Tailwind CSS 3.x
- **AI 接口**: OpenAI API 兼容
- **存储**: localStorage
- **导出库**: 
  - html-docx.js (Word)
  - html2pdf.js (PDF)
  - FileSaver.js

## 数据结构

### 文章对象
```javascript
{
  id: 'article_1234567890',
  title: '文章标题',
  content: '<h1>...</h1><p>...</p>',
  references: ['[1] 引用1', '[2] 引用2'],
  type: 'paper',
  folderId: 'folder_123',  // 所属文件夹
  createdAt: 1234567890,
  lastModified: 1234567890
}
```

### 文件夹对象
```javascript
{
  id: 'folder_123' | 'default',
  name: '文件夹名称',
  createdAt: 1234567890
}
```

## 优化历程

### v1.0 - 初始版本
- 基础写作功能
- AI 生成

### v2.0 - 模块化重构
- 将 2171 行单一文件拆分为 8 个模块
- 职责分离，易于维护

### v2.1 - 文档管理增强
- ✅ 文件夹分类管理
- ✅ 关键词搜索
- ✅ 文档元数据显示
- ✅ 多种排序方式
- ✅ 移动文档到文件夹

### v2.2 - Bug 修复
- ✅ 修复删除文档事件冲突
- ✅ 智能切换相邻文档
- ✅ 自动保存 AI 生成内容
- ✅ 侧边栏状态同步

## 测试指南

详细测试步骤请参考 [TESTING_GUIDE.md](./TESTING_GUIDE.md)

## 已知限制

1. **存储容量**: localStorage 约 5-10MB 限制
2. **搜索范围**: 目前仅搜索标题，不搜索正文
3. **浏览器兼容**: 推荐使用现代浏览器（Chrome/Edge/Firefox）

## 后续规划

- [ ] 拖拽文档到文件夹
- [ ] 批量操作（多选、批量移动）
- [ ] 全文搜索（搜索正文内容）
- [ ] 文件夹颜色标签
- [ ] 文档标签系统
- [ ] 云同步功能
- [ ] 数据导出/导入

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 贡献

欢迎贡献！请阅读 [贡献指南](CONTRIBUTING.md) 了解详情。

## 行为准则

请遵守我们的 [行为准则](CODE_OF_CONDUCT.md)。

## 致谢

- [Tailwind CSS](https://tailwindcss.com/) - UI 框架
- [Font Awesome](https://fontawesome.com/) - 图标库
- [html-docx-js](https://github.com/evidenceprime/html-docx-js) - Word 导出
- [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) - PDF 导出

## 免责声明

本工具仅用于学习和辅助写作，请遵守学术诚信原则，不要用于任何违反学术规范的行为。

---

**Star ⭐ 如果这个项目对你有帮助！**
