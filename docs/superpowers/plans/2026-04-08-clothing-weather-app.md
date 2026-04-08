# 服装提案アプリ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 現在地の気象データから時間帯（朝/昼/夜）ごとの服装提案を表示する、完全クライアントサイドWebアプリを構築する。

**Architecture:** HTML/CSS/JS（ES6）の単一ページアプリ。Open-Meteo APIで気象データ取得、Geolocation APIで位置取得、LocalStorageで設定永続化。モジュール分割で各責務を分離し、`app.js`がオーケストレーターとして機能する。

**Tech Stack:** HTML5, CSS3, JavaScript (ES6 Modules), Open-Meteo REST API, Geolocation API, LocalStorage

---

## ファイル構成

```
服アプリ/
├── index.html          # エントリーポイント・DOM構造
├── css/
│   └── styles.css      # デザイントークン・全スタイル・レスポンシブ
└── js/
    ├── storage.js      # LocalStorage CRUD抽象化
    ├── location.js     # Geolocation取得・キャッシュ
    ├── weather.js      # Open-Meteo APIクライアント
    ├── temperature.js  # 体感温度算出・服装分類
    ├── timePeriods.js  # 時間帯モデル・データ集計
    ├── ui.js           # DOMレンダリング（カード・状態表示）
    ├── settings.js     # 設定モーダルのロジック
    └── app.js          # 起動・処理フロー統括
```

---

### Task 1: プロジェクト骨格（HTML + CSS変数）

**Files:**
- Create: `index.html`
- Create: `css/styles.css`

- [ ] **Step 1: index.html を作成する**

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>服装提案</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <header class="app-header">
    <div class="header-inner">
      <div class="location-info">
        <span id="location-name">取得中...</span>
        <span id="current-date" class="date-label"></span>
      </div>
    </div>
  </header>

  <main class="app-main">
    <div id="cards-container" class="cards-container">
      <!-- JS でカード挿入 -->
    </div>
  </main>

  <button id="settings-btn" class="settings-fab" aria-label="設定を開く">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  </button>

  <!-- 設定モーダル -->
  <div id="settings-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-label="時間帯設定" hidden>
    <div class="modal-dialog">
      <h2 class="modal-title">時間帯設定</h2>
      <form id="settings-form">
        <fieldset class="period-fieldset">
          <legend>朝</legend>
          <label>開始 <input type="number" id="morning-start" min="0" max="23"></label>
          <label>終了 <input type="number" id="morning-end" min="0" max="23"></label>
        </fieldset>
        <fieldset class="period-fieldset">
          <legend>昼</legend>
          <label>開始 <input type="number" id="afternoon-start" min="0" max="23"></label>
          <label>終了 <input type="number" id="afternoon-end" min="0" max="23"></label>
        </fieldset>
        <fieldset class="period-fieldset">
          <legend>夜</legend>
          <label>開始 <input type="number" id="night-start" min="0" max="23"></label>
          <label>終了 <input type="number" id="night-end" min="0" max="23"></label>
        </fieldset>
        <div class="modal-actions">
          <button type="button" id="settings-cancel" class="btn btn-secondary">キャンセル</button>
          <button type="submit" class="btn btn-primary">保存</button>
        </div>
      </form>
    </div>
  </div>

  <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: css/styles.css を作成する（デザイントークン + ベース）**

