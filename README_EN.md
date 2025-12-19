# Academic Garbage Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Are you also troubled by:

* Too many busy work assignments 😨
* Endless papers one after another 😫

Now you're saved! This is an AI-powered academic writing assistant with folder organization, keyword search, template management, and intelligent document management.

English | [简体中文](README.md)

## ✨ Key Features

### 📝 Smart Writing
- AI-assisted generation of paper outlines and content
- Content polishing and expansion
- Citation format support (GB/T 7714, APA, MLA)
- Automatic format checking and layout

### 📁 Folder Management
- Create multi-level folder categories
- Drag and move documents to folders
- Rename and delete folders
- Smart document counting

### 🔍 Search & Filter
- Real-time keyword search
- Filter documents by folder
- Multiple sorting options (modified time/created time/title)

### 📊 Document Metadata
- Automatic word count
- Paragraph counting
- Modification time tracking

### 🎨 Template System
- Built-in templates (Undergraduate thesis, Internship report, Academic paper)
- Custom template creation
- Template import/export (JSON format)

### 💾 Data Management
- Auto-save (real-time)
- Local storage (localStorage)
- Export to Word/PDF

## 🚀 Quick Start

1. **Use our website or open the editor**
   - Visit [our website](https://app.jasonliu.ggff.net/aiwriter) or open `src/editor.html` in your browser
   - No build process or dependencies required!

2. **Configure API**
   - Click the menu button (top-left) → Settings
   - Enter your OpenAI-compatible API credentials:
     - API Key
     - Base URL
     - Model Name

3. **Start writing**
   - Create a new document
   - Use AI assistance for outlines and content
   - Organize with folders and templates

### Folder Management
1. Click the menu button (top-left) to open sidebar
2. Click `+` in the folder area to create a new folder
3. Click the folder icon on a document to move it
4. Click a folder name to view documents in that category

### Search Documents
1. Enter keywords in the sidebar search box
## 📁 Project Structure

```
academic-garbage-generator/
├── LICENSE
├── README.md            # Project documentation (Chinese)
├── README_EN.md         # Project documentation (English)
├── CONTRIBUTING.md      # Contributing guide
├── CODE_OF_CONDUCT.md   # Code of conduct
├── QUICKSTART.md        # Quick start guide
├── TESTING_GUIDE.md     # Testing guide
├── docs/                # Development documentation
│   └── debug.js         # Debug tool
└── src/                 # Source code
    ├── editor.html      # Main editor page
    └── js/              # JavaScript modules
        ├── theme.js     # Theme management
        ├── utils.js     # Utility functions
        ├── storage.js   # Data persistence
        ├── prompt.js    # AI prompts
        ├── editor.js    # Editor core
        ├── ai.js        # AI generation
        ├── export.js    # Document export
        ├── ui.js        # UI controls
        └── main.js      # App initialization
```

## 📦 Module Overview

### Core Modules

- **theme.js**: Theme switching (dark/light/system)
- **utils.js**: Utility functions (UUID, formatting, etc.)
- **storage.js**: Data persistence
  - Article CRUD operations
  - Folder CRUD operations
  - Settings management
- **prompt.js**: AI prompt management

### Feature Modules

- **editor.js**: Editor
  - Auto-pagination
  - Format checking
  - Outline generation
  - FileSaver.js

## 📊 Data Structure

### Article Object
```javascript
{
  id: 'article_1234567890',
  title: 'Article Title',
  content: '<h1>...</h1><p>...</p>',
  references: ['[1] Reference 1', '[2] Reference 2'],
- [ ] Drag-and-drop document organization
- [ ] Batch operations (multi-select, batch move)
- [ ] Full-text search (search document content)
- [ ] Folder color tags
- [ ] Document tagging system
- [ ] Cloud sync functionality
- [ ] Data export/import

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📜 Code of Conduct

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## 🙏 Acknowledgmentsanagement Enhancement
- ✅ Folder categorization
- ✅ Keyword search
- ✅ Document metadata display
- ✅ Multiple sorting options
- ✅ Move documents to folders

### v2.2 - Bug Fixes
- ✅ Fixed document deletion event conflicts
- ✅ Smart switching to adjacent documents
- ✅ Auto-save AI generated content
- ✅ Sidebar state synchronization

## 🧪 Testing

For detailed testing steps, please refer to [TESTING_GUIDE.md](./TESTING_GUIDE.md)

## ⚠️ Known Limitations

1. **Storage Capacity**: localStorage has approximately 5-10MB limit
2. **Search Scope**: Currently only searches titles, not content
3. **Browser Compatibility**: Recommended modern browsers (Chrome/Edge/Firefox)

## 🎯 Roadmapents
  - Full text copy

- **ui.js**: UI Controls
  - Sidebar management
  - Article list (with search & filter)
  - Folder list
  - Settings panel

- **main.js**: App Initialization
  - Module loading
  - Event binding
  - Auto-save

## 🛠️ Tech Stack.js     # Theme management
        ├── utils.js     # Utility functions
        ├── storage.js   # Data persistence
        ├── prompt.js    # AI prompts
        ├── editor.js    # Editor core
        ├── ai.js        # AI generation
        ├── export.js    # Document export
        ├── ui.js        # UI controls
        └── main.js      # App initialization
```

## 🛠️ Tech Stack

- **Frontend**: Pure HTML/CSS/JavaScript (no framework dependencies)
- **Styling**: Tailwind CSS 3.x
- **AI Interface**: OpenAI API compatible
- **Storage**: localStorage
- **Export Libraries**: 
  - html-docx.js (Word)
  - html2pdf.js (PDF)
  - FileSaver.js

## 📖 Documentation

- [Quick Start Guide](QUICKSTART.md) - Get started in 5 minutes
- [Testing Guide](TESTING_GUIDE.md) - Feature testing instructions
- [Contributing Guide](CONTRIBUTING.md) - How to contribute
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community guidelines

## 🎯 Roadmap

- [ ] Full-text search (search document content)
- [ ] Drag-and-drop document organization
- [ ] Batch operations (multi-select, batch move)
- [ ] Folder color tags
- [ ] Document tagging system
- [ ] Cloud sync functionality
- [ ] Data export/import
- [ ] Internationalization (i18n)
- [ ] Keyboard shortcuts

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) - UI framework
- [Font Awesome](https://fontawesome.com/) - Icon library
- [html-docx-js](https://github.com/evidenceprime/html-docx-js) - Word export
- [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) - PDF export

## ⚠️ Disclaimer

This tool is for learning and writing assistance only. Please follow academic integrity principles and do not use it for any behavior that violates academic standards.

---

**Star ⭐ if this project helps you!**
