/* ============================================
   SmartKRS — Register Page Logic
   ============================================ */

// ----- DOM Elements -----
const form = document.getElementById('register-form');
const alertBox = document.getElementById('alert');
const submitBtn = document.getElementById('submit-btn');
const submitText = document.getElementById('submit-text');

const emailInput = document.getElementById('email');
const emailHint = document.getElementById('email-hint');
const passwordInput = document.getElementById('password');
const strengthMeter = document.getElementById('strength-meter');
const strengthHint = document.getElementById('strength-hint');

// ----- Helper: Show Alert -----
function showAlert(message, type = 'error') {
  alertBox.textContent = message;
  alertBox.className = `alert alert-${type} show`;
}

function hideAlert() {
  alertBox.className = 'alert';
}

// ----- Real-time: Email Validation -----
emailInput.addEventListener('input', () => {
  const email = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email === '') {
    emailHint.textContent = '';
    emailHint.className = 'hint';
  } else if (emailRegex.test(email)) {
    emailHint.innerHTML = '<i class="ti ti-check"></i> Email valid';
    emailHint.className = 'hint hint-success';
  } else {
    emailHint.innerHTML = '<i class="ti ti-x"></i> Format email belum benar';
    emailHint.className = 'hint hint-error';
  }
});

// ----- Real-time: Password Strength -----
passwordInput.addEventListener('input', () => {
  const password = passwordInput.value;
  const strength = calculateStrength(password);
  updateStrengthMeter(strength);
});

function calculateStrength(password) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0-4
}

function updateStrengthMeter(score) {
  const bars = strengthMeter.querySelectorAll('.strength-bar');
  bars.forEach((bar, i) => {
    bar.classList.toggle('strength-on', i < score);
  });

  const labels = ['Terlalu lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'];
  strengthHint.textContent = score === 0 ? 'Min. 6 karakter' : `Password ${labels[score].toLowerCase()}`;
}

// ----- Form Submit -----
form.addEventListener('submit', async (e) => {
  e.preventDefault(); // jangan reload halaman
  hideAlert();

  // Ambil data dari form
  const formData = {
    nim: document.getElementById('nim').value.trim(),
    name: document.getElementById('name').value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value,
  };

  // Validation manual sebelum kirim
  if (formData.password.length < 6) {
    showAlert('Password minimal 6 karakter');
    return;
  }

  // Loading state
  submitBtn.disabled = true;
  submitText.textContent = 'Mendaftarkan...';

  try {
    // Hit backend: POST /api/auth/register
    const result = await api.register(formData);

    // SUCCESS — backend balikin user data
    showAlert('Pendaftaran berhasil! Mengarahkan ke login...', 'success');

    // Redirect ke login setelah 1.5 detik
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);

  } catch (error) {
    // ERROR — tampilin pesan dari backend
    showAlert(error.message || 'Terjadi kesalahan, coba lagi.');

    // Reset button
    submitBtn.disabled = false;
    submitText.textContent = 'Daftar sekarang';
  }
});