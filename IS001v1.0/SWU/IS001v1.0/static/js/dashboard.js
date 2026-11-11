const periodButton = document.querySelector('#period');
if (periodButton) {
  periodButton.addEventListener('click', () => {
    const choices = ['Esta semana', 'Este mes', 'Hoy'];
    const current = periodButton.textContent.replace('⌄', '');
    const next = choices[(choices.indexOf(current) + 1) % choices.length];
    periodButton.textContent = `${next}⌄`;
  });
}
