(function () {
  // Cache the form and the sidebar/progress elements so they can be updated dynamically.
  const form = document.getElementById('profile-form');
  if (!form) return;

  const completionFill = document.getElementById('completion-fill');
  const completionPercent = document.getElementById('completion-percent');
  const quickGender = document.getElementById('quick-gender');
  const quickAge = document.getElementById('quick-age');
  const quickCountry = document.getElementById('quick-country');
  const quickBaptized = document.getElementById('quick-baptized');
  const avatarPreview = document.getElementById('profile-avatar-preview');
  const photoInput = document.getElementById('profile-photo-input');

  // Allow the user to upload a profile picture and preview it inside the avatar circle.
  if (avatarPreview && photoInput) {
    photoInput.addEventListener('change', function (event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (e) {
        avatarPreview.innerHTML = '<img class="profile-avatar-img" src="' + e.target.result + '" alt="Profile photo">';
      };
      reader.readAsDataURL(file);
    });
  }

  // Define each sidebar section and the form fields that must be filled for it to count as complete.
  const sections = [
    {
      id: 'sidebar-personal',
      fields: ['firstName', 'lastName', 'age', 'gender', 'maritalStatus', 'country', 'regionState', 'congregation', 'relocation', 'children', 'aboutYourself'],
      label: 'Personal Details'
    },
    {
      id: 'sidebar-spiritual',
      fields: ['yearsBaptized', 'currentPrivileges', 'hoursPerMonth', 'spiritualGoals'],
      label: 'Spiritual Standing'
    },
    {
      id: 'sidebar-preferences',
      fields: [],
      label: 'Partner Preferences',
      isComplete: function () {
        return form.querySelectorAll('.q-chip.active').length > 0;
      }
    },
    {
      id: 'sidebar-contact',
      fields: ['email', 'phone', 'preferredContact', 'bestTime'],
      label: 'Contact Info'
    }
  ];

  // Helper that checks whether a field contains actual entered content.
  function isFilled(value) {
    return String(value || '').trim() !== '';
  }

  // Update the status text for each sidebar section and calculate the overall completion percent.
  function updateSectionStates() {
    let completedSections = 0;

    sections.forEach(function (section) {
      const sidebarItem = document.getElementById(section.id);
      const status = sidebarItem ? sidebarItem.querySelector('.sidebar-item-val') : null;

      let done = false;
      if (section.isComplete) {
        // Partner Preferences uses a custom rule: at least one quality chip must be active.
        done = section.isComplete();
      } else {
        // For standard sections, every listed field must be filled before the section is marked complete.
        done = section.fields.every(function (fieldName) {
          const input = form.elements[fieldName];
          return input ? isFilled(input.value) : false;
        });
      }

      if (status) {
        // Toggle the sidebar label between a completed and pending state.
        status.textContent = done ? '✓ Done' : 'Pending';
        status.style.color = done ? 'var(--gold)' : 'var(--muted)';
      }

      if (done) completedSections += 1;
    });

    // Convert the completed section count into a percentage for the bar and label.
    const percent = Math.round((completedSections / sections.length) * 100);
    if (completionFill) completionFill.style.width = percent + '%';
    if (completionPercent) completionPercent.textContent = percent + '%';
  }

  // Copy the main form values into the quick-info items shown in the sidebar.
  function updateQuickInfo() {
    if (quickGender) {
      const gender = form.elements.gender?.value || 'Not provided';
      quickGender.textContent = gender;
    }

    if (quickAge) {
      const age = form.elements.age?.value || '—';
      quickAge.textContent = age;
    }

    if (quickCountry) {
      const country = form.elements.country?.selectedOptions[0]?.text || 'Not provided';
      quickCountry.textContent = country;
    }

    if (quickBaptized) {
      const baptized = form.elements.yearsBaptized?.value ? form.elements.yearsBaptized.value + ' years' : '—';
      quickBaptized.textContent = baptized;
    }
  }

  // Re-run both the quick-info and section-status updates whenever the user edits the form.
  function refreshProfileSummary() {
    updateQuickInfo();
    updateSectionStates();
  }

  // Listen for typing and changing events so the sidebar updates live while the user fills the form.
  form.addEventListener('input', refreshProfileSummary);
  form.addEventListener('change', refreshProfileSummary);

  // Make each quality chip toggle on click and immediately recheck the completion state.
  form.querySelectorAll('.q-chip').forEach(function (chip) {
    chip.addEventListener('click', function (event) {
      event.preventDefault();
      chip.classList.toggle('active');
      refreshProfileSummary();
    });
  });

  // Handle the submit action without reloading the page and show a short feedback message.
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    refreshProfileSummary();
    const feedback = document.getElementById('profile-feedback');
    if (feedback) {
      feedback.textContent = 'Profile details updated.';
    }
  });

  // Run once on page load so the sidebar and progress bar start in the correct state.
  refreshProfileSummary();

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
})();