```css
/* ===== デザイントークン ===== */
:root {
  --color-primary: #2563EB;
  --color-bg: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;

  --temp-30: #EF4444;
  --temp-25: #F97316;
  --temp-20: #22C55E;
  --temp-15: #06B6D4;
  --temp-10: #3B82F6;
  --temp-5: #6366F1;
  --temp-cold: #111827;

  --radius-card: 16px;
  --shadow-card: 0 4px 12px rgba(0,0,0,0.06);
  --space-4: 4px;
  --space-8: 8px;
  --space-12: 12px;
  --space-16: 16px;
  --space-24: 24px;
  --space-32: 32px;
}

/* ===== ダークモード ===== */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #020617;
    --color-surface: #0F172A;
    --color-text-primary: #E2E8F0;
    --color-text-secondary: #94A3B8;
    --shadow-card: 0 4px 12px rgba(0,0,0,0.3);
  }
}

/* ===== リセット・ベース ===== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans JP", sans-serif;
  background: var(--color-bg);
  color: var(--color-text-primary);
  line-height: 1.5;
  min-height: 100vh;
}

/* ===== ヘッダー ===== */
.app-header {
  background: var(--color-surface);
  border-bottom: 1px solid rgba(0,0,0,0.06);
  padding: var(--space-16);
  position: sticky;
  top: 0;
  z-index: 10;
}
.header-inner {
  max-width: 720px;
  margin: 0 auto;
}
.location-info {
  display: flex;
  align-items: baseline;
  gap: var(--space-8);
}
.location-info span:first-child {
  font-size: 18px;
  font-weight: 600;
}
.date-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* ===== メイン ===== */
.app-main {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-24) var(--space-16);
}

/* ===== カードコンテナ ===== */
.cards-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
}

/* ===== WeatherCard ===== */
.weather-card {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  display: flex;
  overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  cursor: default;
}
.weather-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}
.card-accent {
  width: 4px;
  flex-shrink: 0;
}
.card-body {
  padding: var(--space-16) var(--space-20, 20px);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.period-label {
  font-size: 20px;
  font-weight: 600;
}
.period-range {
  font-size: 13px;
  color: var(--color-text-secondary);
}
.temp-display {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
}
.card-footer {
  display: flex;
  align-items: center;
  gap: var(--space-8);
}
.clothing-label {
  font-size: 17px;
  font-weight: 600;
}
.clothing-icon {
  font-size: 24px;
}

/* ===== スケルトン（loading） ===== */
.skeleton-card {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  height: 120px;
  overflow: hidden;
  position: relative;
}
.skeleton-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%);
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* ===== エラー状態 ===== */
.error-state {
  text-align: center;
  padding: var(--space-32);
  color: var(--color-text-secondary);
}
.error-state h2 { color: var(--color-text-primary); margin-bottom: var(--space-8); }
.error-state p { margin-bottom: var(--space-16); }

/* ===== ボタン ===== */
.btn {
  padding: var(--space-8) var(--space-16);
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s ease;
}
.btn:active { transform: scale(0.98); }
.btn:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
.btn-primary { background: var(--color-primary); color: #fff; }
.btn-secondary { background: transparent; color: var(--color-text-secondary); border: 1px solid currentColor; }

/* ===== FAB（設定ボタン） ===== */
.settings-fab {
  position: fixed;
  bottom: var(--space-24);
  right: var(--space-24);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(37,99,235,0.4);
  transition: transform 0.1s ease;
  z-index: 20;
}
.settings-fab:active { transform: scale(0.95); }
.settings-fab:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 3px; }

/* ===== モーダル ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}
.modal-overlay[hidden] { display: none; }
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.modal-dialog {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: var(--space-24);
  width: min(400px, 90vw);
  animation: slideUp 0.2s ease;
}
@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--space-16);
}
.period-fieldset {
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 8px;
  padding: var(--space-12);
  margin-bottom: var(--space-12);
}
.period-fieldset legend {
  font-weight: 600;
  padding: 0 var(--space-4);
}
.period-fieldset label {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  margin-top: var(--space-8);
  font-size: 14px;
}
.period-fieldset input[type="number"] {
  width: 60px;
  padding: var(--space-4) var(--space-8);
  border: 1px solid rgba(0,0,0,0.2);
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: 14px;
}
.period-fieldset input:focus-visible {
  outline: 2px solid var(--color-primary);
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-8);
  margin-top: var(--space-16);
}

/* ===== レスポンシブ ===== */
@media (max-width: 480px) {
  .app-main { padding: var(--space-16) var(--space-12); }
  .temp-display { font-size: 28px; }
  .period-label { font-size: 17px; }
  .settings-fab { bottom: var(--space-16); right: var(--space-16); }
}
```

- [ ] **Step 3: ブラウザで index.html を開いて骨格が表示されることを確認する**

`index.html` をブラウザで開く（またはローカルサーバーで開く）。  
期待: ヘッダー「取得中...」が表示され、右下にFABボタンが見える。カード領域は空。

- [ ] **Step 4: git commit**

```bash
cd /Users/miyaderahiroyuki/Desktop/programs/puroguramingukensyu/服アプリ
git init
git add index.html css/styles.css
git commit -m "feat: プロジェクト骨格（HTML + CSS）を追加"
```

