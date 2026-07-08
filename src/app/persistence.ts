import { sampleMarkdown } from '../markdown/sample';
import { ensureValidWorkspace, migrateMarkdownToWorkspace, type WorkspaceSnapshot } from './workspace';

const dbName = 'markdown-typography-studio';
const storeName = 'documents';
const legacyDocumentKey = 'current';
const workspaceKey = 'workspace';
const legacyLocalStorageKey = 'mkd:document';
const workspaceLocalStorageKey = 'mkd:workspace:v2';

type StoredLegacyDocument = {
  id: string;
  markdown: string;
  updatedAt: string;
};

function fallbackLoadWorkspace() {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(workspaceLocalStorageKey);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as WorkspaceSnapshot;
  } catch {
    return null;
  }
}

function fallbackLoadLegacyMarkdown() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(legacyLocalStorageKey);
}

function fallbackSaveWorkspace(snapshot: WorkspaceSnapshot) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(workspaceLocalStorageKey, JSON.stringify(snapshot));
  }
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is unavailable'));
      return;
    }

    const request = indexedDB.open(dbName, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Unable to open IndexedDB'));
  });
}

async function readRecord<T>(key: string) {
  const db = await openDatabase();
  return await new Promise<T | null>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const request = transaction.objectStore(storeName).get(key);
    request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error('Unable to read workspace'));
    transaction.oncomplete = () => db.close();
  });
}

export async function loadPersistedWorkspace(idFactory: () => string): Promise<WorkspaceSnapshot> {
  try {
    const storedWorkspace = await readRecord<(WorkspaceSnapshot & { id: string })>(workspaceKey);
    if (storedWorkspace) {
      return ensureValidWorkspace(storedWorkspace, idFactory());
    }

    const legacy = await readRecord<StoredLegacyDocument>(legacyDocumentKey);
    if (legacy?.markdown) {
      return migrateMarkdownToWorkspace(legacy.markdown, idFactory());
    }
  } catch {
    const fallbackWorkspace = fallbackLoadWorkspace();
    if (fallbackWorkspace) return ensureValidWorkspace(fallbackWorkspace, idFactory());
  }

  const fallbackMarkdown = fallbackLoadLegacyMarkdown();
  if (fallbackMarkdown) return migrateMarkdownToWorkspace(fallbackMarkdown, idFactory());

  return migrateMarkdownToWorkspace(sampleMarkdown, idFactory());
}

export async function savePersistedWorkspace(snapshot: WorkspaceSnapshot) {
  fallbackSaveWorkspace(snapshot);
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      transaction.objectStore(storeName).put({
        id: workspaceKey,
        ...snapshot
      });
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error ?? new Error('Unable to save workspace'));
    });
  } catch {
    fallbackSaveWorkspace(snapshot);
  }
}
