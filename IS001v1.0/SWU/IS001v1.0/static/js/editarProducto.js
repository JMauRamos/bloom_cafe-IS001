function agregarVariante() {
    const container = document.getElementById('variantes-container');
    const template = container.querySelector('.variante-row');
    const nuevaFila = template.cloneNode(true);
    nuevaFila.querySelector('select').value = '';
    nuevaFila.querySelector('input').value = '';
    container.appendChild(nuevaFila);
}

function eliminarVariante(btn) {
    const container = document.getElementById('variantes-container');
    const total = container.querySelectorAll('.variante-row').length;
    if (total > 1) {
        btn.closest('.variante-row').remove();
    } else {
        alert('Debe haber al menos una variante configurada.');
    }
}