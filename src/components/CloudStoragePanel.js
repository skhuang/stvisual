import { graphCoverageCriteria } from '../data/testingData.js';
import { createCloudIntegrationClient } from '../utils/cloudIntegration.js';
import { t, pickField } from '../i18n/index.js';

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
    ? t('cloud.signInPrompt')
    : client.isSupportedOrigin
      ? t('cloud.firebaseMissing', { keys: client.missingKeys.join(', ') })
      : client.originWarning;
  let settings = { ...DEFAULT_SETTINGS };
  let uploadedFiles = [];
  let selectedFile = null;
  let driveFiles = [];
  let driveFilesLoading = false;

  function render() {
    root.className = 'cloud-storage';
    root.dataset.testid = 'cloud-storage-panel';
    root.innerHTML = `
      <div class="cloud-card">
        <div class="cloud-header">
          <div>
            <p class="cloud-kicker">${t('cloud.kicker')}</p>
            <h3>${t('cloud.title')}</h3>
            <p class="cloud-subtitle">${t('cloud.subtitle')}</p>
            ${!client.isSupportedOrigin ? `<p class="cloud-warning" data-testid="cloud-origin-warning">${t('cloud.fileWarning')}</p>` : ''}
          </div>
          <div class="cloud-auth-actions">
            ${user
              ? `<span class="cloud-signed-in" data-testid="cloud-signed-in">${t('common.signedIn')}</span>`
              : `<button type="button" class="cloud-btn" data-testid="cloud-signin-btn" ${!canUseCloudAuth ? 'disabled' : ''}>${t('common.googleSignIn')}</button>`}
            <button type="button" class="cloud-btn cloud-btn--secondary" data-testid="cloud-signout-btn" ${!user ? 'disabled' : ''}>${t('common.signOut')}</button>
          </div>
        </div>

        <div class="cloud-meta">
          <p data-testid="cloud-status">${status}</p>
          <p data-testid="cloud-user">${user ? t('cloud.userPrefix', { name: user.email || user.uid }) : t('common.notSignedIn')}</p>
        </div>

        <div class="cloud-grid">
          <section class="cloud-section">
            <h4>${t('cloud.section.settings')}</h4>
            <label>
              ${t('cloud.preferredCriterion')}
              <select data-testid="cloud-criterion-select">
                ${graphCoverageCriteria.map((criterion) => `
                  <option value="${criterion.id}"${settings.preferredCriterion === criterion.id ? ' selected' : ''}>${pickField(criterion, 'label')}</option>
                `).join('')}
              </select>
            </label>

            <label>
              ${t('cloud.notes')}
              <textarea data-testid="cloud-notes-input">${settings.notes || ''}</textarea>
            </label>

            <label>
              ${t('cloud.extras')}
              <textarea data-testid="cloud-extras-input">${formatJson(settings.extras || {})}</textarea>
            </label>

            <div class="cloud-actions-row">
              <button type="button" class="cloud-btn" data-testid="cloud-load-settings-btn" ${!user ? 'disabled' : ''}>${t('cloud.loadSettings')}</button>
              <button type="button" class="cloud-btn" data-testid="cloud-save-settings-btn" ${!user ? 'disabled' : ''}>${t('cloud.saveSettings')}</button>
            </div>
          </section>

          <section class="cloud-section">
            <h4>${t('cloud.section.files')}</h4>
            <label class="cloud-file-picker">
              ${t('cloud.uploadHint')}
              <input type="file" data-testid="cloud-file-input" ${!user ? 'disabled' : ''} />
            </label>
            <p data-testid="cloud-file-name">${selectedFile ? t('cloud.pendingUpload', { name: selectedFile.name }) : t('cloud.noFileSelected')}</p>
            <button type="button" class="cloud-btn" data-testid="cloud-upload-btn" ${!selectedFile || !user ? 'disabled' : ''}>${t('cloud.upload')}</button>

            <ul class="cloud-upload-list" data-testid="cloud-upload-list">
              ${uploadedFiles.map((item, idx) => `<li>
                <div class="cloud-upload-row">
                  <strong>${item.name}</strong>${item.webViewLink ? ` · <a href="${item.webViewLink}" target="_blank" rel="noreferrer">${t('cloud.openFile')}</a>` : ''}
                </div>
                <div class="cloud-upload-actions">
                  <button type="button" class="cloud-btn cloud-btn--small" data-use-target="mutation" data-use-idx="${idx}">${t('cloud.useForMutation')}</button>
                  <button type="button" class="cloud-btn cloud-btn--small" data-use-target="graph" data-use-idx="${idx}">${t('cloud.useForGraph')}</button>
                  <button type="button" class="cloud-btn cloud-btn--small" data-use-target="grammar" data-use-idx="${idx}">${t('cloud.useForGrammar')}</button>
                </div>
              </li>`).join('') || `<li>${t('cloud.noFiles')}</li>`}
            </ul>

            <div class="cloud-drive-list-header">
              <h5>${t('cloud.driveFilesTitle')}</h5>
              <button type="button" class="cloud-btn cloud-btn--small" data-testid="cloud-refresh-drive-btn" ${!user ? 'disabled' : ''}>${driveFilesLoading ? t('cloud.refreshing') : t('cloud.refreshDriveFiles')}</button>
            </div>
            <ul class="cloud-drive-list" data-testid="cloud-drive-list">
              ${driveFiles.length === 0
                ? `<li class="cloud-drive-empty">${user ? (driveFilesLoading ? t('cloud.refreshing') : t('cloud.noDriveFiles')) : t('cloud.signInToList')}</li>`
                : driveFiles.map((f, idx) => `<li>
                    <div class="cloud-upload-row">
                      <strong>${f.name}</strong>${f.modifiedTime ? ` · <span class="cloud-drive-time">${new Date(f.modifiedTime).toLocaleString()}</span>` : ''}${f.webViewLink ? ` · <a href="${f.webViewLink}" target="_blank" rel="noreferrer">${t('cloud.openFile')}</a>` : ''}
                    </div>
                    <div class="cloud-upload-actions">
                      <button type="button" class="cloud-btn cloud-btn--small" data-drive-target="mutation" data-drive-idx="${idx}">${t('cloud.useForMutation')}</button>
                      <button type="button" class="cloud-btn cloud-btn--small" data-drive-target="graph" data-drive-idx="${idx}">${t('cloud.useForGraph')}</button>
                      <button type="button" class="cloud-btn cloud-btn--small" data-drive-target="grammar" data-drive-idx="${idx}">${t('cloud.useForGrammar')}</button>
                    </div>
                  </li>`).join('')}
            </ul>
          </section>
        </div>
      </div>
    `;

    root.querySelector('[data-testid="cloud-signin-btn"]')?.addEventListener('click', async () => {
      try {
        const result = await client.signInWithGoogle();
        user = result.user;
        status = result.hasDriveToken
          ? t('cloud.signedInOk')
          : t('cloud.signedInNoDrive');;
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
        status = t('cloud.signedOut');;
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
          status = t('cloud.loadedOk');
        } else {
          status = t('cloud.noSavedSettings');
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
        status = t('cloud.savedOk');
        render();
      } catch (error) {
        status = error.message.includes('JSON') ? t('cloud.extrasJsonError') : error.message;
        render();
      }
    });

    root.querySelector('[data-testid="cloud-upload-btn"]').addEventListener('click', async () => {
      try {
        const fileToUpload = selectedFile;
        let content = null;
        try {
          if (typeof fileToUpload.text === 'function') {
            content = await fileToUpload.text();
          } else if (typeof FileReader !== 'undefined') {
            content = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result || ''));
              reader.onerror = () => reject(reader.error);
              reader.readAsText(fileToUpload);
            });
          }
        } catch {
          content = null;
        }
        const uploaded = await client.uploadFileToDrive(fileToUpload);
        uploadedFiles = [{ ...uploaded, content, fileName: fileToUpload.name, file: fileToUpload }, ...uploadedFiles].slice(0, 8);
        status = t('cloud.uploadedOk', { name: uploaded.name });
        selectedFile = null;
        render();
      } catch (error) {
        status = error.message;
        render();
      }
    });

    root.querySelectorAll('[data-use-target]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const idx = Number(btn.dataset.useIdx);
        const target = btn.dataset.useTarget;
        const item = uploadedFiles[idx];
        if (!item) return;
        let content = item.content;
        if (content == null && item.file) {
          try {
            content = typeof item.file.text === 'function'
              ? await item.file.text()
              : await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || ''));
                reader.onerror = () => reject(reader.error);
                reader.readAsText(item.file);
              });
            item.content = content;
          } catch (err) {
            status = t('cloud.readError', { msg: err?.message || err });
            render();
            return;
          }
        }
        if (content == null) {
          status = t('cloud.noContent');
          render();
          return;
        }
        const sectionId = target === 'graph' ? 'section-graph' : 'section-syntax';
        const targetSection = globalThis.document?.querySelector(`[data-testid="${sectionId}"]`);
        targetSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        globalThis.dispatchEvent?.(new CustomEvent('stvisual:load-program-source', {
          detail: { target, name: item.fileName || item.name, content },
        }));
        status = target === 'mutation'
          ? t('cloud.sentToMutation', { name: item.name })
          : target === 'grammar'
            ? t('cloud.sentToGrammar', { name: item.name })
            : t('cloud.sentToGraph', { name: item.name });
        render();
      });
    });

    root.querySelector('[data-testid="cloud-refresh-drive-btn"]')?.addEventListener('click', async () => {
      if (!user || typeof client.listDriveFiles !== 'function') return;
      driveFilesLoading = true;
      status = t('cloud.refreshing');
      render();
      try {
        driveFiles = await client.listDriveFiles();
        status = t('cloud.driveListed', { count: driveFiles.length });
      } catch (err) {
        status = t('cloud.driveListError', { msg: err?.message || err });
      } finally {
        driveFilesLoading = false;
        render();
      }
    });

    root.querySelectorAll('[data-drive-target]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const idx = Number(btn.dataset.driveIdx);
        const target = btn.dataset.driveTarget;
        const f = driveFiles[idx];
        if (!f) return;
        try {
          status = t('cloud.downloading', { name: f.name });
          render();
          const content = await client.downloadDriveFile(f.id);
          const sectionId = target === 'graph' ? 'section-graph' : 'section-syntax';
          const targetSection = globalThis.document?.querySelector(`[data-testid="${sectionId}"]`);
          targetSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          globalThis.dispatchEvent?.(new CustomEvent('stvisual:load-program-source', {
            detail: { target, name: f.name, content },
          }));
          status = target === 'mutation'
            ? t('cloud.sentToMutation', { name: f.name })
            : target === 'grammar'
              ? t('cloud.sentToGrammar', { name: f.name })
              : t('cloud.sentToGraph', { name: f.name });
        } catch (err) {
          status = t('cloud.readError', { msg: err?.message || err });
        }
        render();
      });
    });
  }

  client.subscribeAuthState(async (nextUser) => {
    user = nextUser;
    if (!user && canUseCloudAuth) {
      status = t('cloud.signInPrompt');
      driveFiles = [];
    } else if (user && typeof client.listDriveFiles === 'function') {
      try {
        driveFiles = await client.listDriveFiles();
      } catch {
        // silent — user can refresh manually
      }
    }
    render();
  });

  render();
  return root;
}