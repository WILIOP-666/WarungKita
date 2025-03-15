// Promotion Management JavaScript

// Initialize promotions data from localStorage or use empty array if none exists
let promotions = JSON.parse(localStorage.getItem('warungkita-promotions')) || [];

// DOM Elements
const activePromotions = document.getElementById('active-promotions');
const emptyPromotions = document.getElementById('empty-promotions');
const tambahPromosiBtn = document.getElementById('tambah-promosi-btn');
const shareWaBtn = document.getElementById('share-wa-btn');
const promoModal = document.getElementById('promo-modal');
const closeModal = document.getElementById('close-modal');
const cancelForm = document.getElementById('cancel-form');
const promoForm = document.getElementById('promo-form');
const modalTitle = document.getElementById('modal-title');
const promoIdInput = document.getElementById('promo-id');
const judulPromosiInput = document.getElementById('judul-promosi');
const deskripsiPromosiInput = document.getElementById('deskripsi-promosi');
const tanggalMulaiInput = document.getElementById('tanggal-mulai');
const tanggalSelesaiInput = document.getElementById('tanggal-selesai');
const deleteModal = document.getElementById('delete-modal');
const deletePromoName = document.getElementById('delete-promo-name');
const cancelDelete = document.getElementById('cancel-delete');
const confirmDelete = document.getElementById('confirm-delete');
const shareModal = document.getElementById('share-modal');
const closeShareModal = document.getElementById('close-share-modal');
const cancelShare = document.getElementById('cancel-share');
const confirmShare = document.getElementById('confirm-share');
const shareMessageInput = document.getElementById('share-message');
const phoneNumberInput = document.getElementById('phone-number');

