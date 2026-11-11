const products = [
  { id: 1, name: 'Café Americano', category: 'Café', price: 50, stock: 20, description: 'Café de la casa, recién preparado.', emoji: '☕', kind: 'coffee' },
  { id: 2, name: 'Latte', category: 'Café', price: 65, stock: 15, description: 'Espresso con leche cremosa.', emoji: '☕', kind: 'coffee' },
  { id: 3, name: 'Cappuccino', category: 'Café', price: 80, stock: 18, description: 'Espresso, leche y espuma.', emoji: '☕', kind: 'coffee' },
  { id: 4, name: 'Croissant', category: 'Panadería', price: 45, stock: 25, description: 'Hojaldre dorado y recién horneado.', emoji: '🥐', kind: 'pastry' },
  { id: 5, name: 'Cheesecake', category: 'Postre', price: 60, stock: 12, description: 'Rebanada de cheesecake de la casa.', emoji: '🍰', kind: 'dessert' },
];

let selectedCategory = 'Todos';
let nextId = Math.max(...products.map((product) => product.id)) + 1;

const table = document.querySelector('#productsTable');
const searchInput = document.querySelector('#searchProducts');
const emptyMessage = document.querySelector('#emptyProducts');
const dialog = document.querySelector('#productDialog');
const form = document.querySelector('#productForm');
const count = document.querySelector('#productCount');
const availableCount = document.querySelector('#availableCount');
const tableCount = document.querySelector('#tableCount');

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase('es');
  const visibleProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    const matchesSearch = `${product.name} ${product.category}`.toLocaleLowerCase('es').includes(query);
    return matchesCategory && matchesSearch;
  });

  table.innerHTML = visibleProducts.map((product) => {
    const stockClass = product.stock < 10 ? 'low' : '';
    const availability = product.stock === 0 ? 'Agotado' : product.stock < 10 ? 'Stock bajo' : 'Disponible';

    return `
      <tr>
        <td>
          <div class="product-cell">
            <span class="product-thumb ${product.kind}">${product.emoji}</span>
            <span>
              <span class="product-name">${escapeHtml(product.name)}</span>
              <span class="product-description">${escapeHtml(product.description || 'Producto de Bloom Café.')}</span>
            </span>
          </div>
        </td>
        <td><span class="category-label">${escapeHtml(product.category)}</span></td>
        <td class="price">$${Number(product.price).toFixed(0)}</td>
        <td class="stock">${product.stock} uds.</td>
        <td><span class="availability ${stockClass}">${availability}</span></td>
        <td>
          <div class="actions">
            <button class="action" data-action="edit" data-id="${product.id}">Editar</button>
            <button class="action delete" data-action="delete" data-id="${product.id}">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  emptyMessage.hidden = visibleProducts.length > 0;
  count.textContent = products.length;
  availableCount.textContent = products.filter((product) => product.stock > 0).length;
  tableCount.textContent = `Mostrando ${visibleProducts.length} de ${products.length} productos`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character]);
}

function openDialog(product = null) {
  form.reset();
  document.querySelector('#productId').value = product?.id ?? '';
  document.querySelector('#dialogTitle').textContent = product ? 'Editar producto' : 'Agregar producto';
  document.querySelector('#productName').value = product?.name ?? '';
  document.querySelector('#productCategory').value = product?.category ?? '';
  document.querySelector('#productPrice').value = product?.price ?? '';
  document.querySelector('#productStock').value = product?.stock ?? '';
  document.querySelector('#productDescription').value = product?.description ?? '';
  dialog.showModal();
  document.querySelector('#productName').focus();
}

document.querySelector('#addProduct').addEventListener('click', () => openDialog());
document.querySelector('#closeDialog').addEventListener('click', () => dialog.close());
document.querySelector('#cancelDialog').addEventListener('click', () => dialog.close());
searchInput.addEventListener('input', renderProducts);

document.querySelectorAll('.category-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelector('.category-tab.active').classList.remove('active');
    tab.classList.add('active');
    selectedCategory = tab.dataset.category;
    renderProducts();
  });
});

table.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const product = products.find((item) => item.id === Number(button.dataset.id));
  if (!product) return;

  if (button.dataset.action === 'edit') {
    openDialog(product);
    return;
  }

  if (window.confirm(`¿Eliminar ${product.name} del catálogo?`)) {
    products.splice(products.indexOf(product), 1);
    renderProducts();
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const id = document.querySelector('#productId').value;
  const productData = {
    name: document.querySelector('#productName').value.trim(),
    category: document.querySelector('#productCategory').value,
    price: Number(document.querySelector('#productPrice').value),
    stock: Number(document.querySelector('#productStock').value),
    description: document.querySelector('#productDescription').value.trim(),
  };

  if (id) {
    const existingProduct = products.find((product) => product.id === Number(id));
    Object.assign(existingProduct, productData);
  } else {
    products.push({
      id: nextId++,
      ...productData,
      emoji: productData.category === 'Panadería' ? '🥐' : productData.category === 'Postre' ? '🍰' : '☕',
      kind: productData.category === 'Panadería' ? 'pastry' : productData.category === 'Postre' ? 'dessert' : 'coffee',
    });
  }

  dialog.close();
  renderProducts();
});

renderProducts();
