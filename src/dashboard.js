export function renderDashboard(records) {
  const elWeight = document.getElementById('bento-weight');
  const elBf = document.getElementById('bento-bf');
  const elVf = document.getElementById('bento-vf');
  const elDate = document.getElementById('bento-date');
  const bWeight = document.getElementById('badge-weight');
  const bWeightArrow = document.getElementById('badge-weight-arrow');
  const bWeightVal = document.getElementById('badge-weight-val');
  const bBf = document.getElementById('badge-bf');
  const bVf = document.getElementById('badge-vf');

  if (!elWeight) return;

  elWeight.innerText = '--';
  elBf.innerText = '--';
  elVf.innerText = '--';
  elDate.innerText = '最後紀錄：--';
  bWeight.classList.add('hidden');
  bBf.classList.add('hidden');
  bVf.classList.add('hidden');

  if (!records || records.length === 0) return;

  const newest = records[0];
  elWeight.innerText = newest.weight;
  elBf.innerText = newest.bodyFat;
  elVf.innerText = newest.visceralFat;
  elDate.innerText = `最後紀錄：${newest.date}`;

  // Compare latest Sunday vs previous Sunday
  const sundays = records.filter(r => new Date(r.date).getDay() === 0);
  if (sundays.length < 2) return;

  const cur = sundays[0];
  const prev = sundays[1];

  const updateBadge = (wrapper, arrowEl, valEl, vNew, vOld, isBfVf) => {
    const diff = parseFloat(vNew) - parseFloat(vOld);
    if (isNaN(diff)) return;
    wrapper.classList.remove('hidden');
    if (!isBfVf) wrapper.classList.add('flex');
    wrapper.classList.remove(
      'bg-emerald-400/20','text-emerald-300','border-emerald-400/30',
      'bg-rose-400/20','text-rose-300','border-rose-400/30',
      'bg-neutral-400/20','text-neutral-300','border-neutral-400/30'
    );
    let sign, valStr = Math.abs(diff).toFixed(1);
    if (diff < 0) {
      sign = '-';
      wrapper.classList.add('bg-emerald-400/20','text-emerald-300','border-emerald-400/30');
    } else if (diff > 0) {
      sign = '+';
      wrapper.classList.add('bg-rose-400/20','text-rose-300','border-rose-400/30');
    } else {
      sign = '';
      valStr = '0.0';
      wrapper.classList.add('bg-neutral-400/20','text-neutral-300','border-neutral-400/30');
    }
    if (isBfVf) {
      wrapper.innerText = `${sign}${valStr}`;
    } else {
      arrowEl.innerText = sign;
      valEl.innerText = valStr;
    }
  };

  updateBadge(bWeight, bWeightArrow, bWeightVal, cur.weight, prev.weight, false);
  updateBadge(bBf, null, null, cur.bodyFat, prev.bodyFat, true);
  updateBadge(bVf, null, null, cur.visceralFat, prev.visceralFat, true);
}

function deltaBadge(cur, old, unit) {
  const diff = parseFloat(cur) - parseFloat(old);
  if (isNaN(diff)) return '';
  const neutral = diff === 0, decreased = diff < 0;
  const sign = neutral ? '' : (decreased ? '-' : '+');
  const color = neutral ? 'text-white/60' : (decreased ? 'text-emerald-300' : 'text-rose-300');
  return `<span class="${color} font-semibold">${sign}${Math.abs(diff).toFixed(1)}${unit}</span>`;
}

export function renderWeeklyProgress(records) {
  const panel = document.getElementById('weeklyProgressPanel');
  const totalEl = document.getElementById('weeklyProgressTotal');
  const listEl = document.getElementById('weeklyProgressList');
  if (!panel) return;

  const sundaysAsc = records
    .filter(r => new Date(r.date).getDay() === 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (sundaysAsc.length < 2) {
    panel.classList.add('hidden');
    return;
  }
  panel.classList.remove('hidden');

  const baseline = sundaysAsc[0];
  const latest = sundaysAsc[sundaysAsc.length - 1];

  const measurementSpans = [
    latest.chest && baseline.chest ? `<span>胸圍 ${deltaBadge(latest.chest, baseline.chest, 'cm')}</span>` : '',
    latest.arm && baseline.arm ? `<span>上手臂 ${deltaBadge(latest.arm, baseline.arm, 'cm')}</span>` : '',
    latest.waist && baseline.waist ? `<span>腰圍 ${deltaBadge(latest.waist, baseline.waist, 'cm')}</span>` : '',
    latest.hip && baseline.hip ? `<span>臀圍 ${deltaBadge(latest.hip, baseline.hip, 'cm')}</span>` : '',
    latest.thigh && baseline.thigh ? `<span>大腿 ${deltaBadge(latest.thigh, baseline.thigh, 'cm')}</span>` : '',
  ].filter(Boolean).join('');

  totalEl.innerHTML = `
    <p class="text-xs text-white/40 px-1 mb-2">🏁 總計（${baseline.date} → ${latest.date}）</p>
    <div class="glass rounded-2xl p-4 space-y-2 text-sm">
      <div class="flex flex-wrap gap-x-6 gap-y-1 justify-center">
        <span>體重 ${deltaBadge(latest.weight, baseline.weight, 'kg')}</span>
        <span>體脂 ${deltaBadge(latest.bodyFat, baseline.bodyFat, '%')}</span>
        <span>內臟脂肪 ${deltaBadge(latest.visceralFat, baseline.visceralFat, '')}</span>
      </div>
      ${measurementSpans ? `<div class="flex flex-wrap gap-x-6 gap-y-1 justify-center pt-2 border-t border-white/10">${measurementSpans}</div>` : ''}
    </div>`;

  const rows = [];
  for (let i = sundaysAsc.length - 1; i > 0; i--) {
    const cur = sundaysAsc[i];
    const prev = sundaysAsc[i - 1];
    rows.push(`
      <div class="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2 text-sm">
        <span class="text-white/50">${prev.date} → ${cur.date}</span>
        <span class="flex gap-3">
          ${deltaBadge(cur.weight, prev.weight, 'kg')}
          ${deltaBadge(cur.bodyFat, prev.bodyFat, '%')}
        </span>
      </div>`);
  }
  listEl.innerHTML = rows.join('');
}
