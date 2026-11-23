document.addEventListener('DOMContentLoaded', () => {
    const eliminarModal = document.getElementById('eliminarEmpleadoModal');
    if (eliminarModal) {
        eliminarModal.addEventListener('show.bs.modal', function (event) {
            const boton = event.relatedTarget;
            document.getElementById('eliminarNombreEmpleado').textContent = boton.dataset.nombre;
            document.getElementById('formEliminarEmpleado').action = boton.dataset.url;
        });
    }
});