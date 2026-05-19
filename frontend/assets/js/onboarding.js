/* ============================================
   SmartKRS — Onboarding Logic
   ============================================ */

// ----- Guard: harus login dulu -----
if (!api.isLoggedIn()) {
  window.location.href = 'login.html';
}

// ----- State -----
let currentStep = 1;
let selectedDays = ['Senin', 'Selasa', 'Rabu', 'Kamis'];
let selectedEndTime = '18:00';
let selectedGap = 120;

// ----- Time Slots (step per 60 menit dari 13:30) -----
const timeSlots = [
  '13:30','14:30','15:30','16:30',
  '17:30','18:30','19:30','20:30','21:30'
];

// ----- Day Picker -----
document.querySelectorAll('.day-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    const day = pill.dataset.day;
    pill.classList.toggle('selected');

    if (pill.classList.contains('selected')) {
      if (!selectedDays.includes(day)) selectedDays.push(day);
    } else {
      selectedDays = selectedDays.filter(d => d !== day);
    }
  });
});

// ----- Time Slider -----
const slider = document.getElementById('time-slider');
const timeDisplay = document.getElementById('time-display-val');

slider.addEventListener('input', () => {
  const val = parseInt(slider.value);
  selectedEndTime = timeSlots[val];
  timeDisplay.textContent = selectedEndTime;

  // Update track color
  const pct = (val / (timeSlots.length - 1)) * 100;
  slider.style.setProperty('--slider-pct', `${pct}%`);
});

// ----- Gap Picker -----
document.querySelectorAll('.gap-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.gap-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedGap = parseInt(card.dataset.gap);
  });
});

// ----- Step Navigation -----
function goToStep(step) {
  // Validasi step 1: minimal 1 hari dipilih
  if (currentStep === 1 && step === 2) {
    if (selectedDays.length === 0) {
      document.getElementById('day-error').style.display = 'flex';
      return;
    }
    document.getElementById('day-error').style.display = 'none';
  }

  // Sembunyiin card lama
  document.getElementById(`step-${currentStep}`).style.display = 'none';

  // Update stepper visual
  updateStepper(currentStep, step);

  // Tampilin card baru
  currentStep = step;
  document.getElementById(`step-${step}`).style.display = 'block';
}

function updateStepper(from, to) {
  const stepNums = [
    document.getElementById('step-1-num'),
    document.getElementById('step-2-num'),
    document.getElementById('step-3-num'),
  ];
  const stepLines = [
    document.getElementById('step-line-1'),
    document.getElementById('step-line-2'),
  ];

  // Mark step yang udah selesai
  if (to > from) {
    stepNums[from - 1].classList.remove('step-todo');
    stepNums[from - 1].classList.add('step-done');
    stepNums[from - 1].innerHTML = '<i class="ti ti-check"></i>';

    if (from <= 2) stepLines[from - 1].classList.add('done');
  }

  // Mark current step
  stepNums[to - 1].classList.remove('step-todo', 'step-done');
  stepNums[to - 1].innerHTML = to;

  // Kalo balik (klik kembali)
  if (to < from) {
    stepNums[from - 1].classList.remove('step-done');
    stepNums[from - 1].classList.add('step-todo');
    stepNums[from - 1].innerHTML = from;
    if (from <= 2) stepLines[from - 1].classList.remove('done');
    stepNums[to - 1].classList.remove('step-todo');
    stepNums[to - 1].innerHTML = to;
  }
}

// ----- Finish Onboarding (Save ke Backend) -----
async function finishOnboarding() {
  const finishBtn = document.getElementById('finish-btn');
  const finishText = document.getElementById('finish-text');

  finishBtn.disabled = true;
  finishText.textContent = 'Menyimpan...';

  try {
    // Kirim preferensi ke backend: PUT /api/preferences
    await api.updatePreferences({
      allowed_days: selectedDays,
      latest_end_time: selectedEndTime + ':00', // format HH:MM:SS
      max_gap_minutes: selectedGap,
    });

    // Tandain udah selesai onboarding
    localStorage.setItem('smartkrs_onboarding_done', 'true');

    // Redirect ke dashboard
    window.location.href = 'dashboard.html';

  } catch (error) {
    alert('Gagal menyimpan preferensi: ' + error.message);
    finishBtn.disabled = false;
    finishText.textContent = 'Selesai';
  }
}

// ----- Skip Onboarding -----
function skipOnboarding() {
  localStorage.setItem('smartkrs_onboarding_done', 'true');
  window.location.href = 'dashboard.html';
}