---

### Task 2: storage.js — LocalStorage抽象化

**Files:**
- Create: `js/storage.js`

- [ ] **Step 1: js/storage.js を作成する**

```js
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
```

- [ ] **Step 2: ブラウザコンソールで動作確認する**

`index.html` を開いてコンソールで実行:
```js
// type="module" なので直接テストはできないため、app.js 経由で確認（Task 9 で統合）
// この時点ではファイル存在確認のみ
```
ファイルが存在してシンタックスエラーがないことを確認。

- [ ] **Step 3: git commit**

```bash
git add js/storage.js
git commit -m "feat: storage.js — LocalStorage抽象化モジュールを追加"
```

---

### Task 3: temperature.js — 体感温度算出・服装分類

**Files:**
- Create: `js/temperature.js`

- [ ] **Step 1: js/temperature.js を作成する**

```js
// js/temperature.js
// 体感温度の算出と服装分類ロジック

/**
 * ミスナール改良式による体感温度を算出する
 * T_app = T + 0.33 * H - 0.7 * V - 4.0
 * @param {number} temp - 気温 (℃)
 * @param {number} humidity - 相対湿度 (%)
 * @param {number} windSpeed - 風速 (m/s)
 * @returns {number} 体感温度 (℃)
 */
function calcApparentTemp(temp, humidity, windSpeed) {
  return temp + 0.33 * humidity - 0.7 * windSpeed - 4.0;
}

/**
 * 体感温度から服装カテゴリを決定する
 * @param {number} apparentTemp - 体感温度 (℃)
 * @returns {{ label: string, icon: string, colorVar: string }}
 */
function classifyClothing(apparentTemp) {
  if (apparentTemp >= 30) return { label: 'ノースリーブ', icon: '🩴', colorVar: '--temp-30' };
  if (apparentTemp >= 25) return { label: '半袖',         icon: '👕', colorVar: '--temp-25' };
  if (apparentTemp >= 20) return { label: '長袖',         icon: '👔', colorVar: '--temp-20' };
  if (apparentTemp >= 15) return { label: 'カーディガン', icon: '🧥', colorVar: '--temp-15' };
  if (apparentTemp >= 10) return { label: 'ジャケット',   icon: '🧣', colorVar: '--temp-10' };
  if (apparentTemp >= 5)  return { label: 'コート',       icon: '🧤', colorVar: '--temp-5'  };
  return                         { label: 'ダウン',       icon: '🫧', colorVar: '--temp-cold' };
}

/**
 * 体感温度の配列から平均値を算出する
 * @param {number[]} temps
 * @returns {number}
 */
function average(temps) {
  if (temps.length === 0) return 0;
  return temps.reduce((sum, t) => sum + t, 0) / temps.length;
}

export { calcApparentTemp, classifyClothing, average };
```

- [ ] **Step 2: ブラウザコンソールで計算ロジックを手動確認する**

app.js に以下を一時的に追加して確認（Task 9 前に削除）:
```js
import { calcApparentTemp, classifyClothing } from './temperature.js';
console.assert(calcApparentTemp(25, 60, 3) === 25 + 0.33*60 - 0.7*3 - 4.0, 'calcApparentTemp OK');
// 25 + 19.8 - 2.1 - 4.0 = 38.7 → ノースリーブ
console.assert(classifyClothing(38.7).label === 'ノースリーブ', 'classify 38.7 OK');
console.assert(classifyClothing(22).label === '長袖', 'classify 22 OK');
console.assert(classifyClothing(4).label === 'ダウン', 'classify 4 OK');
console.log('temperature.js: all assertions passed');
```

コンソールに `temperature.js: all assertions passed` が表示されることを確認。確認後このコードを削除。

- [ ] **Step 3: git commit**

```bash
git add js/temperature.js
git commit -m "feat: temperature.js — 体感温度算出・服装分類ロジックを追加"
```

---

### Task 4: timePeriods.js — 時間帯モデルとデータ集計

**Files:**
- Create: `js/timePeriods.js`

- [ ] **Step 1: js/timePeriods.js を作成する**

