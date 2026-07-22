const invitationParams = new URLSearchParams(window.location.search);
const invitationToken = invitationParams.get('token');

function togglePassword(inputId) {
  const input = document.getElementById(inputId);

  if (!input) return;

  input.type = input.type === 'password' ? 'text' : 'password';
}

function showError(message) {
  const banner = document.getElementById('errorBanner');
  const text = document.getElementById('errorText');

  if (text) text.textContent = message;
  if (banner) banner.classList.add('show');
}

function hideError() {
  document.getElementById('errorBanner')?.classList.remove('show');
}

function showSuccess(message) {
  const banner = document.getElementById('successBanner');
  const text = document.getElementById('successText');

  if (text) text.textContent = message;
  if (banner) banner.classList.add('show');
}

function hideSuccess() {
  document.getElementById('successBanner')?.classList.remove('show');
}

function setSubmitting(active) {
  const button = document.getElementById('submitBtn');

  if (!button) return;

  button.disabled = active;

  button.dataset.original =
    button.dataset.original || button.innerHTML;

  button.innerHTML = active
    ? 'Activating account…'
    : button.dataset.original;
}

async function handleSubmit(event) {
  event.preventDefault();

  hideError();
  hideSuccess();

  const password = document.getElementById('password')?.value;
  const confirmPassword =
    document.getElementById('confirmPassword')?.value;

  if (!invitationToken) {
    showError('This invitation link is missing its token.');
    return;
  }

  if (!password || !confirmPassword) {
    showError('Complete all required fields.');
    return;
  }

  if (password.length < 8) {
    showError('Password must be at least 8 characters long.');
    return;
  }

  if (password !== confirmPassword) {
    showError('Passwords do not match.');
    return;
  }

  setSubmitting(true);

  try {
    await AdminAPI.post('/auth/accept-invite', {
      token: invitationToken,
      password,
      confirmPassword,
    });

    showSuccess(
      'Your administrator account has been activated. Redirecting to sign in…'
    );

    document.getElementById('signupForm')?.reset();

    setTimeout(() => {
      window.location.href = 'admin-signin.html';
    }, 1800);
  } catch (err) {
    showError(
      err.message ||
        'The invitation could not be accepted. It may be invalid or expired.'
    );

    setSubmitting(false);
  }
}

(function initialiseSignupPage() {
  if (AdminAPI.getAccessToken()) {
    window.location.href = 'admin.html';
    return;
  }

  if (!invitationToken) {
    showError('This invitation link is incomplete or invalid.');

    const button = document.getElementById('submitBtn');

    if (button) {
      button.disabled = true;
    }
  }

  document
    .getElementById('signupForm')
    ?.addEventListener('submit', handleSubmit);
})();