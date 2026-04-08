# 傘・実気温サブ情報追加 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 各時間帯カードのヘッダーに実気温、フッターに降水確率（30%以上で傘アイコン）をサブ情報として追加する。

**Architecture:** Open-Meteo APIに `precipitation_probability` を追加取得し、`calcPeriodAverages` の戻り値を `{ apparentTemp, actualTemp, precipProb }` に拡張する。`ui.js` の `renderCards` がこの新しい型を受け取りカードを描画する。

**Tech Stack:** JavaScript ES6 Modules, Open-Meteo REST API

---

## 変更ファイル一覧

```
js/weather.js       — hourlyパラメータに precipitation_probability を追加
js/timePeriods.js   — calcPeriodAverages の戻り値型を拡張
js/ui.js            — renderCards を新しい averages 型に対応
css/styles.css      — .actual-temp / .precip-info スタイルを追加
```

---

### Task 1: weather.js — 降水確率データを取得

**Files:**
- Modify: `js/weather.js:16`

- [ ] **Step 1: weather.js を読み込んで確認する**

```bash
cat /Users/miyaderahiroyuki/Desktop/programs/puroguramingukensyu/服アプリ/js/weather.js
```

- [ ] **Step 2: hourly パラメータに precipitation_probability を追加する**

16行目の `hourly` を以下に変更する:

```js
hourly: 'temperature_2m,relativehumidity_2m,wind_speed_10m,precipitation_probability',
```

変更後の `fetchWeather` 全体:

```js
async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude:        String(lat),
    longitude:       String(lon),
    hourly:          'temperature_2m,relativehumidity_2m,wind_speed_10m,precipitation_probability',
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
```

- [ ] **Step 3: ブラウザコンソールで API レスポンスを確認する**

`http://localhost:8080` を開き、コンソールで以下を実行してレスポンスに `precipitation_probability` 配列が含まれることを確認:

```js
fetch('https://api.open-meteo.com/v1/forecast?latitude=35.68&longitude=139.69&hourly=temperature_2m,precipitation_probability&timezone=Asia/Tokyo&forecast_days=1&wind_speed_unit=ms')
  .then(r => r.json())
  .then(d => console.log(d.hourly.precipitation_probability));
// 期待: [0, 0, 10, 20, ...] のような数値配列
```

- [ ] **Step 4: git commit**

```bash
git add js/weather.js
git commit -m "feat: weather.js — 降水確率データ取得を追加"
```

---

### Task 2: timePeriods.js — calcPeriodAverages の戻り値を拡張

**Files:**
- Modify: `js/timePeriods.js:39-72`

- [ ] **Step 1: calcPeriodAverages 関数全体を以下に置き換える**

JSDoc と関数本体を以下に変更する（39〜72行目を置換）:

```js
/**
 * Open-Meteoのhourlyデータから各時間帯の集計値を算出する
 * @param {{ time: string[], temperature_2m: number[], relativehumidity_2m: number[], wind_speed_10m: number[], precipitation_probability: number[] }} hourly
 * @param {TimeSettings} settings
 * @returns {{ morning: PeriodData, afternoon: PeriodData, night: PeriodData }}
 * @typedef {{ apparentTemp: number, actualTemp: number, precipProb: number }} PeriodData
 */
function calcPeriodAverages(hourly, settings) {
  const today = new Date().toISOString().slice(0, 10);

  const periods = {
    morning:   { apparentTemps: [], actualTemps: [], precipProbs: [] },
    afternoon: { apparentTemps: [], actualTemps: [], precipProbs: [] },
    night:     { apparentTemps: [], actualTemps: [], precipProbs: [] },
  };

  hourly.time.forEach((timeStr, i) => {
    if (!timeStr.startsWith(today)) return;

    const hour = new Date(timeStr).getHours();
    const apparentTemp = calcApparentTemp(
      hourly.temperature_2m[i],
      hourly.relativehumidity_2m[i],
      hourly.wind_speed_10m[i]
    );

    for (const [period, range] of Object.entries(settings)) {
      if (hour >= range.start && hour <= range.end) {
        periods[period].apparentTemps.push(apparentTemp);
        periods[period].actualTemps.push(hourly.temperature_2m[i]);
        periods[period].precipProbs.push(hourly.precipitation_probability[i] ?? 0);
      }
    }
  });

  const summarize = ({ apparentTemps, actualTemps, precipProbs }) => ({
    apparentTemp: average(apparentTemps),
    actualTemp:   average(actualTemps),
    precipProb:   precipProbs.length > 0 ? Math.max(...precipProbs) : 0,
  });

  return {
    morning:   summarize(periods.morning),
    afternoon: summarize(periods.afternoon),
    night:     summarize(periods.night),
  };
}
```

- [ ] **Step 2: ブラウザコンソールで動作を確認する（app.js に一時コード追加）**

`js/app.js` の `run()` 内、`renderCards` 呼び出し前に以下を一時追加:

```js
console.log('averages:', averages);
// 期待: { morning: { apparentTemp: xx, actualTemp: xx, precipProb: xx }, ... }
```

確認後、この行を削除する。

- [ ] **Step 3: git commit**

```bash
git add js/timePeriods.js
git commit -m "feat: timePeriods.js — calcPeriodAverages に実気温・降水確率を追加"
```

---

### Task 3: css/styles.css — サブ情報のスタイルを追加

**Files:**
- Modify: `css/styles.css`（ファイル末尾の `@media (max-width: 480px)` ブロックの前に追加）

- [ ] **Step 1: 以下のスタイルを styles.css に追加する**

`.weather-card:hover` のブロックの後（`.card-accent` の前あたり）に追加:

```css
/* ===== サブ情報（実気温・降水確率） ===== */
.actual-temp {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-left: auto;
}

.precip-info {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 2px;
}
```

- [ ] **Step 2: git commit**

```bash
git add css/styles.css
git commit -m "feat: styles.css — 実気温・降水確率のサブ情報スタイルを追加"
```

---

### Task 4: ui.js — renderCards を新しい averages 型に対応

**Files:**
- Modify: `js/ui.js:48-85`

- [ ] **Step 1: renderCards 関数全体を以下に置き換える**

JSDoc と関数本体（48〜85行目）を以下に変更:

```js
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
```

- [ ] **Step 2: ブラウザで表示を確認する**

`http://localhost:8080` をリロードして以下を確認:
- ヘッダーに `🌡 XX℃` が表示されている
- フッターに `☂ XX%` または `🌤 XX%` が表示されている
- 降水確率が30%以上のとき ☂、未満のとき 🌤 になっている
- 既存の体感温度・服装表示が壊れていない

- [ ] **Step 3: git commit してプッシュ**

```bash
git add js/ui.js
git commit -m "feat: ui.js — カードに実気温・降水確率サブ情報を追加"
git push
```
