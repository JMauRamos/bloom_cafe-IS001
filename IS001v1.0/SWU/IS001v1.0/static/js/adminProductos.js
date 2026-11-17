function agregarVariante() {
    const container = document.getElementById('variantes-container');
    const row = container.querySelector('.variante-row');
    
    const nuevaFila = row.cloneNode(true);
    
    nuevaFila.querySelector('select').value = '';
    nuevaFila.querySelector('input').value = '';
    
    container.appendChild(nuevaFila);
}

function eliminarVariante(btn) {
    const container = document.getElementById('variantes-container');
    const totalFilas = container.querySelectorAll('.variante-row').length;
    
    if (totalFilas > 1) {
        btn.closest('.variante-row').remove();
    } else {
        alert('Debe haber al menos un tamaño configurado.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const Buscador = document.getElementById('searchProducts');
    const Categorias = document.querySelectorAll('.category-tab');
    const filasTabla = document.querySelectorAll('#productsTable tr');
    const mensajeVacio = document.getElementById('emptyProducts');
    const contadorTabla = document.getElementById('tableCount');

    let categoriaActual = 'Todos';
    let textoBusqueda = '';

    function filtrarTabla() {
        let contadorVisible = 0;

        filasTabla.forEach(row => {
            const elementoProducto = row.querySelector('.product-name');
            const elementoCategoria = row.querySelector('.category-label');
            
            if (!elementoProducto || !elementoCategoria) return;

            const nombreProducto = elementoProducto.textContent.toLowerCase().trim();
            const nombreCategoria = elementoCategoria.textContent.trim();

            const matchesSearch = nombreProducto.includes(textoBusqueda);
            const matchesCategory = (categoriaActual === 'Todos' || nombreCategoria === categoriaActual);

            if (matchesSearch && matchesCategory) {
                row.style.display = '';
                contadorVisible++;
            } else {
                row.style.display = 'none';
            }
        });

        if (contadorTabla) {
            contadorTabla.textContent = `Mostrando ${contadorVisible} productos`;
        }

        if (mensajeVacio) {
            if (contadorVisible === 0) {
                mensajeVacio.hidden = false;
            } else {
                mensajeVacio.hidden = true;
            }
        }
    }

    if (Buscador) {
        Buscador.addEventListener('input', (e) => {
            textoBusqueda = e.target.value.toLowerCase().trim();
            filtrarTabla();
        });
    }

    Categorias.forEach(tab => {
        tab.addEventListener('click', () => {
            Categorias.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            categoriaActual = tab.dataset.category;
            filtrarTabla();
        });
    });

    const eliminarModal = document.getElementById('eliminarProductoModal');

    if (eliminarModal) {
        eliminarModal.addEventListener('show.bs.modal', function (event) {
            const boton = event.relatedTarget;
            
            const nombre = boton.dataset.nombre;
            const url = boton.dataset.url;

            document.getElementById('eliminarNombreProducto').textContent = nombre;
            document.getElementById('formEliminarProducto').action = url;
        });
    }
});