// Minimal two-year calendar (user-supplied logic)
document.addEventListener('DOMContentLoaded', function(){
  const calendar = document.getElementById('calendar');
  if (!calendar) return;

  const now = new Date();
  const startYear = now.getFullYear();
  const endYear = startYear + 1;

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  // Controls container
  const controls = document.createElement('div');
  controls.className = 'cal-controls-top';
  controls.innerHTML = `<div class="controls-inner" style="display:flex;gap:8px;align-items:center;justify-content:center;margin-bottom:12px">
    <button class="btn" id="cal-prev">Prev</button>
    <select id="jump-month"></select>
    <select id="jump-year"></select>
    <button class="btn" id="cal-go">Go</button>
    <button class="btn" id="cal-today">Today</button>
    <button class="btn" id="cal-next">Next</button>
  </div>`;
  calendar.parentNode.insertBefore(controls, calendar);

  const monthSelect = controls.querySelector('#jump-month');
  const yearSelect = controls.querySelector('#jump-year');
  months.forEach((m,i)=>{ const o = document.createElement('option'); o.value = i; o.text = m; monthSelect.appendChild(o); });
  for(let y = startYear; y <= endYear; y++){ const o = document.createElement('option'); o.value = y; o.text = y; yearSelect.appendChild(o); }

  let currentIndex = startYear*12 + new Date().getMonth();

  function getMonthElement(idx){ const y = Math.floor(idx/12); const m = idx%12; return document.querySelector(`.month[data-year="${y}"][data-month="${m}"]`); }
  function scrollToIndex(idx){ const el = getMonthElement(idx); if (el) el.scrollIntoView({behavior:'smooth',block:'start'}); currentIndex = idx; syncControls(); }
  function syncControls(){ const y = Math.floor(currentIndex/12); const m = currentIndex%12; monthSelect.value = m; yearSelect.value = y; }

  for (let year = startYear; year <= endYear; year++) {
    const yearDiv = document.createElement('div');
    yearDiv.className = 'year';
    const h2 = document.createElement('h2'); h2.textContent = year; yearDiv.appendChild(h2);

    for (let m = 0; m < 12; m++) {
      const month = document.createElement('div');
      month.className = 'month';
      month.dataset.year = year; month.dataset.month = m;
      const title = document.createElement('h3'); title.textContent = months[m]; month.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'grid';

      days.forEach(d => {
        const dn = document.createElement('div');
        dn.textContent = d; dn.className = 'day-name'; grid.appendChild(dn);
      });

      const firstDay = new Date(year, m, 1).getDay();
      const totalDays = new Date(year, m + 1, 0).getDate();

      for (let i = 0; i < firstDay; i++) { const blank = document.createElement('div'); blank.className='day empty'; grid.appendChild(blank); }

      for (let d = 1; d <= totalDays; d++) {
        const day = document.createElement('div'); day.className = 'day';
        const dayNum = document.createElement('span'); dayNum.className = 'day-num'; dayNum.textContent = d;
        day.appendChild(dayNum);
        // accessibility
        day.tabIndex = 0;
        day.setAttribute('role','button');
        const iso = new Date(year, m, d).toISOString().slice(0,10);
        day.setAttribute('aria-label', `${months[m]} ${d}, ${year}`);
        day.dataset.date = iso;

        // highlight today
        if (year === now.getFullYear() && m === now.getMonth() && d === now.getDate()) {
          dayNum.classList.add('today');
        }

        // click to toggle a note indicator (simple localStorage)
        day.addEventListener('click', ()=>{
          const key = 'cal-note-'+iso;
          const existing = localStorage.getItem(key);
          const note = prompt('Add note for '+iso, existing||'');
          if (note === null) return; // cancelled
          if (note.trim().length === 0) { localStorage.removeItem(key); day.classList.remove('has-note'); } else { localStorage.setItem(key,note); day.classList.add('has-note'); }
        });

        // show dot if note exists
        if (localStorage.getItem('cal-note-'+iso)) day.classList.add('has-note');

        grid.appendChild(day);
      }

      month.appendChild(grid);
      yearDiv.appendChild(month);
    }

    calendar.appendChild(yearDiv);
  }

  // wire controls
  document.getElementById('cal-prev').addEventListener('click', ()=> { scrollToIndex(currentIndex-1); });
  document.getElementById('cal-next').addEventListener('click', ()=> { scrollToIndex(currentIndex+1); });
  document.getElementById('cal-today').addEventListener('click', ()=> { const idx = startYear*12 + new Date().getMonth(); scrollToIndex(idx); });
  document.getElementById('cal-go').addEventListener('click', ()=> { const idx = parseInt(yearSelect.value,10)*12 + parseInt(monthSelect.value,10); scrollToIndex(idx); });

  // initial scroll to current month
  syncControls(); scrollToIndex(currentIndex);

  // keyboard navigation: left/right to prev/next month
  document.addEventListener('keydown', (e)=>{ if (e.key === 'ArrowLeft') scrollToIndex(currentIndex-1); if (e.key === 'ArrowRight') scrollToIndex(currentIndex+1); });

});