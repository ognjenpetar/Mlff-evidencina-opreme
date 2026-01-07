/**
 * Main Application Entry Point (ES Module)
 * Version: 4.0.0 - ES Modules Architecture
 *
 * This is the main entry point for the MLFF Equipment Tracking application.
 * It initializes the Supabase client, services, and sets up the app.
 */

// Import Supabase configuration and functions
import supabase, {
    loginWithGoogle,
    logout,
    getCurrentUser,
    isAuthenticated,
    setupAuthListener,
    testConnection
} from './config/supabase.js';

// Import Supabase service
import SupabaseService from './services/supabase.js';

console.log('🚀 Initializing MLFF Equipment Tracking Application v4.0.0');

// ==========================================
// EXPOSE TO GLOBAL SCOPE
// ==========================================
// Make functions available globally for compatibility with existing code

window.supabase = supabase;
window.supabaseClient = supabase;
window.SupabaseService = SupabaseService;

// Auth functions
window.loginWithGoogle = loginWithGoogle;
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.isAuthenticated = isAuthenticated;

console.log('✅ Supabase client and service exposed globally');

// ==========================================
// INITIALIZE APPLICATION
// ==========================================

// Setup auth state listener
setupAuthListener();
console.log('✅ Auth state listener initialized');

// Test connection to Supabase
testConnection();

// ==========================================
// WAIT FOR OTHER SCRIPTS TO LOAD
// ==========================================
// The rest of the app (analytics.js, router.js, app.js) will load after this module

console.log('✅ Main application module initialized');
console.log('📋 Waiting for additional scripts (analytics, router, app) to load...');

// Dispatch event to signal that Supabase is ready
window.dispatchEvent(new CustomEvent('supabase-ready'));
