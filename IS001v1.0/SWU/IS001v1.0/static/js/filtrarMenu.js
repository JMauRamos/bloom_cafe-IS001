document.addEventListener('DOMContentLoaded', () => {
    const buscador = document.querySelector('#buscador');
    const botonesCategoria = document.querySelectorAll('.categoria');
    const gruposCategorias = document.querySelectorAll('.categoria_grupo');

    let textoBusqueda = '';
    let categoriaActiva = 'todos';

    function aplicarFiltros() {
        gruposCategorias.forEach(grupo => {
            const nombreCategoria = grupo.dataset.categoria;
            const productos = grupo.querySelectorAll('.producto');
            let productosVisibles = 0;

            const coincideCategoria = (categoriaActiva === 'todos' || nombreCategoria === categoriaActiva);

            productos.forEach(producto => {
                const nombreProducto = producto.querySelector('h3').textContent.toLowerCase();
                const coincideTexto = nombreProducto.includes(textoBusqueda);

                if (coincideCategoria && coincideTexto) {
                    producto.style.display = 'flex';
                    productosVisibles++;
                } else {
                    producto.style.display = 'none';
                }
            });

            if (productosVisibles === 0) {
                grupo.style.display = 'none';
            } else {
                grupo.style.display = 'flex';
            }
        });
    }

    if (buscador) {
        buscador.addEventListener('input', (e) => {
            textoBusqueda = e.target.value.toLowerCase().trim();
            aplicarFiltros();
        });
    }

    botonesCategoria.forEach(boton => {
        boton.addEventListener('click', () => {
            botonesCategoria.forEach(b => b.classList.remove('activa'));
            boton.classList.add('activa');
            
            categoriaActiva = boton.dataset.categoria;
            aplicarFiltros();
        });
    });
});