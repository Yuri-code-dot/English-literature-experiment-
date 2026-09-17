// Supabase public client configuration.
// Replace these two placeholders with your project's URL and publishable key.
// NEVER put a Supabase service_role/secret key in this file.

export const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co'
export const SUPABASE_PUBLISHABLE_KEY = 'YOUR_SUPABASE_PUBLISHABLE_KEY'

export const AUTH_REDIRECT_URL = new URL('auth/login.html', window.location.href).href
