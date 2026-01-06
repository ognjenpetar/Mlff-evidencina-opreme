/**
 * Supabase Configuration
 * Version: 3.0 (Supabase Edition)
 *
 * This file initializes the Supabase client for the MLFF Equipment Tracking application.
 *
 * ⚠️ IMPORTANT: Replace the placeholder values below with your actual Supabase credentials!
 *
 * To get your credentials:
 * 1. Go to https://supabase.com/dashboard
 * 2. Select your project: mlff-equipment-tracking
 * 3. Click Settings → API
 * 4. Copy "Project URL" and "anon/public" key
 * 5. Paste them below
 *
 * Example values (REPLACE THESE):
 *   SUPABASE_URL: 'https://abcdefghijk.supabase.co'
 *   SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 */

// ==========================================
// CONFIGURATION
// ==========================================
// Credentials are loaded from environment variables (.env file)
// For local development: copy .env.example to .env and fill in your values
// For production: environment variables are injected during build (Vite)
// ==========================================

const SUPABASE_URL = 'https://xmkkqawodbejrcjlnmqx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhta2txYXdvZGJlanJjamxubXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMzQ4MTksImV4cCI6MjA4MTcxMDgxOX0.nZSQTc1mqXm4Grv5u2ewolOHhjyvAebfbEnZ65yaZiE';

// ==========================================
// INITIALIZE SUPABASE CLIENT
// ==========================================

if (!window.supabase) {
    console.error('❌ Supabase SDK not loaded! Make sure you included the Supabase SDK script in index.html');
    throw new Error('Supabase SDK not found. Please include: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
}

// Create Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// VERIFY CONFIGURATION
// ==========================================

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ ERROR: Supabase credentials not found!');
    console.error('📝 Make sure you have:');
    console.error('   1. Created .env file (copy from .env.example)');
    console.error('   2. Filled in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    console.error('   3. Run "npm run dev" (for development) or "npm run build" (for production)');
    throw new Error('Missing Supabase credentials. Check console for details.');
} else if (SUPABASE_URL.includes('YOUR-PROJECT-ID') || SUPABASE_ANON_KEY.includes('YOUR-ANON-KEY')) {
    console.warn('⚠️ WARNING: Supabase credentials are placeholder values!');
    console.warn('📝 Please update .env file with your actual Supabase credentials.');
    console.warn('🔗 Get them from: https://supabase.com/dashboard → Your Project → Settings → API');
} else {
    console.log('✅ Supabase client initialized successfully');
    console.log('🌐 Project URL:', SUPABASE_URL);
    console.log('🔐 Using anon/public key (safe to expose in frontend)');
}

// ==========================================
// GLOBAL EXPORTS
// ==========================================

// Make supabase client available globally
window.supabase = supabase;  // Used by supabase-service.js
window.supabaseClient = supabase;  // Backward compatibility

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabase };
}

// ==========================================
// AUTHENTICATION STATE LISTENER
// ==========================================
// This listener will update the UI when auth state changes
// (defined here so it's available early in app lifecycle)
// ==========================================

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

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Login with Google OAuth
 */
async function loginWithGoogle() {
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
async function logout() {
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
async function getCurrentUser() {
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
async function isAuthenticated() {
    const user = await getCurrentUser();
    return user !== null;
}

// Make auth functions available globally
window.loginWithGoogle = loginWithGoogle;
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.isAuthenticated = isAuthenticated;

// ==========================================
// CONNECTION TEST
// ==========================================
// Test connection to Supabase on page load
// ==========================================

(async function testConnection() {
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
        console.error('🔧 Check your credentials in js/supabase-config.js');
    }
})();

// ==========================================
// END OF CONFIGURATION
// ==========================================
