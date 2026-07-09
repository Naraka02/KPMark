export const languages = ['en', 'zh-CN'] as const;

export type Language = (typeof languages)[number];

export const defaultLanguage: Language = 'en';

const languageStorageKey = 'mkd:language';

const en = {
  app: {
    title: 'KPMark',
    documentFallback: 'Document',
    documentFilenameFallback: 'document'
  },
  language: {
    label: 'Interface language',
    english: 'English',
    chinese: '简体中文',
    englishShort: 'EN',
    chineseShort: '中文'
  },
  status: {
    notSavedYet: 'Not saved yet',
    saving: 'Saving...',
    savingShort: 'Saving',
    saveFailed: 'Save failed',
    saved: (time: string) => `Saved ${time}`,
    ready: 'Ready',
    localWorkspace: 'Local workspace'
  },
  workspace: {
    aria: 'Workspace documents',
    eyebrow: 'Workspace',
    fallbackTitle: 'Documents',
    count: (count: number) => `${count} local document${count === 1 ? '' : 's'}`,
    newDocument: 'New document',
    openDocument: (title: string) => `Open ${title}`,
    renameDocument: 'Rename document',
    renameDocumentNamed: (title: string) => `Rename ${title}`,
    duplicateDocument: 'Duplicate document',
    duplicateDocumentNamed: (title: string) => `Duplicate ${title}`,
    deleteDocument: 'Delete document',
    deleteDocumentNamed: (title: string) => `Delete ${title}`,
    renameInput: (title: string) => `New title for ${title}`,
    saveRename: 'Save title',
    cancelRename: 'Cancel rename',
    deleteTitle: 'Delete document?',
    deleteMessage: (title: string) => `Delete “${title}”? This cannot be undone.`,
    deleteConfirm: 'Delete',
    deleteCancel: 'Keep document',
    keepOneDocument: 'Keep at least one document in the workspace.',
    empty: 'No documents yet.',
    searchPlaceholder: 'Search documents',
    noSearchResults: 'No matching documents',
    createdTitle: 'Untitled document',
    createdMarkdown: '# Untitled document\n\nStart writing here.\n',
    duplicateSuffix: 'copy',
    importedFallback: 'Imported document'
  },
  toolbar: {
    currentDocument: 'Current document',
    viewMode: 'View mode',
    editorTools: 'Editor tools',
    fileActions: 'File actions',
    paragraph: 'Paragraph',
    bulletList: 'Bullet list',
    orderedList: 'Ordered list',
    imageUrl: 'Image URL',
    imagePrompt: 'Paste an image URL',
    mermaid: 'Mermaid',
    displayMath: 'Display math',
    importMarkdown: 'Import Markdown as document',
    exportMarkdown: 'Export Markdown',
    printOrExport: 'Print or export HTML',
    modes: {
      editor: 'Editor',
      source: 'Markdown',
      reader: 'Reader'
    }
  },
  editor: {
    wysiwygAria: 'WYSIWYG Markdown editor',
    sourceAria: 'Markdown source editor',
    placeholder: 'Start writing Markdown…',
    editorTitle: 'Writing canvas',
    sourceTitle: 'Markdown source',
    readerTitle: 'Reading preview',
    editorHint: 'Use the command bar for blocks, or keep typing like a document.',
    sourceHint: 'Edit the canonical Markdown stored in the local workspace.',
    readerHint: 'Tune typography and print from the preview controls.'
  },
  richNodes: {
    mermaid: 'Mermaid',
    mermaidSource: 'Mermaid source',
    mermaidError: 'Invalid Mermaid diagram',
    blockMathSource: 'Block math source',
    inlineMathSource: 'Inline math source'
  },
  reader: {
    preview: 'Preview',
    settings: 'Reader settings',
    advancedTypography: 'Advanced typography',
    theme: 'Theme',
    themes: {
      paper: 'Paper',
      sepia: 'Sepia',
      night: 'Night'
    },
    fontSize: 'Font size',
    lineWidth: 'Line width',
    tableOfContents: 'Table of contents',
    contents: 'Contents',
    emptyToc: 'No headings yet'
  }
};

type Messages = typeof en;

