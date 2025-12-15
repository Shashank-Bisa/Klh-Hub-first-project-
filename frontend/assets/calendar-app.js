(function(){
  document.addEventListener('DOMContentLoaded', function(){
    try{
      const calendar = document.getElementById('calendar');
      if(!calendar) return;

      const now = new Date();
      const startYear = now.getFullYear();
      const endYear = startYear + 1;

      const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

      for (let year = startYear; year <= endYear; year++) {
        const yearDiv = document.createElement('div');
        yearDiv.className = 'year';
        const h = document.createElement('h2'); h.textContent = year; yearDiv.appendChild(h);

        for (let month = 0; month < 12; month++) {
          const monthDiv = document.createElement('div');
          monthDiv.className = 'month';

          const title = document.createElement('h3');
          title.textContent = monthNames[month];
          monthDiv.appendChild(title);

          const daysDiv = document.createElement('div');
          daysDiv.className = 'days';

          dayNames.forEach(d => {
            const dn = document.createElement('div');
            dn.className = 'day-name';
            dn.textContent = d;
            daysDiv.appendChild(dn);
          });

          const firstDay = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();

          for (let i = 0; i < firstDay; i++) {
            const blank = document.createElement('div');
            blank.className = 'day';
            daysDiv.appendChild(blank);
          }

          for (let d = 1; d <= daysInMonth; d++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day';

            if (year === now.getFullYear() && month === now.getMonth() && d === now.getDate()) {
              const span = document.createElement('span'); span.className = 'today'; span.textContent = d; dayDiv.appendChild(span);
            } else {
              dayDiv.textContent = d;
            }

            daysDiv.appendChild(dayDiv);
          }

          monthDiv.appendChild(daysDiv);
          yearDiv.appendChild(monthDiv);
        }

        calendar.appendChild(yearDiv);
      }
    }catch(e){
      console.error('Calendar init failed:', e);
    }
  });
})();