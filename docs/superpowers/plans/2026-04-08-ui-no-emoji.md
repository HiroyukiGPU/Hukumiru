# 絵文字なしUIリデザイン Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** カード内の絵文字を全廃し、テキスト・色・区切り線だけで構成するプロフェッショナルなUIに刷新する。

**Architecture:** 3ファイルを変更する。`temperature.js` の `classifyClothing` から `icon` フィールドを削除、`ui.js` の `renderCards` HTML テンプレートを全面改訂、`css/styles.css` に区切り線・新クラスを追加して `--radius-card` を縮小する。

**Tech Stack:** HTML5, CSS3, JavaScript ES6 Modules

---

## 変更ファイル一覧

```
js/temperature.js   — classifyClothing の icon フィールドを削除
js/ui.js            — renderCards の HTML テンプレートを全面改訂
css/styles.css      — --radius-card 変更、card-section / temp-label / precip-info--rain 追加、clothing-icon 削除
```

---

### Task 1: temperature.js — icon フィールドを削除

**Files:**
- Modify: `js/temperature.js:18-31`

- [ ] **Step 1: js/temperature.js を読む**

```bash
cat /Users/miyaderahiroyuki/Desktop/programs/puroguramingukensyu/服アプリ/js/temperature.js
```

- [ ] **Step 2: classifyClothing 関数全体を以下に置き換える**

JSDoc と関数本体（18〜31行目）を以下に変更する:

```js
/**
 * 体感温度から服装カテゴリを決定する
 * @param {number} apparentTemp - 体感温度 (℃)
 * @returns {{ label: string, colorVar: string }}
 */
function classifyClothing(apparentTemp) {
  if (apparentTemp >= 30) return { label: 'ノースリーブ', colorVar: '--temp-30' };
  if (apparentTemp >= 25) return { label: '半袖',         colorVar: '--temp-25' };
  if (apparentTemp >= 20) return { label: '長袖',         colorVar: '--temp-20' };
  if (apparentTemp >= 15) return { label: 'カーディガン', colorVar: '--temp-15' };
  if (apparentTemp >= 10) return { label: 'ジャケット',   colorVar: '--temp-10' };
  if (apparentTemp >= 5)  return { label: 'コート',       colorVar: '--temp-5'  };
  return                         { label: 'ダウン',       colorVar: '--temp-cold' };
}
```

- [ ] **Step 3: git commit**

```bash
git add js/temperature.js
git commit -m "refactor: temperature.js — classifyClothing から icon フィールドを削除"
```

---

### Task 2: css/styles.css — スタイルを更新

**Files:**
- Modify: `css/styles.css`

- [ ] **Step 1: --radius-card を 8px に変更する**

25行目の `--radius-card: 16px;` を以下に変更:

```css
--radius-card: 8px;
```

- [ ] **Step 2: .clothing-icon クラスを削除する**

以下のブロック（169〜171行目）を削除する:

```css
.clothing-icon {
  font-size: 24px;
}
```

- [ ] **Step 3: .precip-info に区切り関連スタイルを追加し、.precip-info--rain を追加する**

既存の `.precip-info` ブロック（122〜129行目）を以下に置き換える:

```css
.precip-info {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-left: auto;
}

.precip-info--rain {
  color: var(--color-primary);
  font-weight: 600;
}
```

- [ ] **Step 4: .card-section と .temp-label を追加する**

`.temp-display` のブロック（155〜159行目）の直後に以下を追加する:

```css
.card-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-8) 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}
.temp-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}
```

- [ ] **Step 5: .card-footer に border-top を追加する（区切り線をフッターにも適用）**

既存の `.card-footer` ブロック（160〜164行目付近）を以下に変更する:

```css
.card-footer {
  display: flex;
  align-items: center;
  gap: var(--space-8);
}
```

※ border-top は `.card-section` で対応済みなのでフッターへの追加は不要。

- [ ] **Step 6: git commit**

```bash
git add css/styles.css
git commit -m "style: styles.css — 絵文字なしUIのスタイル更新（radius縮小・区切り線・新クラス追加）"
```

---

### Task 3: ui.js — renderCards を全面改訂

**Files:**
- Modify: `js/ui.js:48-92`

- [ ] **Step 1: js/ui.js を読む**

```bash
cat /Users/miyaderahiroyuki/Desktop/programs/puroguramingukensyu/服アプリ/js/ui.js
```

- [ ] **Step 2: renderCards 関数全体（JSDocを含む 48〜90行目）を以下に置き換える**

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
    const precipClass = precipProb >= 30 ? ' precip-info--rain' : '';

    return `
      <article class="weather-card" aria-label="${label}の服装提案">
        <div class="card-accent" style="background:${accentColor}"></div>
        <div class="card-body">
          <div class="card-header">
            <span class="period-label">${label}</span>
            <span class="period-range">${range.start}時〜${range.end}時</span>
            <span class="actual-temp" aria-label="実気温">実 ${Math.round(actualTemp)}℃</span>
          </div>
          <div class="card-section">
            <div class="temp-display" style="color:${accentColor}">
              ${apparentTemp.toFixed(1)}℃
            </div>
            <span class="temp-label">体感温度</span>
          </div>
          <div class="card-footer">
            <span class="clothing-label">${clothing.label}</span>
            <span class="precip-info${precipClass}" aria-label="降水確率 ${precipProb}パーセント">降水 ${precipProb}%</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}
```

- [ ] **Step 3: ブラウザで表示を確認する**

`python3 -m http.server 8080 --directory /Users/miyaderahiroyuki/Desktop/programs/puroguramingukensyu/服アプリ` でサーバーを起動し、`http://localhost:8080` を開いて以下を確認:

- 絵文字が一切表示されていない（🌡 ☂ 🌤 🧥 等）
- ヘッダーに「実 XX℃」が表示されている
- 中段に体感温度（大）と「体感温度」ラベルが表示されている
- 中段に上下の区切り線がある
- フッターに服装名と「降水 XX%」が表示されている
- 降水確率30%以上のカードで「降水 XX%」が青太字になっている
- カードの角丸が以前より小さくなっている

- [ ] **Step 4: git commit してプッシュ**

```bash
git add js/ui.js
git commit -m "feat: ui.js — 絵文字なしカードUIに全面改訂"
git push
```
