# 傘・実気温サブ情報追加 設計書

## 概要

各時間帯カード（朝/昼/夜）に、実際の気温（平均値）と降水確率（最大値）をサブ情報として追加する。

## カードレイアウト変更

### 変更前

```
┌─────────────────────────────────┐
│ 朝                 6時〜10時   │
│         12.3℃（体感）          │
│  🧥 カーディガン               │
└─────────────────────────────────┘
```

### 変更後

```
┌─────────────────────────────────┐
│ 朝         6時〜10時   🌡 15℃  │  ← 実気温（平均・整数）をヘッダー右端に追加
│         12.3℃（体感）          │
│  🧥 カーディガン    ☂ 40%      │  ← 降水確率をフッター右端に追加
└─────────────────────────────────┘
```

## データ仕様

### 実気温（actualTemp）

- 算出方法：当該時間帯の `temperature_2m` の平均値
- 表示：整数（`toFixed(0)`）+ ℃
- 表示位置：カードヘッダー右端

### 降水確率（precipProb）

- 算出方法：当該時間帯の `precipitation_probability` の最大値
- 表示：数値（%）+ アイコン
  - 30%以上：☂（傘アイコン）+ XX%
  - 30%未満：🌤 + XX%
- 表示位置：カードフッター右端

## 変更ファイル一覧

### 1. `js/weather.js`

`fetchWeather` の `hourly` パラメータに `precipitation_probability` を追加する。

```
hourly: 'temperature_2m,relativehumidity_2m,wind_speed_10m,precipitation_probability'
```

### 2. `js/timePeriods.js`

`calcPeriodAverages` の戻り値を拡張する。

**変更前の戻り値:**
```js
{ morning: number, afternoon: number, night: number }
// 各値は体感温度の平均
```

**変更後の戻り値:**
```js
{
  morning:   { apparentTemp: number, actualTemp: number, precipProb: number },
  afternoon: { apparentTemp: number, actualTemp: number, precipProb: number },
  night:     { apparentTemp: number, actualTemp: number, precipProb: number },
}
```

- `apparentTemp`: 体感温度の平均（既存）
- `actualTemp`: 実気温（temperature_2m）の平均
- `precipProb`: 降水確率（precipitation_probability）の最大値

### 3. `js/ui.js`

`renderCards` の引数 `averages` の型が変わるため更新。

- ヘッダーに `🌡 ${actualTemp}℃` を追加
- フッターに `${icon} ${precipProb}%` を追加（30%以上で ☂、未満で 🌤）

### 4. `css/styles.css`

- `.actual-temp`：ヘッダー右端の実気温テキスト（13–14px、secondary色）
- `.precip-info`：フッター右端の降水情報（13–14px）

## 破壊的変更の影響範囲

`calcPeriodAverages` の戻り値の型が変わるため、呼び出し元 `app.js` も合わせて更新が必要。

- `app.js` の `run()` と `rerender()` は `averages` を `renderCards` にそのまま渡しているだけなので、変更量は最小。

## 非対象

- 降水量（mm）は対象外（降水確率のみ）
- 天気アイコン（曇/晴/雨）の表示は対象外
