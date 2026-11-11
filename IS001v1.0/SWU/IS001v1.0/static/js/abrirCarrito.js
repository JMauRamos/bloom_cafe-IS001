const carritoTrigger = document.querySelector('#carrito_trigger');
const cerrarCarrito = document.querySelector('#cerrar_carrito');
const carritoPreview = document.querySelector('.carrito_abrir');

carritoTrigger.addEventListener('click', () => {
    carritoTrigger.classList.toggle('activo');
    carritoPreview.classList.toggle('activo');
});

cerrarCarrito.addEventListener('click', () => {
    carritoTrigger.classList.toggle('activo');
    carritoPreview.classList.toggle('activo');
});

document.addEventListener('click', (event) => {
    const clickCarrito = carritoPreview.contains(event.target);
    const clickTrigger = carritoTrigger.contains(event.target);

    if (!clickCarrito && !clickTrigger && carritoPreview.classList.contains('activo')) {
        carritoPreview.classList.remove('activo');
        carritoTrigger.classList.remove('activo');
    }
});