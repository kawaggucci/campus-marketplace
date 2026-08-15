/*
  page-login.js - logic of the login page.

  The page works in two modes:

  * the backend answers: a real login. The password is sent to the server,
    checked against a stored hash, and the answer is a token. The role comes
    with that answer, from the account, and the user cannot choose it,
  * the backend does not answer: the demo mode from before. The site then runs
    on the data in this browser, there is nothing to check a password against,
    so a name and a role are simply picked.
*/

$(document).ready(handlePageReady);

function handlePageReady() {
  bindPageEvents();

  if (getSession().role !== 'visitor') {
    showAlreadyLoggedIn();
    return;
  }

  apiCheckHealth()
    .done(showAccountForms)
    .fail(showDemoForm);
}

function bindPageEvents() {
  $('#login-form').on('submit', handleLoginSubmit);
  $('#register-form').on('submit', handleRegisterSubmit);
  $('#demo-form').on('submit', handleDemoSubmit);
}

/* ---------------------------------------------------------------------------
   Which form the page shows
--------------------------------------------------------------------------- */

function showAccountForms() {
  $('#account-login').removeClass('is-hidden');
  $('#account-register').removeClass('is-hidden');
}

function showDemoForm() {
  $('#demo-login').removeClass('is-hidden');
}

function showAlreadyLoggedIn() {
  $('#already-logged-in').removeClass('is-hidden');
  $('#logged-in-info').text(describeSession(getSession()));
}

// After a successful login or registration the session is stored and the user
// goes back to the board.
function startSession(answer) {
  setSession(answer.username, answer.role, answer.access_token);
  window.location.href = 'index.html';
}

/* ---------------------------------------------------------------------------
   Logging in
--------------------------------------------------------------------------- */

function handleLoginSubmit(event) {
  event.preventDefault();
  clearFormErrors('#login-form');

  const username = $.trim($('#login-username').val());
  const password = $('#login-password').val();

  if (username === '') {
    showFieldError('login-username', 'Please enter your username.');
    return;
  }
  if (password === '') {
    showFieldError('login-password', 'Please enter your password.');
    return;
  }

  apiLogin(username, password)
    .done(startSession)
    .fail(handleLoginFailed);
}

function handleLoginFailed(request) {
  if (request.status === 401) {
    showFieldError('login-password', 'Wrong username or password.');
    return;
  }
  showFieldError('login-password', 'The server could not be reached. Please try again.');
}

/* ---------------------------------------------------------------------------
   Creating an account
--------------------------------------------------------------------------- */

function handleRegisterSubmit(event) {
  event.preventDefault();
  clearFormErrors('#register-form');

  const username = $.trim($('#register-username').val());
  const password = $('#register-password').val();
  const repeated = $('#register-repeat').val();

  if (!isRegistrationValid(username, password, repeated)) {
    return;
  }

  apiRegister(username, password)
    .done(startSession)
    .fail(handleRegisterFailed);
}

// Validation in the browser is for a quick answer. The same rules run again
// on the server, because these checks can be bypassed.
function isRegistrationValid(username, password, repeated) {
  let isValid = true;

  if (username.length < 3) {
    showFieldError('register-username', 'The username needs at least 3 characters.');
    isValid = false;
  } else if (!/^[A-Za-z0-9_]+$/.test(username)) {
    showFieldError('register-username', 'Only letters, digits and the underscore are allowed.');
    isValid = false;
  }

  if (password.length < 8) {
    showFieldError('register-password', 'The password needs at least 8 characters.');
    isValid = false;
  }

  if (repeated !== password) {
    showFieldError('register-repeat', 'The two passwords are not the same.');
    isValid = false;
  }

  return isValid;
}

function handleRegisterFailed(request) {
  if (request.status === 409) {
    showFieldError('register-username', 'This username is already taken.');
    return;
  }
  if (request.status === 422) {
    showFieldError('register-username', 'The server did not accept these values.');
    return;
  }
  showFieldError('register-username', 'The server could not be reached. Please try again.');
}

/* ---------------------------------------------------------------------------
   Demo mode without a backend
--------------------------------------------------------------------------- */

function handleDemoSubmit(event) {
  event.preventDefault();
  clearFormErrors('#demo-form');

  const username = $.trim($('#demo-username').val());
  const role = $('#demo-role').val();

  if (!isUsernameValid(username)) {
    return;
  }

  // No token in this mode: there is no server that could hand one out.
  setSession(username, role);
  window.location.href = 'index.html';
}

function isUsernameValid(username) {
  if (username === '') {
    showFieldError('demo-username', 'Please enter a username.');
    return false;
  }
  if (username.length < 3) {
    showFieldError('demo-username', 'The username needs at least 3 characters.');
    return false;
  }
  if (!/^[A-Za-z0-9_]+$/.test(username)) {
    showFieldError('demo-username', 'Only letters, digits and the underscore are allowed.');
    return false;
  }
  return true;
}