```js
// js/timePeriods.js
// 時間帯の定義・データ集計ロジック

import { load, save, KEYS } from './storage.js';
import { calcApparentTemp, average } from './temperature.js';

/** @typedef {{ start: number, end: number }} TimeRange */
/** @typedef {{ morning: TimeRange, afternoon: TimeRange, night: TimeRange }} TimeSettings */

/** @type {TimeSettings} */
const DEFAULT_SETTINGS = {
  morning:   { start: 5,  end: 10 },
  afternoon: { start: 10, end: 16 },
  night:     { start: 16, end: 23 },
};

/**
 * 設定をLocalStorageから読み込む（なければデフォルト）
 * @returns {TimeSettings}
 */
function loadTimeSettings() {
  return load(KEYS.TIME_SETTINGS) ?? DEFAULT_SETTINGS;
}

/**
 * 設定をLocalStorageに保存する
 * @param {TimeSettings} settings
 */
function saveTimeSettings(settings) {
  save(KEYS.TIME_SETTINGS, settings);
}

/**
 * Open-Meteoのhourlyデータから各時間帯の平均体感温度を算出する
 * @param {{ time: string[], temperature_2m: number[], relativehumidity_2m: number[], wind_speed_10m: number[] }} hourly
 * @param {TimeSettings} settings
 * @returns {{ morning: number, afternoon: number, night: number }}
 */
function calcPeriodAverages(hourly, settings) {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const periods = { morning: [], afternoon: [], night: [] };

  hourly.time.forEach((timeStr, i) => {
    if (!timeStr.startsWith(today)) return;

    const hour = new Date(timeStr).getHours();
    const apparentTemp = calcApparentTemp(
      hourly.temperature_2m[i],
      hourly.relativehumidity_2m[i],
      hourly.wind_speed_10m[i]
    );

    for (const [period, range] of Object.entries(settings)) {
      if (hour >= range.start && hour < range.end) {
        periods[period].push(apparentTemp);
      }
    }
  });

  return {
    morning:   average(periods.morning),
    afternoon: average(periods.afternoon),
    night:     average(periods.night),
  };
}

/**
 * 設定の妥当性チェック
 * @param {TimeSettings} settings
 * @returns {string|null} エラーメッセージ（問題なければ null）
 */
function validateSettings(settings) {
  for (const [name, range] of Object.entries(settings)) {
    if (range.start < 0 || range.start > 23 || range.end < 0 || range.end > 23) {
      return `${name}の時間が0〜23の範囲外です`;
    }
    if (range.start >= range.end) {
      return `${name}の開始時間は終了時間より前にしてください`;
    }
  }
  return null;
}

export { DEFAULT_SETTINGS, loadTimeSettings, saveTimeSettings, calcPeriodAverages, validateSettings };
```

- [ ] **Step 2: git commit**

```bash
git add js/timePeriods.js
git commit -m "feat: timePeriods.js — 時間帯モデルとデータ集計を追加"
```

---

### Task 5: location.js — 位置情報取得・キャッシュ

**Files:**
- Create: `js/location.js`

- [ ] **Step 1: js/location.js を作成する**

```js
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
 * 緯度・経度から簡易的な地域名を生成する（APIなしの簡易表示）
 * @param {number} lat
 * @param {number} lon
 * @returns {string}
 */
function formatLocationLabel(lat, lon) {
  return `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
}

export { getLocation, formatLocationLabel };
```

- [ ] **Step 2: git commit**

```bash
git add js/location.js
git commit -m "feat: location.js — 位置情報取得・キャッシュを追加"
```

---

### Task 6: weather.js — Open-Meteo APIクライアント

**Files:**
- Create: `js/weather.js`

- [ ] **Step 1: js/weather.js を作成する**

```js
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
    latitude:  String(lat),
    longitude: String(lon),
    hourly:    'temperature_2m,relativehumidity_2m,wind_speed_10m',
    timezone:  'Asia/Tokyo',
    forecast_days: '1',
  });

  const res = await fetch(`${API_BASE}?${params}`);
  if (!res.ok) {
    throw new Error(`気象データの取得に失敗しました (HTTP ${res.status})`);
  }

  const data = await res.json();
  return data.hourly;
}

