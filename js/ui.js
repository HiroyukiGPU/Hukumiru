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
  container.innerHTML = [
    '<div class="skeleton-card skeleton-card--summary"></div>',
    ...['朝', '昼', '夜'].map(() => `
    <div class="skeleton-card"></div>
  `),
  ].join('');
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

function buildDailySummary(periodItems) {
  const coldest = periodItems.reduce((min, item) => (
    item.apparentTemp < min.apparentTemp ? item : min
  ));
  const warmest = periodItems.reduce((max, item) => (
    item.apparentTemp > max.apparentTemp ? item : max
  ));
  const rainiest = periodItems.reduce((max, item) => (
    item.precipProb > max.precipProb ? item : max
  ));
  const tempSpread = warmest.apparentTemp - coldest.apparentTemp;
  const summaryColor = `var(${coldest.clothing.colorVar})`;

  const supportText = tempSpread >= 7 && coldest.clothing.label !== warmest.clothing.label
    ? `${coldest.label}は${coldest.clothing.label}基準、${warmest.label}は${warmest.clothing.label}まで軽くできます。`
    : coldest.clothing.advice;

  const cautionText = rainiest.precipProb >= 40
    ? `${rainiest.label}は降水確率${rainiest.precipProb}%です。雨対策も一緒に考えると安心です。`
    : `${coldest.label}が最も冷えるので、外に出るならこの時間帯に合わせるのが安全です。`;

  return `
    <section class="daily-summary-card" aria-label="今日の服装サマリー" style="--summary-accent:${summaryColor}">
      <p class="summary-kicker">今日の服装</p>
      <div class="summary-main">
        <div class="summary-icon" aria-hidden="true">${coldest.clothing.icon}</div>
        <div class="summary-copy">
          <p class="summary-caption">まずこれを基準に</p>
          <h2 class="summary-title">${coldest.clothing.label}</h2>
          <p class="summary-support">${supportText}</p>
        </div>
      </div>
      <p class="summary-note">${cautionText}</p>
      <div class="summary-metrics" aria-label="今日の根拠">
        <div class="summary-metric">
          <span class="summary-metric-label">最低体感</span>
          <strong>${coldest.apparentTemp.toFixed(1)}℃</strong>
          <span>${coldest.label}</span>
        </div>
        <div class="summary-metric">
          <span class="summary-metric-label">最高体感</span>
          <strong>${warmest.apparentTemp.toFixed(1)}℃</strong>
          <span>${warmest.label}</span>
        </div>
        <div class="summary-metric">
          <span class="summary-metric-label">温度差</span>
          <strong>${tempSpread.toFixed(1)}℃</strong>
          <span>脱ぎ着の目安</span>
        </div>
      </div>
      <div class="summary-periods" aria-label="時間帯別の服装">
        ${periodItems.map(({ label, clothing }) => `
          <span class="summary-period-chip">${label}: ${clothing.label}</span>
        `).join('')}
      </div>
    </section>
  `;
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

  const periodItems = periods.map(({ key, label }) => {
    const { apparentTemp, actualTemp, precipProb } = averages[key];
    const clothing = classifyClothing(apparentTemp);
    const range = settings[key];
    const accentColor = `var(${clothing.colorVar})`;
    const precipClass = precipProb >= 30 ? ' metric-value--rain' : '';

    return {
      key,
      label,
      apparentTemp,
      actualTemp,
      precipProb,
      clothing,
      card: `
      <article class="weather-card" aria-label="${label}の服装提案" style="--card-accent:${accentColor}">
        <div class="card-accent"></div>
        <div class="card-body">
          <div class="card-header">
            <div class="card-heading-group">
              <span class="period-label">${label}</span>
              <span class="period-range">${range.start}時〜${range.end}時</span>
            </div>
            <span class="recommend-badge">おすすめ</span>
          </div>
          <div class="recommendation-hero">
            <div class="recommendation-icon" aria-hidden="true">${clothing.icon}</div>
            <div class="recommendation-copy">
              <p class="recommendation-label">この時間帯は</p>
              <div class="clothing-name">
                ${clothing.label}
              </div>
              <p class="recommendation-text">${clothing.advice}</p>
            </div>
          </div>
          <div class="card-metrics" aria-label="判断の根拠">
            <div class="metric-chip">
              <span class="metric-label">体感温度</span>
              <span class="metric-value metric-value--accent">${apparentTemp.toFixed(1)}℃</span>
            </div>
            <div class="metric-chip">
              <span class="metric-label">実気温</span>
              <span class="metric-value">${Math.round(actualTemp)}℃</span>
            </div>
            <div class="metric-chip">
              <span class="metric-label">降水確率</span>
              <span class="metric-value${precipClass}">${precipProb}%</span>
            </div>
          </div>
        </div>
      </article>
    `,
    };
  });

  container.innerHTML = `
    ${buildDailySummary(periodItems)}
    <div class="detail-section-heading" aria-hidden="true">
      <span class="detail-section-title">時間帯ごとの詳細</span>
      <span class="detail-section-note">服装の根拠を確認</span>
    </div>
    ${periodItems.map((item) => item.card).join('')}
  `;
}

export { updateHeader, showLoading, showError, renderCards };
