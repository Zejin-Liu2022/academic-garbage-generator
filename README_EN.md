# Academic Garbage Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Do you also have these troubles:

* Too many assignments for easy courses 😨
* Endless papers one after another 😫

Now you're saved! This is an AI-based academic writing assistant tool that supports folder organization, keyword search, template management, and intelligent document management.

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

### 💾 Data Management
- Auto-save (real-time)
- Local storage (localStorage)
- Export to Word/PDF

## Project Structure

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
│   └── debug.js         # Debug tools
└── src/                 # Source code
    ├── editor.html      # Main editor page
    └── js/              # JavaScript modules
        ├── theme.js     # Theme management
        ├── utils.js     # Utility functions
        ├── storage.js   # Data persistence (includes folder management)
        ├── prompt.js    # AI prompts
        ├── editor.js    # Editor core
        ├── ai.js        # AI generation
        ├── export.js    # Document export
        ├── ui.js        # UI control (includes search, sorting)
        └── main.js      # Application entry point
```

## Module Description

### Core Modules

- **theme.js**: Theme switching (dark/light/system)
- **utils.js**: Common utilities (UUID, formatting, etc.)
- **storage.js**: Data persistence
  - Article CRUD operations
  - Folder CRUD operations
  - Settings management
- **prompt.js**: AI prompt management

### Feature Modules

- **editor.js**: Editor
  - Auto pagination
  - Format checking
  - Outline generation
  - Citation insertion

- **ai.js**: AI features
  - Content generation (outline/body/polish)
  - Chat assistant
  - Streaming responses

- **export.js**: Export
  - Word documents
  - PDF documents
  - Full text copy

- **ui.js**: Interface control
  - Sidebar management
  - Article list (with search, filtering)
  - Folder list
  - Settings panel

- **main.js**: Application initialization
  - Module loading
  - Event binding
  - Auto-save

## Usage

### Quick Start
1. Use our [website](https://app.jasonliu.ggff.net/aiwriter) or open `src/editor.html`
2. Configure API (Settings → API Configuration)
3. Start writing

### Folder Management
1. Click the menu in the top left to open the sidebar
2. Click the `+` in the folder area to create a folder
3. Click the folder icon on a document to move it
4. Click a folder name to view documents in that category

### Search Documents
1. Enter keywords in the sidebar search box
2. Real-time filtering of matching documents
3. Use in combination with folder filtering

### Sort Documents
Use the sort dropdown to select:
- By modified time (default)
- By created time
- By title

## Tech Stack

- **Frontend Framework**: Pure HTML/CSS/JavaScript (no dependencies)
- **Styling**: Tailwind CSS 3.x
- **AI Interface**: OpenAI API compatible
- **Storage**: localStorage
- **Export Libraries**: 
  - html-docx.js (Word)
  - html2pdf.js (PDF)
  - FileSaver.js

## Data Structure

### Article Object
```javascript
{
  id: 'article_1234567890',
  title: 'Article Title',
  content: '<h1>...</h1><p>...</p>',
  references: ['[1] Reference 1', '[2] Reference 2'],
  type: 'paper',
  folderId: 'folder_123',  // Parent folder
  createdAt: 1234567890,
  lastModified: 1234567890
}
```

### Folder Object
```javascript
{
  id: 'folder_123' | 'default',
  name: 'Folder Name',
  createdAt: 1234567890
}
```

## Development History

### v1.0 - Initial Release
- Basic writing features
- AI generation

### v2.0 - Modular Refactoring
- Split 2171-line monolithic file into 8 modules
- Separation of concerns, easier to maintain

### v2.1 - Enhanced Document Management
- ✅ Folder categorization
- ✅ Keyword search
- ✅ Document metadata display
- ✅ Multiple sorting options
- ✅ Move documents to folders

### v2.2 - Bug Fixes
- ✅ Fixed delete document event conflicts
- ✅ Smart switching to adjacent documents
- ✅ Auto-save AI generated content
- ✅ Sidebar state synchronization

## Testing Guide

For detailed testing steps, see [TESTING_GUIDE.md](./TESTING_GUIDE.md)

## Known Limitations

1. **Storage Capacity**: localStorage has approximately 5-10MB limit
2. **Search Scope**: Currently only searches titles, not content
3. **Browser Compatibility**: Recommended to use modern browsers (Chrome/Edge/Firefox)

## Future Plans

- [ ] Drag and drop documents to folders
- [ ] Batch operations (multi-select, batch move)
- [ ] Full-text search (search document content)
- [ ] Folder color labels
- [ ] Document tagging system
- [ ] Cloud synchronization
- [ ] Data export/import

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) for details.

## Code of Conduct

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) - UI framework
- [Font Awesome](https://fontawesome.com/) - Icon library
- [html-docx-js](https://github.com/evidenceprime/html-docx-js) - Word export
- [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) - PDF export

## Disclaimer

This tool is for learning and writing assistance only. Please follow academic integrity principles and do not use it for any behavior that violates academic standards.

---

**Star ⭐ if this project helps you!**