// Mobile menu toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Render promotions
function renderPromotions() {
    // Clear previous promotions except empty state
    const cards = activePromotions.querySelectorAll('.promo-card');
    cards.forEach(card => card.remove());
    
    // Filter active promotions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activePromos = promotions.filter(promo => {
        const endDate = new Date(promo.tanggalSelesai);
        endDate.setHours(23, 59, 59, 999);
        return endDate >= today;
    });
    
    if (activePromos.length === 0) {
        // Show empty state
        emptyPromotions.classList.remove('hidden');
        return;
    }
    
    // Hide empty state
    emptyPromotions.classList.add('hidden');
    
    // Sort promotions by start date (newest first)
    activePromos.sort((a, b) => new Date(b.tanggalMulai) - new Date(a.tanggalMulai));
    
    // Render each promotion
    activePromos.forEach(promo => {
        const card = document.createElement('div');
        card.className = 'promo-card bg-white rounded-lg shadow-md overflow-hidden';
        
        // Format dates
        const startDate = new Date(promo.tanggalMulai);
        const endDate = new Date(promo.tanggalSelesai);
        const formattedStartDate = startDate.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        const formattedEndDate = endDate.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        // Determine if promotion is active now
        const now = new Date();
        const isActive = startDate <= now && endDate >= now;
        
        card.innerHTML = `
            <div class="bg-accent h-2"></div>
            <div class="p-4">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="font-bold text-lg text-dark">${promo.judul}</h3>
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                        ${isActive ? 'Aktif' : 'Akan Datang'}
                    </span>
                </div>
                <p class="text-gray-600 mb-3">${promo.deskripsi}</p>
                <div class="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span><i class="far fa-calendar-alt mr-1"></i> ${formattedStartDate} - ${formattedEndDate}</span>
                </div>
                <div class="border-t border-gray-200 pt-3 flex justify-end space-x-2">
                    <button class="edit-promo text-secondary hover:text-dark transition" data-id="${promo.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-promo text-red-500 hover:text-red-700 transition" data-id="${promo.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        activePromotions.appendChild(card);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-promo').forEach(btn => {
        btn.addEventListener('click', () => editPromo(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-promo').forEach(btn => {
        btn.addEventListener('click', () => showDeleteModal(btn.dataset.id));
    });
}

// Show add/edit promotion modal
function showPromoModal(isEdit = false, promoId = null) {
    modalTitle.textContent = isEdit ? 'Edit Promosi' : 'Tambah Promosi Baru';
    
    if (isEdit && promoId) {
        const promo = promotions.find(p => p.id === promoId);
        if (promo) {
            promoIdInput.value = promo.id;
            judulPromosiInput.value = promo.judul;
            deskripsiPromosiInput.value = promo.deskripsi;
            tanggalMulaiInput.value = promo.tanggalMulai;
            tanggalSelesaiInput.value = promo.tanggalSelesai;
        }
    } else {
        // Reset form for new promotion
        promoForm.reset();
        promoIdInput.value = '';
        
        // Set default dates (today and a week from today)
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        tanggalMulaiInput.value = formatDateForInput(today);
        tanggalSelesaiInput.value = formatDateForInput(nextWeek);
    }
    
    promoModal.classList.remove('hidden');
}

// Format date for input field (YYYY-MM-DD)
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Hide promotion modal
function hidePromoModal() {
    promoModal.classList.add('hidden');
    promoForm.reset();
}

// Edit promotion
function editPromo(promoId) {
    showPromoModal(true, promoId);
}

// Show delete confirmation modal
function showDeleteModal(promoId) {
    const promo = promotions.find(p => p.id === promoId);
    if (promo) {
        deletePromoName.textContent = promo.judul;
        confirmDelete.dataset.id = promoId;
        deleteModal.classList.remove('hidden');
    }
}

// Hide delete modal
function hideDeleteModal() {
    deleteModal.classList.add('hidden');
}

// Delete promotion
function deletePromo(promoId) {
    promotions = promotions.filter(promo => promo.id !== promoId);
    savePromotions();
    renderPromotions();
    hideDeleteModal();
}

// Save promotions to localStorage
function savePromotions() {
    localStorage.setItem('warungkita-promotions', JSON.stringify(promotions));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Show WhatsApp share modal
function showShareModal() {
    // Generate message with active promotions
    const today = new Date();
    const activePromos = promotions.filter(promo => {
        const endDate = new Date(promo.tanggalSelesai);
        endDate.setHours(23, 59, 59, 999);
        return endDate >= today;
    });
    
    if (activePromos.length === 0) {
        alert('Tidak ada promosi aktif untuk dibagikan.');
        return;
    }
    
    // Generate default message
    let defaultMessage = "🔥 *PROMOSI SPESIAL WARUNG KITA* 🔥\n\n";
    
    activePromos.forEach(promo => {
        const startDate = new Date(promo.tanggalMulai);
        const endDate = new Date(promo.tanggalSelesai);
        
        defaultMessage += `*${promo.judul}*\n`;
        defaultMessage += `${promo.deskripsi}\n`;
        defaultMessage += `Berlaku: ${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}\n\n`;
    });
    
    defaultMessage += "Kunjungi warung kami segera sebelum promo berakhir!\n";
    defaultMessage += "Alamat: Jl. Contoh No. 123, Kota\n";
    defaultMessage += "Hubungi: 08123456789";
    
    // Show share modal
    shareMessageInput.value = defaultMessage;
    shareModal.classList.remove('hidden');
}

// Hide share modal
function hideShareModal() {
    shareModal.classList.add('hidden');
}

// Share to WhatsApp
function shareToWhatsApp() {
    const message = encodeURIComponent(shareMessageInput.value);
    const phone = phoneNumberInput.value.replace(/[^0-9]/g, '');
    
    let whatsappUrl = 'https://wa.me/';
    if (phone) {
        whatsappUrl += phone;
    }
    whatsappUrl += `?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    hideShareModal();
}

// Use promotion template
function useTemplate(templateType) {
    // Reset form
    promoForm.reset();
    promoIdInput.value = '';
    
    // Set default dates (today and a week from today)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    tanggalMulaiInput.value = formatDateForInput(today);
    tanggalSelesaiInput.value = formatDateForInput(nextWeek);
    
    // Fill template data
    switch (templateType) {
        case 'diskon':
            judulPromosiInput.value = 'Diskon 10% Semua Produk';
            deskripsiPromosiInput.value = 'Dapatkan diskon 10% untuk semua pembelian produk di warung kami. Syarat dan ketentuan berlaku.';
            break;
        case 'beli1gratis1':
            judulPromosiInput.value = 'Beli 1 Gratis 1';
            deskripsiPromosiInput.value = 'Beli 1 produk dan dapatkan 1 produk sejenis secara gratis. Berlaku untuk produk tertentu.';
            break;
        case 'paket':
            judulPromosiInput.value = 'Paket Hemat Keluarga';
            deskripsiPromosiInput.value = 'Paket belanja hemat untuk keluarga. Dapatkan potongan harga spesial untuk pembelian paket produk.';
            break;
    }
    
    // Show modal
    showPromoModal();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial render
    renderPromotions();
    
    // Add promotion button
    tambahPromosiBtn.addEventListener('click', () => showPromoModal());
    
    // Share to WhatsApp button
    shareWaBtn.addEventListener('click', showShareModal);
    
    // Close modal buttons
    closeModal.addEventListener('click', hidePromoModal);
    cancelForm.addEventListener('click', hidePromoModal);
    
    // Delete modal buttons
    cancelDelete.addEventListener('click', hideDeleteModal);
    confirmDelete.addEventListener('click', () => deletePromo(confirmDelete.dataset.id));
    
    // Share modal buttons
    closeShareModal.addEventListener('click', hideShareModal);
    cancelShare.addEventListener('click', hideShareModal);
    confirmShare.addEventListener('click', shareToWhatsApp);
    
    // Template buttons
    document.querySelectorAll('.use-template').forEach(btn => {
        btn.addEventListener('click', () => useTemplate(btn.dataset.template));
    });
    
    // Form submission
    promoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const promoId = promoIdInput.value;
        const isEdit = !!promoId;
        
        const newPromo = {
            id: isEdit ? promoId : generateId(),
            judul: judulPromosiInput.value,
            deskripsi: deskripsiPromosiInput.value,
            tanggalMulai: tanggalMulaiInput.value,
            tanggalSelesai: tanggalSelesaiInput.value
        };
        
        if (isEdit) {
            // Update existing promotion
            promotions = promotions.map(promo => promo.id === promoId ? newPromo : promo);
        } else {
            // Add new promotion
            promotions.push(newPromo);
        }
        
        savePromotions();
        renderPromotions();
        hidePromoModal();
    });
});