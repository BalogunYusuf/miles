document.getElementById('profile-form')?.addEventListener('submit', async (event) => {
  
  if (result.success) {
    // alert('profile submited successfully');
    setFeedback('profile-feedback', );
    document.getElementById('profile-contact-email').textContent = data.email;
    document.getElementById('profile-contact-phone').textContent = data.phone;
  }
});


  // Mobile nav toggle — works alongside any existing jw.js logic.
  (function () {
    var toggle = document.getElementById('nav-toggle');
    var links = document.getElementById('nav-links');
    if (!toggle || !links) return;

    function closeMenu() {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeMenu();
    });
  })();
