const categorias = document.querySelectorAll('.categoria');
const productos = document.querySelectorAll('.producto');

categorias.forEach(categoria => {
    categoria.addEventListener('click', () => {
        const categoriaSeleccionada = categoria.dataset.categoria;

        categorias.forEach(c => {
            c.classList.remove('activa');
        });

        categoria.classList.add('activa');

        productos.forEach(producto => {
            const categoriaProducto = producto.dataset.categoria;
            if (categoriaSeleccionada === 'todos' || categoriaProducto === categoriaSeleccionada) {
                producto.style.display = '';
            } else {
                producto.style.display = 'none';
            }
        });
    });
});