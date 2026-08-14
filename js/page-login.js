/*
  page-login.js - logic of the login page.

  There is no real authentication here. The form stores a name and a role in
  localStorage, and the rest of the site reads that session to decide what to
  show. The report describes this as a front end role switch.
*/

$(document).ready(handlePageReady);

function handlePageReady() {
  bindPageEvents();
  showLoginState();
}

function bindPageEvents() {
  $('#login-form').on('submit', handleLoginSubmit);
}

// Somebody who is already logged in does not need the form again.
function showLoginState() {
  const session = getSession();
  if (session.role === 'visitor') {
    return;
  }

  $('#login-form').closest('.panel').addClass('is-hidden');
  $('#already-logged-in').removeClass('is-hidden');
  $('#logged-in-info').text(describeSession(session));
}

function handleLoginSubmit(event) {
  event.preventDefault();
  clearFormErrors('#login-form');

  const username = $.trim($('#username').val());
  const role = $('#role').val();

  if (!isUsernameValid(username)) {
    return;
  }

  setSession(username, role);
  window.location.href = 'index.html';
}

/*
  Validation: is the input well formed? The name is escaped separately when it
  is displayed, that is sanitization and a different step.
*/
function isUsernameValid(username) {
  if (username === '') {
    showFieldError('username', 'Please enter a username.');
    return false;
  }
  if (username.length < 3) {
    showFieldError('username', 'The username needs at least 3 characters.');
    return false;
  }
  if (!/^[A-Za-z0-9_]+$/.test(username)) {
    showFieldError('username', 'Only letters, digits and the underscore are allowed.');
    return false;
  }
  return true;
}
