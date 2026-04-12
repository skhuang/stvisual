import { graphCoverageCriteria } from '../data/testingData.js';
import { createCloudIntegrationClient } from '../utils/cloudIntegration.js';

const DEFAULT_SETTINGS = {
  preferredCriterion: 'node',
  notes: '',
  extras: {},
};

function formatJson(value) {
  return JSON.stringify(value, null, 2);
}

function parseJson(value) {
  if (!value.trim()) {
    return {};
  }

  return JSON.parse(value);
}

export function createCloudStoragePanel() {
  const root = document.createElement('div');
  const client = createCloudIntegrationClient();
  const canUseCloudAuth = client.isConfigured && client.isSupportedOrigin;

  let user = null;
  let status = canUseCloudAuth
    ? '請先以 Google 登入後，再儲存設定或上傳檔案。'
    : client.isSupportedOrigin
      ? `Firebase 設定不完整：${client.missingKeys.join(', ')}`
      : client.originWarning;
  let settings = { ...DEFAULT_SETTINGS };
  let uploadedFiles = [];
  let selectedFile = null;

  function render() {
    root.className = 'cloud-storage';
    root.dataset.testid = 'cloud-storage-panel';
    root.innerHTML = `
      <div class="cloud-card">
        <div class="cloud-header">
          <div>
            <p class="cloud-kicker">Google + Firebase</p>
            <h3>雲端設定與檔案儲存</h3>
            <p class="cloud-subtitle">Google 登入後：設定存 Firebase、檔案上傳到 Google Drive。</p>
            ${!client.isSupportedOrigin ? '<p class="cloud-warning" data-testid="cloud-origin-warning">目前為 file:// 模式。Google OAuth 需要 http://localhost 或 https。</p>' : ''}
          </div>
          <div class="cloud-auth-actions">
            <button type="button" class="cloud-btn" data-testid="cloud-signin-btn" ${!canUseCloudAuth ? 'disabled' : ''}>Google 登入</button>
            <button type="button" class="cloud-btn cloud-btn--secondary" data-testid="cloud-signout-btn" ${!user ? 'disabled' : ''}>登出</button>
          </div>
        </div>

        <div class="cloud-meta">
          <p data-testid="cloud-status">${status}</p>
          <p data-testid="cloud-user">${user ? `目前使用者：${user.email || user.uid}` : '尚未登入'}</p>
        </div>

        <div class="cloud-grid">
          <section class="cloud-section">
            <h4>設定（Firebase Firestore）</h4>
            <label>
              預設 Coverage Criterion
              <select data-testid="cloud-criterion-select">
                ${graphCoverageCriteria.map((criterion) => `
                  <option value="${criterion.id}"${settings.preferredCriterion === criterion.id ? ' selected' : ''}>${criterion.label}</option>
                `).join('')}
              </select>
            </label>

            <label>
              備註
              <textarea data-testid="cloud-notes-input">${settings.notes || ''}</textarea>
            </label>

            <label>
              額外設定 JSON
              <textarea data-testid="cloud-extras-input">${formatJson(settings.extras || {})}</textarea>
            </label>

            <div class="cloud-actions-row">
              <button type="button" class="cloud-btn" data-testid="cloud-load-settings-btn" ${!user ? 'disabled' : ''}>讀取設定</button>
              <button type="button" class="cloud-btn" data-testid="cloud-save-settings-btn" ${!user ? 'disabled' : ''}>儲存設定</button>
            </div>
          </section>

          <section class="cloud-section">
            <h4>檔案（Google Drive）</h4>
            <label class="cloud-file-picker">
              選擇要上傳的檔案
              <input type="file" data-testid="cloud-file-input" ${!user ? 'disabled' : ''} />
            </label>
            <p data-testid="cloud-file-name">${selectedFile ? `待上傳：${selectedFile.name}` : '尚未選擇檔案'}</p>
            <button type="button" class="cloud-btn" data-testid="cloud-upload-btn" ${!selectedFile || !user ? 'disabled' : ''}>上傳到 Google Drive</button>

            <ul class="cloud-upload-list" data-testid="cloud-upload-list">
              ${uploadedFiles.map((item) => `<li><strong>${item.name}</strong>${item.webViewLink ? ` · <a href="${item.webViewLink}" target="_blank" rel="noreferrer">開啟</a>` : ''}</li>`).join('') || '<li>尚無上傳紀錄</li>'}
            </ul>
          </section>
        </div>
      </div>
    `;

    root.querySelector('[data-testid="cloud-signin-btn"]').addEventListener('click', async () => {
      try {
        const result = await client.signInWithGoogle();
        user = result.user;
        status = result.hasDriveToken
          ? 'Google 登入成功，已取得 Drive 上傳權限。'
          : 'Google 登入成功，但未取得 Drive 權限，請重新登入。';
        render();
      } catch (error) {
        status = error.message;
        render();
      }
    });

    root.querySelector('[data-testid="cloud-signout-btn"]').addEventListener('click', async () => {
      try {
        await client.signOutGoogle();
        user = null;
        selectedFile = null;
        status = '已登出。';
        render();
      } catch (error) {
        status = error.message;
        render();
      }
    });

    root.querySelector('[data-testid="cloud-criterion-select"]').addEventListener('change', (event) => {
      settings.preferredCriterion = event.target.value;
    });

    root.querySelector('[data-testid="cloud-notes-input"]').addEventListener('input', (event) => {
      settings.notes = event.target.value;
    });

    root.querySelector('[data-testid="cloud-file-input"]').addEventListener('change', (event) => {
      [selectedFile] = event.target.files || [];
      render();
    });

    root.querySelector('[data-testid="cloud-load-settings-btn"]').addEventListener('click', async () => {
      try {
        const loaded = await client.loadSettings(user.uid);
        if (loaded) {
          settings = {
            preferredCriterion: loaded.preferredCriterion || 'node',
            notes: loaded.notes || '',
            extras: loaded.extras || {},
          };
          status = '已從 Firebase 載入設定。';
        } else {
          status = 'Firebase 尚無已儲存設定。';
        }
        render();
      } catch (error) {
        status = error.message;
        render();
      }
    });

    root.querySelector('[data-testid="cloud-save-settings-btn"]').addEventListener('click', async () => {
      try {
        const extras = parseJson(root.querySelector('[data-testid="cloud-extras-input"]').value);
        settings.extras = extras;

        await client.saveSettings(user.uid, settings);
        status = '設定已儲存到 Firebase。';
        render();
      } catch (error) {
        status = error.message.includes('JSON') ? '額外設定 JSON 格式錯誤。' : error.message;
        render();
      }
    });

    root.querySelector('[data-testid="cloud-upload-btn"]').addEventListener('click', async () => {
      try {
        const uploaded = await client.uploadFileToDrive(selectedFile);
        uploadedFiles = [uploaded, ...uploadedFiles].slice(0, 8);
        status = `檔案 ${uploaded.name} 已上傳到 Google Drive。`;
        selectedFile = null;
        render();
      } catch (error) {
        status = error.message;
        render();
      }
    });
  }

  client.subscribeAuthState(async (nextUser) => {
    user = nextUser;
    if (!user && canUseCloudAuth) {
      status = '請先以 Google 登入後，再儲存設定或上傳檔案。';
    }
    render();
  });

  render();
  return root;
}