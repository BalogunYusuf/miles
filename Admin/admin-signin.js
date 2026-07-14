
function togglePassword(){
  const input = document.getElementById('password');
  input.type = input.type === 'password' ? 'text' : 'password';
}
let remembered = false;
function toggleRemember(){
  remembered = !remembered;
  document.getElementById('rememberBox').classList.toggle('checked', remembered);
}
function handleSubmit(e){
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const banner = document.getElementById('errorBanner');
  // Demo-only validation stub — replace with real authentication.
  if(email && password.length >= 6){
    banner.classList.remove('show');
    window.location.href = 'admin-dashboard.html';
  } else {
    banner.classList.add('show');
  }
  return false;
}
