(function () {
  // Backend runs on a different origin than the frontend (e.g. Live Server on 127.0.0.1:5500
  // vs. the API on localhost:5000), so a relative fetch URL would resolve against the wrong
  // origin. Point directly at the API instead. Update this if your backend URL changes.
  const API_BASE_URL = 'http://localhost:5000/api/v1';

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
  const feedback = document.getElementById('profile-feedback');
  const qualitiesField = document.getElementById('qualities-field');

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
      fields: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus', 'country', 'regionState', 'congregation', 'relocation', 'children', 'aboutYourself'],
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

  // Compute a whole-number age from a yyyy-mm-dd date input value.
  function ageFromDOB(dobValue) {
    if (!dobValue) return null;
    const dob = new Date(dobValue);
    if (isNaN(dob.getTime())) return null;
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
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
      const age = ageFromDOB(form.elements.dateOfBirth?.value);
      quickAge.textContent = age !== null ? age : '—';
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

  // Keep the hidden qualities field in sync with whichever chips are active, so FormData picks it up.
  function syncQualitiesField() {
    if (!qualitiesField) return;
    const active = Array.from(form.querySelectorAll('.q-chip.active')).map(function (chip) {
      return chip.textContent.trim();
    });
    qualitiesField.value = JSON.stringify(active);
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
      syncQualitiesField();
      refreshProfileSummary();
    });
  });

  // --- Label -> backend enum maps ---
  const PIONEER_MAP = {
    'Regular Pioneer': 'regular',
    'Auxiliary Pioneer': 'auxiliary',
    'Publisher': 'none',
  };
  const RELOCATION_MAP = {
    'Yes, open to relocation': 'open',
    'Within same country': 'same_country',
    'Local area only': 'local_only',
  };
  const CHILDREN_MAP = {
    'No children': 'none',
    'Have children, not in home': 'not_in_home',
    'Have children, in home': 'in_home',
  };
  const CONTACT_MAP = {
    'Email': 'email',
    'Phone': 'phone',
    'Either': 'either',
  };
  const GENDER_MAP = {
    'Sister': 'female',
    'Brother': 'male',
  };
  const MARITAL_MAP = {
    'Never married': 'never_married',
    'Widowed': 'widowed',
    'Divorced (scriptural)': 'divorced',
  };

  // Fields that get renamed as-is (frontend name -> backend name), no value transformation needed.
  const RENAME_MAP = {
    regionState: 'state',
    aboutYourself: 'aboutMe',
    yearsBaptized: null, // handled specially below (converted to baptismYear)
    bestTime: 'bestTimeToContact',
  };

  // Build the FormData payload the API expects from the raw form values.
  function buildPayload() {
    const fd = new FormData();
    const raw = new FormData(form);

    for (const [key, value] of raw.entries()) {
      if (key === 'profileImage') {
        if (value && value.size > 0) fd.append('profileImage', value);
        continue;
      }
      if (key === 'qualities') {
        JSON.parse(value || '[]').forEach(function (q) { fd.append('qualities[]', q); });
        continue;
      }
      if (key === 'currentPrivileges') {
        fd.append('pioneerStatus', PIONEER_MAP[value] ?? 'none');
        continue;
      }
      if (key === 'relocation') {
        fd.append('relocation', RELOCATION_MAP[value] ?? 'local_only');
        continue;
      }
      if (key === 'children') {
        fd.append('hasChildren', CHILDREN_MAP[value] ?? 'none');
        continue;
      }
      if (key === 'preferredContact') {
        fd.append('preferredContact', CONTACT_MAP[value] ?? 'either');
        continue;
      }
      if (key === 'gender') {
        fd.append('gender', GENDER_MAP[value] ?? 'female');
        continue;
      }
      if (key === 'maritalStatus') {
        fd.append('maritalStatus', MARITAL_MAP[value] ?? 'never_married');
        continue;
      }
      if (key === 'yearsBaptized') {
        const years = Number(value || 0);
        const year = new Date().getFullYear() - years;
        fd.append('baptismYear', year);
        continue;
      }
      if (RENAME_MAP[key]) {
        fd.append(RENAME_MAP[key], value);
        continue;
      }
      // country, dateOfBirth, firstName, lastName, gender, maritalStatus, congregation,
      // hoursPerMonth, spiritualGoals, email, phone go through unchanged.
      fd.append(key, value);
    }

    return fd;
  }

  // Handle the submit action: build the payload, POST it, and report success/failure.
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    syncQualitiesField();
    refreshProfileSummary();

    const submitBtn = form.querySelector('.btn-save');
    if (submitBtn) submitBtn.disabled = true;
    if (feedback) {
      feedback.style.color = 'var(--gold2)';
      feedback.textContent = 'Submitting...';
    }

    try {
      const payload = buildPayload();
      const res = await fetch(`${API_BASE_URL}/profiles`, {
        method: 'POST',
        body: payload,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Submission failed. Please check your details and try again.');
      }

      if (feedback) {
        feedback.style.color = 'var(--gold)';
        feedback.textContent = 'Profile submitted successfully.';
      }
      form.reset();
      if (qualitiesField) qualitiesField.value = '[]';
      form.querySelectorAll('.q-chip.active').forEach(function (chip) { chip.classList.remove('active'); });
      if (avatarPreview) avatarPreview.innerHTML = '✦';
      refreshProfileSummary();
    } catch (err) {
      if (feedback) {
        feedback.style.color = '#c0392b';
        feedback.textContent = err.message;
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  // Run once on page load so the sidebar and progress bar start in the correct state.
  syncQualitiesField();
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