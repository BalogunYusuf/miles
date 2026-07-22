(function () {
  // Backend runs on a different origin than the frontend (e.g. Live Server on 127.0.0.1:5500
  // vs. the API on localhost:5000), so a relative fetch URL would resolve against the wrong
  // origin. Point directly at the API instead. Update this if your backend URL changes.
  const API_BASE_URL = 'http://localhost:5000/api/v1';

  // ============================================================
  // 1. SHARED BEHAVIOR — runs on every page (homepage, profile,
  //    contact, and any other public page that loads jw.js)
  // ============================================================

  // --- Reveal-on-scroll animation ---
  // There must be only one reveal observer in the entire file.
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach(function (element) {
      element.classList.add('visible');
    });
  }

  // --- Mobile navigation ---
  // There must be only one copy of this logic. Safely does nothing if either
  // #nav-toggle or #nav-links is missing from the page.
  (function () {
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    if (!navToggle || !navLinks) return;

    function closeMenu() {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }

    navToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeMenu();
    });
  })();

  // --- Shared helper functions ---
  // Safe to call from any page; not duplicated per form.
  function setFeedback(elementId, message, isSuccess = true) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = message;
    element.style.color = isSuccess ? 'var(--gold2)' : '#c85656';
  }

  // ============================================================
  // 2. CONTACT-PAGE BEHAVIOR — runs only when #contact-form exists
  // ============================================================

  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const submitBtn = contactForm.querySelector('[type="submit"]');
      const formData = new FormData(contactForm);

      const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message')
      };

      if (submitBtn) submitBtn.disabled = true;

      setFeedback(
        'contact-feedback',
        'Sending message...',
        true
      );

      fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok) {
              throw new Error(
                data.message ||
                data.error ||
                'Failed to send message.'
              );
            }

            return data;
          });
        })
        .then(function (data) {
          setFeedback(
            'contact-feedback',
            data.message ||
            'Your message has been sent. We will get back to you shortly.',
            true
          );

          contactForm.reset();
        })
        .catch(function (error) {
          setFeedback(
            'contact-feedback',
            error.message ||
            'Something went wrong. Please try again.',
            false
          );
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  // ============================================================
  // 3. PROFILE-PAGE BEHAVIOR — runs only when #profile-form exists
  // ============================================================

  const profileForm = document.getElementById('profile-form');

  if (profileForm) {
    // Cache the sidebar/progress elements so they can be updated dynamically.
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
    // Also cache a resized version (via canvas) for embedding into the draft/receipt PDFs.
    let draftPhotoDataUrl = null;

    if (avatarPreview && photoInput) {
      photoInput.addEventListener('change', function (event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
          avatarPreview.innerHTML = '<img class="profile-avatar-img" src="' + e.target.result + '" alt="Profile photo">';

          // Resize via canvas so the PDF embed is a reasonable, consistent size.
          const img = new Image();
          img.onload = function () {
            const maxDim = 300; // cap longest side at 300px, keeps PDF file size sane
            let w = img.width;
            let h = img.height;
            if (w > h && w > maxDim) {
              h = Math.round(h * (maxDim / w));
              w = maxDim;
            } else if (h > maxDim) {
              w = Math.round(w * (maxDim / h));
              h = maxDim;
            }

            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);

            // JPEG at 0.85 quality keeps file size down while still looking clean.
            draftPhotoDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    // Define each sidebar section and the profileForm fields that must be filled for it to count as complete.
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
          return profileForm.querySelectorAll('.q-chip.active').length > 0;
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
            const input = profileForm.elements[fieldName];
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

    // Copy the main profileForm values into the quick-info items shown in the sidebar.
    function updateQuickInfo() {
      if (quickGender) {
        const gender = profileForm.elements.gender?.value || 'Not provided';
        quickGender.textContent = gender;
      }

      if (quickAge) {
        const age = ageFromDOB(profileForm.elements.dateOfBirth?.value);
        quickAge.textContent = age !== null ? age : '—';
      }

      if (quickCountry) {
        const country = profileForm.elements.country?.selectedOptions[0]?.text || 'Not provided';
        quickCountry.textContent = country;
      }

      if (quickBaptized) {
        const baptized = profileForm.elements.yearsBaptized?.value ? profileForm.elements.yearsBaptized.value + ' years' : '—';
        quickBaptized.textContent = baptized;
      }
    }

    // Keep the hidden qualities field in sync with whichever chips are active, so FormData picks it up.
    function syncQualitiesField() {
      if (!qualitiesField) return;
      const active = Array.from(profileForm.querySelectorAll('.q-chip.active')).map(function (chip) {
        return chip.textContent.trim();
      });
      qualitiesField.value = JSON.stringify(active);
    }

    // Re-run both the quick-info and section-status updates whenever the user edits the profileForm.
    function refreshProfileSummary() {
      updateQuickInfo();
      updateSectionStates();
    }

    // Listen for typing and changing events so the sidebar updates live while the user fills the form.
    profileForm.addEventListener('input', refreshProfileSummary);
    profileForm.addEventListener('change', refreshProfileSummary);

    // Make each quality chip toggle on click and immediately recheck the completion state.
    profileForm.querySelectorAll('.q-chip').forEach(function (chip) {
      chip.addEventListener('click', function (event) {
        event.preventDefault();
        chip.classList.toggle('active');
        syncQualitiesField();
        refreshProfileSummary();
      });
    });

    // --- Tab navigation: scroll to the matching form section when a tab is clicked ---
    const profileTabs = profileForm.querySelectorAll('.profile-tab');
    profileTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        profileTabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');

        const targetId = tab.getAttribute('data-target');
        const targetEl = targetId ? document.getElementById(targetId) : null;
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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

    // Build the FormData payload the API expects from the raw profileForm values.
    function buildPayload() {
      const fd = new FormData();
      const raw = new FormData(profileForm);

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

    // Snapshot of the raw profileForm values, used for the receipt PDF before profileForm.reset() clears everything.
    function getFormValuesSnapshot() {
      const data = {};
      profileForm.querySelectorAll('input[name], select[name], textarea[name]').forEach(function (el) {
        if (el.type === 'file' || el.type === 'hidden') return;
        data[el.name] = el.value;
      });
      return data;
    }

    // --- Save Draft: generate a client-side PDF snapshot of the user's current form entries. ---
    // No backend call - works at any point while filling out the profile.
    function generateDraftPDF() {
      if (!window.jspdf) {
        if (feedback) {
          feedback.style.color = '#c0392b';
          feedback.textContent = 'PDF library failed to load. Check your connection and try again.';
        }
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const marginX = 15;
      let y = 20;
      const lineHeight = 8;

      function addLine(label, value) {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.setFont(undefined, 'bold');
        doc.text(label + ':', marginX, y);
        doc.setFont(undefined, 'normal');
        doc.text(String(value || '—'), marginX + 55, y);
        y += lineHeight;
      }

      doc.setFontSize(16);
      doc.text('Profile Draft', marginX, y);
      y += 12;
      doc.setFontSize(11);

      // Embed the uploaded photo, if one was selected.
      if (draftPhotoDataUrl) {
        const imgWidth = 40;  // mm
        const imgHeight = 40; // mm, assumes roughly square crop
        doc.addImage(draftPhotoDataUrl, 'JPEG', marginX, y, imgWidth, imgHeight);
        y += imgHeight + 8;
      }

      // Personal Details
      doc.setFontSize(13);
      doc.text('Personal Details', marginX, y);
      y += 8;
      doc.setFontSize(11);
      addLine('First Name', profileForm.elements.firstName?.value);
      addLine('Last Name', profileForm.elements.lastName?.value);
      addLine('Date of Birth', profileForm.elements.dateOfBirth?.value);
      addLine('Gender', profileForm.elements.gender?.value);
      addLine('Marital Status', profileForm.elements.maritalStatus?.value);
      addLine('Country', profileForm.elements.country?.selectedOptions[0]?.text);
      addLine('Region/State', profileForm.elements.regionState?.value);
      addLine('Congregation', profileForm.elements.congregation?.value);
      addLine('Open to Relocation', profileForm.elements.relocation?.value);
      addLine('Children', profileForm.elements.children?.value);
      y += 4;

      const aboutMe = profileForm.elements.aboutYourself?.value;
      if (aboutMe) {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFont(undefined, 'bold');
        doc.text('About:', marginX, y);
        y += 6;
        doc.setFont(undefined, 'normal');
        const split = doc.splitTextToSize(aboutMe, 180);
        doc.text(split, marginX, y);
        y += split.length * 6 + 4;
      }

      // Spiritual Standing
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.text('Spiritual Standing', marginX, y);
      y += 8;
      doc.setFontSize(11);
      addLine('Years Baptized', profileForm.elements.yearsBaptized?.value);
      addLine('Current Privileges', profileForm.elements.currentPrivileges?.value);
      addLine('Hours/Month', profileForm.elements.hoursPerMonth?.value);
      addLine('Spiritual Goals', profileForm.elements.spiritualGoals?.value);
      y += 4;

      // Partner Preferences
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.text('Partner Preferences', marginX, y);
      y += 8;
      doc.setFontSize(11);
      const qualities = Array.from(profileForm.querySelectorAll('.q-chip.active'))
        .map(function (chip) { return chip.textContent.trim(); });
      addLine('Desired Qualities', qualities.length ? qualities.join(', ') : 'None selected');
      y += 4;

      // Contact Info
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.text('Contact Info', marginX, y);
      y += 8;
      doc.setFontSize(11);
      addLine('Email', profileForm.elements.email?.value);
      addLine('Phone', profileForm.elements.phone?.value);
      addLine('Preferred Contact', profileForm.elements.preferredContact?.value);
      addLine('Best Time', profileForm.elements.bestTime?.value);

      const fileName = 'profile-draft-' + (profileForm.elements.firstName?.value || 'user').toLowerCase() + '.pdf';
      doc.save(fileName);

      if (feedback) {
        feedback.style.color = 'var(--gold)';
        feedback.textContent = 'Draft PDF downloaded.';
      }
    }

    // --- Submission receipt: generate a client-side PDF confirming what was actually submitted. ---
    // Called right after a successful 201 response, using the real memberId the backend returned.
    function generateReceiptPDF(memberId, rawValues, activeQualities) {
      if (!window.jspdf) return; // submission already succeeded — fail silently if the library didn't load

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const marginX = 15;
      let y = 20;
      const lineHeight = 8;

      function addLine(label, value) {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.setFont(undefined, 'bold');
        doc.text(label + ':', marginX, y);
        doc.setFont(undefined, 'normal');
        doc.text(String(value || '—'), marginX + 55, y);
        y += lineHeight;
      }

      doc.setFontSize(16);
      doc.text('Profile Submission Receipt', marginX, y);
      y += 10;
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text('Member ID: ' + (memberId || 'Pending'), marginX, y);
      y += 6;
      doc.text('Submitted: ' + new Date().toLocaleString(), marginX, y);
      y += 12;
      doc.setTextColor(0);
      doc.setFontSize(11);

      // Embed the uploaded photo, if one was selected.
      if (draftPhotoDataUrl) {
        const imgWidth = 40;
        const imgHeight = 40;
        doc.addImage(draftPhotoDataUrl, 'JPEG', marginX, y, imgWidth, imgHeight);
        y += imgHeight + 8;
      }

      // Personal Details
      doc.setFontSize(13);
      doc.text('Personal Details', marginX, y);
      y += 8;
      doc.setFontSize(11);
      addLine('First Name', rawValues.firstName);
      addLine('Last Name', rawValues.lastName);
      addLine('Date of Birth', rawValues.dateOfBirth);
      addLine('Gender', rawValues.gender);
      addLine('Marital Status', rawValues.maritalStatus);
      addLine('Country', profileForm.elements.country?.selectedOptions[0]?.text || rawValues.country);
      addLine('Region/State', rawValues.regionState);
      addLine('Congregation', rawValues.congregation);
      addLine('Open to Relocation', rawValues.relocation);
      addLine('Children', rawValues.children);
      y += 4;

      if (rawValues.aboutYourself) {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFont(undefined, 'bold');
        doc.text('About:', marginX, y);
        y += 6;
        doc.setFont(undefined, 'normal');
        const split = doc.splitTextToSize(rawValues.aboutYourself, 180);
        doc.text(split, marginX, y);
        y += split.length * 6 + 4;
      }

      // Spiritual Standing
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.text('Spiritual Standing', marginX, y);
      y += 8;
      doc.setFontSize(11);
      addLine('Years Baptized', rawValues.yearsBaptized);
      addLine('Current Privileges', rawValues.currentPrivileges);
      addLine('Hours/Month', rawValues.hoursPerMonth);
      addLine('Spiritual Goals', rawValues.spiritualGoals);
      y += 4;

      // Partner Preferences
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.text('Partner Preferences', marginX, y);
      y += 8;
      doc.setFontSize(11);
      addLine('Desired Qualities', activeQualities.length ? activeQualities.join(', ') : 'None selected');
      y += 4;

      // Contact Info
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.text('Contact Info', marginX, y);
      y += 8;
      doc.setFontSize(11);
      addLine('Email', rawValues.email);
      addLine('Phone', rawValues.phone);
      addLine('Preferred Contact', rawValues.preferredContact);
      addLine('Best Time', rawValues.bestTime);

      doc.save('profile-receipt-' + (memberId || 'submission') + '.pdf');
    }

    // --- Profile form submission ---
    profileForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const submitBtn = profileForm.querySelector('[type="submit"]');
      const rawValues = getFormValuesSnapshot();
      const activeQualities = Array.from(profileForm.querySelectorAll('.q-chip.active'))
        .map(function (chip) { return chip.textContent.trim(); });
      const payload = buildPayload();

      if (submitBtn) submitBtn.disabled = true;
      if (feedback) {
        feedback.style.color = 'var(--muted)';
        feedback.textContent = 'Submitting your profile...';
      }

      fetch(`${API_BASE_URL}/profiles`, {
        method: 'POST',
        body: payload
      })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok) {
              throw new Error(data.message || 'Failed to submit profile.');
            }
            return data;
          });
        })
        .then(function (data) {
          const memberId = data && (data.memberId || (data.data && data.data.memberId));
          if (feedback) {
            feedback.style.color = 'var(--gold)';
            feedback.textContent = 'Profile submitted successfully!';
          }
          generateReceiptPDF(memberId, rawValues, activeQualities);
          profileForm.reset();
          draftPhotoDataUrl = null;
          if (avatarPreview) avatarPreview.innerHTML = '';
          syncQualitiesField();
          refreshProfileSummary();
        })
        .catch(function (error) {
          if (feedback) {
            feedback.style.color = '#c85656';
            feedback.textContent = error.message || 'Something went wrong. Please try again.';
          }
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });

    // Wire up the Save Draft button.
    // NOTE: adjust this selector to match your actual button's id/class if different.
    const draftBtn = profileForm.querySelector('.btn-secondary');
    if (draftBtn) {
      draftBtn.addEventListener('click', function (event) {
        event.preventDefault();
        generateDraftPDF();
      });
    }

    // Run once on page load so the sidebar and progress bar start in the correct state.
    syncQualitiesField();
    refreshProfileSummary();
  }
})();