// js/app.js
// アプリの起動・処理フロー全体を統括するエントリーポイント

import { getLocation, formatLocationLabel } from './location.js';
import { fetchWeather } from './weather.js';
import { calcPeriodAverages, loadTimeSettings } from './timePeriods.js';
import { updateHeader, showLoading, showError, renderCards } from './ui.js';
import { initSettings } from './settings.js';

/**
 * メイン処理: 位置情報取得 → 気象データ取得 → 算出 → 描画
 */
async function run() {
  showLoading();

  try {
    const location = await getLocation();
    updateHeader(formatLocationLabel(location.lat, location.lon));

    const hourly = await fetchWeather(location.lat, location.lon);
    const settings = loadTimeSettings();
    const averages = calcPeriodAverages(hourly, settings);

    renderCards(averages, settings);
  } catch (err) {
    showError(err.message, run);
  }
}

/**
 * 設定保存後に再計算・再描画する（位置情報・APIは再取得しない）
 */
async function rerender() {
  showLoading();
  try {
    const location = await getLocation();
    const hourly = await fetchWeather(location.lat, location.lon);
    const settings = loadTimeSettings();
    const averages = calcPeriodAverages(hourly, settings);
    renderCards(averages, settings);
  } catch (err) {
    showError(err.message, rerender);
  }
}

initSettings(rerender);
run();