export { fetchWeather };
```

- [ ] **Step 2: git commit**

```bash
git add js/weather.js
git commit -m "feat: weather.js — Open-Meteo APIクライアントを追加"
```

---

### Task 7: ui.js — DOMレンダリング

**Files:**
- Create: `js/ui.js`

- [ ] **Step 1: js/ui.js を作成する**

```js
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
      <p>${message}</p>
      <button class="btn btn-primary" id="retry-btn">再試行</button>
    </div>
  `;
  document.getElementById('retry-btn').addEventListener('click', onRetry);
}

/**
 * 時間帯カードを3枚レンダリングする
 * @param {{ morning: number, afternoon: number, night: number }} averages
 * @param {{ morning: {start:number,end:number}, afternoon: {start:number,end:number}, night: {start:number,end:number} }} settings
 */
function renderCards(averages, settings) {
  const periods = [
    { key: 'morning',   label: '朝' },
    { key: 'afternoon', label: '昼' },
    { key: 'night',     label: '夜' },
  ];

  container.innerHTML = periods.map(({ key, label }) => {
    const temp = averages[key];
    const clothing = classifyClothing(temp);
    const range = settings[key];
    const accentColor = `var(${clothing.colorVar})`;

    return `
      <article class="weather-card" aria-label="${label}の服装提案">
        <div class="card-accent" style="background:${accentColor}"></div>
        <div class="card-body">
          <div class="card-header">
            <span class="period-label">${label}</span>
            <span class="period-range">${range.start}時〜${range.end}時</span>
          </div>
          <div class="temp-display" style="color:${accentColor}">
            ${temp.toFixed(1)}℃
          </div>
          <div class="card-footer">
            <span class="clothing-icon" aria-hidden="true">${clothing.icon}</span>
            <span class="clothing-label">${clothing.label}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

export { updateHeader, showLoading, showError, renderCards };
```

- [ ] **Step 2: git commit**

```bash
git add js/ui.js
git commit -m "feat: ui.js — カードレンダリング・状態表示を追加"
```

---

### Task 8: settings.js — 設定モーダル

**Files:**
- Create: `js/settings.js`

- [ ] **Step 1: js/settings.js を作成する**

```js
// js/settings.js
// 設定モーダルの開閉・フォーム操作・バリデーションを管理する

import { loadTimeSettings, saveTimeSettings, validateSettings } from './timePeriods.js';

const modal   = document.getElementById('settings-modal');
const form    = document.getElementById('settings-form');
const openBtn = document.getElementById('settings-btn');
const cancelBtn = document.getElementById('settings-cancel');

/** @type {(() => void)|null} 設定保存後に呼ばれるコールバック */
let onSaveCallback = null;

function openModal() {
  const settings = loadTimeSettings();
  document.getElementById('morning-start').value   = settings.morning.start;
  document.getElementById('morning-end').value     = settings.morning.end;
  document.getElementById('afternoon-start').value = settings.afternoon.start;
  document.getElementById('afternoon-end').value   = settings.afternoon.end;
  document.getElementById('night-start').value     = settings.night.start;
  document.getElementById('night-end').value       = settings.night.end;
  modal.hidden = false;
  cancelBtn.focus();
}

function closeModal() {
  modal.hidden = true;
  openBtn.focus();
}

function handleSubmit(e) {
  e.preventDefault();

  const settings = {
    morning:   { start: Number(document.getElementById('morning-start').value),   end: Number(document.getElementById('morning-end').value)   },
    afternoon: { start: Number(document.getElementById('afternoon-start').value), end: Number(document.getElementById('afternoon-end').value) },
    night:     { start: Number(document.getElementById('night-start').value),     end: Number(document.getElementById('night-end').value)     },
  };

  const error = validateSettings(settings);
  if (error) {
    alert(error);
    return;
  }

  saveTimeSettings(settings);
  closeModal();
  onSaveCallback?.();
}

/**
 * 設定モーダルのイベントリスナーを初期化する
 * @param {() => void} onSave - 保存後に実行するコールバック（UI再描画など）
 */
function initSettings(onSave) {
  onSaveCallback = onSave;
  openBtn.addEventListener('click', openModal);
  cancelBtn.addEventListener('click', closeModal);
  form.addEventListener('submit', handleSubmit);

  // オーバーレイクリックで閉じる
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // ESCキーで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
}

