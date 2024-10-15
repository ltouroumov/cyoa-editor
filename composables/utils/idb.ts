export class IndexedDB {
  private constructor(private readonly conn: IDBDatabase) {}

  public transaction<T>(
    storeNames: string | string[],
    mode: 'readonly' | 'readwrite',
    handler: (tx: Transaction) => Promise<T>,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const tx0 = this.conn.transaction(storeNames, mode);
      const tx = new Transaction(tx0);

      handler(tx)
        .then((result) => {
          tx0.commit();
          resolve(result);
        })
        .catch((error) => {
          tx0.abort();
          reject(error);
        });
    });
  }

  static open(
    name: string,
    version: number,
    upgrade?: (
      db: IDBDatabase,
      oldVersion: number,
      newVersion: number | null,
      transaction: IDBTransaction | null,
    ) => void,
  ): Promise<IndexedDB> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(name, version);

      if (upgrade) {
        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          upgrade(
            request.result,
            event.oldVersion,
            event.newVersion,
            request.transaction,
          );
        };
      }

      request.onsuccess = () => {
        console.log('idb.onsuccess');
        resolve(new IndexedDB(request.result));
      };

      request.onerror = () => {
        console.log('idb.onerror', request.error);
        reject(request.error);
      };
    });
  }
}

export class Transaction {
  constructor(private readonly tx: IDBTransaction) {}

  public objectStore(name: string): ObjectStore {
    return new ObjectStore(this.tx.objectStore(name));
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ObjectStore {
  constructor(private readonly os: IDBObjectStore) {}

  public add(data: any, key?: any): Promise<any> {
    return request2promise(this.os.add(data, key));
  }

  public put(data: any, key?: any): Promise<any> {
    return request2promise(this.os.put(data, key));
  }

  public get(key: any): Promise<any> {
    return request2promise(this.os.get(key));
  }

  public getAll(): Promise<any> {
    return request2promise(this.os.getAll());
  }

  public delete(key: any): Promise<void> {
    return request2promise(this.os.delete(key));
  }
}

function request2promise(request: IDBRequest): Promise<any> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */
