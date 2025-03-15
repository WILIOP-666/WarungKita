// Order Management JavaScript

// Initialize orders data from localStorage or use empty array if none exists
let orders = JSON.parse(localStorage.getItem('warungkita-orders')) || [];
let stockItems = JSON.parse(localStorage.getItem('warungkita-stock')) || [];

// DOM Elements
const tabPesananBaru = document.getElementById('tab-pesanan-baru');
const tabRiwayatPesanan = document.getElementById('tab-riwayat-pesanan');
const pesananBaruContent = document.getElementById('pesanan-baru-content');
const riwayatPesananContent = document.getElementById('riwayat-pesanan-content');
const searchPesanan = document.getElementById('search-pesanan');
const filterStatus = document.getElementById('filter-status');
const pesananList = document.getElementById('pesanan-list');
const emptyPesanan = document.getElementById('empty-pesanan');
const buatPesananBtn = document.getElementById('buat-pesanan-btn');

// Mobile menu toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Tab switching
tabPesananBaru.addEventListener('click', () => {
    tabPesananBaru.classList.add('text-primary', 'border-b-2', 'border-primary');
    tabPesananBaru.classList.remove('text-gray-500');
    tabRiwayatPesanan.classList.remove('text-primary', 'border-b-2', 'border-primary');
    tabRiwayatPesanan.classList.add('text-gray-500');
    pesananBaruContent.classList.remove('hidden');
    riwayatPesananContent.classList.add('hidden');
});

tabRiwayatPesanan.addEventListener('click', () => {
    tabRiwayatPesanan.classList.add('text-primary', 'border-b-2', 'border-primary');
    tabRiwayatPesanan.classList.remove('text-gray-500');
    tabPesananBaru.classList.remove('text-primary', 'border-b-2', 'border-primary');
    tabPesananBaru.classList.add('text-gray-500');
    riwayatPesananContent.classList.remove('hidden');
    pesananBaruContent.classList.add('hidden');
});

