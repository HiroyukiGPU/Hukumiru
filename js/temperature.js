// js/temperature.js
// 体感温度の算出と服装分類ロジック

/**
 * Steadman式による体感温度を算出する
 * T_app = T + 0.33 * e - 0.7 * V - 4.0
 * e = 水蒸気圧 (hPa) = (RH/100) * 6.105 * exp(17.27 * T / (237.7 + T))
 * @param {number} temp - 気温 (℃)
 * @param {number} humidity - 相対湿度 (%)
 * @param {number} windSpeed - 風速 (m/s)
 * @returns {number} 体感温度 (℃)
 */
function calcApparentTemp(temp, humidity, windSpeed) {
  const e = (humidity / 100) * 6.105 * Math.exp(17.27 * temp / (237.7 + temp));
  return temp + 0.33 * e - 0.7 * windSpeed - 4.0;
}

/**
 * 体感温度から服装カテゴリを決定する
 * @param {number} apparentTemp - 体感温度 (℃)
 * @returns {{ label: string, icon: string, colorVar: string, advice: string }}
 */
function classifyClothing(apparentTemp) {
  if (apparentTemp >= 30) return { label: 'ノースリーブ', icon: '☀️', colorVar: '--temp-30', advice: 'かなり暑いので、できるだけ軽い服装がおすすめです' };
  if (apparentTemp >= 25) return { label: '半袖',         icon: '👕', colorVar: '--temp-25', advice: '日中は半袖がちょうどよく、羽織りは基本不要です' };
  if (apparentTemp >= 20) return { label: '長袖',         icon: '🧶', colorVar: '--temp-20', advice: '薄手の長袖を基準にすると快適に過ごせます' };
  if (apparentTemp >= 15) return { label: 'カーディガン', icon: '🧥', colorVar: '--temp-15', advice: '長袖に軽い羽織りを足すと温度差に対応しやすいです' };
  if (apparentTemp >= 10) return { label: 'ジャケット',   icon: '🧥', colorVar: '--temp-10', advice: '外にいる時間があるなら、上着を前提にしたい体感です' };
  if (apparentTemp >= 5)  return { label: 'コート',       icon: '🧣', colorVar: '--temp-5',  advice: 'しっかり防寒できるアウターを選ぶと安心です' };
  return                         { label: 'ダウン',       icon: '🥶', colorVar: '--temp-cold', advice: '厚手の防寒着を主役にしたい寒さです' };
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
