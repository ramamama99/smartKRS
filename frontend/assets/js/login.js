/* ============================================
   SmartKRS — Login Page Logic
   ============================================ */

// ----- DOM Elements -----
const form = document.getElementById('login-form');
const alertBox = document.getElementById('alert');
const submitBtn = document.getElementById('submit-btn');
const submitText = document.getElementById('submit-text');
const togglePassword = document.getElementById('toggle-password');
const eyeIcon = document.getElementById('eye-icon');
const passwordInput = document.getElementById('password');
const rememberCheck = document.getElementById('remember-check');

// ----- Redirect kalo udah login -----
if (api.isLoggedIn()) {
  const onboardingDone = localStorage.getItem('smartkrs_onboarding_done');
if (!onboardingDone) {
  window.location.href = 'onboarding.html';
} else {
  window.location.href = 'dashboard.html';
}

}

// ----- Helper: Show Alert -----
function showAlert(message, type = 'error') {
  alertBox.textContent = message;
  alertBox.className = `alert alert-${type} show`;
}

function hideAlert() {
  alertBox.className = 'alert';
}

// ----- Toggle Password Visibility -----
togglePassword.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  eyeIcon.className = isPassword ? 'ti ti-eye-off' : 'ti ti-eye';
});

// ----- Toggle Remember Me -----
let isRemembered = false;
rememberCheck.addEventListener('click', () => {
  isRemembered = !isRemembered;
  rememberCheck.classList.toggle('checked', isRemembered);
});

// ----- Form Submit -----
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  const formData = {
    email: document.getElementById('email').value.trim(),
    password: passwordInput.value,
  };

  // Loading state
  submitBtn.disabled = true;
  submitText.textContent = 'Masuk...';

  try {
    // Hit backend: POST /api/auth/login
    const result = await api.login(formData);

    // Simpan token ke localStorage
    api.setToken(result.token);

    // Simpan nama user buat greeting di dashboard
    localStorage.setItem('smartkrs_user', JSON.stringify({
      name: result.user.name,
      email: result.user.email,
      nim: result.user.nim,
      role: result.user.role,
    }));

    // Redirect berdasarkan role
    if (result.user.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'dashboard.html';
    }

  } catch (error) {
    showAlert(error.message || 'Email atau password salah.');
    submitBtn.disabled = false;
    submitText.textContent = 'Masuk';
  }
});