async function requireUser() {
  if (SUPABASE_URL.startsWith("YOUR_") || SUPABASE_ANON_KEY.startsWith("YOUR_")) {
    document.body.innerHTML = '<main><p>Supabase is not configured. Add the project URL and anon key in js/supabase.js.</p></main>';
    throw new Error("Supabase configuration missing.");
  }
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error || !session) {
    window.location.replace("Login.html");
    return null;
  }
  return session.user;
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = document.getElementById("message");
      const button = loginForm.querySelector('button[type="submit"]');
      button.disabled = true;
      message.textContent = "Signing in…";
      const { error } = await supabaseClient.auth.signInWithPassword({
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value
      });
      if (error) {
        message.textContent = `Sign-in failed: ${error.message}`;
        button.disabled = false;
      } else {
        window.location.replace("Search.html");
      }
    });
  }
  const logout = document.getElementById("logout");
  if (logout) logout.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.replace("Login.html");
  });
});
