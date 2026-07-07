document.getElementById('profile-form')?.addEventListener('submit', async (event) => {
  ...
  if (result.success) {
    // alert('profile submited successfully');
    setFeedback('profile-feedback', ...);
    document.getElementById('profile-contact-email').textContent = data.email;
    document.getElementById('profile-contact-phone').textContent = data.phone;
  }
});