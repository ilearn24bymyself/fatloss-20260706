import './style.css';
import { Chart, registerables } from 'chart.js';
import { getRecords, saveRecord, deleteRecord, exportData, importData } from './storage.js';
import { renderDashboard } from './dashboard.js';
import { getSession, onAuthStateChange, sendMagicLink, signOut } from './auth.js';

Chart.register(...registerables);

// DOM Elements
const authGate = document.getElementById('authGate');
const appRoot = document.getElementById('appRoot');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginMessage = document.getElementById('loginMessage');
const userEmailEl = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');

const form = document.getElementById('fatLossForm');
const dateInput = document.getElementById('date');
const weeklyMeasurements = document.getElementById('weeklyFields');
const historyTbody = document.getElementById('historyTableBody');
const trendChartCanvas = document.getElementById('trendChart');
const btnExport = document.getElementById('exportBtn');
const btnImport = document.getElementById('btnImport');
const fileImport = document.getElementById('fileImport');

let trendChartInstance = null;

// Initialize
async function init() {
  // Set today's date
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;
  handleDateChange();

  // Event Listeners
  dateInput.addEventListener('change', handleDateChange);
  form.addEventListener('submit', handleFormSubmit);

  // Expose delete to window so inline onclick works
  window.handleDelete = handleDelete;

  // Export/Import
  btnExport.addEventListener('click', async () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(await exportData());
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "fat_loss_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  });

  btnImport.addEventListener('click', () => fileImport.click());
  fileImport.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (await importData(event.target.result)) {
        alert('匯入成功！');
        refreshUI();
      } else {
        alert('匯入失敗，請確認檔案格式。');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  });

  // Auth
  loginForm.addEventListener('submit', handleLoginSubmit);
  logoutBtn.addEventListener('click', handleLogout);

  const session = await getSession();
  showForSession(session);

  onAuthStateChange((session) => {
    showForSession(session);
  });
}

function showForSession(session) {
  if (session) {
    authGate.classList.add('hidden');
    appRoot.classList.remove('hidden');
    userEmailEl.textContent = session.user.email;
    refreshUI();
  } else {
    appRoot.classList.add('hidden');
    authGate.classList.remove('hidden');
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = loginEmail.value.trim();
  if (!email) return;

  const submitBtn = loginForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  loginMessage.classList.add('hidden');

  try {
    await sendMagicLink(email);
    loginMessage.textContent = `登入連結已寄到 ${email}，請去信箱點擊連結。`;
    loginMessage.classList.remove('hidden');
  } catch (err) {
    loginMessage.textContent = `寄送失敗：${err.message}`;
    loginMessage.classList.remove('hidden');
  } finally {
    submitBtn.disabled = false;
  }
}

async function handleLogout() {
  await signOut();
}

function handleDateChange() {
  const d = new Date(dateInput.value);
  // 0 is Sunday
  if (d.getDay() === 0) {
    weeklyMeasurements.classList.remove('hidden');
  } else {
    weeklyMeasurements.classList.add('hidden');
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const record = {
    date: dateInput.value,
    weight: parseFloat(document.getElementById('weight').value),
    bodyFat: parseFloat(document.getElementById('bodyFat').value),
    visceralFat: parseFloat(document.getElementById('visceralFat').value),
  };

  // Only add measurements if it's Sunday
  const d = new Date(record.date);
  if (d.getDay() === 0) {
    const chest = document.getElementById('chest').value;
    const arm = document.getElementById('arm').value;
    const waist = document.getElementById('waist').value;
    const hip = document.getElementById('hip').value;
    const thigh = document.getElementById('thigh').value;

    if(chest) record.chest = parseFloat(chest);
    if(arm) record.arm = parseFloat(arm);
    if(waist) record.waist = parseFloat(waist);
    if(hip) record.hip = parseFloat(hip);
    if(thigh) record.thigh = parseFloat(thigh);
  }

  try {
    await saveRecord(record);
  } catch (err) {
    alert(`儲存失敗：${err.message}`);
    return;
  }

  // reset form partially
  document.getElementById('weight').value = '';
  document.getElementById('bodyFat').value = '';
  document.getElementById('visceralFat').value = '';
  document.getElementById('chest').value = '';
  document.getElementById('arm').value = '';
  document.getElementById('waist').value = '';
  document.getElementById('hip').value = '';
  document.getElementById('thigh').value = '';

  // Advance date by 1 day
  const currentD = new Date(record.date);
  currentD.setDate(currentD.getDate() + 1);
  const nextDateStr = currentD.toISOString().split('T')[0];
  dateInput.value = nextDateStr;

  handleDateChange();
  await refreshUI();

  // Refocus the date input
  dateInput.focus();
}

async function handleDelete(date) {
  if (confirm(`確定要刪除 ${date} 的紀錄嗎？`)) {
    await deleteRecord(date);
    await refreshUI();
  }
}

async function refreshUI() {
  const records = await getRecords();
  renderTable(records);
  renderChart(records);
  renderDashboard(records);
}

function renderTable(records) {
  historyTbody.innerHTML = '';
  records.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="py-3 px-2 text-white/90">${r.date}</td>
      <td class="py-3 px-2 text-right text-white font-bold">${r.weight} kg</td>
      <td class="py-3 px-2 text-right text-pink-300 font-bold">${r.bodyFat} %</td>
      <td class="py-3 px-2 text-center">
        <button class="text-white/50 hover:text-rose-400 transition-colors" onclick="handleDelete('${r.date}')">刪除</button>
      </td>
    `;
    historyTbody.appendChild(tr);
  });
}

function renderChart(records) {
  // Sort chronologically for charts (oldest first)
  const chartData = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));

  const labels = chartData.map(r => r.date.substring(5)); // MM-DD
  const weightData = chartData.map(r => r.weight);
  const bodyFatData = chartData.map(r => r.bodyFat);

  if (trendChartInstance) {
    trendChartInstance.destroy();
  }

  trendChartInstance = new Chart(trendChartCanvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '體重 (kg)',
          data: weightData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          yAxisID: 'yWeight',
          tension: 0.3,
          fill: true
        },
        {
          label: '體脂 (%)',
          data: bodyFatData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          yAxisID: 'yFat',
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        yWeight: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: '體重 (kg)', color: 'rgba(255, 255, 255, 0.8)' },
          ticks: { color: 'rgba(255, 255, 255, 0.8)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        yFat: {
          type: 'linear',
          display: true,
          position: 'right',
          title: { display: true, text: '體脂 (%)', color: 'rgba(255, 255, 255, 0.8)' },
          ticks: { color: 'rgba(255, 255, 255, 0.8)' },
          grid: { drawOnChartArea: false }
        },
        x: {
          ticks: { color: 'rgba(255, 255, 255, 0.8)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      },
      plugins: {
        legend: {
          labels: { color: 'rgba(255, 255, 255, 0.9)' }
        }
      }
    }
  });
}

// Start app
init();
