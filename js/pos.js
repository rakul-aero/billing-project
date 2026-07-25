document.addEventListener('DOMContentLoaded', () => {
  // Sample Product Database
  const products = [
    { id: 1, name: 'Wireless Mouse', hsn: '8471', price: 450.00, gst: 18 },
    { id: 2, name: 'USB-C Cable', hsn: '8544', price: 150.00, gst: 18 },
    { id: 3, name: 'Mechanical Keyboard', hsn: '8471', price: 2500.00, gst: 18 },
    { id: 4, name: 'Monitor 24"', hsn: '8528', price: 8500.00, gst: 28 },
    { id: 5, name: 'Laptop Stand', hsn: '3926', price: 650.00, gst: 18 }
  ];

  let cart = [];
  
  const cartBody = document.querySelector('#cart-table-body');
  const searchInput = document.querySelector('#product-search');
  const addCustomBtn = document.querySelector('#add-custom-btn');
  
  const subtotalEl = document.querySelector('#subtotal-val');
  const gstEl = document.querySelector('#gst-val');
  const discountInput = document.querySelector('#discount-input');
  const grandTotalEl = document.querySelector('#grand-total');

  // Print buttons
  const printBtn = document.querySelector('#btn-print');
  const saveBtn = document.querySelector('#btn-save-bill');

  function renderCart() {
    cartBody.innerHTML = '';
    let subtotal = 0;
    let totalGst = 0;

    cart.forEach((item, index) => {
      const itemSub = item.price * item.qty;
      const itemGst = itemSub * (item.gst / 100);
      const itemTotal = itemSub + itemGst;

      subtotal += itemSub;
      totalGst += itemGst;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <p style="font-weight: 500;">${item.name}</p>
          <p class="text-muted" style="font-size: 0.75rem;">HSN: ${item.hsn || 'N/A'}</p>
        </td>
        <td>
          <div class="flex items-center border" style="border: 1px solid var(--border-color); border-radius: 4px; width: fit-content;">
            <button class="qty-btn" data-index="${index}" data-action="minus" style="padding: 0.25rem 0.5rem;">-</button>
            <input type="text" value="${item.qty}" style="width: 30px; text-align: center; border: none; outline: none;" readonly>
            <button class="qty-btn" data-index="${index}" data-action="plus" style="padding: 0.25rem 0.5rem;">+</button>
          </div>
        </td>
        <td>₹ ${item.price.toFixed(2)}</td>
        <td>${item.gst}%</td>
        <td>₹ ${itemTotal.toFixed(2)}</td>
        <td><button class="text-danger del-btn" data-index="${index}" style="color: var(--danger);"><i data-lucide="trash-2" style="width: 18px;"></i></button></td>
      `;
      cartBody.appendChild(tr);
    });

    if(window.lucide) lucide.createIcons();

    // Update Totals
    const discountStr = discountInput.value || '0';
    let discount = parseFloat(discountStr);
    if(isNaN(discount)) discount = 0;

    const grandTotal = (subtotal - discount) + totalGst;

    subtotalEl.textContent = `₹ ${subtotal.toFixed(2)}`;
    gstEl.textContent = `₹ ${totalGst.toFixed(2)}`;
    grandTotalEl.textContent = grandTotal.toFixed(2);
    
    // Bind buttons
    document.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index);
        const action = e.currentTarget.dataset.action;
        if (action === 'plus') {
          cart[idx].qty++;
        } else if (action === 'minus') {
          if (cart[idx].qty > 1) cart[idx].qty--;
        }
        renderCart();
      });
    });

    document.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index);
        cart.splice(idx, 1);
        renderCart();
      });
    });
  }

  // Add Item Logic
  addCustomBtn.addEventListener('click', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return;

    // Find if product exists in mock DB
    const prod = products.find(p => p.name.toLowerCase().includes(q));
    if (prod) {
      // Check if already in cart
      const existing = cart.find(c => c.id === prod.id);
      if (existing) {
        existing.qty++;
      } else {
        cart.push({ ...prod, qty: 1 });
      }
    } else {
      // Add custom item
      cart.push({
        id: Date.now(),
        name: searchInput.value.trim(),
        hsn: '8544',
        price: 100.00, // default placeholder
        gst: 18, // default placeholder
        qty: 1
      });
    }
    searchInput.value = '';
    renderCart();
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addCustomBtn.click();
    }
  });

  discountInput.addEventListener('input', renderCart);

  // Print Logic
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
  
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      alert("Bill generated and saved successfully!");
    });
  }

  // Initial dummy cart
  cart.push({ ...products[0], qty: 1 });
  cart.push({ ...products[1], qty: 2 });
  renderCart();
});
