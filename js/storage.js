// js/storage.js
// LocalStorageのCRUD操作を抽象化するモジュール

const KEYS = {
  LOCATION: 'location',
  TIME_SETTINGS: 'timeSettings',
};

/**
 * @param {string} key
 * @returns {any|null}
 */
function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * @param {string} key
 * @param {any} value
 */
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * @param {string} key
 */
function remove(key) {
  localStorage.removeItem(key);
}

export { KEYS, load, save, remove };
