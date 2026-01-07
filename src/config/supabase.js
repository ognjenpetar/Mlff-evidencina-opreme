/**
 * Supabase Configuration (ES Module)
 * Version: 4.0.0 - ES Modules Architecture
 *
 * This module initializes and exports the Supabase client.
 * Uses Vite environment variables for configuration.
 */

// Import Supabase from CDN (will be available globally)
const { createClient } = window.supabase;

// Get environment variables (injected by Vite)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ ERROR: Supabase credentials not found!');
    console.error('📝 Make sure you have:');
    console.error('   1. Created .env file (copy from .env.example)');
    console.error('   2. Filled in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    console.error('   3. Run "npm run dev" (for development) or "npm run build" (for production)');
    throw new Error('Missing Supabase credentials. Check console for details.');
}

if (SUPABASE_URL.includes('YOUR-PROJECT-ID') || SUPABASE_ANON_KEY.includes('YOUR-ANON-KEY')) {
    console.warn('⚠️ WARNING: Supabase credentials are placeholder values!');
    console.warn('📝 Please update .env file with your actual Supabase credentials.');
    console.warn('🔗 Get them from: https://supabase.com/dashboard → Your Project → Settings → API');
}

// Create Supabase client (singleton - ES modules only load once)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase client initialized successfully');
console.log('🌐 Project URL:', SUPABASE_URL);
console.log('🔐 Using anon/public key (safe to expose in frontend)');

// ==========================================
// AUTHENTICATION FUNCTIONS
// ==========================================

/**
 * Login with Google OAuth
 */
export async function loginWithGoogle() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) throw error;

        console.log('🔐 Google OAuth initiated');
    } catch (error) {
        console.error('❌ Login error:', error);
        alert('Greška pri prijavi: ' + error.message);
    }
}

/**
 * Logout current user
 */
export async function logout() {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        console.log('✅ User logged out successfully');

        // Optionally redirect to home
        window.location.hash = '#/';
    } catch (error) {
        console.error('❌ Logout error:', error);
        alert('Greška pri odjavi: ' + error.message);
    }
}

/**
 * Get current user
 * @returns {Promise<Object|null>} User object or null if not logged in
 */
export async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) throw error;

        return user;
    } catch (error) {
        console.error('❌ Error getting current user:', error);
        return null;
    }
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if user is logged in
 */
export async function isAuthenticated() {
    const user = await getCurrentUser();
    return user !== null;
}

// ==========================================
// AUTHENTICATION STATE LISTENER
// ==========================================

/**
 * Setup auth state change listener
 * Call this once when app initializes
 */
export function setupAuthListener() {
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔐 Auth state changed:', event);

        if (session) {
            console.log('✅ User logged in:', session.user.email);

            // Update UI to show logged-in state
            if (document.getElementById('loginBtn')) {
                document.getElementById('loginBtn').style.display = 'none';
            }
            if (document.getElementById('userInfo')) {
                document.getElementById('userInfo').style.display = 'flex';
            }
            if (document.getElementById('logoutBtn')) {
                document.getElementById('logoutBtn').style.display = 'block';
            }
            if (document.getElementById('userEmail')) {
                document.getElementById('userEmail').textContent = session.user.email;
            }
        } else {
            console.log('❌ User logged out');

            // Update UI to show logged-out state
            if (document.getElementById('loginBtn')) {
                document.getElementById('loginBtn').style.display = 'block';
            }
            if (document.getElementById('userInfo')) {
                document.getElementById('userInfo').style.display = 'none';
            }
            if (document.getElementById('logoutBtn')) {
                document.getElementById('logoutBtn').style.display = 'none';
            }
        }
    });
}

// ==========================================
// CONNECTION TEST
// ==========================================

/**
 * Test connection to Supabase
 * Call this once when app initializes
 */
export async function testConnection() {
    try {
        // Try a simple query to test connection
        const { data, error } = await supabase
            .from('locations')
            .select('count')
            .limit(1);

        if (error) {
            // If error is about missing table, that's OK (migrations not run yet)
            if (error.message.includes('relation') || error.message.includes('does not exist')) {
                console.log('⚠️ Supabase connected, but database tables not found.');
                console.log('📝 Run SQL migrations in Supabase Dashboard → SQL Editor');
                console.log('   1. supabase/migrations/001_initial_schema.sql');
                console.log('   2. supabase/migrations/002_rls_policies.sql');
                console.log('   3. supabase/migrations/003_indexes.sql');
                console.log('   4. supabase/migrations/004_storage_setup.sql');
            } else {
                throw error;
            }
        } else {
            console.log('✅ Supabase connection successful!');
        }
    } catch (error) {
        console.error('❌ Supabase connection test failed:', error);
        console.error('🔧 Check your credentials in .env file');
    }
}

// Export the Supabase client as default
export default supabase;
