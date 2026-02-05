(function () {
  const serverUrlEl = document.getElementById('serverUrl');
  const copyUrlBtn = document.getElementById('copyUrl');
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const progressWrap = document.getElementById('progressWrap');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const downloadProgressWrap = document.getElementById('downloadProgressWrap');
  const downloadProgressBar = document.getElementById('downloadProgressBar');
  const downloadProgressText = document.getElementById('downloadProgressText');
  const fileListThis = document.getElementById('fileListThis');
  const fileListOther = document.getElementById('fileListOther');
  const myIpLabel = document.getElementById('myIpLabel');
  const countThis = document.getElementById('countThis');
  const countOther = document.getElementById('countOther');
  const refreshListBtn = document.getElementById('refreshList');
  const btnDownloadZip = document.getElementById('btnDownloadZip');
  const btnSelectAll = document.getElementById('btnSelectAll');
  const toastContainer = document.getElementById('toastContainer');
  const settingsModal = document.getElementById('settingsModal');
  const btnSettings = document.getElementById('btnSettings');
  const cleanupSelect = document.getElementById('cleanupSelect');
  const settingsCancel = document.getElementById('settingsCancel');
  const settingsSave = document.getElementById('settingsSave');
  const btnQr = document.getElementById('btnQr');
  const qrModal = document.getElementById('qrModal');
  const qrClose = document.getElementById('qrClose');
  const qrcodeEl = document.getElementById('qrcode');
  const qrUrlText = document.getElementById('qrUrlText');

  let baseUrl = '';
  let myIp = null;

  function showToast(message, type) {
    type = type || 'info';
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function setProgress(percent, text) {
    progressWrap.hidden = false;
    progressBar.style.setProperty('--progress', percent + '%');
    progressText.textContent = text != null ? text : percent + '%';
  }

  function hideProgress() {
    progressWrap.hidden = true;
    progressBar.style.setProperty('--progress', '0%');
    progressText.textContent = '0%';
  }

  function setDownloadProgress(percent, text) {
    downloadProgressWrap.hidden = false;
    downloadProgressBar.style.setProperty('--download-progress', percent + '%');
    downloadProgressText.textContent = text != null ? text : percent + '%';
  }

  function hideDownloadProgress() {
    downloadProgressWrap.hidden = true;
    downloadProgressBar.style.setProperty('--download-progress', '0%');
    downloadProgressText.textContent = '0%';
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  async function fetchServerInfo() {
    try {
      const res = await fetch('/api/server-info');
      if (!res.ok) throw new Error();
      const data = await res.json();
      baseUrl = data.url || window.location.origin;
      serverUrlEl.textContent = baseUrl;
      return baseUrl;
    } catch (err) {
      baseUrl = window.location.origin;
      serverUrlEl.textContent = baseUrl;
      return baseUrl;
    }
  }

  async function fetchMyIp() {
    try {
      const res = await fetch(baseUrl ? baseUrl + '/api/my-ip' : '/api/my-ip');
      if (!res.ok) throw new Error();
      const data = await res.json();
      myIp = data.ip || null;
      myIpLabel.textContent = myIp ? myIp : 'Bilinmiyor';
      return myIp;
    } catch (err) {
      myIp = null;
      myIpLabel.textContent = '—';
      return null;
    }
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    } finally {
      document.body.removeChild(ta);
    }
  }

  function copyUrl() {
    const url = baseUrl || serverUrlEl.textContent;
    if (!url || url === 'Yükleniyor…') {
      showToast('Adres henüz hazır değil.', 'info');
      return;
    }
    copyToClipboard(url)
      .then(() => showToast('Adres kopyalandı.', 'success'))
      .catch(() => showToast('Kopyalama başarısız.', 'error'));
  }

  function renderFileList(listEl, files) {
    listEl.innerHTML = '';
    if (files.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'file-list-empty';
      empty.textContent = 'Henüz dosya yok.';
      listEl.appendChild(empty);
      return;
    }
    files.forEach((f) => {
      const li = document.createElement('li');
      li.className = 'file-item';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'file-checkbox';
      cb.setAttribute('aria-label', 'Seç: ' + f.name);
      cb.value = f.name;
      cb.addEventListener('click', (e) => e.stopPropagation());
      li.appendChild(cb);
      const nameSpan = document.createElement('span');
      nameSpan.className = 'name';
      nameSpan.textContent = f.name;
      li.appendChild(nameSpan);
      const sizeSpan = document.createElement('span');
      sizeSpan.className = 'size';
      sizeSpan.textContent = formatSize(f.size);
      li.appendChild(sizeSpan);
      const dateSpan = document.createElement('span');
      dateSpan.className = 'date';
      dateSpan.textContent = formatDate(f.uploadedAt || f.modified);
      li.appendChild(dateSpan);
      li.addEventListener('click', (e) => {
        if (e.target.classList.contains('file-checkbox')) return;
        downloadFile(f.name);
      });
      listEl.appendChild(li);
    });
  }

  async function loadFileList() {
    const url = baseUrl ? baseUrl + '/files' : '/files';
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Liste alınamadı');
      const files = await res.json();
      const thisComputer = [];
      const otherComputer = [];
      files.forEach((f) => {
        const uploaderIp = f.uploadedBy || null;
        if (myIp && uploaderIp === myIp) {
          thisComputer.push(f);
        } else {
          otherComputer.push(f);
        }
      });
      renderFileList(fileListThis, thisComputer);
      renderFileList(fileListOther, otherComputer);
      countThis.textContent = thisComputer.length + ' dosya';
      countOther.textContent = otherComputer.length + ' dosya';
      if (btnSelectAll) btnSelectAll.textContent = 'Tümünü seç';
    } catch (err) {
      fileListThis.innerHTML = '';
      fileListOther.innerHTML = '';
      const emptyThis = document.createElement('li');
      emptyThis.className = 'file-list-empty';
      emptyThis.textContent = 'Dosya listesi yüklenemedi.';
      fileListThis.appendChild(emptyThis);
      const emptyOther = document.createElement('li');
      emptyOther.className = 'file-list-empty';
      emptyOther.textContent = '—';
      fileListOther.appendChild(emptyOther);
      countThis.textContent = '0 dosya';
      countOther.textContent = '0 dosya';
      if (btnSelectAll) btnSelectAll.textContent = 'Tümünü seç';
      showToast('Dosya listesi alınamadı.', 'error');
    }
  }

  function downloadFile(filename) {
    const url = (baseUrl || window.location.origin) + '/download/' + encodeURIComponent(filename);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('İndirme başlatıldı: ' + filename, 'success');
  }

  function toggleSelectAll() {
    const all = document.querySelectorAll('.file-list .file-checkbox');
    const checked = document.querySelectorAll('.file-list .file-checkbox:checked');
    const selectAll = checked.length < all.length;
    all.forEach((cb) => { cb.checked = selectAll; });
    btnSelectAll.textContent = selectAll ? 'Seçimi kaldır' : 'Tümünü seç';
  }

  async function downloadSelectedAsZip() {
    const checkboxes = document.querySelectorAll('.file-list .file-checkbox:checked');
    const filenames = Array.from(checkboxes).map((cb) => cb.value).filter(Boolean);
    if (filenames.length === 0) {
      showToast('İndirmek için en az bir dosya seçin.', 'info');
      return;
    }

    setDownloadProgress(0, 'ZIP hazırlanıyor...');

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = (baseUrl || window.location.origin) + '/zip-download';

      // İndirme ilerlemesini takip et
      xhr.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setDownloadProgress(pct, 'İndiriliyor... ' + pct + '%');
        } else {
          // Toplam boyut bilinmiyorsa
          const loadedMB = (e.loaded / (1024 * 1024)).toFixed(2);
          setDownloadProgress(50, 'İndiriliyor... ' + loadedMB + ' MB');
        }
      });

      xhr.addEventListener('load', () => {
        hideDownloadProgress();
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const contentType = xhr.getResponseHeader('Content-Type') || '';
            
            // Hata mesajı mı döndü?
            if (contentType.indexOf('application/json') >= 0) {
              const data = JSON.parse(xhr.responseText);
              showToast(data.error || 'İndirme başarısız.', 'error');
              reject(new Error(data.error));
              return;
            }

            // ZIP dosyasını indir
            const blob = new Blob([xhr.response], { type: 'application/zip' });
            
            if (blob.size === 0) {
              showToast('ZIP dosyası boş.', 'error');
              reject(new Error('Empty ZIP'));
              return;
            }

            // Dosya adını al
            const disp = xhr.getResponseHeader('Content-Disposition');
            let zipName = 'dosyalar.zip';
            if (disp) {
              const m = disp.match(/filename=\"?([^\";\n]+)\"?/);
              if (m) zipName = m[1].trim();
            }

            // İndir
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = zipName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            showToast(filenames.length + ' dosya ZIP olarak indirildi.', 'success');
            resolve();
          } catch (err) {
            showToast('ZIP işleme hatası: ' + err.message, 'error');
            reject(err);
          }
        } else {
          // HTTP hatası
          try {
            const data = JSON.parse(xhr.responseText);
            showToast(data.error || 'İndirme başarısız (HTTP ' + xhr.status + ').', 'error');
          } catch (_) {
            showToast('İndirme başarısız (HTTP ' + xhr.status + ').', 'error');
          }
          reject(new Error('HTTP ' + xhr.status));
        }
      });

      xhr.addEventListener('error', () => {
        hideDownloadProgress();
        showToast('Bağlantı hatası. Sunucu adresini kontrol edin.', 'error');
        reject(new Error('Network error'));
      });

      xhr.addEventListener('abort', () => {
        hideDownloadProgress();
        showToast('İndirme iptal edildi.', 'info');
        reject(new Error('Aborted'));
      });

      // XMLHttpRequest ayarları
      xhr.open('POST', url);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.responseType = 'arraybuffer'; // Binary veri için
      xhr.send(JSON.stringify({ filenames }));
    });
  }

  function doUpload(fileOrFiles) {
    const formData = new FormData();
    const isSingleFile = fileOrFiles instanceof File;
    const list = isSingleFile ? [fileOrFiles] : fileOrFiles;
    for (let i = 0; i < list.length; i++) {
      formData.append('files', list[i], list[i].name);
    }
    const xhr = new XMLHttpRequest();
    const url = baseUrl ? baseUrl + '/upload' : '/upload';

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setProgress(pct, pct + '%');
      } else {
        setProgress(50, 'Yükleniyor…');
      }
    });

    xhr.addEventListener('load', () => {
      hideProgress();
      if (xhr.status >= 200 && xhr.status < 300) {
        showToast((list.length === 1 ? '1 dosya' : list.length + ' dosya') + ' yüklendi.', 'success');
        loadFileList();
      } else {
        let msg = 'Yükleme başarısız.';
        try {
          const j = JSON.parse(xhr.responseText);
          if (j && j.error) msg = j.error;
        } catch (_) {}
        showToast(msg, 'error');
      }
    });

    xhr.addEventListener('error', () => {
      hideProgress();
      showToast('Bağlantı hatası. Sunucu adresini kontrol edin.', 'error');
    });

    xhr.open('POST', url);
    xhr.send(formData);
  }

  function uploadFiles(files) {
    if (!files || files.length === 0) return;

    if (files.length === 1) {
      setProgress(10, 'Yükleniyor…');
      doUpload(files[0]);
      return;
    }

    setProgress(0, 'Zipleniyor…');
    const zip = new JSZip();
    const now = new Date();
    const zipName =
      'transfer_' +
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0') +
      '_' +
      String(now.getHours()).padStart(2, '0') +
      '-' +
      String(now.getMinutes()).padStart(2, '0') +
      '-' +
      String(now.getSeconds()).padStart(2, '0') +
      '.zip';

    let added = 0;
    for (let i = 0; i < files.length; i++) {
      zip.file(files[i].name, files[i], { binary: true });
      added++;
      if (added % 5 === 0 || added === files.length) {
        setProgress(Math.round((added / files.length) * 40), 'Zipleniyor…');
      }
    }

    zip
      .generateAsync({ type: 'blob' }, (metadata) => {
        if (metadata.percent) {
          setProgress(40 + Math.round(metadata.percent * 0.2), 'Zipleniyor…');
        }
      })
      .then((blob) => {
        setProgress(60, 'Sunucuya gönderiliyor…');
        const zipFile = new File([blob], zipName, { type: 'application/zip' });
        doUpload(zipFile);
      })
      .catch((err) => {
        hideProgress();
        showToast('Zip oluşturulamadı.', 'error');
        console.error(err);
      });
  }

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove('dragover');
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length) uploadFiles(Array.from(files));
  });
  fileInput.addEventListener('change', () => {
    const files = fileInput.files;
    if (files.length) uploadFiles(Array.from(files));
    fileInput.value = '';
  });

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      cleanupSelect.value = String(data.cleanupAfterMinutes ?? 1440);
    } catch (err) {
      showToast('Ayarlar yüklenemedi. Sayfayı sunucu adresiyle açtığınızdan emin olun.', 'error');
    }
  }

  function openSettingsModal() {
    fetchSettings();
    settingsModal.hidden = false;
  }

  function closeSettingsModal() {
    settingsModal.hidden = true;
  }

  async function saveSettings() {
    const minutes = parseInt(cleanupSelect.value, 10);
    if (isNaN(minutes) || minutes < 0 || minutes > 525600) {
      showToast('Geçersiz süre.', 'error');
      return;
    }
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cleanupAfterMinutes: minutes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || 'Kaydedilemedi.', 'error');
        return;
      }
      showToast('Ayarlar kaydedildi.', 'success');
      closeSettingsModal();
    } catch (err) {
      showToast('Bağlantı hatası. Sunucu adresiyle açtığınızdan emin olun.', 'error');
    }
  }

  function openQrModal() {
    const url = baseUrl || serverUrlEl.textContent;
    if (!url || url === 'Yükleniyor…') {
      showToast('Adres henüz hazır değil.', 'info');
      return;
    }
    
    qrcodeEl.innerHTML = '';
    qrUrlText.textContent = url;
    
    try {
      new QRCode(qrcodeEl, {
        text: url,
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
      qrModal.hidden = false;
    } catch (err) {
      console.error(err);
      showToast('QR kod oluşturulamadı.', 'error');
    }
  }

  function closeQrModal() {
    qrModal.hidden = true;
  }

  refreshListBtn.addEventListener('click', () => loadFileList());
  btnSelectAll.addEventListener('click', toggleSelectAll);
  btnDownloadZip.addEventListener('click', downloadSelectedAsZip);
  copyUrlBtn.addEventListener('click', copyUrl);
  btnSettings.addEventListener('click', openSettingsModal);
  settingsCancel.addEventListener('click', closeSettingsModal);
  settingsSave.addEventListener('click', saveSettings);
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeSettingsModal();
  });
  
  btnQr.addEventListener('click', openQrModal);
  qrClose.addEventListener('click', closeQrModal);
  qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal) closeQrModal();
  });

  (async function init() {
    await fetchServerInfo();
    await fetchMyIp();
    await loadFileList();
  })();
})();
