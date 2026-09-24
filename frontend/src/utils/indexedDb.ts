const DB_NAME = "stage-light-db";
const DB_VERSION = 1;

export const STORE_NAMES = ["fixture", "cueScene", "timelineTrack", "showProject", "executionSheet"] as const;
export type StoreName = (typeof STORE_NAMES)[number];

let dbPromise: Promise<IDBDatabase> | null = null;

export function isIndexedDbAvailable() {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  if (!isIndexedDbAvailable()) {
    return Promise.reject(new Error("INDEXED_DB_UNAVAILABLE"));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        STORE_NAMES.forEach((name) => {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, { keyPath: "id" });
          }
        });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

function runRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function idbGetAll<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDb();
  const transaction = db.transaction(storeName, "readonly");
  return runRequest<T[]>(transaction.objectStore(storeName).getAll() as IDBRequest<T[]>);
}

export async function idbGet<T>(storeName: StoreName, id: number): Promise<T | undefined> {
  const db = await openDb();
  const transaction = db.transaction(storeName, "readonly");
  return runRequest<T | undefined>(transaction.objectStore(storeName).get(id) as IDBRequest<T | undefined>);
}

export async function idbPut<T>(storeName: StoreName, value: T): Promise<T> {
  const db = await openDb();
  const transaction = db.transaction(storeName, "readwrite");
  await runRequest(transaction.objectStore(storeName).put(value));
  return value;
}

export async function idbPutMany<T extends { id: number }>(storeName: StoreName, values: T[]): Promise<T[]> {
  const db = await openDb();
  const transaction = db.transaction(storeName, "readwrite");
  await Promise.all(values.map((value) => runRequest(transaction.objectStore(storeName).put(value))));
  return values;
}

export async function idbDelete(storeName: StoreName, id: number): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(storeName, "readwrite");
  await runRequest(transaction.objectStore(storeName).delete(id));
}

export async function idbClear(storeName: StoreName): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(storeName, "readwrite");
  await runRequest(transaction.objectStore(storeName).clear());
}
