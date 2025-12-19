# 贡献指南

感谢您对 Academic Garbage Generator 项目的关注！我们欢迎任何形式的贡献。

## 🤝 如何贡献

### 报告问题

如果您发现了 bug 或有功能建议：

1. 在 [Issues](../../issues) 中搜索是否已有相关问题
2. 如果没有，创建新 Issue，并包含：
   - 清晰的标题和描述
   - 复现步骤（如果是 bug）
   - 预期行为和实际行为
   - 浏览器版本和操作系统信息
   - 截图或错误信息（如有）

### 提交代码

1. **Fork 本仓库**
   ```bash
   # 克隆你的 fork
   git clone https://github.com/Zejin-Liu2022/academic-garbage-generator.git
   cd academic-garbage-generator
   ```

2. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

3. **进行开发**
   - 遵循现有代码风格
   - 保持模块化结构
   - 添加必要的注释
   - 测试您的更改

4. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加某功能" 
   # 或 "fix: 修复某bug"
   ```

5. **推送并创建 Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 代码规范

### JavaScript 规范

- 使用 ES6+ 语法
- 函数名使用驼峰命名
- 常量使用大写下划线分隔
- 添加 JSDoc 注释

```javascript
/**
 * 函数描述
 * @param {string} param1 - 参数描述
 * @returns {Object} 返回值描述
 */
function myFunction(param1) {
    // 实现
}
```

### 模块组织

项目采用模块化结构，请遵循现有模块划分：

- `storage.js` - 数据持久化
- `ui.js` - UI 渲染和交互
- `editor.js` - 编辑器功能
- `ai.js` - AI 相关功能
- `export.js` - 导出功能
- `utils.js` - 工具函数
- `prompt.js` - 提示词管理
- `main.js` - 应用初始化

### HTML/CSS 规范

- 使用 Tailwind CSS 工具类
- 保持响应式设计
- 支持深色模式
- 使用语义化 HTML

### 提交信息规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式调整（不影响功能）
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具相关

示例：
```
feat: 添加文档导出为 Markdown 功能
fix: 修复文件夹删除时的数据同步问题
docs: 更新 README 中的安装说明
```

## 🧪 测试

在提交 PR 前，请确保：

1. 在浏览器中手动测试您的更改
2. 测试深色/浅色主题下的表现
3. 测试不同浏览器的兼容性（Chrome、Firefox、Safari、Edge）
4. 确保没有控制台错误

可以使用 `docs/debug.js` 进行功能检查：
```javascript
// 在浏览器控制台粘贴 docs/debug.js 的内容运行
```

## 🎯 优先级方向

我们特别欢迎以下方向的贡献：

### 高优先级
- [ ] 性能优化（大文档加载）
- [ ] 跨浏览器兼容性改进
- [ ] 无障碍访问（ARIA 标签）
- [ ] 安全性增强

### 中优先级
- [ ] 全文搜索功能
- [ ] 拖拽排序文档/文件夹
- [ ] 批量操作（多选、批量移动）
- [ ] 导出为 Markdown 格式
- [ ] 国际化（i18n）

### 欢迎尝试
- [ ] 文档标签系统
- [ ] 文件夹颜色标记
- [ ] 快捷键支持
- [ ] 打印样式优化
- [ ] 版本历史功能

## ❓ 问题反馈

如有疑问，可以通过以下方式联系：

- 提交 [Issue](../../issues)
- 在 [Discussions](../../discussions) 中讨论

## 📜 许可证

通过提交贡献，您同意您的贡献将采用 MIT 许可证授权。

---

再次感谢您的贡献！ 🎉
