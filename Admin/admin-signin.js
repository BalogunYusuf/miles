function togglePassword(){
  const input = document.getElementById('password');
  input.type = input.type === 'password' ? 'text' : 'password';
}

let remembered = false;
function toggleRemember(){
  remembered = !remembered;
  document.getElementById('rememberBox').classList.toggle('checked', remembered);
}

function showError(message){
  const banner = document.getElementById('errorBanner');
  const text = banner.querySelector('span');
  if(text) text.textContent = message;
  banner.classList.add('show');
}

function hideError(){
  document.getElementById('errorBanner').classList.remove('show');
}

function setSubmitting(isSubmitting){
  const btn = document.querySelector('.btn-submit');
  if(!btn) return;
  btn.disabled = isSubmitting;
  btn.dataset.originalHtml = btn.dataset.originalHtml || btn.innerHTML;
  btn.innerHTML = isSubmitting ? 'Signing in…' : btn.dataset.originalHtml;
}

async function handleSubmit(e){
  e.preventDefault();
  hideError();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if(!email || !password){
    showError('Please enter both email and password.');
    return false;
  }

  setSubmitting(true);
  try {
    const res = await AdminAPI.login(email, password);
    const { admin, accessToken } = res.data;

    AdminAPI.setAccessToken(accessToken);
    AdminAPI.setStoredAdmin(admin);

    window.location.href = 'admin.html';
  } catch (err) {
    // Don't reveal whether the email exists — generic message for 401.
    // Show the real message for account-state errors (e.g. deactivated).
    if (err.status === 403) {
      showError(err.message);
    } else {
      showError('Incorrect email or password. Please try again.');
    }
    setSubmitting(false);
  }

  return false;
}

/* If a valid session already exists (refresh cookie still good),
   skip straight to the dashboard instead of showing the form. */
(async function checkExistingSession(){
  if (AdminAPI.getAccessToken()) {
    window.location.href = 'admin.html';
    return;
  }
  const refreshed = await AdminAPI.refreshAccessToken();
  if (refreshed) {
    window.location.href = 'admin.html';
  }
})();