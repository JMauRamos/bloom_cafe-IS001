document.addEventListener('DOMContentLoaded', () => {
    const inputTelefono = document.getElementById('telefono');
    const botonBuscar = document.getElementById('buscar');
    const contenedorResultado = document.getElementById('resultado');

    const urlParams = new URLSearchParams(window.location.search);
    const telefonoDesdeUrl = urlParams.get('telefono');

    if (telefonoDesdeUrl) {
        inputTelefono.value = telefonoDesdeUrl;
        buscarPedidos(telefonoDesdeUrl);
    }

    botonBuscar.addEventListener('click', () => {
        const telefono = inputTelefono.value.trim();
        if (telefono === '') {
            alert('Por favor, ingresa un número de teléfono.');
            return;
        }
        buscarPedidos(telefono);
    });

    async function buscarPedidos(telefono) {
        contenedorResultado.innerHTML = '<p style="text-align:center;">Buscando pedidos...</p>';
        
        try {
            const response = await fetch(`/pedidos/api/mis_pedidos/${telefono}/`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Error al buscar');

            if (data.pedidos.length === 0) {
                contenedorResultado.innerHTML = `
                    <div class="estado-inicial">
                        <h3>No hay pedidos</h3>
                        <p>No encontramos pedidos asociados a este número.</p>
                    </div>`;
                return;
            }

            let html = '';
            data.pedidos.forEach(pedido => {
                html += `
                    <div class="tarjeta_pedido" style="border: 1px solid #ccc; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between;">
                            <h4 class="num_pedido">Pedido #${pedido.id}</h4>
                            <span class="estado ${pedido.estado}">
                                ${pedido.estado}
                            </span>
                        </div>
                        <p><strong>Fecha:</strong> ${pedido.fecha} a las ${pedido.hora}</p>
                        <p><strong>Total:</strong> $${pedido.total}</p>
                        <details>
                            <summary style="cursor: pointer;">Ver productos</summary>
                            <ul style="margin-top: 10px;">
                                ${pedido.detalles.map(detalle => `<li>${detalle.cantidad}x ${detalle.producto} (${detalle.variante}) - $${detalle.precio_unitario}</li>`).join('')}
                            </ul>
                        </details>
                    </div>
                `;
            });
            contenedorResultado.innerHTML = html;

        } catch (error) {
            console.error(error);
            contenedorResultado.innerHTML = '<p style="color: red; text-align: center;">Hubo un error al cargar tus pedidos.</p>';
        }
    }
});