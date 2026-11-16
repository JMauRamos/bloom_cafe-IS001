function buscarProducto() {
    const buscador = document.querySelector('#buscador');
    const productos = document.querySelectorAll('.producto');

    if(!buscador || !productos) return;

    buscador.addEventListener('input', () => {
        const texto = buscador.value.toLowerCase().trim();

        productos.forEach(producto => {
            const nombre = producto.querySelector('h3').textContent.toLowerCase();
            if (nombre.includes(texto)) {
                producto.style.display = 'flex';
            } else {
                producto.style.display = 'none';
            }
        });
    });
};

document.addEventListener('DOMContentLoaded', buscarProducto)