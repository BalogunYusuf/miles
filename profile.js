// This whole file runs inside an IIFE (Immediately Invoked Function Expression) so none of
// these variables or helper functions leak into the global scope and collide with other scripts
// (like jw.js) that might be loaded on the same page.
(function () {
    console.log("PROFILE JS LOADED");
  // Backend runs on a different origin than the frontend (e.g. Live Server on 127.0.0.1:5500
  // vs. the API on localhost:5000), so a relative fetch URL would resolve against the wrong
  // origin. Point directly at the API instead. Update this if your backend URL changes.
  const API_BASE_URL = 'http://localhost:5000/api/v1';

  // Cache the form and the sidebar/progress elements so they can be updated dynamically.
  const form = document.getElementById('profile-form');
  if (!form) return; // Bail out entirely if this script somehow loads on a page with no form.

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
      if (!file) return; // User opened the file picker but cancelled - nothing to do.

      const reader = new FileReader();
      reader.onload = function (e) {
        // Swap the placeholder "✦" glyph for the actual uploaded photo.
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
      event.preventDefault(); // Chips are <button> elements inside a <form> - stop them from submitting it.
      chip.classList.toggle('active');
      syncQualitiesField();
      refreshProfileSummary();
    });
  });

  // --- Tab navigation: scroll to the matching form section when a tab is clicked ---
  const profileTabs = form.querySelectorAll('.profile-tab');
  profileTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      // Only one tab is ever "active" at a time, so clear the others before marking this one.
      profileTabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');

      const targetId = tab.getAttribute('data-target');
      const targetEl = targetId ? document.getElementById(targetId) : null;
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Word counters for "About Yourself" and "Spiritual Goals" ---
  // Each entry maps a textarea's `name` attribute to the id of its counter <div> and its word cap.
  const WORD_LIMITS = [
    { field: 'aboutYourself', counterId: 'aboutYourself-counter', limit: 150 },
    { field: 'spiritualGoals', counterId: 'spiritualGoals-counter', limit: 150 }
  ];

  // Counts words by splitting on whitespace and dropping any empty strings
  // (so leading/trailing spaces or multiple spaces don't inflate the count).
  function countWords(text) {
    const trimmed = String(text || '').trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }

  // Updates one counter element to reflect its textarea's current word count.
  // Doesn't stop the user from typing past the limit - it just warns them in red,
  // since hard-blocking mid-sentence typing is a frustrating experience.
  function updateWordCounter(fieldName, counterId, limit) {
    const textarea = form.elements[fieldName];
    const counterEl = document.getElementById(counterId);
    if (!textarea || !counterEl) return;

    const used = countWords(textarea.value);
    const remaining = limit - used;

    if (remaining >= 0) {
      counterEl.textContent = remaining + ' words left';
      counterEl.classList.remove('over-limit');
    } else {
      counterEl.textContent = Math.abs(remaining) + ' words over the ' + limit + '-word limit';
      counterEl.classList.add('over-limit');
    }
  }

  // Wire up a live listener for each limited field and run once immediately
  // so the counters show the correct number on page load (in case of pre-filled text).
  WORD_LIMITS.forEach(function (cfg) {
    const textarea = form.elements[cfg.field];
    if (!textarea) return;
    textarea.addEventListener('input', function () {
      updateWordCounter(cfg.field, cfg.counterId, cfg.limit);
    });
    updateWordCounter(cfg.field, cfg.counterId, cfg.limit);
  });

  // --- Label -> backend enum maps ---
  // The <select> elements show friendly labels to the user, but the backend API expects short,
  // fixed enum strings. These lookup tables translate one to the other in buildPayload() below.
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

    // Walk every field the browser collected from the form and translate/rename as needed
    // before appending it to the payload that actually gets sent to the backend.
    for (const [key, value] of raw.entries()) {
      if (key === 'profileImage') {
        // Only attach the photo if the user actually selected one (size > 0).
        if (value && value.size > 0) fd.append('profileImage', value);
        continue;
      }
      if (key === 'qualities') {
        // Stored as a JSON string in the hidden field; expand it back into repeated qualities[] entries.
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
        // Backend wants a calendar year, not a number-of-years count, so convert it here.
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

  // Snapshot of the raw form values, used for the receipt PDF before form.reset() clears everything.
  function getFormValuesSnapshot() {
    const data = {};
    form.querySelectorAll('input[name], select[name], textarea[name]').forEach(function (el) {
      if (el.type === 'file' || el.type === 'hidden') return; // Skip the photo input and the JSON qualities field.
      data[el.name] = el.value;
    });
    return data;
  }

  // --- Save Draft: generate a client-side PDF snapshot of the user's current form entries. ---
  // No backend call - works at any point while filling out the profile.
  function generateDraftPDF() {
    if (!window.jspdf) {
      // The jsPDF <script> tag is loaded with `defer` from a CDN; if the network is slow or
      // blocked, window.jspdf might not exist yet. Fail gracefully instead of throwing.
      if (feedback) {
        feedback.style.color = '#c0392b';
        feedback.textContent = 'PDF library failed to load. Check your connection and try again.';
      }
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const marginX = 15;
    let y = 20; // Running vertical cursor position (in mm) as we print each line.
    const lineHeight = 8;

    // Small helper that prints a "Label: value" pair and advances the y cursor,
    // starting a new page automatically if we're about to run off the bottom.
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
    addLine('First Name', form.elements.firstName?.value);
    addLine('Last Name', form.elements.lastName?.value);
    addLine('Date of Birth', form.elements.dateOfBirth?.value);
    addLine('Gender', form.elements.gender?.value);
    addLine('Marital Status', form.elements.maritalStatus?.value);
    addLine('Country', form.elements.country?.selectedOptions[0]?.text);
    addLine('Region/State', form.elements.regionState?.value);
    addLine('Congregation', form.elements.congregation?.value);
    addLine('Open to Relocation', form.elements.relocation?.value);
    addLine('Children', form.elements.children?.value);
    y += 4;

    const aboutMe = form.elements.aboutYourself?.value;
    if (aboutMe) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFont(undefined, 'bold');
      doc.text('About:', marginX, y);
      y += 6;
      doc.setFont(undefined, 'normal');
      // splitTextToSize wraps long paragraphs to fit the page width (180mm) instead of
      // running off the edge of the PDF.
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
    addLine('Years Baptized', form.elements.yearsBaptized?.value);
    addLine('Current Privileges', form.elements.currentPrivileges?.value);
    addLine('Hours/Month', form.elements.hoursPerMonth?.value);
    addLine('Spiritual Goals', form.elements.spiritualGoals?.value);
    y += 4;

    // Partner Preferences
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(13);
    doc.text('Partner Preferences', marginX, y);
    y += 8;
    doc.setFontSize(11);
    const qualities = Array.from(form.querySelectorAll('.q-chip.active'))
      .map(function (chip) { return chip.textContent.trim(); });
    addLine('Desired Qualities', qualities.length ? qualities.join(', ') : 'None selected');
    y += 4;

    // Contact Info
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(13);
    doc.text('Contact Info', marginX, y);
    y += 8;
    doc.setFontSize(11);
    addLine('Email', form.elements.email?.value);
    addLine('Phone', form.elements.phone?.value);
    addLine('Preferred Contact', form.elements.preferredContact?.value);
    addLine('Best Time', form.elements.bestTime?.value);

    const fileName = 'profile-draft-' + (form.elements.firstName?.value || 'user').toLowerCase() + '.pdf';
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
    addLine('Country', form.elements.country?.selectedOptions[0]?.text || rawValues.country);
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

  // Wire up the Save Draft button.
  // NOTE: adjust this selector to match your actual button's id/class if different.
  const draftBtn = form.querySelector('.btn-secondary');
  if (draftBtn) {
    draftBtn.addEventListener('click', function (event) {
      event.preventDefault(); // It's type="button" already, but this keeps behavior safe either way.
      generateDraftPDF();
    });
  }

  // Handle the submit action: build the payload, POST it, and report success/failure.
  form.addEventListener('submit', async function (event) {
     console.log("SUBMIT EVENT FIRED", Date.now());
    event.preventDefault(); // Stop the browser's default full-page-reload form submission.
    syncQualitiesField();
    refreshProfileSummary();

    const submitBtn = form.querySelector('.btn-save');
    if (submitBtn) submitBtn.disabled = true; // Prevent duplicate submissions while the request is in flight.
    if (feedback) {
      feedback.style.color = 'var(--gold2)';
      feedback.textContent = 'Submitting...';
    }

    try {
      // Snapshot the raw values now, since form.reset() below will wipe them after a successful submit.
      const rawFormValues = getFormValuesSnapshot();
      const activeQualities = Array.from(form.querySelectorAll('.q-chip.active')).map(function (chip) {
        return chip.textContent.trim();
      });

      const payload = buildPayload();
      const res = await fetch(`${API_BASE_URL}/profiles`, {
        method: 'POST',
        body: payload,
      });
      const data = await res.json();

      if (!res.ok) {
        // Surface the backend's error message when available, otherwise a generic fallback.
        throw new Error(data.message || 'Submission failed. Please check your details and try again.');
      }

      if (feedback) {
        feedback.style.color = 'var(--gold)';
        feedback.textContent = 'Profile submitted successfully.';
      }

      const memberId = data?.data?.profile?.memberId;
      generateReceiptPDF(memberId, rawFormValues, activeQualities);

      // Clear everything back to a blank form now that submission succeeded.
      form.reset();
      if (qualitiesField) qualitiesField.value = '[]';
      form.querySelectorAll('.q-chip.active').forEach(function (chip) { chip.classList.remove('active'); });
      if (avatarPreview) avatarPreview.innerHTML = '✦';
      draftPhotoDataUrl = null;
      refreshProfileSummary();
    } catch (err) {
      if (feedback) {
        feedback.style.color = '#c0392b';
        feedback.textContent = err.message;
      }
    } finally {
      // Always re-enable the submit button, whether the request succeeded or failed.
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  // Run once on page load so the sidebar and progress bar start in the correct state
  // (important since some fields come pre-filled with sample values).
  syncQualitiesField();
  refreshProfileSummary();

  // Mobile nav toggle — works alongside any existing jw.js logic.
  // Wrapped in its own IIFE purely to keep its local variable names (toggle, links) from
  // clashing with anything else in this file.
  (function () {
    var toggle = document.getElementById('nav-toggle');
    var links = document.getElementById('nav-links');
    if (!toggle || !links) return;

    // Resets the mobile nav back to its closed state.
    function closeMenu() {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    // Clicking the hamburger button flips the menu open/closed.
    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Clicking any nav link should also close the menu (so it doesn't stay open after navigating).
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });

    // If the window is resized back up to desktop width, make sure the mobile menu isn't
    // left open underneath the now-visible desktop nav bar.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeMenu();
    });
  })();
})();