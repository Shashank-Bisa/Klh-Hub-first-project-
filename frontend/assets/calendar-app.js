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

  for (let year = startYear; year <= endYear; year++) {
    const yearDiv = document.createElement('div');
    yearDiv.className = 'year';
    const h2 = document.createElement('h2'); h2.textContent = year; yearDiv.appendChild(h2);

    for (let m = 0; m < 12; m++) {
      const month = document.createElement('div');
      month.className = 'month';
      const title = document.createElement('h3'); title.textContent = months[m]; month.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'grid';

      days.forEach(d => {
        const dn = document.createElement('div');
        dn.textContent = d; dn.className = 'day-name'; grid.appendChild(dn);
      });

      const firstDay = new Date(year, m, 1).getDay();
      const totalDays = new Date(year, m + 1, 0).getDate();

      for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement('div'));

      for (let d = 1; d <= totalDays; d++) {
        const day = document.createElement('div'); day.textContent = d; day.className = 'day';
        if (year === now.getFullYear() && m === now.getMonth() && d === now.getDate()) {
          day.innerHTML = `<span class="today">${d}</span>`;
        }
        grid.appendChild(day);
      }

      month.appendChild(grid);
      yearDiv.appendChild(month);
    }

    calendar.appendChild(yearDiv);
  }
});