// Render orders
function renderOrders(items = orders, isHistory = false) {
    const container = isHistory ? document.getElementById('riwayat-list') : pesananList;
    const emptyState = isHistory ? document.getElementById('empty-riwayat') : emptyPesanan;
    
    // Clear previous orders except empty state
    const cards = container.querySelectorAll('.pesanan-card');
    cards.forEach(card => card.remove());
    
    // Filter active orders for new orders tab
    const filteredItems = isHistory 
        ? items.filter(order => order.status === 'selesai' || order.status === 'dibatalkan')
        : items.filter(order => order.status !== 'selesai' && order.status !== 'dibatalkan');
    
    if (filteredItems.length === 0) {
        // Show empty state
        emptyState.classList.remove('hidden');
        return;
    }
    
    // Hide empty state
    emptyState.classList.add('hidden');
    
    // Sort orders by date (newest first)
    filteredItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Render each order
    filteredItems.forEach(order => {
        const card = document.createElement('div');
        card.className = 'pesanan-card bg-white rounded-lg shadow-md overflow-hidden';
        
        // Determine status badge color
        let statusClass = '';
        switch (order.status) {
            case 'baru':
                statusClass = 'bg-blue-100 text-blue-800';
                break;
            case 'diproses':
                statusClass = 'bg-yellow-100 text-yellow-800';
                break;
            case 'siap':
                statusClass = 'bg-green-100 text-green-800';
                break;
            case 'selesai':
                statusClass = 'bg-gray-100 text-gray-800';
                break;
            case 'dibatalkan':
                statusClass = 'bg-red-100 text-red-800';
                break;
        }
        
        // Format date
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        const formattedTime = orderDate.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Calculate total
        const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Create card HTML
        card.innerHTML = `
            <div class="p-4 border-b border-gray-200">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-bold text-lg text-dark">Pesanan #${order.id}</h3>
                        <p class="text-gray-500 text-sm">${formattedDate}, ${formattedTime}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${statusClass}">
                        ${capitalizeFirstLetter(order.status)}
                    </span>
                </div>
            </div>
            <div class="p-4">
                <div class="mb-4">
                    <p class="font-medium text-dark">Pelanggan:</p>
                    <p>${order.customer.name}</p>
                    <p class="text-gray-500">${order.customer.phone}</p>
                </div>
                <div class="mb-4">
                    <p class="font-medium text-dark mb-2">Item:</p>
                    <ul class="space-y-1">
                        ${order.items.map(item => `
                            <li class="flex justify-between">
                                <span>${item.name} x${item.quantity}</span>
                                <span>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div class="border-t border-gray-200 pt-3 flex justify-between">
                    <p class="font-bold">Total:</p>
                    <p class="font-bold">Rp ${total.toLocaleString('id-ID')}</p>
                </div>
            </div>
        `;
        
        // Add action buttons for active orders
        if (!isHistory) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'bg-gray-50 p-4 flex space-x-2';
            
            // Different buttons based on status
            if (order.status === 'baru') {
                actionsDiv.innerHTML = `
                    <button class="process-btn flex-1 bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition" data-id="${order.id}">
                        <i class="fas fa-check mr-2"></i> Proses Pesanan
                    </button>
                    <button class="whatsapp-btn flex-1 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition" data-phone="${order.customer.phone}">
                        <i class="fab fa-whatsapp mr-2"></i> Hubungi
                    </button>
                `;
            } else if (order.status === 'diproses') {
                actionsDiv.innerHTML = `
                    <button class="ready-btn flex-1 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition" data-id="${order.id}">
                        <i class="fas fa-check-double mr-2"></i> Siap Diambil
                    </button>
                    <button class="whatsapp-btn flex-1 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition" data-phone="${order.customer.phone}">
                        <i class="fab fa-whatsapp mr-2"></i> Hubungi
                    </button>
                `;
            } else if (order.status === 'siap') {
                actionsDiv.innerHTML = `
                    <button class="complete-btn flex-1 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition" data-id="${order.id}">
                        <i class="fas fa-flag-checkered mr-2"></i> Selesaikan
                    </button>
                    <button class="whatsapp-btn flex-1 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition" data-phone="${order.customer.phone}">
                        <i class="fab fa-whatsapp mr-2"></i> Hubungi
                    </button>
                `;
            }
            
            card.appendChild(actionsDiv);
        }
        
        container.appendChild(card);
    });
    
    // Add event listeners to buttons
    if (!isHistory) {
        document.querySelectorAll('.process-btn').forEach(btn => {
            btn.addEventListener('click', () => updateOrderStatus(btn.dataset.id, 'diproses'));
        });
        
        document.querySelectorAll('.ready-btn').forEach(btn => {
            btn.addEventListener('click', () => updateOrderStatus(btn.dataset.id, 'siap'));
        });
        
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', () => updateOrderStatus(btn.dataset.id, 'selesai'));
        });
        
        document.querySelectorAll('.whatsapp-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const phone = btn.dataset.phone.replace(/[^0-9]/g, '');
                window.open(`https://wa.me/${phone}`, '_blank');
            });
        });
    }
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    orders = orders.map(order => {
        if (order.id === orderId) {
            return { ...order, status: newStatus };
        }
        return order;
    });
    
    saveOrders();
    renderOrders();
}

// Save orders to localStorage
function saveOrders() {
    localStorage.setItem('warungkita-orders', JSON.stringify(orders));
}

// Filter orders
function filterOrders() {
    const searchTerm = searchPesanan.value.toLowerCase();
    const statusValue = filterStatus.value;
    
    let filteredOrders = orders.filter(order => {
        // Search filter (customer name, order ID, or items)
        const matchesSearch = 
            order.customer.name.toLowerCase().includes(searchTerm) ||
            order.id.toLowerCase().includes(searchTerm) ||
            order.items.some(item => item.name.toLowerCase().includes(searchTerm));
        
        // Status filter
        const matchesStatus = statusValue === '' || order.status === statusValue;
        
        return matchesSearch && matchesStatus;
    });
    
    renderOrders(filteredOrders);
}

