const periodSelect = document.querySelector('#period');

if (periodSelect) {
  periodSelect.addEventListener('change', () => {
    if (periodSelect.form) {
      periodSelect.form.requestSubmit();
    }
  });
}

