// Previously used reveal code is kept commented out because the IntersectionObserver below handles reveal animations.
// document.addEventListener('DOMContentLoaded', () => {
//   document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
// });




// Create an IntersectionObserver to reveal elements as they scroll into view.
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Add visible class when the element is in view.
      entry.target.classList.add('visible');

      // Stop observing once the element has become visible.
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

// Observe every element with the .reveal class.
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Add click behavior to quality chips so they toggle active state.
document.querySelectorAll('.q-chip').forEach(chip => {
  chip.addEventListener('click', () => chip.classList.toggle('active'));
});

// Add click behavior to profile tabs to switch the active tab visually.
document.querySelectorAll('.profile-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active from all tabs first.
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
    // Add active to the clicked tab.
    tab.classList.add('active');
  });
});

function getFormValues(form) {
  // Collect values from all named inputs, selects, and textareas within the form.
  const data = {};
  form.querySelectorAll('input[name], select[name], textarea[name]').forEach(el => {
    data[el.name] = el.value;
  });
  return data;
}

function getProfileQualities() {
  // Return the text content of all active quality chips as an array.
  return Array.from(document.querySelectorAll('.qualities-wrap .q-chip.active')).map(chip => chip.textContent.trim());
}

function setFeedback(elementId, message, isSuccess = true) {
  // Find the feedback element by its ID.
  const el = document.getElementById(elementId);
  if (!el) return;

  // Display the message and adjust the color based on success or error.
  el.textContent = message;
  el.style.color = isSuccess ? 'var(--gold2)' : '#c85656';
}

async function sendForm(endpoint, payload) {
  // Send JSON to the given endpoint using POST.
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  // Return the parsed JSON response.
  return response.json();
}

document.getElementById('contact-form')?.addEventListener('submit', async (event) => {
  // Prevent the browser from submitting the form and reloading the page.
  event.preventDefault();

  const form = event.currentTarget;
  const data = getFormValues(form);

  try {
    const result = await sendForm('/api/contact', data);
    if (result.success) {
      setFeedback('contact-feedback', result.message || 'Your message was sent.');
      form.reset();
    } else {
      setFeedback('contact-feedback', result.error || 'Unable to send message.', false);
    }
  } catch (err) {
    setFeedback('contact-feedback', 'Unable to send message. Please try again later.', false);
    console.error(err);
  }
});

document.getElementById('profile-form')?.addEventListener('submit', async (event) => {
  // Prevent default form submission so data can be handled by JavaScript.
  event.preventDefault();

  const form = event.currentTarget;
  const data = getFormValues(form);
  data.qualities = getProfileQualities();

  try {
    const result = await sendForm('/api/profile', data);
    if (result.success) {
      setFeedback('profile-feedback', result.message || 'Profile saved successfully.');
    } else {
      setFeedback('profile-feedback', result.error || 'Unable to save your profile.', false);
    }
  } catch (err) {
    setFeedback('profile-feedback', 'Unable to save your profile. Please try again later.', false);
    console.error(err);
  }
});

// Run a quick reveal animation for elements on the home page after the page loads.
setTimeout(() => {
  document.querySelectorAll('#page-home .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 120);
  });
}, 300);
