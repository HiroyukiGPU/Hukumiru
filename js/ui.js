// js/ui.js
// DOM操作・カードレンダリング・状態表示を担当する

import { classifyClothing } from './temperature.js';

const container = document.getElementById('cards-container');
const locationName = document.getElementById('location-name');
const currentDate = document.getElementById('current-date');

/**
 * ヘッダーの地域名と日付を更新する
 * @param {string} label
 */
function updateHeader(label) {
  locationName.textContent = label;
  const today = new Date();
  currentDate.textContent = today.toLocaleDateString('ja-JP', {
    month: 'long', day: 'numeric', weekday: 'short'
  });
}

/**
 * ローディング中のスケルトンカードを表示する
 */
function showLoading() {
  container.innerHTML = ['朝', '昼', '夜'].map(() => `
    <div class="skeleton-card"></div>
  `).join('');
}

/**
 * エラーメッセージを表示する
 * @param {string} message
 * @param {() => void} onRetry
 */
function showError(message, onRetry) {
  container.innerHTML = `
    <div class="error-state">
      <h2>データを取得できませんでした</h2>
      <p id="error-message"></p>
      <button class="btn btn-primary" id="retry-btn">再試行</button>
    </div>
  `;
  document.getElementById('error-message').textContent = message;
  document.getElementById('retry-btn').addEventListener('click', onRetry);
}

/**
 * 時間帯カードを3枚レンダリングする
 * @param {{ morning: {apparentTemp:number, actualTemp:number, precipProb:number}, afternoon: {apparentTemp:number, actualTemp:number, precipProb:number}, night: {apparentTemp:number, actualTemp:number, precipProb:number} }} averages
 * @param {{ morning: {start:number,end:number}, afternoon: {start:number,end:number}, night: {start:number,end:number} }} settings
 */
function renderCards(averages, settings) {
  const periods = [
    { key: 'morning',   label: '朝' },
    { key: 'afternoon', label: '昼' },
    { key: 'night',     label: '夜' },
  ];

  container.innerHTML = periods.map(({ key, label }) => {
    const { apparentTemp, actualTemp, precipProb } = averages[key];
    const clothing = classifyClothing(apparentTemp);
    const range = settings[key];
    const accentColor = `var(${clothing.colorVar})`;
    const precipIcon = precipProb >= 30 ? '☂' : '🌤';

    return `
      <article class="weather-card" aria-label="${label}の服装提案">
        <div class="card-accent" style="background:${accentColor}"></div>
        <div class="card-body">
          <div class="card-header">
            <span class="period-label">${label}</span>
            <span class="period-range">${range.start}時〜${range.end}時</span>
            <span class="actual-temp" aria-label="実気温">🌡 ${Math.round(actualTemp)}℃</span>
          </div>
          <div class="temp-display" style="color:${accentColor}">
            ${apparentTemp.toFixed(1)}℃
          </div>
          <div class="card-footer">
            <span class="clothing-icon" aria-hidden="true">${clothing.icon}</span>
            <span class="clothing-label">${clothing.label}</span>
            <span class="precip-info" aria-label="降水確率 ${precipProb}パーセント">
              <span aria-hidden="true">${precipIcon}</span>${precipProb}%
            </span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

export { updateHeader, showLoading, showError, renderCards };
