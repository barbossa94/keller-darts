// Tiny IndexedDB wrapper. Stores: players, games, meta (settings + game in progress).
const DB_NAME = 'basement-darts';
const DB_VERSION = 1;
let dbPromise;

function open() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('players')) db.createObjectStore('players', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('games')) db.createObjectStore('games', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

async function tx(store, mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    const out = fn(s);
    t.oncomplete = () => resolve(out && 'result' in out ? out.result : out);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const getAll = (store) => tx(store, 'readonly', (s) => s.getAll());
export const get = (store, key) => tx(store, 'readonly', (s) => s.get(key));
export const put = (store, value, key) => tx(store, 'readwrite', (s) => (key === undefined ? s.put(value) : s.put(value, key)));
export const del = (store, key) => tx(store, 'readwrite', (s) => s.delete(key));
export const clear = (store) => tx(store, 'readwrite', (s) => s.clear());

// Players: cached in memory because almost every screen needs them.
let playerCache = null;
export async function players() {
  if (!playerCache) playerCache = await getAll('players');
  return playerCache;
}
export async function savePlayer(p) {
  await put('players', p);
  playerCache = null;
}
export async function playerMap() {
  return new Map((await players()).map((p) => [p.id, p]));
}

export async function finishedGames() {
  const all = await getAll('games');
  return all.filter((g) => g.finishedAt).sort((a, b) => a.startedAt - b.startedAt);
}

export const getCurrent = () => get('meta', 'current');
export const setCurrent = (game) => put('meta', game, 'current');
export const clearCurrent = () => del('meta', 'current');

const DEFAULT_SETTINGS = { doubleOut: false, legs: 1, sound: true, inputMode: 'total' };
export async function settings() {
  return { ...DEFAULT_SETTINGS, ...((await get('meta', 'settings')) || {}) };
}
export async function saveSettings(patch) {
  const s = { ...(await settings()), ...patch };
  await put('meta', s, 'settings');
  return s;
}

export function invalidate() { playerCache = null; }

export async function persist() {
  try { if (navigator.storage && navigator.storage.persist) return await navigator.storage.persist(); } catch {}
  return false;
}
