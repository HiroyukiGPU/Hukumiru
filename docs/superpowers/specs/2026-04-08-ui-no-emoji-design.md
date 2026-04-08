# 絵文字なしUIリデザイン 設計書

## 概要

現在の絵文字ベースのUIを、テキストと色のみで構成するプロフェッショナルなデザインに刷新する。weathernews.jp を参考にした、情報密度が高く視認性の高いカードデザインを実現する。

## カード構造（変更後）

```
┌─────────────────────────────────┐  角丸 8px
│▌ 朝        6〜10時    実 15℃   │  ヘッダー行
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │  区切り線
│           12.3℃                │  体感温度（大）
│           体感温度              │  サブラベル（小・グレー）
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │  区切り線
│ カーディガン          降水 10%  │  フッター行
└─────────────────────────────────┘
```

## 変更一覧

### js/ui.js — renderCards の HTML テンプレート

| 要素 | 変更前 | 変更後 |
|------|--------|--------|
| 実気温 | `🌡 ${Math.round(actualTemp)}℃` | `実 ${Math.round(actualTemp)}℃` |
| 降水確率（低） | `<span aria-hidden="true">🌤</span>${precipProb}%` | `降水 ${precipProb}%` |
| 降水確率（高） | `<span aria-hidden="true">☂</span>${precipProb}%` | `降水 ${precipProb}%`（色で区別） |
| 服装アイコン | `<span class="clothing-icon" aria-hidden="true">${clothing.icon}</span>` | 削除 |
| 体感温度表示 | `${apparentTemp.toFixed(1)}℃` | `${apparentTemp.toFixed(1)}℃` + `<span class="temp-label">体感温度</span>` |

**降水確率の色分け:**
- `precipProb >= 30`：`.precip-info--rain`（青 `#2563EB`）
- `precipProb < 30`：デフォルト（グレー `var(--color-text-secondary)`）

**temperature.js の classifyClothing から icon フィールドは引き続き存在するが ui.js で使用しない。**

### js/temperature.js — classifyClothing

`icon` フィールドを削除する。

変更前:
```js
return { label: 'カーディガン', icon: '🧥', colorVar: '--temp-15' };
```

変更後:
```js
return { label: 'カーディガン', colorVar: '--temp-15' };
```

すべての7分類から `icon` を削除する。

### css/styles.css — スタイル変更

| プロパティ | 変更前 | 変更後 |
|-----------|--------|--------|
| `--radius-card` | `16px` | `8px` |
| `.card-body` セクション区切り | なし | `border-top: 1px solid var(--color-border)` を2箇所 |
| `.temp-label` | 存在しない | 新規追加（12px、グレー、中央揃え） |
| `.precip-info--rain` | 存在しない | 新規追加（color: var(--color-primary)） |
| `.clothing-icon` | 存在する | 削除（クラス定義を削除） |

### カード内部のHTML構造（変更後の完全形）

```html
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
      <span class="precip-info${precipProb >= 30 ? ' precip-info--rain' : ''}" aria-label="降水確率 ${precipProb}パーセント">降水 ${precipProb}%</span>
    </div>
  </div>
</article>
```

## 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `js/temperature.js` | `classifyClothing` の各返り値から `icon` フィールドを削除 |
| `js/ui.js` | `renderCards` の HTML テンプレートを全面改訂 |
| `css/styles.css` | `--radius-card` 変更、`.card-section` 追加、`.temp-label` 追加、`.precip-info--rain` 追加、`.clothing-icon` 削除 |

## 非対象

- カードの3枚構成・左アクセントバーは維持
- ダークモード対応は維持
- レスポンシブ対応は維持
- 設定モーダルのデザインは変更しない