export { initSettings };
```

- [ ] **Step 2: git commit**

```bash
git add js/settings.js
git commit -m "feat: settings.js — 設定モーダルを追加"
```

---

### Task 9: app.js — 全体オーケストレーション

**Files:**
- Create: `js/app.js`

- [ ] **Step 1: js/app.js を作成する**

```js
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

// 設定保存後に再計算・再描画する（位置情報・APIは再取得しない）
async function rerender() {
  showLoading();
  try {
    const location = await getLocation();
    const hourly = await fetchWeather(location.lat, location.lon);
    const settings = loadTimeSettings();
    const averages = calcPeriodAverages(hourly, settings);
    renderCards(averages, settings);
  } catch (err) {
    showError(err.message, run);
  }
}

initSettings(rerender);
run();
```

- [ ] **Step 2: HTTPS対応のローカルサーバーで動作確認する**

Geolocation APIはHTTPS（またはlocalhost）が必要。以下のいずれかで起動:
```bash
# Python 3
python3 -m http.server 8080 --directory /Users/miyaderahiroyuki/Desktop/programs/puroguramingukensyu/服アプリ
```
ブラウザで `http://localhost:8080` を開く。

期待する動作:
1. スケルトンカードが表示される
2. 位置情報の許可を求めるダイアログが出る（または初回許可済みならスキップ）
3. 朝・昼・夜のカードが体感温度・服装とともに表示される
4. 右下のFABを押すと設定モーダルが開く
5. 設定変更→保存でカードが更新される

- [ ] **Step 3: git commit**

```bash
git add js/app.js
git commit -m "feat: app.js — アプリ起動・処理フロー統括を追加"
```

---

### Task 10: GitHub Pages 公開設定

**Files:**
- Create: `.nojekyll`

- [ ] **Step 1: .nojekyll を作成する**

GitHub PagesがJekyllによるビルドをスキップするために必要。

```bash
touch /Users/miyaderahiroyuki/Desktop/programs/puroguramingukensyu/服アプリ/.nojekyll
```

- [ ] **Step 2: GitHubリポジトリを作成してプッシュする**

```bash
cd /Users/miyaderahiroyuki/Desktop/programs/puroguramingukensyu/服アプリ
git add .nojekyll
git commit -m "chore: GitHub Pages用 .nojekyll を追加"
```

その後、GitHubでリポジトリを作成し（`gh repo create` または GitHub Web UI）、pushする:
```bash
git remote add origin https://github.com/<username>/<repo-name>.git
git branch -M main
git push -u origin main
```

- [ ] **Step 3: GitHub Pages を有効化する**

GitHub リポジトリの Settings → Pages → Source: "Deploy from a branch" → Branch: `main` / `/ (root)` → Save。

数分後に `https://<username>.github.io/<repo-name>/` でアクセスできることを確認。

---

## 仕様カバレッジチェック

| 仕様項目 | 対応タスク |
|----------|-----------|
| Geolocation取得・キャッシュ | Task 5 (location.js) |
| Open-Meteo API (temp/humidity/wind) | Task 6 (weather.js) |
| 3時間帯モデル（デフォルト設定） | Task 4 (timePeriods.js) |
| カスタム時間帯・LocalStorage永続化 | Task 4 + Task 8 (settings.js) |
| ミスナール体感温度計算式 | Task 3 (temperature.js) |
| 時間帯別平均算出 | Task 4 (timePeriods.js) |
| 7段階服装分類 | Task 3 (temperature.js) |
| 朝/昼/夜カード表示 | Task 7 (ui.js) |
| 設定モーダル（0-23・逆転バリデーション） | Task 8 (settings.js) |
| ローディング状態（スケルトン） | Task 7 (ui.js) |
| エラー状態 + 再試行ボタン | Task 7 (ui.js) |
| デザイントークン・カラーパレット | Task 1 (styles.css) |
| 温度レンジカラー（左ボーダー+温度色） | Task 7 (ui.js) |
| ホバーアニメーション | Task 1 (styles.css) |
| モーダルフェード+スライド | Task 1 (styles.css) |
| レスポンシブ（モバイル<=480px） | Task 1 (styles.css) |
| ダークモード | Task 1 (styles.css) |
| aria-label / フォーカスリング | Task 1 (index.html) + Task 7 (ui.js) |
| GitHub Pages対応 | Task 10 |
