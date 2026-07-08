import { create } from 'zustand';
import { sampleMarkdown } from '../markdown/sample';
import { loadInitialMarkdown, savePersistedMarkdown } from './persistence';

export type ViewMode = 'editor' | 'source' | 'reader';
export type ReaderTheme = 'paper' | 'sepia' | 'night';

type AppState = {
  markdown: string;
  hasHydrated: boolean;
  viewMode: ViewMode;
  advancedTypography: boolean;
  readerTheme: ReaderTheme;
  fontSize: number;
  lineWidth: number;
  hydrateDocument: () => Promise<void>;
  setMarkdown: (markdown: string) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setAdvancedTypography: (enabled: boolean) => void;
  setReaderTheme: (theme: ReaderTheme) => void;
  setFontSize: (fontSize: number) => void;
  setLineWidth: (lineWidth: number) => void;
};

export const useAppStore = create<AppState>((set) => ({
  markdown: sampleMarkdown,
  hasHydrated: false,
  viewMode: 'editor',
  advancedTypography: true,
  readerTheme: 'paper',
  fontSize: 18,
  lineWidth: 74,
  hydrateDocument: async () => {
    set({ markdown: await loadInitialMarkdown(), hasHydrated: true });
  },
  setMarkdown: (markdown) => {
    void savePersistedMarkdown(markdown);
    set({ markdown });
  },
  setViewMode: (viewMode) => set({ viewMode }),
  setAdvancedTypography: (advancedTypography) => set({ advancedTypography }),
  setReaderTheme: (readerTheme) => set({ readerTheme }),
  setFontSize: (fontSize) => set({ fontSize }),
  setLineWidth: (lineWidth) => set({ lineWidth })
}));