// Create new order modal
function showNewOrderModal() {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.id = 'new-order-modal';
    
    // Get available items from stock
    const availableItems = stockItems.filter(item => item.stok > 0);
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 overflow-y-auto max-h-[90vh]">
            <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 class="text-xl font-bold text-dark">Buat Pesanan Baru</h3>
                <button id="close-order-modal" class="text-gray-500 hover:text-gray-700 focus:outline-none">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-4">
                <form id="new-order-form">
                    <div class="mb-6">
                        <h4 class="font-bold text-dark mb-3">Informasi Pelanggan</h4>
                        <div class="mb-4">
                            <label for="customer-name" class="block text-gray-700 font-medium mb-2">Nama Pelanggan</label>
                            <input type="text" id="customer-name" class="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary" required>
                        </div>
                        <div class="mb-4">
                            <label for="customer-phone" class="block text-gray-700 font-medium mb-2">Nomor Telepon</label>
                            <input type="tel" id="customer-phone" class="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary" required>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h4 class="font-bold text-dark mb-3">Item Pesanan</h4>
                        <div id="order-items" class="space-y-4">
                            ${availableItems.length > 0 ? `
                                <div class="order-item border border-gray-200 rounded-lg p-3">
                                    <div class="mb-3">
                                        <label class="block text-gray-700 font-medium mb-2">Pilih Barang</label>
                                        <select class="item-select w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary" required>
                                            <option value="">Pilih Barang</option>
                                            ${availableItems.map(item => `
                                                <option value="${item.id}" data-price="${item.harga}" data-name="${item.nama}" data-stock="${item.stok}">${item.nama} - Rp ${item.harga.toLocaleString('id-ID')} (Stok: ${item.stok})</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="block text-gray-700 font-medium mb-2">Jumlah</label>
                                        <input type="number" class="item-quantity w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary" min="1" value="1" required>
                                    </div>
                                    <div class="flex justify-end">
                                        <button type="button" class="remove-item text-red-500 hover:text-red-700 transition hidden">
                                            <i class="fas fa-trash"></i> Hapus
                                        </button>
                                    </div>
                                </div>
                            ` : `
                                <div class="text-center py-4">
                                    <p class="text-gray-500">Tidak ada barang tersedia dalam stok.</p>
                                </div>
                            `}
                        </div>
                        
                        ${availableItems.length > 0 ? `
                            <button type="button" id="add-item-btn" class="mt-3 text-secondary hover:text-primary transition">
                                <i class="fas fa-plus-circle"></i> Tambah Item Lain
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="border-t border-gray-200 pt-4 mb-6">
                        <div class="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span id="order-total">Rp 0</span>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-3">
                        <button type="button" id="cancel-order" class="bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-400 transition">Batal</button>
                        <button type="submit" class="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition" ${availableItems.length === 0 ? 'disabled' : ''}>Buat Pesanan</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeModal = document.getElementById('close-order-modal');
    const cancelOrder = document.getElementById('cancel-order');
    const addItemBtn = document.getElementById('add-item-btn');
    const orderForm = document.getElementById('new-order-form');
    const orderItems = document.getElementById('order-items');
    
    // Close modal
    closeModal.addEventListener('click', hideNewOrderModal);
    cancelOrder.addEventListener('click', hideNewOrderModal);
    
    // Add new item
    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => {
            const itemTemplate = orderItems.querySelector('.order-item').cloneNode(true);
            const removeBtn = itemTemplate.querySelector('.remove-item');
            removeBtn.classList.remove('hidden');
            
            // Reset values
            itemTemplate.querySelector('.item-select').value = '';
            itemTemplate.querySelector('.item-quantity').value = 1;
            
            // Add remove button functionality
            removeBtn.addEventListener('click', () => {
                itemTemplate.remove();
                updateOrderTotal();
            });
            
            orderItems.appendChild(itemTemplate);
            
            // Add change listeners to new elements
            addItemListeners(itemTemplate);
        });
    }
    
    // Add change listeners to initial item
    if (availableItems.length > 0) {
        const initialItem = orderItems.querySelector('.order-item');
        addItemListeners(initialItem);
    }
    
    // Form submission
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get customer info
        const customerName = document.getElementById('customer-name').value;
        const customerPhone = document.getElementById('customer-phone').value;
        
        // Get order items
        const orderItemElements = orderItems.querySelectorAll('.order-item');
        const items = [];
        
        orderItemElements.forEach(itemElement => {
            const select = itemElement.querySelector('.item-select');
            const quantity = itemElement.querySelector('.item-quantity');
            
            if (select.value) {
                const selectedOption = select.options[select.selectedIndex];
                items.push({
                    id: select.value,
                    name: selectedOption.dataset.name,
                    price: parseInt(selectedOption.dataset.price, 10),
                    quantity: parseInt(quantity.value, 10)
                });
            }
        });
        
        if (items.length === 0) {
            alert('Silakan pilih minimal satu barang.');
            return;
        }
        
        // Create new order
        const newOrder = {
            id: generateOrderId(),
            date: new Date().toISOString(),
            customer: {
                name: customerName,
                phone: customerPhone
            },
            items: items,
            status: 'baru'
        };
        
        // Add to orders and save
        orders.push(newOrder);
        saveOrders();
        
        // Update stock
        updateStock(items);
        
        // Hide modal and render orders
        hideNewOrderModal();
        renderOrders();
    });
}

