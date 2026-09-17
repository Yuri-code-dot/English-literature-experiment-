// Supabase public client configuration for the English Literature Library experiment.
// The publishable client key is safe to use in browser code.
// NEVER put a Supabase service_role/secret key in this file.

export const SUPABASE_URL = 'https://svmurnxbudnzafxfsnqd.supabase.co'
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_kO_j4EQYc56T__S8rs5Ejw_gYA8rHfp'

// login.html lives in this same directory, so this resolves to /auth/login.html.
export const AUTH_REDIRECT_URL = new URL('./login.html', window.location.href).href
