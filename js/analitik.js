// Analytics JavaScript

// Initialize data from localStorage
let orders = JSON.parse(localStorage.getItem('warungkita-orders')) || [];
let stockItems = JSON.parse(localStorage.getItem('warungkita-stock')) || [];

// DOM Elements
const periodFilter = document.getElementById('period-filter');
const totalSales = document.getElementById('total-sales');
const orderCount = document.getElementById('order-count');
const criticalStock = document.getElementById('critical-stock');
const outOfStock = document.getElementById('out-of-stock');
const recentOrders = document.getElementById('recent-orders');
const emptyOrders = document.getElementById('empty-orders');
const lowStockItems = document.getElementById('low-stock-items');
const emptyStock = document.getElementById('empty-stock');

// Chart elements
const salesChart = document.getElementById('sales-chart');
const productsChart = document.getElementById('products-chart');

// Mobile menu toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Update analytics based on selected period
function updateAnalytics(days = 30) {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    // Filter orders within date range
    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= startDate && orderDate <= endDate && order.status !== 'dibatalkan';
    });
    
    // Update summary cards
    updateSummaryCards(filteredOrders);
    
    // Update charts
    updateSalesChart(filteredOrders, days);
    updateProductsChart(filteredOrders);
    
    // Update tables
    updateRecentOrders(filteredOrders);
    updateLowStockItems();
}

// Update summary cards
function updateSummaryCards(filteredOrders) {
    // Calculate total sales
    const sales = filteredOrders.reduce((total, order) => {
        if (order.status === 'selesai') {
            return total + order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }
        return total;
    }, 0);
    
    // Update total sales display
    totalSales.textContent = `Rp ${sales.toLocaleString('id-ID')}`;
    
    // Update order count
    orderCount.textContent = filteredOrders.length;
    
    // Count critical and out of stock items
    let criticalCount = 0;
    let outOfStockCount = 0;
    
    stockItems.forEach(item => {
        if (item.stok === 0) {
            outOfStockCount++;
        } else if (item.stok <= item.stokMinimum) {
            criticalCount++;
        }
    });
    
    criticalStock.textContent = criticalCount;
    outOfStock.textContent = outOfStockCount;
}

// Update sales chart
function updateSalesChart(filteredOrders, days) {
    // Prepare data for chart
    const labels = [];
    const data = [];
    
    // Generate date labels based on period
    const endDate = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(endDate.getDate() - i);
        labels.push(date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }));
        
        // Calculate sales for this day
        const daySales = filteredOrders.reduce((total, order) => {
            const orderDate = new Date(order.date);
            if (orderDate.toDateString() === date.toDateString() && order.status === 'selesai') {
                return total + order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            }
            return total;
        }, 0);
        
        data.push(daySales);
    }
    
    // Create or update chart
    if (window.salesChartInstance) {
        window.salesChartInstance.destroy();
    }
    
    window.salesChartInstance = new Chart(salesChart, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Penjualan Harian',
                data: data,
                backgroundColor: 'rgba(46, 196, 182, 0.2)',
                borderColor: '#2EC4B6',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rp ' + value.toLocaleString('id-ID');
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Rp ' + context.raw.toLocaleString('id-ID');
                        }
                    }
                }
            }
        }
    });
}

// Update products chart
function updateProductsChart(filteredOrders) {
    // Count product sales
    const productSales = {};
    
    filteredOrders.forEach(order => {
        if (order.status === 'selesai') {
            order.items.forEach(item => {
                if (productSales[item.name]) {
                    productSales[item.name] += item.quantity;
                } else {
                    productSales[item.name] = item.quantity;
                }
            });
        }
    });
    
    // Sort products by sales and take top 5
    const sortedProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const labels = sortedProducts.map(product => product[0]);
    const data = sortedProducts.map(product => product[1]);
    
    // Create or update chart
    if (window.productsChartInstance) {
        window.productsChartInstance.destroy();
    }
    
    window.productsChartInstance = new Chart(productsChart, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah Terjual',
                data: data,
                backgroundColor: '#FF6B35',
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Update recent orders table
function updateRecentOrders(filteredOrders) {
    // Clear table
    recentOrders.innerHTML = '';
    
    if (filteredOrders.length === 0) {
        emptyOrders.classList.remove('hidden');
        return;
    }
    
    emptyOrders.classList.add('hidden');
    
    // Sort by date (newest first) and take top 5
    const recentOrdersList = [...filteredOrders]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    // Render orders
    recentOrdersList.forEach(order => {
        const row = document.createElement('tr');
        
        // Format date
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        
        // Calculate total
        const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Determine status class
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
        
        row.innerHTML = `
            <td class="px-4 py-3 border-b">${order.id}</td>
            <td class="px-4 py-3 border-b">${order.customer.name}</td>
            <td class="px-4 py-3 border-b">${formattedDate}</td>
            <td class="px-4 py-3 border-b">Rp ${total.toLocaleString('id-ID')}</td>
            <td class="px-4 py-3 border-b">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${statusClass}">
                    ${capitalizeFirstLetter(order.status)}
                </span>
            </td>
        `;
        
        recentOrders.appendChild(row);
    });
}

// Update low stock items table
function updateLowStockItems() {
    // Clear table
    lowStockItems.innerHTML = '';
    
    // Filter low stock items
    const lowStock = stockItems.filter(item => item.stok <= item.stokMinimum);
    
    if (lowStock.length === 0) {
        emptyStock.classList.remove('hidden');
        return;
    }
    
    emptyStock.classList.add('hidden');
    
    // Sort by stock level (lowest first)
    lowStock.sort((a, b) => a.stok - b.stok);
    
    // Render items
    lowStock.forEach(item => {
        const row = document.createElement('tr');
        
        // Determine stock status
        let statusClass = 'bg-yellow-100 text-yellow-800';
        let statusText = 'Kritis';
        
        if (item.stok === 0) {
            statusClass = 'bg-red-100 text-red-800';
            statusText = 'Habis';
        }
        
        row.innerHTML = `
            <td class="px-4 py-3 border-b">${item.nama}</td>
            <td class="px-4 py-3 border-b capitalize">${item.kategori}</td>
            <td class="px-4 py-3 border-b">${item.stok}</td>
            <td class="px-4 py-3 border-b">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${statusClass}">
                    ${statusText}
                </span>
            </td>
        `;
        
        lowStockItems.appendChild(row);
    });
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial update
    updateAnalytics(30);
    
    // Period filter change
    periodFilter.addEventListener('change', () => {
        const days = parseInt(periodFilter.value, 10);
        updateAnalytics(days);
        
        // Update period text
        document.querySelectorAll('.text-sm.text-gray-500').forEach(el => {
            if (el.textContent.includes('hari')) {
                el.textContent = `${days} hari terakhir`;
            }
        });
    });
});