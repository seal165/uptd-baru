// public/js/admin/users.js

(function() {
    'use strict';

    // ==================== KONFIGURASI ====================
    // 🔥 PASTIKAN BASE URL SELALU BENAR
    const API_BASE_URL = (window.__APP_CONFIG__?.API_BASE_URL || window.location.origin + '/api' || 'http://localhost:5000/api').replace(/\/+$/, '');
    const ITEMS_PER_PAGE = 10;
    
    // State
    let currentPage = 1;
    let currentRole = '';
    let searchTerm = '';
    let totalData = 0;
    let allUsers = [];
    let searchTimeout;

    console.log('🔗 [USER MANAGEMENT] API_BASE_URL:', API_BASE_URL);

    // ==================== CEK TOKEN ====================
    function getToken() {
        return localStorage.getItem('token');
    }

    if (!getToken()) {
        window.location.href = '/admin/login';
        return;
    }

    // ==================== LOAD DATA ====================
    async function loadUsers() {
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                role: currentRole,
                search: searchTerm
            });

            const url = `${API_BASE_URL}/users?${params}`;
            console.log('📡 [USER MANAGEMENT] Fetching:', url);
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Kirim cookie jika ada
            });

            console.log('📡 [USER MANAGEMENT] Response status:', response.status);

            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/admin/login';
                return;
            }

            if (response.status === 404) {
                console.error('❌ [USER MANAGEMENT] Endpoint 404 – pastikan backend berjalan dan route /users tersedia.');
                showAlert('Endpoint tidak ditemukan. Periksa koneksi ke server.', 'danger');
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('📦 [USER MANAGEMENT] Response:', result);

            if (result.success) {
                allUsers = Array.isArray(result.data) ? result.data : [];
                totalData = result.pagination?.total || result.data?.total || 0;
                updateStats({ total: totalData });
                updateUsersTable(allUsers);
                updatePagination();
            } else {
                showAlert(result.message || 'Gagal memuat data', 'danger');
            }
        } catch (error) {
            console.error('❌ [USER MANAGEMENT] Error:', error);
            showAlert('Gagal terhubung ke server: ' + error.message, 'danger');
        } finally {
            const loadingRow = document.getElementById('loadingRow');
            if (loadingRow) {
                loadingRow.style.display = 'none';
            }
        }
    }

    // ==================== UPDATE STATS ====================
    function updateStats(stats) {
        const statsHtml = `
            <div class="stats-card h-100">
                <div class="d-flex justify-content-between align-items-center h-100">
                    <div>
                        <small class="text-muted d-block mb-1">Total Pemohon</small>
                        <h3 class="fw-bold mb-0">${stats.total || 0}</h3>
                    </div>
                    <div class="bg-primary-subtle p-3 rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                        <i class="fas fa-users text-primary fs-5"></i>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('statsCards').innerHTML = statsHtml;
    }

    // ==================== UPDATE TABLE ====================
    function updateUsersTable(users) {
        const tbody = document.getElementById('usersTableBody');
        const emptyState = document.getElementById('emptyState');
        
        const loadingRow = document.getElementById('loadingRow');
        if (loadingRow) loadingRow.style.display = 'none';
        
        if (!users || users.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        const rowsHtml = users.map(user => {
            const fullName = user.full_name || 'NA';
            const initials = fullName.substring(0, 2).toUpperCase();
            
            const statusClass = user.role === 'admin' ? 'badge-soft-success' : 'badge-soft-primary';
            const statusIcon = user.role === 'admin' ? 'fa-user-shield' : 'fa-user';
            const statusText = user.role === 'admin' ? 'Admin' : 'Pelanggan';
            
            const totalTrans = parseInt(user.total_transactions) || 0;
            
            // 🔥 AVATAR: tampilkan gambar jika ada, fallback ke inisial
            let avatarUrl = user.avatar;
            if (avatarUrl && !avatarUrl.startsWith('http') && avatarUrl !== 'null' && avatarUrl !== '') {
                const assetBaseUrl = window.__APP_CONFIG__?.assetBaseUrl || 'http://localhost:5000';
                avatarUrl = avatarUrl.startsWith('/') ? `${assetBaseUrl}${avatarUrl}` : `${assetBaseUrl}/${avatarUrl}`;
            }
            
            const avatarHtml = (avatarUrl && avatarUrl !== 'null' && avatarUrl !== '')
                ? `<img src="${avatarUrl}" alt="${fullName}" class="avatar-img me-3 shadow-sm" style="width:40px;height:40px;border-radius:50%;object-fit:cover;background:white;border:2px solid #e9ecef;" onerror="this.outerHTML='<div class=\\'avatar-initials bg-primary-subtle me-3\\'>${initials}</div>'">`
                : `<div class="avatar-initials bg-primary-subtle me-3">${initials}</div>`;
            
            return `
                <tr>
                    <td class="ps-4">
                        <input type="checkbox" class="form-check-input row-checkbox" value="${user.id}">
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            ${avatarHtml}
                            <div>
                                <div class="fw-bold text-dark">${fullName}</div>
                                <div class="small text-muted">
                                    ${user.nama_instansi ? 
                                        `<i class="fas fa-building me-1"></i> ${user.nama_instansi}` : 
                                        '<i class="fas fa-user me-1"></i> Perorangan'
                                    }
                                </div>
                            </div>
                        </div>
                    </td>

                    <td>
                        <div class="d-flex flex-column">
                            <span class="text-dark small">${user.email}</span>
                            <span class="text-muted small">${user.nomor_telepon || '-'}</span>
                        </div>
                    </td>

                    <td>
                        <span class="badge ${statusClass} rounded-pill px-3">
                            <i class="fas ${statusIcon} me-1"></i>${statusText}
                        </span>
                    </td>

                    <td class="text-muted small">
                        ${formatDate(user.created_at)}
                    </td>

                    <td class="text-center">
                        <span class="fw-bold">${totalTrans}</span>
                    </td>

                    <td class="text-end pe-4">
                        <div class="d-flex gap-3 justify-content-end align-items-center">
                            <a href="/admin/users/${user.id}" class="text-secondary action-icon" title="Detail" style="font-size: 1.1rem; text-decoration: none;">
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                            
                            ${user.status === 'pending' ? `
                                <button class="text-success action-icon bg-transparent border-0 p-0" title="Verifikasi" onclick="window.verifyUser('${user.id}')" style="font-size: 1.1rem;">
                                    <i class="fas fa-check"></i>
                                </button>
                            ` : ''}
                            
                            <button class="text-danger action-icon bg-transparent border-0 p-0" title="Hapus" onclick="window.deleteUser('${user.id}')" style="font-size: 1.1rem;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = rowsHtml;

        // Update select all functionality
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            const newSelectAll = selectAll.cloneNode(true);
            selectAll.parentNode.replaceChild(newSelectAll, selectAll);
            newSelectAll.addEventListener('change', (e) => {
                document.querySelectorAll('.row-checkbox').forEach(cb => cb.checked = e.target.checked);
            });
        }
    }

    // ==================== FILTER HANDLERS ====================
    function initFilters() {
        document.querySelectorAll('.filter-badge').forEach(badge => {
            badge.addEventListener('click', function() {
                const role = this.dataset.role;
                document.querySelectorAll('.filter-badge').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                filterByRole(role);
            });
        });

        document.getElementById('searchInput').addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchTerm = e.target.value;
                currentPage = 1;
                loadUsers();
            }, 500);
        });
    }

    function filterByRole(role) {
        currentRole = role;
        currentPage = 1;
        loadUsers();
        
        document.querySelectorAll('.filter-badge').forEach(badge => {
            if (badge.dataset.role === role) {
                badge.classList.add('active');
            } else {
                badge.classList.remove('active');
            }
        });
    }

    function resetFilters() {
        document.getElementById('searchInput').value = '';
        currentRole = '';
        currentPage = 1;
        
        document.querySelectorAll('.filter-badge').forEach(badge => {
            if (badge.dataset.role === '') {
                badge.classList.add('active');
            } else {
                badge.classList.remove('active');
            }
        });
        
        loadUsers();
    }

    // ==================== PAGINATION ====================
    function updatePagination() {
        const totalPages = Math.ceil(totalData / ITEMS_PER_PAGE);
        const pagination = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            document.getElementById('paginationInfo').innerHTML = 
                `Total: <strong>${totalData}</strong> Pemohon`;
            return;
        }

        let paginationHtml = '';
        
        paginationHtml += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="window.changePage(${currentPage - 1})">Prev</a>
            </li>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                paginationHtml += `
                    <li class="page-item ${currentPage === i ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="window.changePage(${i})">${i}</a>
                    </li>
                `;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        paginationHtml += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="window.changePage(${currentPage + 1})">Next</a>
            </li>
        `;

        pagination.innerHTML = paginationHtml;
        
        const start = ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
        const end = Math.min(currentPage * ITEMS_PER_PAGE, totalData);
        document.getElementById('paginationInfo').innerHTML = 
            `Menampilkan ${start}-${end} dari <strong>${totalData}</strong> Pemohon`;
    }

    function changePage(page) {
        currentPage = page;
        loadUsers();
    }

    // ==================== USER ACTIONS ====================
    async function verifyUser(userId) {
        if (!confirm('Verifikasi user ini?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
                showAlert('User berhasil diverifikasi', 'success');
                loadUsers();
            } else {
                showAlert(result.message || 'Gagal memverifikasi user', 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Gagal memverifikasi user', 'danger');
        }
    }

    async function deleteUser(userId) {
        if (!confirm('Hapus user ini? Tindakan ini tidak dapat dibatalkan.')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
                showAlert('User berhasil dihapus', 'success');
                loadUsers();
            } else {
                showAlert(result.message || 'Gagal menghapus user', 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Gagal menghapus user', 'danger');
        }
    }

    // ==================== EXPORT FUNCTIONS ====================
    function exportToExcel() {
        if (!allUsers || allUsers.length === 0) {
            showAlert('Tidak ada data untuk diexport', 'warning');
            return;
        }

        const headers = [
            'Nama', 'Email', 'Telepon', 'Perusahaan', 'Alamat', 
            'Status', 'Terdaftar', 'Total Transaksi'
        ];
        
        const rows = allUsers.map(user => [
            user.full_name || user.name || '-',
            user.email || '-',
            user.nomor_telepon || user.phone || '-',
            user.nama_instansi || user.company || '-',
            user.alamat || user.address || '-',
            user.role === 'admin' ? 'Admin' : 'Pelanggan',
            formatDate(user.created_at),
            user.total_transactions || 0
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pemohon_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // ==================== HELPER FUNCTIONS ====================
    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    }

    function getStatusClass(status) {
        const classes = {
            'Selesai': 'badge-soft-success',
            'Lunas': 'badge-soft-success',
            'Sedang Diuji': 'badge-soft-primary',
            'Menunggu Verifikasi': 'badge-soft-warning',
            'Pengecekan Sampel': 'badge-soft-warning',
            'Belum Lunas': 'badge-soft-warning',
            'Menunggu Pembayaran': 'badge-soft-warning'
        };
        return classes[status] || 'badge-soft-secondary';
    }

    function showAlert(message, type = 'info') {
        let swalType = type === 'danger' ? 'error' : (type === 'primary' ? 'info' : type);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: swalType,
            title: message,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            customClass: {
                popup: 'swal2-toast'
            }
        });
    }

    // ==================== EXPOSE FUNCTIONS TO WINDOW ====================
    window.loadUsers = loadUsers;
    window.filterByRole = filterByRole;
    window.resetFilters = resetFilters;
    window.verifyUser = verifyUser;
    window.deleteUser = deleteUser;
    window.exportToExcel = exportToExcel;
    window.changePage = changePage;

    // ==================== INITIALIZE ====================
    document.addEventListener('DOMContentLoaded', () => {
        console.log('✅ Users page initialized');
        
        initFilters();
        loadUsers();
        
        // Auto refresh every 30 seconds
        setInterval(loadUsers, 30000);
    });

})();