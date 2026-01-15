/**
 * Admin Panel Module
 * Version: 5.0 (Authentication Edition)
 *
 * Provides user management functionality for Super Admins.
 * Features:
 *   - View all allowed users
 *   - Add new users
 *   - Edit user roles
 *   - Delete users (except self)
 */

const AdminPanel = {
    // State
    users: [],
    isLoading: false,

    /**
     * Initialize admin panel
     */
    async initialize() {
        console.log('🔧 Initializing Admin Panel...');

        if (!AuthService.canAccessAdmin()) {
            console.warn('⚠️ User does not have admin access');
            return false;
        }

        await this.loadUsers();
        console.log('✅ Admin Panel initialized');
        return true;
    },

    /**
     * Load all users from database
     */
    async loadUsers() {
        try {
            this.isLoading = true;
            this.users = await AuthService.getAllUsers();
            console.log(`✅ Loaded ${this.users.length} users`);
        } catch (error) {
            console.error('❌ Error loading users:', error);
            this.users = [];
        } finally {
            this.isLoading = false;
        }
    },

    /**
     * Render the admin panel HTML
     * @returns {string} HTML string
     */
    render() {
        if (!AuthService.canAccessAdmin()) {
            return `
                <div class="access-denied">
                    <i class="fas fa-lock"></i>
                    <h2>Pristup Odbijen</h2>
                    <p>Nemate dozvolu za pristup admin panelu.</p>
                    <a href="#dashboard" class="btn btn-primary">
                        <i class="fas fa-home"></i> Nazad na Dashboard
                    </a>
                </div>
            `;
        }

        return `
            <div class="admin-panel">
                <div class="admin-header">
                    <h1><i class="fas fa-users-cog"></i> Upravljanje Korisnicima</h1>
                    <button class="btn btn-primary" onclick="AdminPanel.showAddUserModal()">
                        <i class="fas fa-user-plus"></i> Dodaj Korisnika
                    </button>
                </div>

                <div class="admin-stats">
                    <div class="stat-card">
                        <i class="fas fa-users"></i>
                        <span class="stat-value">${this.users.length}</span>
                        <span class="stat-label">Ukupno Korisnika</span>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-user-shield"></i>
                        <span class="stat-value">${this.users.filter(u => u.role === 'super_admin').length}</span>
                        <span class="stat-label">Super Admini</span>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-user-edit"></i>
                        <span class="stat-value">${this.users.filter(u => u.role === 'editor').length}</span>
                        <span class="stat-label">Editori</span>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-user"></i>
                        <span class="stat-value">${this.users.filter(u => u.role === 'viewer').length}</span>
                        <span class="stat-label">Vieweri</span>
                    </div>
                </div>

                <div class="users-table-container">
                    <table class="users-table">
                        <thead>
                            <tr>
                                <th>Korisnik</th>
                                <th>Email</th>
                                <th>Uloga</th>
                                <th>Dodat</th>
                                <th>Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderUsersRows()}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Add User Modal -->
            <div id="add-user-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-user-plus"></i> Dodaj Korisnika</h2>
                        <button class="modal-close" onclick="AdminPanel.closeModal('add-user-modal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="add-user-form" onsubmit="AdminPanel.handleAddUser(event)">
                        <div class="form-group">
                            <label for="new-user-email">Email Adresa *</label>
                            <input type="email" id="new-user-email" required placeholder="korisnik@gmail.com">
                            <small>Korisnik mora imati Google nalog sa ovom email adresom</small>
                        </div>
                        <div class="form-group">
                            <label for="new-user-name">Ime (opciono)</label>
                            <input type="text" id="new-user-name" placeholder="Ime Prezime">
                        </div>
                        <div class="form-group">
                            <label for="new-user-role">Uloga *</label>
                            <select id="new-user-role" required>
                                <option value="">-- Izaberite ulogu --</option>
                                <option value="viewer">Viewer (samo pregled)</option>
                                <option value="editor">Editor (pregled + izmene)</option>
                                <option value="super_admin">Super Admin (sve dozvole)</option>
                            </select>
                        </div>
                        <div class="role-description" id="role-description"></div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="AdminPanel.closeModal('add-user-modal')">
                                Odustani
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-plus"></i> Dodaj Korisnika
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Edit User Modal -->
            <div id="edit-user-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-user-edit"></i> Izmeni Korisnika</h2>
                        <button class="modal-close" onclick="AdminPanel.closeModal('edit-user-modal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="edit-user-form" onsubmit="AdminPanel.handleEditUser(event)">
                        <input type="hidden" id="edit-user-id">
                        <div class="form-group">
                            <label>Email Adresa</label>
                            <input type="email" id="edit-user-email" disabled>
                        </div>
                        <div class="form-group">
                            <label for="edit-user-name">Ime</label>
                            <input type="text" id="edit-user-name" placeholder="Ime Prezime">
                        </div>
                        <div class="form-group">
                            <label for="edit-user-role">Uloga *</label>
                            <select id="edit-user-role" required>
                                <option value="viewer">Viewer (samo pregled)</option>
                                <option value="editor">Editor (pregled + izmene)</option>
                                <option value="super_admin">Super Admin (sve dozvole)</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="AdminPanel.closeModal('edit-user-modal')">
                                Odustani
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Sačuvaj Izmene
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    /**
     * Render table rows for users
     * @returns {string} HTML string
     */
    renderUsersRows() {
        if (this.isLoading) {
            return `
                <tr>
                    <td colspan="5" class="loading-row">
                        <i class="fas fa-spinner fa-spin"></i> Učitavanje...
                    </td>
                </tr>
            `;
        }

        if (this.users.length === 0) {
            return `
                <tr>
                    <td colspan="5" class="empty-row">
                        <i class="fas fa-user-slash"></i> Nema registrovanih korisnika
                    </td>
                </tr>
            `;
        }

        const currentEmail = AuthService.getUserEmail()?.toLowerCase();

        return this.users.map(user => {
            const isCurrentUser = user.email.toLowerCase() === currentEmail;
            const roleClass = this.getRoleClass(user.role);
            const roleIcon = this.getRoleIcon(user.role);
            const roleName = this.getRoleName(user.role);
            const createdAt = new Date(user.created_at).toLocaleDateString('sr-RS');

            return `
                <tr class="${isCurrentUser ? 'current-user-row' : ''}">
                    <td class="user-info">
                        <div class="user-avatar">
                            ${user.display_name ? user.display_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                        <span class="user-name">
                            ${user.display_name || 'Bez imena'}
                            ${isCurrentUser ? '<span class="badge badge-current">Vi</span>' : ''}
                        </span>
                    </td>
                    <td class="user-email">${user.email}</td>
                    <td>
                        <span class="role-badge ${roleClass}">
                            <i class="${roleIcon}"></i> ${roleName}
                        </span>
                    </td>
                    <td>${createdAt}</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-icon" onclick="AdminPanel.showEditUserModal('${user.id}')" title="Izmeni">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${!isCurrentUser ? `
                            <button class="btn btn-sm btn-icon btn-danger" onclick="AdminPanel.confirmDeleteUser('${user.id}', '${user.email}')" title="Obriši">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Get CSS class for role badge
     */
    getRoleClass(role) {
        switch (role) {
            case 'super_admin': return 'role-super-admin';
            case 'editor': return 'role-editor';
            case 'viewer': return 'role-viewer';
            default: return '';
        }
    },

    /**
     * Get icon class for role
     */
    getRoleIcon(role) {
        switch (role) {
            case 'super_admin': return 'fas fa-user-shield';
            case 'editor': return 'fas fa-user-edit';
            case 'viewer': return 'fas fa-user';
            default: return 'fas fa-user';
        }
    },

    /**
     * Get display name for role (in Serbian)
     */
    getRoleName(role) {
        switch (role) {
            case 'super_admin': return 'Super Admin';
            case 'editor': return 'Editor';
            case 'viewer': return 'Viewer';
            default: return 'Nepoznato';
        }
    },

    // ===== MODAL FUNCTIONS =====

    /**
     * Show add user modal
     */
    showAddUserModal() {
        const modal = document.getElementById('add-user-modal');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('add-user-form').reset();
            this.updateRoleDescription();
        }
    },

    /**
     * Show edit user modal
     * @param {string} userId - User UUID
     */
    showEditUserModal(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const modal = document.getElementById('edit-user-modal');
        if (modal) {
            document.getElementById('edit-user-id').value = user.id;
            document.getElementById('edit-user-email').value = user.email;
            document.getElementById('edit-user-name').value = user.display_name || '';
            document.getElementById('edit-user-role').value = user.role;
            modal.classList.add('active');
        }
    },

    /**
     * Close a modal
     * @param {string} modalId - Modal element ID
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },

    /**
     * Update role description based on selected role
     */
    updateRoleDescription() {
        const select = document.getElementById('new-user-role');
        const description = document.getElementById('role-description');

        if (!select || !description) return;

        const role = select.value;
        let text = '';

        switch (role) {
            case 'viewer':
                text = '<i class="fas fa-info-circle"></i> Viewer može samo da pregleda podatke. Ne može da dodaje, menja ili briše.';
                break;
            case 'editor':
                text = '<i class="fas fa-info-circle"></i> Editor može da pregleda i menja podatke (dodavanje, izmena). Ne može da briše.';
                break;
            case 'super_admin':
                text = '<i class="fas fa-exclamation-triangle"></i> Super Admin ima potpunu kontrolu: pregled, izmene, brisanje i upravljanje korisnicima.';
                break;
            default:
                text = '';
        }

        description.innerHTML = text;
    },

    // ===== FORM HANDLERS =====

    /**
     * Handle add user form submission
     * @param {Event} event
     */
    async handleAddUser(event) {
        event.preventDefault();

        const email = document.getElementById('new-user-email').value.trim();
        const displayName = document.getElementById('new-user-name').value.trim();
        const role = document.getElementById('new-user-role').value;

        if (!email || !role) {
            showToast('Molimo popunite sva obavezna polja', 'error');
            return;
        }

        try {
            showLoadingOverlay('Dodavanje korisnika...');

            await AuthService.addUser({
                email,
                displayName,
                role
            });

            hideLoadingOverlay();
            showToast('Korisnik uspešno dodat!', 'success');
            this.closeModal('add-user-modal');
            await this.loadUsers();
            this.refreshPanel();
        } catch (error) {
            hideLoadingOverlay();
            showToast(error.message || 'Greška pri dodavanju korisnika', 'error');
        }
    },

    /**
     * Handle edit user form submission
     * @param {Event} event
     */
    async handleEditUser(event) {
        event.preventDefault();

        const userId = document.getElementById('edit-user-id').value;
        const displayName = document.getElementById('edit-user-name').value.trim();
        const role = document.getElementById('edit-user-role').value;

        try {
            showLoadingOverlay('Ažuriranje korisnika...');

            await AuthService.updateUser(userId, {
                displayName,
                role
            });

            hideLoadingOverlay();
            showToast('Korisnik uspešno ažuriran!', 'success');
            this.closeModal('edit-user-modal');
            await this.loadUsers();
            this.refreshPanel();
        } catch (error) {
            hideLoadingOverlay();
            showToast(error.message || 'Greška pri ažuriranju korisnika', 'error');
        }
    },

    /**
     * Confirm and delete user
     * @param {string} userId - User UUID
     * @param {string} userEmail - User email
     */
    async confirmDeleteUser(userId, userEmail) {
        const confirmed = await showConfirmDialog(
            'Brisanje Korisnika',
            `Da li ste sigurni da želite da obrišete korisnika "${userEmail}"?\n\nOva akcija se ne može poništiti.`,
            'Obriši',
            'Odustani'
        );

        if (!confirmed) return;

        try {
            showLoadingOverlay('Brisanje korisnika...');

            await AuthService.deleteUser(userId, userEmail);

            hideLoadingOverlay();
            showToast('Korisnik uspešno obrisan!', 'success');
            await this.loadUsers();
            this.refreshPanel();
        } catch (error) {
            hideLoadingOverlay();
            showToast(error.message || 'Greška pri brisanju korisnika', 'error');
        }
    },

    /**
     * Refresh the admin panel content
     */
    refreshPanel() {
        const container = document.getElementById('main-content') || document.getElementById('content');
        if (container && window.location.hash === '#admin-panel') {
            container.innerHTML = this.render();
            this.attachEventListeners();
        }
    },

    /**
     * Attach event listeners after render
     */
    attachEventListeners() {
        // Role description update on change
        const roleSelect = document.getElementById('new-user-role');
        if (roleSelect) {
            roleSelect.addEventListener('change', () => this.updateRoleDescription());
        }
    }
};

// Make available globally
window.AdminPanel = AdminPanel;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdminPanel };
}

console.log('✅ AdminPanel loaded');
