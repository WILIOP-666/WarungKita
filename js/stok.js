// Stock Management JavaScript

// Initialize stock data from localStorage or use empty array if none exists
let stockItems = JSON.parse(localStorage.getItem('warungkita-stock')) || [];

// DOM Elements
const stockTableBody = document.getElementById('stok-table-body');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const kategoriFilter = document.getElementById('kategori-filter');
const stokFilter = document.getElementById('stok-filter');
const tambahStokBtn = document.getElementById('tambah-stok-btn');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const itemModal = document.getElementById('item-modal');
const closeModal = document.getElementById('close-modal');
const cancelForm = document.getElementById('cancel-form');
const itemForm = document.getElementById('item-form');
const modalTitle = document.getElementById('modal-title');
const itemIdInput = document.getElementById('item-id');
const namaBarangInput = document.getElementById('nama-barang');
const kategoriInput = document.getElementById('kategori');
const hargaInput = document.getElementById('harga');
const stokInput = document.getElementById('stok');
const stokMinimumInput = document.getElementById('stok-minimum');
const deleteModal = document.getElementById('delete-modal');
const deleteItemName = document.getElementById('delete-item-name');
const cancelDelete = document.getElementById('cancel-delete');
const confirmDelete = document.getElementById('confirm-delete');

// Mobile menu toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Render stock table
function renderStockTable(items = stockItems) {
    // Clear table
    stockTableBody.innerHTML = '';
    
    if (items.length === 0) {
        // Show empty state
        emptyState.classList.remove('hidden');
        return;
    }
    
    // Hide empty state
    emptyState.classList.add('hidden');
    
    // Render items
    items.forEach(item => {
        const row = document.createElement('tr');
        
        // Determine stock status
        let statusClass = 'bg-green-100 text-green-800';
        let statusText = 'Cukup';
        
        if (item.stok === 0) {
            statusClass = 'bg-red-100 text-red-800';
            statusText = 'Habis';
        } else if (item.stok <= item.stokMinimum) {
            statusClass = 'bg-yellow-100 text-yellow-800';
            statusText = 'Kritis';
        }
        
        row.innerHTML = `
            <td class="px-4 py-3 border-b">${item.nama}</td>
            <td class="px-4 py-3 border-b capitalize">${item.kategori}</td>
            <td class="px-4 py-3 border-b">Rp ${item.harga.toLocaleString('id-ID')}</td>
            <td class="px-4 py-3 border-b">${item.stok}</td>
            <td class="px-4 py-3 border-b">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${statusClass}">
                    ${statusText}
                </span>
            </td>
            <td class="px-4 py-3 border-b">
                <div class="flex space-x-2">
                    <button class="edit-btn text-secondary hover:text-dark transition" data-id="${item.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn text-red-500 hover:text-red-700 transition" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        stockTableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editItem(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => showDeleteModal(btn.dataset.id));
    });
}

// Filter stock items
function filterStockItems() {
    const searchTerm = searchInput.value.toLowerCase();
    const kategoriValue = kategoriFilter.value;
    const stokValue = stokFilter.value;
    
    let filteredItems = stockItems.filter(item => {
        // Search filter
        const matchesSearch = item.nama.toLowerCase().includes(searchTerm);
        
        // Category filter
        const matchesKategori = kategoriValue === '' || item.kategori === kategoriValue;
        
        // Stock filter
        let matchesStok = true;
        if (stokValue === 'habis') {
            matchesStok = item.stok === 0;
        } else if (stokValue === 'kritis') {
            matchesStok = item.stok > 0 && item.stok <= item.stokMinimum;
        } else if (stokValue === 'cukup') {
            matchesStok = item.stok > item.stokMinimum;
        }
        
        return matchesSearch && matchesKategori && matchesStok;
    });
    
    renderStockTable(filteredItems);
}

// Show add/edit item modal
function showItemModal(isEdit = false, itemId = null) {
    modalTitle.textContent = isEdit ? 'Edit Barang' : 'Tambah Barang Baru';
    
    if (isEdit && itemId) {
        const item = stockItems.find(item => item.id === itemId);
        if (item) {
            itemIdInput.value = item.id;
            namaBarangInput.value = item.nama;
            kategoriInput.value = item.kategori;
            hargaInput.value = item.harga;
            stokInput.value = item.stok;
            stokMinimumInput.value = item.stokMinimum;
        }
    } else {
        // Reset form for new item
        itemForm.reset();
        itemIdInput.value = '';
    }
    
    itemModal.classList.remove('hidden');
}

// Hide item modal
function hideItemModal() {
    itemModal.classList.add('hidden');
    itemForm.reset();
}

// Edit item
function editItem(itemId) {
    showItemModal(true, itemId);
}

// Show delete confirmation modal
function showDeleteModal(itemId) {
    const item = stockItems.find(item => item.id === itemId);
    if (item) {
        deleteItemName.textContent = item.nama;
        confirmDelete.dataset.id = itemId;
        deleteModal.classList.remove('hidden');
    }
}

// Hide delete modal
function hideDeleteModal() {
    deleteModal.classList.add('hidden');
}

// Delete item
function deleteItem(itemId) {
    stockItems = stockItems.filter(item => item.id !== itemId);
    saveStockItems();
    filterStockItems();
    hideDeleteModal();
}

// Save stock items to localStorage
function saveStockItems() {
    localStorage.setItem('warungkita-stock', JSON.stringify(stockItems));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Export stock data to CSV
function exportToCSV() {
    if (stockItems.length === 0) {
        alert('Tidak ada data stok untuk diekspor.');
        return;
    }
    
    const headers = ['Nama Barang', 'Kategori', 'Harga', 'Stok', 'Stok Minimum'];
    const csvRows = [
        headers.join(','),
        ...stockItems.map(item => [
            `"${item.nama}"`,
            item.kategori,
            item.harga,
            item.stok,
            item.stokMinimum
        ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `warungkita-stok-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Import stock data from CSV
function importFromCSV() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const csvData = event.target.result;
            const rows = csvData.split('\n');
            
            // Skip header row
            if (rows.length < 2) {
                alert('File CSV tidak valid.');
                return;
            }
            
            const newItems = [];
            
            // Parse rows starting from index 1 (skip header)
            for (let i = 1; i < rows.length; i++) {
                if (!rows[i].trim()) continue;
                
                // Handle quoted values with commas inside
                const values = [];
                let inQuote = false;
                let currentValue = '';
                
                for (let char of rows[i]) {
                    if (char === '"') {
                        inQuote = !inQuote;
                    } else if (char === ',' && !inQuote) {
                        values.push(currentValue);
                        currentValue = '';
                    } else {
                        currentValue += char;
                    }
                }
                
                values.push(currentValue); // Add the last value
                
                if (values.length >= 5) {
                    newItems.push({
                        id: generateId(),
                        nama: values[0].replace(/"/g, ''),
                        kategori: values[1],
                        harga: parseInt(values[2], 10),
                        stok: parseInt(values[3], 10),
                        stokMinimum: parseInt(values[4], 10)
                    });
                }
            }
            
            if (newItems.length > 0) {
                if (confirm(`${newItems.length} data barang akan diimpor. Lanjutkan?`)) {
                    stockItems = [...stockItems, ...newItems];
                    saveStockItems();
                    filterStockItems();
                    alert('Data berhasil diimpor.');
                }
            } else {
                alert('Tidak ada data valid yang dapat diimpor.');
            }
        };
        
        reader.readAsText(file);
    });
    
    input.click();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial render
    renderStockTable();
    
    // Search and filter
    searchInput.addEventListener('input', filterStockItems);
    kategoriFilter.addEventListener('change', filterStockItems);
    stokFilter.addEventListener('change', filterStockItems);
    
    // Add item button
    tambahStokBtn.addEventListener('click', () => showItemModal());
    
    // Export button
    exportBtn.addEventListener('click', exportToCSV);
    
    // Import button
    importBtn.addEventListener('click', importFromCSV);
    
    // Close modal buttons
    closeModal.addEventListener('click', hideItemModal);
    cancelForm.addEventListener('click', hideItemModal);
    
    // Delete modal buttons
    cancelDelete.addEventListener('click', hideDeleteModal);
    confirmDelete.addEventListener('click', () => deleteItem(confirmDelete.dataset.id));
    
    // Form submission
    itemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const itemId = itemIdInput.value;
        const isEdit = !!itemId;
        
        const newItem = {
            id: isEdit ? itemId : generateId(),
            nama: namaBarangInput.value,
            kategori: kategoriInput.value,
            harga: parseInt(hargaInput.value, 10),
            stok: parseInt(stokInput.value, 10),
            stokMinimum: parseInt(stokMinimumInput.value, 10)
        };
        
        if (isEdit) {
            // Update existing item
            stockItems = stockItems.map(item => item.id === itemId ? newItem : item);
        } else {
            // Add new item
            stockItems.push(newItem);
        }
        
        saveStockItems();
        filterStockItems();
        hideItemModal();
    });
});