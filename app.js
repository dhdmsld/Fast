document.addEventListener('DOMContentLoaded', () => {

  // ======= STATE =======
  let configs = [];
  let currentPage = 1;
  const perPage = 5;
  let sortField = 'name';
  let sortDir = 'asc';
  let searchTerm = '';
  let statusFilter = 'all';

  // ======= DOM REFS =======
  const body = document.body;
  const pullCord = document.getElementById('pullCord');
  const loginForm = document.getElementById('loginForm');
  const loginCard = document.getElementById('loginCard');
  const panelContainer = document.getElementById('panel-container');
  const displayUsername = document.getElementById('displayUsername');
  const logoutBtn = document.getElementById('logoutBtn');
  const themeToggle = document.getElementById('themeToggle');
  const exportBtn = document.getElementById('exportJson');
  const importBtn = document.getElementById('importJson');
  const fileInput = document.getElementById('fileInput');
  const newConfigBtn = document.getElementById('newConfigBtn');
  const modal = document.getElementById('configModal');
  const closeModal = document.querySelector('.close-modal');
  const configForm = document.getElementById('configForm');
  const editId = document.getElementById('editId');
  const configName = document.getElementById('configName');
  const configProtocol = document.getElementById('configProtocol');
  const configExpiry = document.getElementById('configExpiry');
  const configStatus = document.getElementById('configStatus');
  const modalTitle = document.getElementById('modalTitle');
  const tbody = document.getElementById('configTableBody');
  const searchInput = document.getElementById('searchInput');
  const statusFilterEl = document.getElementById('statusFilter');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');
  const showPassBtn = document.getElementById('showPassBtn');
  const passwordInput = document.getElementById('passwordInput');

  // ======= LOAD FROM LOCALSTORAGE =======
  function loadConfigs() {
    const stored = localStorage.getItem('lumen_configs');
    if (stored) {
      try { configs = JSON.parse(stored); } catch { configs = []; }
    } else {
      // نمونه اولیه
      configs = [
        { id: Date.now() + 1, name: 'کانفیگ اصلی', protocol: 'V2Ray', expiry: '2025-05-15', status: 'active' },
        { id: Date.now() + 2, name: 'کانفیگ تست', protocol: 'Shadowsocks', expiry: '2025-04-20', status: 'inactive' },
        { id: Date.now() + 3, name: 'کانفیگ VIP', protocol: 'WireGuard', expiry: '2025-06-01', status: 'active' },
      ];
      saveConfigs();
    }
  }
  function saveConfigs() {
    localStorage.setItem('lumen_configs', JSON.stringify(configs));
    updateStats();
    renderTable();
  }

  // ======= STATS =======
  function updateStats() {
    const total = configs.length;
    const active = configs.filter(c => c.status === 'active').length;
    const inactive = total - active;
    const online = Math.floor(total * 0.6); // شبیه‌سازی
    document.getElementById('totalCount').textContent = total;
    document.getElementById('activeCount').textContent = active;
    document.getElementById('inactiveCount').textContent = inactive;
    document.getElementById('onlineCount').textContent = online;
  }

  // ======= RENDER TABLE (با فیلتر، جستجو، مرتب‌سازی و پیجینیشن) =======
  function renderTable() {
    let filtered = [...configs];

    // فیلتر وضعیت
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // جستجو
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.protocol.toLowerCase().includes(term)
      );
    }

    // مرتب‌سازی
    filtered.sort((a, b) => {
      let va = a[sortField] || '';
      let vb = b[sortField] || '';
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    // پیجینیشن
    const totalPages = Math.ceil(filtered.length / perPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * perPage;
    const pageData = filtered.slice(start, start + perPage);

    pageInfo.textContent = `صفحه ${currentPage} از ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    if (pageData.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-muted);">هیچ کانفیگی یافت نشد</td></tr>`;
      return;
    }

    tbody.innerHTML = pageData.map(c => `
      <tr data-id="${c.id}">
        <td>${c.name}</td>
        <td>${c.protocol}</td>
        <td>${c.expiry || 'نامشخص'}</td>
        <td><span class="badge ${c.status}" data-id="${c.id}">${c.status === 'active' ? 'فعال' : 'غیرفعال'}</span></td>
        <td>
          <button class="action-btn copy" data-id="${c.id}"><i class="fas fa-copy"></i></button>
          <button class="action-btn edit" data-id="${c.id}"><i class="fas fa-pen"></i></button>
          <button class="action-btn extend" data-id="${c.id}"><i class="fas fa-clock"></i></button>
          <button class="action-btn delete" data-id="${c.id}"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

    // attach events
    document.querySelectorAll('.badge').forEach(el => {
      el.addEventListener('click', toggleStatus);
    });
    document.querySelectorAll('.action-btn.copy').forEach(el => el.addEventListener('click', copyHandler));
    document.querySelectorAll('.action-btn.edit').forEach(el => el.addEventListener('click', editHandler));
    document.querySelectorAll('.action-btn.extend').forEach(el => el.addEventListener('click', extendHandler));
    document.querySelectorAll('.action-btn.delete').forEach(el => el.addEventListener('click', deleteHandler));
  }

  // ======= CRUD =======
  function addConfig(name, protocol, expiry, status) {
    configs.push({ id: Date.now(), name, protocol, expiry, status });
    saveConfigs();
    showToast('✅ کانفیگ جدید ساخته شد!', 'success');
  }

  function updateConfig(id, name, protocol, expiry, status) {
    const idx = configs.findIndex(c => c.id === id);
    if (idx > -1) {
      configs[idx] = { ...configs[idx], name, protocol, expiry, status };
      saveConfigs();
      showToast('✅ کانفیگ بروزرسانی شد!', 'success');
    }
  }

  function deleteConfig(id) {
    if (confirm('آیا از حذف این کانفیگ مطمئنی؟')) {
      configs = configs.filter(c => c.id !== id);
      saveConfigs();
      showToast('🗑 کانفیگ حذف شد.', 'info');
    }
  }

  function toggleStatus(e) {
    const id = Number(e.target.dataset.id);
    const c = configs.find(c => c.id === id);
    if (c) {
      c.status = c.status === 'active' ? 'inactive' : 'active';
      saveConfigs();
      showToast(`وضعیت به ${c.status === 'active' ? 'فعال' : 'غیرفعال'} تغییر کرد.`, 'info');
    }
  }

  function extendExpiry(id) {
    const c = configs.find(c => c.id === id);
    if (c && c.expiry) {
      const d = new Date(c.expiry);
      d.setDate(d.getDate() + 30);
      c.expiry = d.toISOString().split('T')[0];
      saveConfigs();
      showToast('⏳ تاریخ انقضا ۳۰ روز تمدید شد!', 'success');
    } else {
      showToast('تاریخ انقضا نامعتبر است', 'error');
    }
  }

  // ======= EVENT HANDLERS =======
  function copyHandler(e) {
    const id = Number(e.currentTarget.dataset.id);
    const c = configs.find(c => c.id === id);
    if (c) {
      const text = `نام: ${c.name}\nپروتکل: ${c.protocol}\nانقضا: ${c.expiry}\nوضعیت: ${c.status}`;
      navigator.clipboard?.writeText(text);
      showToast(`📋 اطلاعات کانفیگ "${c.name}" کپی شد.`, 'success');
    }
  }

  function editHandler(e) {
    const id = Number(e.currentTarget.dataset.id);
    const c = configs.find(c => c.id === id);
    if (c) {
      editId.value = c.id;
      configName.value = c.name;
      configProtocol.value = c.protocol;
      configExpiry.value = c.expiry || '';
      configStatus.value = c.status;
      modalTitle.innerHTML = '<i class="fas fa-pen" style="color:#fbbf24;"></i> ویرایش کانفیگ';
      modal.classList.add('show');
    }
  }

  function extendHandler(e) {
    const id = Number(e.currentTarget.dataset.id);
    extendExpiry(id);
  }

  function deleteHandler(e) {
    const id = Number(e.currentTarget.dataset.id);
    deleteConfig(id);
  }

  // ======= MODAL =======
  function openModalForNew() {
    editId.value = '';
    configName.value = '';
    configProtocol.value = 'V2Ray';
    configExpiry.value = '';
    configStatus.value = 'active';
    modalTitle.innerHTML = '<i class="fas fa-plus-circle" style="color:#fbbf24;"></i> کانفیگ جدید';
    modal.classList.add('show');
  }

  configForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = editId.value ? Number(editId.value) : null;
    const name = configName.value.trim();
    const protocol = configProtocol.value;
    const expiry = configExpiry.value;
    const status = configStatus.value;

    if (!name || !expiry) {
      showToast('لطفاً همه فیلدها را پر کنید', 'error');
      return;
    }

    if (id) {
      updateConfig(id, name, protocol, expiry, status);
    } else {
      addConfig(name, protocol, expiry, status);
    }
    modal.classList.remove('show');
    configForm.reset();
  });

  // ======= SEARCH & FILTER =======
  searchInput.addEventListener('input', () => {
    searchTerm = searchInput.value;
    currentPage = 1;
    renderTable();
  });

  statusFilterEl.addEventListener('change', () => {
    statusFilter = statusFilterEl.value;
    currentPage = 1;
    renderTable();
  });

  // ======= SORT =======
  document.querySelectorAll('[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      if (sortField === field) {
        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        sortField = field;
        sortDir = 'asc';
      }
      renderTable();
    });
  });

  // ======= PAGINATION =======
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; renderTable(); }
  });
  nextPageBtn.addEventListener('click', () => {
    currentPage++; renderTable();
  });

  // ======= THEME =======
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light');
    const icon = themeToggle.querySelector('i');
    icon.className = body.classList.contains('light') ? 'fas fa-sun' : 'fas fa-moon';
  });

  // ======= EXPORT / IMPORT =======
  exportBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(configs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumen_configs_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 خروجی JSON دانلود شد.', 'success');
  });

  importBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data)) {
          configs = data;
          saveConfigs();
          showToast('📂 کانفیگ‌ها با موفقیت وارد شدند.', 'success');
        } else {
          showToast('فرمت فایل نامعتبر است', 'error');
        }
      } catch {
        showToast('خطا در خواندن فایل', 'error');
      }
    };
    reader.readAsText(file);
    fileInput.value = '';
  });

  // ======= LOGIN =======
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('usernameInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    if (username === 'reza grootz' && password === '1234') {
      loginCard.style.display = 'none';
      panelContainer.style.display = 'block';
      displayUsername.textContent = username;
      loadConfigs();
      showToast('✅ خوش آمدی رضا! پنل آماده است.', 'success');
    } else {
      showToast('❌ نام کاربری یا رمز اشتباه است!', 'error');
    }
  });

  // ======= LOGOUT =======
  logoutBtn.addEventListener('click', () => {
    panelContainer.style.display = 'none';
    loginCard.style.display = 'block';
    loginForm.reset();
    showToast('👋 خارج شدید.', 'info');
  });

  // ======= SHOW PASSWORD =======
  let passVisible = false;
  showPassBtn.addEventListener('click', () => {
    passVisible = !passVisible;
    passwordInput.type = passVisible ? 'text' : 'password';
    showPassBtn.textContent = passVisible ? 'Hide' : 'Show';
  });

  // ======= PULL CORD =======
  pullCord.addEventListener('click', () => {
    if (body.classList.contains('is-lit')) return;
    body.classList.add('is-lit');
  });

  // ======= MODAL CLOSE =======
  closeModal.addEventListener('click', () => modal.classList.remove('show'));
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('show');
  });

  // ======= NEW CONFIG SHORTCUT =======
  newConfigBtn.addEventListener('click', openModalForNew);
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      if (panelContainer.style.display !== 'none') openModalForNew();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      if (panelContainer.style.display !== 'none') searchInput.focus();
    }
  });

  // ======= LIVE CLOCK =======
  function updateClock() {
    const now = new Date();
    document.getElementById('liveClock').textContent =
      now.getHours().toString().padStart(2, '0') + ':' +
      now.getMinutes().toString().padStart(2, '0');
  }
  setInterval(updateClock, 10000);
  updateClock();

  // ======= TOAST SYSTEM =======
  function showToast(msg, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    const colors = { success: '#4caf50', error: '#d32f2f', info: '#fbbf24' };
    toast.textContent = msg;
    Object.assign(toast.style, {
      position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
      background: '#1e1e2f', color: '#fff', padding: '12px 28px', borderRadius: '40px',
      backdropFilter: 'blur(12px)', border: `1px solid ${colors[type] || '#fbbf24'}`,
      boxShadow: '0 8px 30px rgba(0,0,0,0.6)', zIndex: '999',
      fontFamily: 'inherit', fontSize: '15px', fontWeight: '500',
      transition: 'opacity 0.4s', opacity: '0'
    });
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.style.opacity = '1');
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  // ======= INIT =======
  loadConfigs();
});
