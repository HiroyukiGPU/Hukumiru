// js/timePeriods.js
// 時間帯の定義・データ集計ロジック

import { load, save, KEYS } from './storage.js';
import { calcApparentTemp, average } from './temperature.js';

/** @typedef {{ start: number, end: number }} TimeRange */
/** @typedef {{ morning: TimeRange, afternoon: TimeRange, night: TimeRange }} TimeSettings */

/** @type {TimeSettings} */
const DEFAULT_SETTINGS = {
  morning:   { start: 6,  end: 10 },
  afternoon: { start: 10, end: 18 },
  night:     { start: 18, end: 23 },
};

const PERIOD_LABELS = {
  morning: '朝',
  afternoon: '昼',
  night: '夜',
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

/**
 * 設定の妥当性チェック
 * @param {TimeSettings} settings
 * @returns {string|null} エラーメッセージ（問題なければ null）
 */
function validateSettings(settings) {
  for (const [name, range] of Object.entries(settings)) {
    const label = PERIOD_LABELS[name] ?? name;

    if (!Number.isInteger(range.start) || !Number.isInteger(range.end)) {
      return `${label}の開始・終了時間は整数で入力してください`;
    }
    if (range.start < 0 || range.start > 23 || range.end < 0 || range.end > 23) {
      return `${label}の時間は0〜23の範囲で入力してください`;
    }
    if (range.start >= range.end) {
      return `${label}の開始時間は終了時間より前にしてください`;
    }
  }
  return null;
}

export { DEFAULT_SETTINGS, loadTimeSettings, saveTimeSettings, calcPeriodAverages, validateSettings };
