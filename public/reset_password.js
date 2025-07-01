/* eslint-disable */

const form = document.getElementById('resetForm');
const password = document.getElementById('password');
const passwordConfirm = document.getElementById('passwordConfirm');
const clientError = document.getElementById('clientError');
const container = document.querySelector('.container');

const configEl = document.getElementById('app-config');
const protocol = configEl.dataset.protocol;
const host = configEl.dataset.host;
const token = configEl.dataset.token;

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const pwd = password.value.trim();
  const confirm = passwordConfirm.value.trim();

  if (!pwd || !confirm) {
    return showError('Both fields are required.');
  }

  if (pwd !== confirm) {
    return showError('Passwords must match.');
  }

  if (pwd.length < 8) {
    return showError('Password must be at least 8 characters.');
  }

  showError('');

  try {
    const url = `${protocol}://${host}/auth/reset-password/${token}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: pwd,
        passwordConfirm: confirm
      })
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.message === 'Token is either invalid or expired.') {
        replaceContainer(`
          <div class="container">
            <h2 class="error">Your password reset link has expired or is invalid. Please request a new password reset.</h2>
          </div>
        `);
      } else {
        showError(data.message || 'Something went wrong.');
      }
    } else {
      replaceContainer(`
        <div class="container">
          <h2 class="success">Password reset successful!</h2>
        </div>
      `);
    }
  } catch (err) {
    showError('Request failed.');
  }
});

function showError(message) {
  clientError.style.display = message ? 'block' : 'none';
  clientError.textContent = message || '';
}

function replaceContainer(html) {
  document.body.innerHTML = html;
}

document.querySelectorAll('.toggle-eye').forEach((icon) => {
  icon.addEventListener('click', () => {
    const input = document.getElementById(icon.dataset.target);
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    icon.textContent = isHidden ? '🙈' : '👁️';
  });
});
