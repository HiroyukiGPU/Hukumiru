// js/weather.js
// Open-Meteo APIからhourly気象データを取得する

const API_BASE = 'https://api.open-meteo.com/v1/forecast';

/**
 * Open-Meteo APIからhourlyデータを取得する
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{ time: string[], temperature_2m: number[], relativehumidity_2m: number[], wind_speed_10m: number[] }>}
 */
async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude:        String(lat),
    longitude:       String(lon),
    hourly:          'temperature_2m,relativehumidity_2m,wind_speed_10m',
    timezone:        'Asia/Tokyo',
    forecast_days:   '1',
    wind_speed_unit: 'ms',
  });

  const res = await fetch(`${API_BASE}?${params}`);
  if (!res.ok) {
    throw new Error(`気象データの取得に失敗しました (HTTP ${res.status})`);
  }

  const data = await res.json();
  return data.hourly;
}

export { fetchWeather };