const zh: Messages = {
  app: {
    title: 'KPMark',
    documentFallback: '文档',
    documentFilenameFallback: 'document'
  },
  language: {
    label: '界面语言',
    english: 'English',
    chinese: '简体中文',
    englishShort: 'EN',
    chineseShort: '中文'
  },
  status: {
    notSavedYet: '尚未保存',
    saving: '正在保存…',
    savingShort: '保存中',
    saveFailed: '保存失败',
    saved: (time: string) => `已保存 ${time}`,
    ready: '就绪',
    localWorkspace: '本地工作区'
  },
  workspace: {
    aria: '工作区文档',
    eyebrow: '工作区',
    fallbackTitle: '文档',
    count: (count: number) => `${count} 个本地文档`,
    newDocument: '新建文档',
    openDocument: (title: string) => `打开 ${title}`,
    renameDocument: '重命名文档',
    renameDocumentNamed: (title: string) => `重命名 ${title}`,
    duplicateDocument: '复制文档',
    duplicateDocumentNamed: (title: string) => `复制 ${title}`,
    deleteDocument: '删除文档',
    deleteDocumentNamed: (title: string) => `删除 ${title}`,
    renameInput: (title: string) => `${title} 的新标题`,
    saveRename: '保存标题',
    cancelRename: '取消重命名',
    deleteTitle: '删除文档？',
    deleteMessage: (title: string) => `删除“${title}”？此操作无法撤销。`,
    deleteConfirm: '删除',
    deleteCancel: '保留文档',
    keepOneDocument: '工作区至少需要保留一个文档。',
    empty: '还没有文档。',
    searchPlaceholder: '搜索文档',
    noSearchResults: '没有匹配的文档',
    createdTitle: '未命名文档',
    createdMarkdown: '# 未命名文档\n\n从这里开始写作。\n',
    duplicateSuffix: '副本',
    importedFallback: '导入的文档'
  },
  toolbar: {
    currentDocument: '当前文档',
    viewMode: '视图模式',
    editorTools: '编辑工具',
    fileActions: '文件操作',
    paragraph: '段落',
    bulletList: '项目符号列表',
    orderedList: '编号列表',
    imageUrl: '图片 URL',
    imagePrompt: '粘贴图片 URL',
    mermaid: 'Mermaid 图表',
    displayMath: '块级公式',
    importMarkdown: '导入 Markdown 为文档',
    exportMarkdown: '导出 Markdown',
    printOrExport: '打印或导出 HTML',
    modes: {
      editor: '编辑',
      source: '源码',
      reader: '阅读'
    }
  },
  editor: {
    wysiwygAria: '所见即所得 Markdown 编辑器',
    sourceAria: 'Markdown 源码编辑器',
    placeholder: '开始写 Markdown…',
    editorTitle: '写作画布',
    sourceTitle: 'Markdown 源码',
    readerTitle: '阅读预览',
    editorHint: '通过命令栏插入内容块，也可以像写文档一样连续输入。',
    sourceHint: '直接编辑本地工作区保存的 Markdown 正文。',
    readerHint: '在预览控制区调整排版并打印输出。'
  },
  richNodes: {
    mermaid: 'Mermaid 图表',
    mermaidSource: 'Mermaid 源码',
    mermaidError: 'Mermaid 图表无效',
    blockMathSource: '块级公式源码',
    inlineMathSource: '行内公式源码'
  },
  reader: {
    preview: '预览',
    settings: '阅读设置',
    advancedTypography: '高级排版',
    theme: '主题',
    themes: {
      paper: '纸张',
      sepia: '暖纸',
      night: '夜间'
    },
    fontSize: '字号',
    lineWidth: '行宽',
    tableOfContents: '目录',
    contents: '目录',
    emptyToc: '暂无标题'
  }
};

export const messages: Record<Language, Messages> = {
  en,
  'zh-CN': zh
};

export function isLanguage(value: string | null): value is Language {
  return value === 'en' || value === 'zh-CN';
}

export function loadPersistedLanguage(): Language {
  if (typeof localStorage === 'undefined') return defaultLanguage;
  const stored = localStorage.getItem(languageStorageKey);
  return isLanguage(stored) ? stored : defaultLanguage;
}

export function savePersistedLanguage(language: Language) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(languageStorageKey, language);
  }
}

export function localeForLanguage(language: Language) {
  return language === 'zh-CN' ? 'zh-CN' : 'en';
}

export function currentDocumentLanguage(): Language {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(languageStorageKey);
    if (isLanguage(stored)) return stored;
  }
  if (typeof document === 'undefined') return defaultLanguage;
  return isLanguage(document.documentElement.lang) ? document.documentElement.lang : defaultLanguage;
}
