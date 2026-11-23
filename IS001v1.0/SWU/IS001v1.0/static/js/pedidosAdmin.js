document.addEventListener('DOMContentLoaded', () => {

    const searchInput = document.getElementById('search');
    const dateFilter = document.getElementById('dateFilter');
    const tabs = document.querySelectorAll('.tab');
    const filas = document.querySelectorAll('.order-row');
    const emptyMessage = document.getElementById('empty');
    const resultCount = document.getElementById('resultCount');

    let currentStatus = 'TODOS';
    let currentDate = 'today';
    let currentText = '';

    function aplicarFiltros() {
        const hoy = new Date().toISOString().split('T')[0];
        const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        let visibles = 0;

        filas.forEach(fila => {
            const statusFila = fila.dataset.status;
            const fechaFila = fila.dataset.fecha;
            const contenido = fila.dataset.search;

            const matchTexto = contenido.includes(currentText);
            
            let matchFecha = true;
            if (currentDate === 'today') matchFecha = fechaFila === hoy;
            else if (currentDate === 'yesterday') matchFecha = fechaFila === ayer;
            
            const matchStatus = (currentStatus === 'TODOS' || statusFila === currentStatus);

            if (matchTexto && matchFecha && matchStatus) {
                fila.style.display = '';
                visibles++;
            } else {
                fila.style.display = 'none';
            }
        });

        if (resultCount) {
            resultCount.textContent = `Mostrando ${visibles} ${visibles === 1 ? 'pedido' : 'pedidos'}`;
        }

        if (emptyMessage) {
            emptyMessage.hidden = visibles > 0;
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentText = e.target.value.toLowerCase().trim();
            aplicarFiltros();
        });
    }

    if (dateFilter) {
        dateFilter.addEventListener('change', (e) => {
            currentDate = e.target.value;
            aplicarFiltros();
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            currentStatus = tab.dataset.status;
            aplicarFiltros();
        });
    });

    document.querySelectorAll('.btn-avanzar').forEach(boton => {
        boton.addEventListener('click', async () => {
            const pedidoId = boton.dataset.id;
            
            boton.disabled = true;
            const textoOriginal = boton.textContent;
            boton.textContent = 'Procesando...';

            try {
                const csrfToken = getCookie('csrftoken');
                
                const response = await fetch(`/pedidos/api/pedido/${pedidoId}/cambiar_estado/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrfToken,
                    }
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    window.location.reload();
                } else {
                    alert(`Error: ${data.error}`);
                    boton.disabled = false;
                    boton.textContent = textoOriginal;
                }
            } catch (error) {
                console.error('Error al cambiar estado:', error);
                alert('Hubo un problema de conexión. Intenta de nuevo.');
                boton.disabled = false;
                boton.textContent = textoOriginal;
            }
        });
    });

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const detalleModal = document.getElementById('detallePedidoModal');

    if (detalleModal) {
        detalleModal.addEventListener('show.bs.modal', async function (event) {
            const boton = event.relatedTarget;
            const pedidoId = boton.dataset.id;
            
            document.getElementById('detalle-productos').innerHTML = 
                '<p class="text-muted text-center">Cargando detalles...</p>';
            
            try {
                const response = await fetch(`/pedidos/api/pedido/${pedidoId}/detalle/`);
                const data = await response.json();
                
                if (!response.ok) throw new Error(data.error);
                
                document.getElementById('detalle-id-pedido').textContent = `#${data.id}`;
                document.getElementById('detalle-cliente').textContent = data.cliente;
                document.getElementById('detalle-telefono').textContent = data.telefono;
                document.getElementById('detalle-lugar').textContent = data.lugar_entrega;
                document.getElementById('detalle-fecha').textContent = data.fecha;
                document.getElementById('detalle-hora').textContent = data.hora;
                document.getElementById('detalle-pago').textContent = data.metodo_pago;
                document.getElementById('detalle-total').textContent = data.total.toFixed(2);
                document.getElementById('detalle-empleado').textContent = data.empleado_preparacion;
                
                let html = '';
                data.detalles.forEach(detalle => {
                    html += `
                        <div class="detalle-item mb-3 pb-3" style="border-bottom: 1px solid #eee;">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <strong>${detalle.cantidad}x ${detalle.producto}</strong>
                                    <span class="text-muted">(${detalle.variante})</span>
                                </div>
                                <div>
                                    <strong>$${detalle.subtotal.toFixed(2)}</strong>
                                </div>
                            </div>
                            <small class="text-muted d-block">
                                Precio unitario: $${detalle.precio_unitario.toFixed(2)}
                            </small>
                    `;
                    
                    if (detalle.notas) {
                        html += `<div class="mt-1"><em>Notas: ${detalle.notas}</em></div>`;
                    }
                    
                    if (detalle.modificaciones.length > 0) {
                        html += '<div class="mt-2 ps-3">';
                        html += '<small><strong>Extras:</strong></small><ul class="mb-0">';
                        detalle.modificaciones.forEach(mod => {
                            html += `<li><small>${mod.accion}: ${mod.nombre} (+$${mod.costo_extra.toFixed(2)})</small></li>`;
                        });
                        html += '</ul></div>';
                    }
                    
                    html += '</div>';
                });
                
                if (data.detalles.length === 0) {
                    html = '<p class="text-muted text-center">Este pedido no tiene productos.</p>';
                }
                
                document.getElementById('detalle-productos').innerHTML = html;
                
            } catch (error) {
                console.error(error);
                document.getElementById('detalle-productos').innerHTML = 
                    '<p class="text-danger text-center">Error al cargar los detalles.</p>';
            }
        });
    }

    aplicarFiltros();
});