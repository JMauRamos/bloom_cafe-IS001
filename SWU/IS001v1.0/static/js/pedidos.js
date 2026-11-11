const orders = [
  {
    id: '001',
    name: 'María González',
    initials: 'MG',
    products: 'Latte (M)',
    time: '10:00',
    total: '$65',
    status: 'Entregado',
  },
  {
    id: '002',
    name: '—',
    initials: '—',
    products: 'Croissant',
    time: '10:15',
    total: '$45',
    status: 'En proceso',
  },
  {
    id: '003',
    name: 'Carlos Ruiz',
    initials: 'CR',
    products: 'Americano (M)',
    time: '10:30',
    total: '$50',
    status: 'Listo',
  },
  {
    id: '004',
    name: 'Sofía López',
    initials: 'SL',
    products: 'Matcha (G)',
    time: '11:00',
    total: '$75',
    status: 'En proceso',
  },
  {
    id: '005',
    name: '—',
    initials: '—',
    products: 'Cheesecake',
    time: '11:20',
    total: '$60',
    status: 'Cancelado',
  },
  {
    id: '006',
    name: 'Ana Torres',
    initials: 'AT',
    products: 'Latte (G)',
    time: '11:45',
    total: '$70',
    status: 'Listo',
  },
  {
    id: '007',
    name: 'Diego Pérez',
    initials: 'DP',
    products: 'Capuccino (M)',
    time: '12:10',
    total: '$60',
    status: 'En proceso',
  },
  {
    id: '008',
    name: 'Lucía Méndez',
    initials: 'LM',
    products: 'Té verde + Pan',
    time: '12:25',
    total: '$55',
    status: 'Entregado',
  },
  {
    id: '009',
    name: '—',
    initials: '—',
    products: 'Latte (M)',
    time: '12:40',
    total: '$65',
    status: 'En proceso',
  },
  {
    id: '010',
    name: 'Jorge Díaz',
    initials: 'JD',
    products: 'Americano + Muffin',
    time: '13:05',
    total: '$85',
    status: 'Entregado',
  },
  {
    id: '011',
    name: 'Elena Cruz',
    initials: 'EC',
    products: 'Frappé (G)',
    time: '13:20',
    total: '$80',
    status: 'Listo',
  },
  {
    id: '012',
    name: 'Pablo Reyes',
    initials: 'PR',
    products: 'Latte (M)',
    time: '13:45',
    total: '$65',
    status: 'Entregado',
  },
];

const perPage = 7;
let activeStatus = 'Todos';
let currentPage = 1;

const body = document.querySelector('#orders');
const search = document.querySelector('#search');
const empty = document.querySelector('#empty');
const resultCount = document.querySelector('#resultCount');
const pagination = document.querySelector('#pagination');

function render() {
  const query = search.value.trim().toLocaleLowerCase('es');
  const filtered = orders.filter((order) => {
    const matchesStatus = activeStatus === 'Todos' || order.status === activeStatus;
    const searchableText = `${order.id} ${order.name} ${order.products}`
      .toLocaleLowerCase('es');

    return matchesStatus && searchableText.includes(query);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  currentPage = Math.min(currentPage, totalPages);

  const startIndex = (currentPage - 1) * perPage;
  const visible = filtered.slice(startIndex, currentPage * perPage);

  body.innerHTML = visible
    .map((order) => {
      const statusClass = {
        Entregado: 'delivered',
        'En proceso': 'process',
        Listo: 'ready-status',
        Cancelado: 'cancelled',
      }[order.status];

      return `
        <tr>
          <td class="order-id">#${order.id}</td>
          <td>
            <span class="client">
              <span class="client-avatar">${order.initials}</span>
              ${order.name}
            </span>
          </td>
          <td>${order.products}</td>
          <td>${order.time}</td>
          <td class="amount">${order.total}</td>
          <td><span class="status ${statusClass}">${order.status}</span></td>
          <td><button class="view" data-order="${order.id}">Ver pedido</button></td>
        </tr>
      `;
    })
    .join('');

  empty.hidden = filtered.length > 0;
  resultCount.textContent = filtered.length
    ? `Mostrando ${startIndex + 1}–${Math.min(currentPage * perPage, filtered.length)} de ${filtered.length} pedidos`
    : '0 pedidos';

  const pageButtons = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    const activeClass = page === currentPage ? 'active' : '';

    return `<button class="page-number ${activeClass}" data-page="${page}">${page}</button>`;
  }).join('');

  pagination.innerHTML = `
    <button class="page-arrow" data-page="prev" aria-label="Página anterior" ${currentPage === 1 ? 'disabled' : ''}>‹</button>
    ${pageButtons}
    <button class="page-arrow" data-page="next" aria-label="Página siguiente" ${currentPage === totalPages ? 'disabled' : ''}>›</button>
  `;
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelector('.tab.active').classList.remove('active');
    tab.classList.add('active');
    activeStatus = tab.dataset.status;
    currentPage = 1;
    render();
  });
});

search.addEventListener('input', () => {
  currentPage = 1;
  render();
});

document.querySelector('#dateFilter').addEventListener('change', (event) => {
  document.querySelector('.eyebrow').textContent = event.target.value === 'yesterday'
    ? 'ADMINISTRACIÓN / PEDIDOS / AYER'
    : 'ADMINISTRACIÓN / PEDIDOS';
});

pagination.addEventListener('click', (event) => {
  const button = event.target.closest('[data-page]');

  if (!button || button.disabled) {
    return;
  }

  const page = button.dataset.page;

  if (page === 'prev') {
    currentPage--;
  } else if (page === 'next') {
    currentPage++;
  } else {
    currentPage = Number(page);
  }

  render();
});

body.addEventListener('click', (event) => {
  const button = event.target.closest('[data-order]');

  if (button) {
    alert(`Detalle del pedido #${button.dataset.order}\nLa pantalla de detalle se puede conectar aquí.`);
  }
});

render();
