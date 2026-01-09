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
console.log('🔐 Using anon/public key (anonymous mode - no authentication required)');

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