// Add event listeners to order item elements
function addItemListeners(itemElement) {
    const select = itemElement.querySelector('.item-select');
    const quantity = itemElement.querySelector('.item-quantity');
    
    select.addEventListener('change', updateOrderTotal);
    quantity.addEventListener('change', () => {
        // Ensure quantity doesn't exceed available stock
        if (select.value) {
            const selectedOption = select.options[select.selectedIndex];
            const maxStock = parseInt(selectedOption.dataset.stock, 10);
            if (parseInt(quantity.value, 10) > maxStock) {
                quantity.value = maxStock;
                alert(`Stok tersedia hanya ${maxStock} item.`);
            }
        }
        updateOrderTotal();
    });
}

// Update order total
function updateOrderTotal() {
    const orderItems = document.getElementById('order-items');
    const orderTotal = document.getElementById('order-total');
    
    let total = 0;
    
    orderItems.querySelectorAll('.order-item').forEach(itemElement => {
        const select = itemElement.querySelector('.item-select');
        const quantity = itemElement.querySelector('.item-quantity');
        
        if (select.value) {
            const selectedOption = select.options[select.selectedIndex];
            const price = parseInt(selectedOption.dataset.price, 10);
            const qty = parseInt(quantity.value, 10);
            total += price * qty;
        }
    });
    
    orderTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

// Hide new order modal
function hideNewOrderModal() {
    const modal = document.getElementById('new-order-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Update stock after order creation
function updateStock(items) {
    items.forEach(item => {
        const stockItem = stockItems.find(stock => stock.id === item.id);
        if (stockItem) {
            stockItem.stok -= item.quantity;
        }
    });
    
    localStorage.setItem('warungkita-stock', JSON.stringify(stockItems));
}

// Generate unique order ID
function generateOrderId() {
    const prefix = 'ORD';
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial render
    renderOrders();
    
    // Create empty history list container if it doesn't exist
    if (!document.getElementById('riwayat-list')) {
        const riwayatList = document.createElement('div');
        riwayatList.id = 'riwayat-list';
        riwayatList.className = 'space-y-4';
        riwayatPesananContent.appendChild(riwayatList);
        
        // Add empty state for history
        const emptyRiwayat = document.createElement('div');
        emptyRiwayat.id = 'empty-riwayat';
        emptyRiwayat.className = 'bg-white rounded-lg shadow-md p-8 text-center';
        emptyRiwayat.innerHTML = `
            <i class="fas fa-history text-gray-400 text-5xl mb-4"></i>
            <p class="text-gray-500">Belum ada riwayat pesanan.</p>
        `;
        riwayatPesananContent.appendChild(emptyRiwayat);
    }
    
    // Render history
    renderOrders(orders, true);
    
    // Search and filter
    searchPesanan.addEventListener('input', filterOrders);
    filterStatus.addEventListener('change', filterOrders);
    
    // History search
    const searchRiwayat = document.getElementById('search-riwayat');
    if (searchRiwayat) {
        searchRiwayat.addEventListener('input', () => {
            const searchTerm = searchRiwayat.value.toLowerCase();
            
            let filteredOrders = orders.filter(order => {
                return order.customer.name.toLowerCase().includes(searchTerm) ||
                    order.id.toLowerCase().includes(searchTerm) ||
                    order.items.some(item => item.name.toLowerCase().includes(searchTerm));
            });
            
            renderOrders(filteredOrders, true);
        });
    }
    
    // Month filter for history
    const filterBulan = document.getElementById('filter-bulan');
    if (filterBulan) {
        filterBulan.addEventListener('change', () => {
            const monthValue = filterBulan.value;
            
            let filteredOrders = orders;
            if (monthValue) {
                const [year, month] = monthValue.split('-');
                filteredOrders = orders.filter(order => {
                    const orderDate = new Date(order.date);
                    return orderDate.getFullYear() === parseInt(year, 10) &&
                        orderDate.getMonth() === parseInt(month, 10) - 1;
                });
            }
            
            renderOrders(filteredOrders, true);
        });
    }
    
    // Create new order button
    buatPesananBtn.addEventListener('click', showNewOrderModal);
});