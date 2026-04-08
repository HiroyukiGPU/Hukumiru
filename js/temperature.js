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
