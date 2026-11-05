// Add your Supabase Project URL and anon/public key here.
// The anon key is intended for browser use when Row Level Security is enabled.
// NEVER place the Supabase service_role key in this file.
const SUPABASE_URL = https://btkguyhcqhttakvymwdq.supabase.co;
const SUPABASE_ANON_KEY = "sb_publishable_LmTTCKzBVn-Mz0MUsRi4LA_wcPTdf1P";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
