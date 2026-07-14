
function togglePw(id){
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
}
let termsAgreed = false;
function toggleTerms(){
  termsAgreed = !termsAgreed;
  document.getElementById('termsBox').classList.toggle('checked', termsAgreed);
}
function checkStrength(){
  const val = document.getElementById('password').value;
  let score = 0;
  if(val.length >= 8) score++;
  if(/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
  if(/[0-9]/.test(val)) score++;
  if(/[^A-Za-z0-9]/.test(val)) score++;
  const bars = [document.getElementById('bar1'),document.getElementById('bar2'),document.getElementById('bar3'),document.getElementById('bar4')];
  const colors = ['#C04B4B','#D9A441','#D9A441','#2E8B57'];
  const labels = ['Weak','Fair','Good','Strong'];
  bars.forEach((b,i)=> b.style.background = i < score ? colors[score-1] : 'rgba(248,243,236,0.1)');
  document.getElementById('strengthLabel').textContent = val.length === 0
    ? 'Use 8+ characters with a mix of letters, numbers & symbols'
    : labels[Math.max(score-1,0)] + ' password';
  document.getElementById('strengthFill').style.width = (score/4*100)+'%';
}
function handleSubmit(e){
  e.preventDefault();
  const banner = document.getElementById('errorBanner');
  const errorText = document.getElementById('errorText');
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirmPassword').value;

  if(!termsAgreed){
    errorText.textContent = 'Please agree to the Administrator Code of Conduct to continue.';
    banner.classList.add('show');
    return false;
  }
  if(password !== confirm){
    errorText.textContent = 'Passwords do not match. Please re-enter.';
    banner.classList.add('show');
    return false;
  }
  if(password.length < 8){
    errorText.textContent = 'Password must be at least 8 characters.';
    banner.classList.add('show');
    return false;
  }
  banner.classList.remove('show');
  window.location.href = 'admin-signin.html';
  return false;
}
