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

  if (!elWeight) return; // guard

  // Reset defaults
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

  // Delta calculation only applies on Sundays
  const dNew = new Date(newest.date);
  if (dNew.getDay() !== 0) return;

  const targetTime = dNew.getTime() - 14 * 24 * 60 * 60 * 1000;
  let bestOldRecord = null;
  let minDiff = Infinity;
  for(let i=1; i<records.length; i++) {
     const t = new Date(records[i].date).getTime();
     const diffDays = Math.abs((t - targetTime) / (1000 * 3600 * 24));
     if(diffDays <= 3 && diffDays < minDiff) {
       minDiff = diffDays;
       bestOldRecord = records[i];
     }
  }

  if (!bestOldRecord) return;

  // Calculate Deltas
  const updateBadge = (wrapper, arrowEl, valEl, vNew, vOld, isBfVf) => {
    const diff = parseFloat(vNew) - parseFloat(vOld);
    if (isNaN(diff)) return;
    
    wrapper.classList.remove('hidden');
    // For flex items, ensure flex is restored.
    if (!isBfVf) {
        wrapper.classList.add('flex');
    }

    let arrow = '➖';
    let valStr = Math.abs(diff).toFixed(1);
    
    wrapper.classList.remove('bg-emerald-400/20', 'text-emerald-300', 'border-emerald-400/30', 'bg-rose-400/20', 'text-rose-300', 'border-rose-400/30', 'bg-neutral-400/20', 'text-neutral-300', 'border-neutral-400/30');

    if (diff < 0) {
      arrow = '⬇';
      wrapper.classList.add('bg-emerald-400/20', 'text-emerald-300', 'border-emerald-400/30');
    } else if (diff > 0) {
      arrow = '⬆';
      wrapper.classList.add('bg-rose-400/20', 'text-rose-300', 'border-rose-400/30');
    } else {
      arrow = '➖';
      wrapper.classList.add('bg-neutral-400/20', 'text-neutral-300', 'border-neutral-400/30');
      valStr = '0.0';
    }

    if (isBfVf) {
      wrapper.innerText = `${arrow} ${valStr}`;
    } else {
      arrowEl.innerText = arrow;
      valEl.innerText = valStr;
    }
  };

  updateBadge(bWeight, bWeightArrow, bWeightVal, newest.weight, bestOldRecord.weight, false);
  updateBadge(bBf, null, null, newest.bodyFat, bestOldRecord.bodyFat, true);
  updateBadge(bVf, null, null, newest.visceralFat, bestOldRecord.visceralFat, true);
}
