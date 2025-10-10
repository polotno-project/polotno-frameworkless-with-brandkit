import {
  Asset,
  AssetsContext,
  BrandKitContextType,
  Color,
  ColorsContext,
  PageRequest,
  PageResult,
  Typography,
  TypographyContext,
} from './context';

// ============================================================================
// API Fetch Function (replace with real fetch to your server)
// ============================================================================

type ApiFetchOptions = {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  params?: Record<string, string | number>;
};

// This function mimics a fetch API but uses IndexedDB as a demo backend.
// Replace this entire function with real fetch calls to your server.
async function apiFetch<T = any>(options: ApiFetchOptions): Promise<T> {
  const { path, method, body, params } = options;

  // Demo implementation using IndexedDB
  const db = await openIndexedDB();
  const [_, resource, id] = path.split('/');

  if (method === 'GET' && id) {
    return (await getById(db, resource, Number(id))) as T;
  }

  if (method === 'GET') {
    const items = await getAll(db, resource);
    return paginate(items, params) as T;
  }

  if (method === 'POST') {
    await add(db, resource, { ...body, createdAt: new Date() });
    return {} as T;
  }

  if (method === 'PUT' && id) {
    await update(db, resource, body);
    return {} as T;
  }

  if (method === 'DELETE' && id) {
    await remove(db, resource, Number(id));
    return {} as T;
  }

  throw new Error('Invalid API request');
}

// ============================================================================
// IndexedDB Demo Implementation (for demo purposes only)
// ============================================================================

const DB_NAME = 'BrandKitDB';
const DB_VERSION = 3;

let dbInstance: IDBDatabase | null = null;

async function openIndexedDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      ['colors', 'typography', 'assets'].forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
        }
      });
    };
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };
    request.onerror = () => reject(request.error);
  });
}

async function getAll<T>(db: IDBDatabase, store: string): Promise<T[]> {
  const tx = db.transaction(store, 'readonly');
  return new Promise((resolve, reject) => {
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getById<T>(
  db: IDBDatabase,
  store: string,
  id: number
): Promise<T | undefined> {
  const tx = db.transaction(store, 'readonly');
  return new Promise((resolve, reject) => {
    const req = tx.objectStore(store).get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function add(db: IDBDatabase, store: string, data: any): Promise<void> {
  const tx = db.transaction(store, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = tx.objectStore(store).add(data);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function update(
  db: IDBDatabase,
  store: string,
  data: any
): Promise<void> {
  const tx = db.transaction(store, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = tx.objectStore(store).put(data);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function remove(
  db: IDBDatabase,
  store: string,
  id: number
): Promise<void> {
  const tx = db.transaction(store, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = tx.objectStore(store).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function paginate<T>(items: T[], params?: Record<string, any>): PageResult<T> {
  const page = Number(params?.page) || 1;
  const pageSize = Number(params?.pageSize) || 10;
  const query = params?.query?.toLowerCase() || '';

  const filtered = query
    ? items.filter((item: any) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(query)
        )
      )
    : items;

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paginatedItems = filtered.slice(start, start + pageSize);
  const totalPages = Math.ceil(total / pageSize) || 1;

  return {
    items: paginatedItems,
    total,
    page,
    pageSize,
    totalPages,
    hasMore: page < totalPages,
    total_pages: totalPages,
    page_size: pageSize,
  };
}

// ============================================================================
// Brand Kit Context Factory
// ============================================================================

export function createBrandKitContext<
  C extends Color = Color,
  T extends Typography = Typography,
  A extends Asset = Asset
>(): BrandKitContextType<C, T, A> {
  const colorsCtx: ColorsContext<C> = {
    listColors: (req) =>
      apiFetch<PageResult<C>>({
        path: '/colors',
        method: 'GET',
        params: req,
      }),

    getColorById: (id) =>
      apiFetch<C>({
        path: `/colors/${id}`,
        method: 'GET',
      }),

    createColor: (color) =>
      apiFetch({
        path: '/colors',
        method: 'POST',
        body: color,
      }),

    updateColor: (color) =>
      apiFetch({
        path: `/colors/${(color as any).id}`,
        method: 'PUT',
        body: color,
      }),

    deleteColor: (id) =>
      apiFetch({
        path: `/colors/${id}`,
        method: 'DELETE',
      }),
  };

  const typographyCtx: TypographyContext<T> = {
    listTypography: (req) =>
      apiFetch<PageResult<T>>({
        path: '/typography',
        method: 'GET',
        params: req,
      }),

    getTypographyById: (id) =>
      apiFetch<T>({
        path: `/typography/${id}`,
        method: 'GET',
      }),

    createTypography: (item) =>
      apiFetch({
        path: '/typography',
        method: 'POST',
        body: item,
      }),

    updateTypography: (item) =>
      apiFetch({
        path: `/typography/${(item as any).id}`,
        method: 'PUT',
        body: item,
      }),

    deleteTypography: (id) =>
      apiFetch({
        path: `/typography/${id}`,
        method: 'DELETE',
      }),
  };

  const assetsCtx: AssetsContext<A> = {
    listAssets: (req) =>
      apiFetch<PageResult<A>>({
        path: '/assets',
        method: 'GET',
        params: req,
      }),

    getAssetById: (id) =>
      apiFetch<A>({
        path: `/assets/${id}`,
        method: 'GET',
      }),

    createAsset: (item) =>
      apiFetch({
        path: '/assets',
        method: 'POST',
        body: item,
      }),

    updateAsset: (item) =>
      apiFetch({
        path: `/assets/${(item as any).id}`,
        method: 'PUT',
        body: item,
      }),

    deleteAsset: (id) =>
      apiFetch({
        path: `/assets/${id}`,
        method: 'DELETE',
      }),
  };

  return {
    colors: colorsCtx,
    typography: typographyCtx,
    assets: assetsCtx,
  };
}
