// js/location.js
// Geolocation APIで現在地を取得し、LocalStorageにキャッシュする

import { load, save, KEYS } from './storage.js';

/** @typedef {{ lat: number, lon: number }} Location */

/**
 * 位置情報を取得する（キャッシュ優先）
 * @returns {Promise<Location>}
 */
async function getLocation() {
  const cached = load(KEYS.LOCATION);
  if (cached) return cached;

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('このブラウザはGeolocationに対応していません'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        save(KEYS.LOCATION, location);
        resolve(location);
      },
      (err) => {
        reject(new Error('位置情報の取得に失敗しました: ' + err.message));
      },
      { timeout: 10000 }
    );
  });
}

/**
 * 緯度・経度から簡易的な地域ラベルを生成する（APIなしの簡易表示）
 * @param {number} lat
 * @param {number} lon
 * @returns {string}
 */
function formatLocationLabel(lat, lon) {
  return `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
}

export { getLocation, formatLocationLabel };
