import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, AUTH_REDIRECT_URL } from './config.js'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

export async function signIn(provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: AUTH_REDIRECT_URL,
    },
  })

  if (error) throw error
  if (!data?.url) throw new Error('Supabase did not return an OAuth URL.')

  // Redirect explicitly so the browser does not depend on Supabase's
  // automatic redirect behavior in this static GitHub Pages experiment.
  window.location.assign(data.url)
}

export async function signInWithGitHub() {
  return signIn('github')
}

export async function signInWithGoogle() {
  return signIn('google')
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export function watchAuth(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session, event)
  })
}
