document.addEventListener('DOMContentLoaded', () => {
    const inputTelefono = document.getElementById('telefono');
    const botonBuscar = document.getElementById('buscar');
    const contenedorResultado = document.getElementById('resultado');
    const csrfToken = document.querySelector('#csrf-form input[name="csrfmiddlewaretoken"]')?.value
        || getCookie('csrftoken');

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

    contenedorResultado.addEventListener('click', async (event) => {
        const botonCancelar = event.target.closest('.btn-cancelar-pedido');
        if (!botonCancelar) return;

        const telefono = inputTelefono.value.trim();
        if (!window.confirm('¿Confirmas que deseas cancelar este pedido?')) return;

        botonCancelar.disabled = true;
        botonCancelar.textContent = 'Cancelando...';

        try {
            const response = await fetch(
                `/pedidos/api/mis_pedidos/${encodeURIComponent(botonCancelar.dataset.pedidoId)}/cancelar/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                        'X-CSRFToken': csrfToken,
                    },
                    body: new URLSearchParams({ telefono }),
                }
            );
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'No fue posible cancelar el pedido.');

            alert(data.mensaje);
            buscarPedidos(telefono);
        } catch (error) {
            alert(error.message || 'Hubo un problema de conexión. Intenta de nuevo.');
            botonCancelar.disabled = false;
            botonCancelar.textContent = 'Cancelar pedido';
        }
    });

    async function buscarPedidos(telefono) {
        contenedorResultado.innerHTML = '<p style="text-align:center;">Buscando pedidos...</p>';

        try {
            const response = await fetch(`/pedidos/api/mis_pedidos/${encodeURIComponent(telefono)}/`);
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
                const estado = escapeHtml(pedido.estado);
                const botonCancelar = pedido.puede_cancelar
                    ? `<button class="btn-cancelar-pedido" type="button" data-pedido-id="${escapeHtml(pedido.id)}">Cancelar pedido</button>`
                    : '';

                html += `
                    <div class="pedido">
                        <div class="pedido-superior">
                            <div>
                                <h4 class="num_pedido">Pedido #${escapeHtml(pedido.id)}</h4>
                                <p class="fecha">${escapeHtml(pedido.fecha)} a las ${escapeHtml(pedido.hora)}</p>
                            </div>
                            <span class="estado ${estado}">${estado}</span>
                        </div>
                        <details class="detalles">
                            <summary style="cursor:pointer;">Ver productos</summary>
                            <ul>
                                ${pedido.detalles.map(detalle => `<li>${escapeHtml(detalle.cantidad)}x ${escapeHtml(detalle.producto)} (${escapeHtml(detalle.variante)}) - $${escapeHtml(detalle.precio_unitario)}</li>`).join('')}
                            </ul>
                        </details>
                        <div class="total">
                            <span>Total</span>
                            <span>$${escapeHtml(pedido.total)}</span>
                        </div>
                        ${botonCancelar}
                    </div>
                `;
            });
            contenedorResultado.innerHTML = html;
        } catch (error) {
            console.error(error);
            contenedorResultado.innerHTML = '<p style="color:red;text-align:center;">Hubo un error al cargar tus pedidos.</p>';
        }
    }

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        })[character]);
    }

    function getCookie(name) {
        const cookie = document.cookie.split(';').map(value => value.trim())
            .find(value => value.startsWith(`${name}=`));
        return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
    }
});
