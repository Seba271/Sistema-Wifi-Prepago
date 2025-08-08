/* Minimal SPA logic for tabs, auth mock, pricing, and summary */
(() => {
  const TABS = Array.from(document.querySelectorAll('.tab-btn'));
  const PANES = Array.from(document.querySelectorAll('.tab-pane'));
  const payBtn = document.getElementById('payBtn');
  const loginHint = document.getElementById('loginHint');
  const sessionUser = document.getElementById('sessionUser');
  const logoutBtn = document.getElementById('logoutBtn');
  // Eliminado el cronómetro azul; usamos solo el badge accessStatus
  const activeTimer = null;
  const timerLabel = { textContent: '00:00:00' };
  const accessStatus = document.getElementById('accessStatus');

  const ratePerHour = 10000; // Precio por hora en CLP
  const currencyFormatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

  const ratePerHourLabel = document.getElementById('ratePerHourLabel');
  ratePerHourLabel.textContent = `${currencyFormatter.format(ratePerHour)}`;

  // Prices on cards
  document.querySelectorAll('.price').forEach((el) => {
    const minutes = Number(el.getAttribute('data-minutes')) || 0;
    const price = Math.round((minutes / 60) * ratePerHour);
    el.textContent = currencyFormatter.format(price);
  });

  // Tab switching
  function activateTab(tab) {
    TABS.forEach((b) => b.classList.remove('active', 'text-brand-700', 'border-brand-600', 'font-semibold'));
    PANES.forEach((p) => p.classList.add('hidden'));
    const btn = TABS.find((b) => b.dataset.tabTarget === tab);
    const pane = PANES.find((p) => p.dataset.tab === tab);
    if (btn) btn.classList.add('active', 'text-brand-700', 'border-brand-600', 'font-semibold');
    if (pane) pane.classList.remove('hidden');
  }
  TABS.forEach((b) => b.addEventListener('click', () => activateTab(b.dataset.tabTarget)));

  // Custom plan visibility and preview
  const customRadio = document.querySelector('input[name="plan"][value="custom"]');
  const customInputs = document.getElementById('customInputs');
  const hoursInput = document.getElementById('hours');
  const minutesInput = document.getElementById('minutes');
  const customPreview = document.getElementById('customPreview');

  function updateCustomPreview() {
    const h = Number(hoursInput.value || 0);
    const m = Math.min(59, Math.max(0, Number(minutesInput.value || 0)));
    minutesInput.value = String(m);
    customPreview.textContent = `${h} ${h === 1 ? 'hora' : 'horas'} ${m} ${m === 1 ? 'minuto' : 'minutos'}`;
    recalcSummary();
  }

  if (customRadio) {
    customRadio.addEventListener('change', () => {
      if (customRadio.checked) {
        customInputs.classList.remove('hidden');
      }
    });
  }
  [hoursInput, minutesInput].forEach((i) => i && i.addEventListener('input', updateCustomPreview));

  // When selecting predefined plans, hide custom inputs
  document.querySelectorAll('input[name="plan"]').forEach((input) => {
    input.addEventListener('change', () => {
      if (input.value !== 'custom') {
        customInputs.classList.add('hidden');
      }
      recalcSummary();
    });
  });

  // Summary calculation
  const summaryTime = document.getElementById('summaryTime');
  const summaryPrice = document.getElementById('summaryPrice');

  function getSelectedMinutes() {
    const selected = document.querySelector('input[name="plan"]:checked');
    if (!selected) return 0;
    if (selected.value === 'custom') {
      const h = Number(hoursInput.value || 0);
      const m = Number(minutesInput.value || 0);
      return h * 60 + m;
    }
    return Number(selected.value || 0);
  }

  function toHumanTime(totalMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const parts = [];
    if (h > 0) parts.push(`${h} ${h === 1 ? 'hora' : 'horas'}`);
    if (m > 0) parts.push(`${m} ${m === 1 ? 'minuto' : 'minutos'}`);
    return parts.length ? parts.join(' ') : '—';
  }

  function recalcSummary() {
    const minutes = getSelectedMinutes();
    const price = Math.round((minutes / 60) * ratePerHour);
    summaryTime.textContent = toHumanTime(minutes);
    summaryPrice.textContent = minutes > 0 ? currencyFormatter.format(price) : '—';
    payBtn.disabled = minutes <= 0;
  }

  // Mock auth using localStorage
  const LOGIN_KEY = 'cc_af_user';
  function getUser() {
    try { return JSON.parse(localStorage.getItem(LOGIN_KEY) || 'null'); } catch { return null; }
  }
  function setUser(user) {
    if (user) {
      localStorage.setItem(LOGIN_KEY, JSON.stringify(user));
    } else {
      // Si se cierra sesión, detener y reiniciar cronómetro
      stopTimer();
      localStorage.removeItem(LOGIN_KEY);
    }
    refreshSessionUI();
  }
  function refreshSessionUI() {
    const u = getUser();
    if (u) {
      sessionUser.textContent = u.fullName || u.email || 'Usuario';
      sessionUser.classList.remove('hidden');
      logoutBtn.classList.remove('hidden');
      loginHint.classList.add('hidden');
    } else {
      sessionUser.textContent = 'Invitado';
      sessionUser.classList.remove('hidden');
      logoutBtn.classList.add('hidden');
    }
  }
  logoutBtn.addEventListener('click', () => setUser(null));

  // Forms: login and register
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = /** @type {HTMLInputElement} */(document.getElementById('loginEmail')).value.trim();
      const password = /** @type {HTMLInputElement} */(document.getElementById('loginPassword')).value;
      if (!email || !password) return;
      // Mock check: If a registered user exists with this email, use it; otherwise create a minimal session
      const existing = getUser();
      const user = existing && existing.email === email ? existing : { email, fullName: email.split('@')[0] };
      setUser(user);
      activateTab('buy');
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = /** @type {HTMLInputElement} */(document.getElementById('fullName')).value.trim();
      const email = /** @type {HTMLInputElement} */(document.getElementById('email')).value.trim();
      const phone = /** @type {HTMLInputElement} */(document.getElementById('phone')).value.trim();
      const password = /** @type {HTMLInputElement} */(document.getElementById('password')).value;
      if (!fullName || !email || !phone || !password) return;
      setUser({ fullName, email, phone });
      activateTab('buy');
    });
  }

  // Pay button mock
  payBtn.addEventListener('click', () => {
    const user = getUser();
    if (!user) {
      loginHint.classList.remove('hidden');
      activateTab('login');
      return;
    }
    const minutes = getSelectedMinutes();
    if (minutes <= 0) return;
    const total = Math.round((minutes / 60) * ratePerHour);
    alert(`Pago de maqueta\n\nUsuario: ${user.fullName || user.email}\nTiempo: ${toHumanTime(minutes)}\nTotal: ${currencyFormatter.format(total)}\n\nAquí se integrará el proveedor de pago.`);
    startTimer(minutes * 60);
  });

  // Default state
  refreshSessionUI();
  updateCustomPreview();
  recalcSummary();

  // -------------------- Timer logic --------------------
  const TIMER_KEY = 'cc_af_timer';
  let timerIntervalId = null;

  function persistTimer(endEpochSeconds) {
    localStorage.setItem(TIMER_KEY, String(endEpochSeconds));
  }
  function clearTimerPersist() {
    localStorage.removeItem(TIMER_KEY);
  }
  function readPersistedTimer() {
    const raw = localStorage.getItem(TIMER_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  function formatHMS(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const hh = String(Math.floor(s / 3600)).padStart(2, '0');
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  function renderTimer() {
    const end = readPersistedTimer();
    if (!end) {
      timerLabel.textContent = '00:00:00';
      setAccessStatus(false);
      return;
    }
    const now = Math.floor(Date.now() / 1000);
    const remaining = end - now;
    if (remaining <= 0) {
      stopTimer();
      timerLabel.textContent = '00:00:00';
      alert('Tu tiempo ha finalizado.');
      return;
    }
    timerLabel.textContent = formatHMS(remaining);
    setAccessStatus(true, remaining);
  }

  function startTimer(durationSeconds) {
    const end = Math.floor(Date.now() / 1000) + Math.max(1, Math.floor(durationSeconds));
    persistTimer(end);
    if (timerIntervalId) window.clearInterval(timerIntervalId);
    renderTimer();
    timerIntervalId = window.setInterval(renderTimer, 1000);
  }
  function stopTimer() {
    if (timerIntervalId) window.clearInterval(timerIntervalId);
    timerIntervalId = null;
    clearTimerPersist();
    renderTimer();
  }

  // Restore timer on load
  if (readPersistedTimer()) {
    renderTimer();
    timerIntervalId = window.setInterval(renderTimer, 1000);
  }

  // Access status badge
  function setAccessStatus(isActive, remainingSeconds) {
    if (!accessStatus) return;
    const base = 'text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ring-inset ';
    accessStatus.className = base + (isActive ? 'bg-green-100 text-green-700 ring-green-200' : 'bg-red-100 text-red-700 ring-red-200');
    if (isActive) {
      const timeText = typeof remainingSeconds === 'number' ? formatHMS(remainingSeconds) : timerLabel.textContent || '00:00:00';
      accessStatus.textContent = `Acceso a internet · ${timeText}`;
    } else {
      accessStatus.textContent = 'Usuario sin acceso a internet';
    }
  }
  // Initialize badge on load
  (function initAccessBadge() {
    const end = readPersistedTimer();
    if (!end) { setAccessStatus(false); return; }
    const remaining = Math.max(0, end - Math.floor(Date.now() / 1000));
    if (remaining > 0) setAccessStatus(true, remaining); else setAccessStatus(false);
  })();
})();


