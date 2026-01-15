/**
 * Authentication Service
 * Version: 5.0 (Authentication Edition)
 *
 * Handles Google OAuth authentication and role-based access control.
 * Works with Supabase Auth and the allowed_users table.
 *
 * Roles:
 *   - super_admin: Full access (CRUD + user management)
 *   - editor: Read + Create + Update (no delete)
 *   - viewer: Read only
 */

const AuthService = {
    // Current user state
    currentUser: null,
    userRole: null,
    userDisplayName: null,
    isInitialized: false,

    // Callbacks for auth state changes
    onAuthStateChangeCallbacks: [],

    /**
     * Initialize the auth service
     * Should be called when app starts
     */
    async initialize() {
        try {
            console.log('🔐 Initializing AuthService...');

            // Check for existing session
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('❌ Error getting session:', error);
            }

            if (session) {
                await this.setCurrentUser(session.user);
            }

            // Listen for auth changes
            supabase.auth.onAuthStateChange(async (event, session) => {
                console.log('🔄 Auth state changed:', event);

                if (event === 'SIGNED_IN' && session) {
                    await this.setCurrentUser(session.user);
                    this.notifyAuthStateChange('signed_in');
                } else if (event === 'SIGNED_OUT') {
                    this.clearCurrentUser();
                    this.notifyAuthStateChange('signed_out');
                } else if (event === 'TOKEN_REFRESHED') {
                    console.log('🔄 Token refreshed');
                }
            });

            this.isInitialized = true;
            console.log('✅ AuthService initialized');

            return true;
        } catch (error) {
            console.error('❌ Error initializing AuthService:', error);
            return false;
        }
    },

    /**
     * Set the current user and fetch their role
     * @param {Object} user - Supabase auth user object
     */
    async setCurrentUser(user) {
        try {
            this.currentUser = user;
            console.log('👤 User signed in:', user.email);

            // Get role from allowed_users table
            const { data, error } = await supabase
                .from('allowed_users')
                .select('role, display_name')
                .eq('email', user.email)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // User not in allowed_users table
                    console.warn('⚠️ User not in allowed_users:', user.email);
                    this.userRole = null;
                    this.userDisplayName = user.user_metadata?.full_name || user.email;
                } else {
                    throw error;
                }
            } else {
                this.userRole = data.role;
                this.userDisplayName = data.display_name || user.user_metadata?.full_name || user.email;
                console.log('✅ User role:', this.userRole);
            }
        } catch (error) {
            console.error('❌ Error setting current user:', error);
            this.userRole = null;
        }
    },

    /**
     * Clear current user state
     */
    clearCurrentUser() {
        this.currentUser = null;
        this.userRole = null;
        this.userDisplayName = null;
        console.log('👤 User signed out');
    },

    /**
     * Sign in with Google OAuth
     * @returns {Promise<Object>} Result with data and error
     */
    async signInWithGoogle() {
        try {
            console.log('🔐 Starting Google OAuth...');

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + window.location.pathname,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent'
                    }
                }
            });

            if (error) throw error;

            console.log('✅ OAuth redirect initiated');
            return { data, error: null };
        } catch (error) {
            console.error('❌ Google sign-in error:', error);
            return { data: null, error };
        }
    },

    /**
     * Sign out the current user
     */
    async signOut() {
        try {
            console.log('🔐 Signing out...');

            const { error } = await supabase.auth.signOut();

            if (error) throw error;

            this.clearCurrentUser();
            console.log('✅ Signed out successfully');

            return { error: null };
        } catch (error) {
            console.error('❌ Sign out error:', error);
            return { error };
        }
    },

    /**
     * Register a callback for auth state changes
     * @param {Function} callback - Function to call when auth state changes
     */
    onAuthStateChange(callback) {
        this.onAuthStateChangeCallbacks.push(callback);
    },

    /**
     * Notify all registered callbacks of auth state change
     * @param {string} event - Event type ('signed_in', 'signed_out')
     */
    notifyAuthStateChange(event) {
        this.onAuthStateChangeCallbacks.forEach(callback => {
            try {
                callback(event, this.currentUser, this.userRole);
            } catch (error) {
                console.error('❌ Error in auth state change callback:', error);
            }
        });
    },

    // ===== PERMISSION CHECKS =====

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this.currentUser;
    },

    /**
     * Check if user is allowed (has a role in allowed_users)
     * @returns {boolean}
     */
    isAllowedUser() {
        return !!this.userRole;
    },

    /**
     * Check if user is Super Admin
     * @returns {boolean}
     */
    isSuperAdmin() {
        return this.userRole === 'super_admin';
    },

    /**
     * Check if user is Editor
     * @returns {boolean}
     */
    isEditor() {
        return this.userRole === 'editor';
    },

    /**
     * Check if user is Viewer
     * @returns {boolean}
     */
    isViewer() {
        return this.userRole === 'viewer';
    },

    /**
     * Check if user can edit (super_admin or editor)
     * @returns {boolean}
     */
    canEdit() {
        return ['super_admin', 'editor'].includes(this.userRole);
    },

    /**
     * Check if user can delete (super_admin only)
     * @returns {boolean}
     */
    canDelete() {
        return this.userRole === 'super_admin';
    },

    /**
     * Check if user can access admin panel (super_admin only)
     * @returns {boolean}
     */
    canAccessAdmin() {
        return this.userRole === 'super_admin';
    },

    // ===== USER INFO =====

    /**
     * Get current user email
     * @returns {string|null}
     */
    getUserEmail() {
        return this.currentUser?.email || null;
    },

    /**
     * Get current user display name
     * @returns {string|null}
     */
    getDisplayName() {
        return this.userDisplayName || this.currentUser?.user_metadata?.full_name || this.currentUser?.email || null;
    },

    /**
     * Get current user avatar URL
     * @returns {string|null}
     */
    getAvatarUrl() {
        return this.currentUser?.user_metadata?.avatar_url || null;
    },

    /**
     * Get current user role
     * @returns {string|null}
     */
    getRole() {
        return this.userRole;
    },

    /**
     * Get role display name (in Serbian)
     * @returns {string}
     */
    getRoleDisplayName() {
        switch (this.userRole) {
            case 'super_admin':
                return 'Super Admin';
            case 'editor':
                return 'Editor';
            case 'viewer':
                return 'Viewer';
            default:
                return 'Nepoznato';
        }
    },

    // ===== ADMIN FUNCTIONS =====

    /**
     * Get all allowed users (admin only)
     * @returns {Promise<Array>}
     */
    async getAllUsers() {
        try {
            if (!this.isSuperAdmin()) {
                throw new Error('Pristup odbijen - samo za Super Admin');
            }

            const { data, error } = await supabase
                .from('allowed_users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            console.log(`✅ Fetched ${data?.length || 0} allowed users`);
            return data || [];
        } catch (error) {
            console.error('❌ Error getting allowed users:', error);
            throw error;
        }
    },

    /**
     * Add a new allowed user (admin only)
     * @param {Object} userData - { email, role, display_name }
     * @returns {Promise<Object>} Created user
     */
    async addUser(userData) {
        try {
            if (!this.isSuperAdmin()) {
                throw new Error('Pristup odbijen - samo za Super Admin');
            }

            const { data, error } = await supabase
                .from('allowed_users')
                .insert([{
                    email: userData.email.toLowerCase().trim(),
                    role: userData.role,
                    display_name: userData.displayName || userData.display_name || null,
                    created_by: this.currentUser?.id || null
                }])
                .select()
                .single();

            if (error) {
                if (error.code === '23505') {
                    throw new Error('Korisnik sa ovim email-om već postoji');
                }
                throw error;
            }

            console.log('✅ User added:', data.email);
            return data;
        } catch (error) {
            console.error('❌ Error adding user:', error);
            throw error;
        }
    },

    /**
     * Update an allowed user's role (admin only)
     * @param {string} userId - User UUID
     * @param {Object} updates - { role, display_name }
     * @returns {Promise<Object>} Updated user
     */
    async updateUser(userId, updates) {
        try {
            if (!this.isSuperAdmin()) {
                throw new Error('Pristup odbijen - samo za Super Admin');
            }

            const updateData = {};
            if (updates.role) updateData.role = updates.role;
            if (updates.displayName !== undefined || updates.display_name !== undefined) {
                updateData.display_name = updates.displayName || updates.display_name;
            }

            const { data, error } = await supabase
                .from('allowed_users')
                .update(updateData)
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            console.log('✅ User updated:', data.email);
            return data;
        } catch (error) {
            console.error('❌ Error updating user:', error);
            throw error;
        }
    },

    /**
     * Delete an allowed user (admin only, cannot delete self)
     * @param {string} userId - User UUID
     * @param {string} userEmail - User email (for safety check)
     */
    async deleteUser(userId, userEmail) {
        try {
            if (!this.isSuperAdmin()) {
                throw new Error('Pristup odbijen - samo za Super Admin');
            }

            // Safety check: cannot delete yourself
            if (userEmail.toLowerCase() === this.getUserEmail()?.toLowerCase()) {
                throw new Error('Ne možete obrisati sopstveni nalog');
            }

            const { error } = await supabase
                .from('allowed_users')
                .delete()
                .eq('id', userId);

            if (error) throw error;

            console.log('✅ User deleted:', userEmail);
        } catch (error) {
            console.error('❌ Error deleting user:', error);
            throw error;
        }
    }
};

// Make service available globally
window.AuthService = AuthService;

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthService };
}

console.log('✅ AuthService loaded');
