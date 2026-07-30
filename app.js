document.addEventListener('DOMContentLoaded', () => {

  // ===== کشیدن طناب =====
  const pullCord = document.getElementById('pullCord');
  const body = document.body;

  pullCord.addEventListener('click', () => {
    if (body.classList.contains('is-lit')) return;
    body.classList.add('is-lit');
  });

  // ===== نمایش/مخفی کردن رمز =====
  const showPassBtn = document.getElementById('showPassBtn');
  const passwordInput = document.getElementById('passwordInput');
  let isPassVisible = false;
  showPassBtn.addEventListener('click', () => {
    isPassVisible = !isPassVisible;
    passwordInput.type = isPassVisible ? 'text' : 'password';
    showPassBtn.textContent = isPassVisible ? 'Hide' : 'Show';
  });

  // ===== لاگین =====
  const loginForm = document.getElementById('loginForm');
  const loginCard = document.getElementById('loginCard');
  const panelContainer = document.getElementById('panel-container');
  const displayUsername = document.getElementById('displayUsername');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('usernameInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();

    if (username === 'reza grootz' && password === '1234') {
      loginCard.style.display = 'none';
      panelContainer.style.display = 'block';
      displayUsername.textContent = username;
      showToast('✅ خوش آمدی رضا! پنل آماده است.');
    } else {
      showToast('❌ نام کاربری یا رمز اشتباه است!', 'error');
    }
  });

  // ===== خروج =====
  document.getElementById('logoutBtn').addEventListener('click', () => {
    panelContainer.style.display = 'none';
    loginCard.style.display = 'block';
    loginForm.reset();
    showToast('👋 خارج شدید.');
  });

  // ===== مودال ساخت کانفیگ =====
  const modal = document.getElementById('newConfigModal');
  const newConfigBtn = document.getElementById('newConfigBtn');
  const closeModalBtn = document.querySelector('.close-modal');

  newConfigBtn.addEventListener('click', () => modal.classList.add('show'));
  closeModalBtn.addEventListener('click', () => modal.classList.remove('show'));
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('show');
  });

  document.getElementById('newConfigForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('✅ کانفیگ جدید با موفقیت ساخته شد!');
    modal.classList.remove('show');
    const tbody = document.getElementById('configTableBody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>کانفیگ جدید</td>
      <td>V2Ray</td>
      <td>۱۴۰۴/۰۴/۱۰</td>
      <td><span class="badge active">فعال</span></td>
      <td>
        <button class="action-btn copy"><i class="fas fa-copy"></i></button>
        <button class="action-btn delete"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.prepend(newRow);
    attachActions();
  });

  // ===== اکشن‌های کپی و حذف =====
  function attachActions() {
    document.querySelectorAll('.action-btn.copy').forEach(btn => {
      btn.removeEventListener('click', copyHandler);
      btn.addEventListener('click', copyHandler);
    });
    document.querySelectorAll('.action-btn.delete').forEach(btn => {
      btn.removeEventListener('click', deleteHandler);
      btn.addEventListener('click', deleteHandler);
    });
  }

  function copyHandler(e) {
    const row = e.target.closest('tr');
    const name = row.querySelector('td:first-child').textContent;
    navigator.clipboard?.writeText(`کانفیگ ${name} کپی شد!`);
    showToast(`📋 لینک کانفیگ "${name}" کپی شد.`);
  }

  function deleteHandler(e) {
    if (confirm('آیا از حذف این کانفیگ مطمئنی؟')) {
      const row = e.target.closest('tr');
      row.remove();
      showToast('🗑 کانفیگ حذف شد.');
    }
  }

  attachActions();

  // ===== توست =====
  function showToast(msg, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: type === 'error' ? '#d32f2f' : '#1e1e2f',
      color: '#fff',
      padding: '12px 28px',
      borderRadius: '40px',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
      zIndex: '999',
      fontFamily: 'inherit',
      fontSize: '15px',
      fontWeight: '500',
      transition: 'opacity 0.4s',
      opacity: '0'
    });
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }
});
