// js/settings.js
// 設定モーダルの開閉・フォーム操作・バリデーションを管理する

import { loadTimeSettings, saveTimeSettings, validateSettings } from './timePeriods.js';

const modal    = document.getElementById('settings-modal');
const form     = document.getElementById('settings-form');
const openBtn  = document.getElementById('settings-btn');
const cancelBtn = document.getElementById('settings-cancel');
const closeBtn = document.getElementById('settings-close');
const errorMessage = document.getElementById('settings-error');

const PERIODS = [
  { key: 'morning', startId: 'morning-start', endId: 'morning-end', previewId: 'morning-preview' },
  { key: 'afternoon', startId: 'afternoon-start', endId: 'afternoon-end', previewId: 'afternoon-preview' },
  { key: 'night', startId: 'night-start', endId: 'night-end', previewId: 'night-preview' },
];

/** @type {(() => void)|null} 設定保存後に呼ばれるコールバック */
let onSaveCallback = null;

function getInput(id) {
  return /** @type {HTMLInputElement} */ (document.getElementById(id));
}

function formatRange(start, end) {
  if (Number.isNaN(start) || Number.isNaN(end)) return '--時〜--時';
  return `${start}時〜${end}時`;
}

function updatePreview(period) {
  const start = Number(getInput(period.startId).value);
  const end = Number(getInput(period.endId).value);
  document.getElementById(period.previewId).textContent = formatRange(start, end);
}

function updateAllPreviews() {
  PERIODS.forEach(updatePreview);
}

function clearError() {
  errorMessage.hidden = true;
  errorMessage.textContent = '';
}

function showError(message) {
  errorMessage.hidden = false;
  errorMessage.textContent = message;
}

function readSettings() {
  return {
    morning: {
      start: Number(getInput('morning-start').value),
      end: Number(getInput('morning-end').value),
    },
    afternoon: {
      start: Number(getInput('afternoon-start').value),
      end: Number(getInput('afternoon-end').value),
    },
    night: {
      start: Number(getInput('night-start').value),
      end: Number(getInput('night-end').value),
    },
  };
}

function openModal() {
  const settings = loadTimeSettings();
  getInput('morning-start').value = String(settings.morning.start);
  getInput('morning-end').value = String(settings.morning.end);
  getInput('afternoon-start').value = String(settings.afternoon.start);
  getInput('afternoon-end').value = String(settings.afternoon.end);
  getInput('night-start').value = String(settings.night.start);
  getInput('night-end').value = String(settings.night.end);
  clearError();
  updateAllPreviews();
  modal.hidden = false;
  getInput('morning-start').focus();
}

function closeModal() {
  clearError();
  modal.hidden = true;
  openBtn.focus();
}

function handleSubmit(e) {
  e.preventDefault();

  const settings = readSettings();

  const error = validateSettings(settings);
  if (error) {
    showError(error);
    return;
  }

  clearError();
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
  closeBtn.addEventListener('click', closeModal);
  form.addEventListener('submit', handleSubmit);
  PERIODS.forEach((period) => {
    [period.startId, period.endId].forEach((id) => {
      getInput(id).addEventListener('input', () => {
        clearError();
        updatePreview(period);
      });
    });
  });

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
