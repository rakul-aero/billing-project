// Bill With Me - Main Script

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Sidebar Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const appLayout = document.getElementById('app-layout');
  
  if (mobileToggle && appLayout) {
    mobileToggle.addEventListener('click', () => {
      appLayout.classList.toggle('sidebar-open');
    });
  }

  // Active Link Highlighting
  const currentLocation = location.href;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    if (link.href === currentLocation) {
      link.classList.add('active');
    }
  });

  // Display Shop Name if registered
  const savedShopName = localStorage.getItem('shopName');
  if (savedShopName) {
    const shopNameDisplays = document.querySelectorAll('.shop-name-display');
    shopNameDisplays.forEach(el => el.textContent = savedShopName);
  }

  // Example: Mock WhatsApp Share
  const waShareBtn = document.getElementById('btn-whatsapp-share');
  if (waShareBtn) {
    waShareBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const phoneNumber = document.getElementById('customer-phone')?.value || '';
      const totalAmount = document.getElementById('grand-total')?.textContent || '0.00';
      
      if (!phoneNumber) {
        alert('Please enter a customer phone number first!');
        return;
      }
      
      const message = `Hello from Bill With Me! Your bill total is ₹${totalAmount}. Thank you for your business.`;
      const waUrl = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
    });
  }

  // Generate mock bill number
  const invoiceEl = document.getElementById('invoice-number');
  if (invoiceEl && !invoiceEl.value) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    invoiceEl.value = `INV-${randomNum}`;
  }
});

// Utility function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}
