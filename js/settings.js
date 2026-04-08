// js/settings.js
// 設定モーダルの開閉・フォーム操作・バリデーションを管理する

import { loadTimeSettings, saveTimeSettings, validateSettings } from './timePeriods.js';

const modal    = document.getElementById('settings-modal');
const form     = document.getElementById('settings-form');
const openBtn  = document.getElementById('settings-btn');
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
