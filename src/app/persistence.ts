import { sampleMarkdown } from '../markdown/sample';

const dbName = 'markdown-typography-studio';
const storeName = 'documents';
const documentKey = 'current';
const localStorageKey = 'mkd:document';

type StoredDocument = {
  id: string;
  markdown: string;
  updatedAt: string;
};

function fallbackLoad() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(localStorageKey);
}

function fallbackSave(markdown: string) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(localStorageKey, markdown);
  }
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is unavailable'));
      return;
    }

    const request = indexedDB.open(dbName, 1);
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

export async function loadPersistedMarkdown() {
  try {
    const db = await openDatabase();
    return await new Promise<string | null>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const request = transaction.objectStore(storeName).get(documentKey);
      request.onsuccess = () => resolve((request.result as StoredDocument | undefined)?.markdown ?? fallbackLoad());
      request.onerror = () => reject(request.error ?? new Error('Unable to read document'));
      transaction.oncomplete = () => db.close();
    });
  } catch {
    return fallbackLoad();
  }
}

export async function savePersistedMarkdown(markdown: string) {
  fallbackSave(markdown);
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      transaction.objectStore(storeName).put({
        id: documentKey,
        markdown,
        updatedAt: new Date().toISOString()
      } satisfies StoredDocument);
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error ?? new Error('Unable to save document'));
    });
  } catch {
    fallbackSave(markdown);
  }
}

export async function loadInitialMarkdown() {
  return (await loadPersistedMarkdown()) ?? sampleMarkdown;
}
