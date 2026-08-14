/*
  account.js - the account menu in the page header.

  It runs on every page. It shows who is logged in, lets the user switch the
  role and log out. The role switch is a demo feature: in a real product the
  role would be a property of the account and not something the user picks.
*/

$(document).ready(handleAccountReady);

function handleAccountReady() {
  bindAccountEvents();
  renderAccountArea();
}

function bindAccountEvents() {
  $('#account-toggle').on('click', handleAccountToggle);
  $('#role-switch').on('change', handleRoleChange);
  $('#logout-button').on('click', handleLogoutClick);
}

// Writes the current session into the header and shows the parts of the page
// that belong to the current role.
function renderAccountArea() {
  const session = getSession();

  $('#account-name').text(session.username);
  $('#account-role').text(session.role);
  $('#role-switch').val(session.role);

  applyRoleVisibility(session.role);
}

// slideToggle is the visual effect from the jQuery lecture.
function handleAccountToggle() {
  const $panel = $('#account-panel');
  const $button = $('#account-toggle');
  const isOpen = $button.attr('aria-expanded') === 'true';

  if (isOpen) {
    $panel.slideUp(150);
  } else {
    $panel.removeClass('is-hidden').hide().slideDown(150);
  }

  $button.attr('aria-expanded', String(!isOpen));
}

/*
  Changing the role changes what the whole page may show, so the page is
  loaded again instead of re-rendering every section by hand.
*/
function handleRoleChange(event) {
  const session = getSession();
  const newRole = $(event.currentTarget).val();

  if (newRole === 'visitor') {
    clearSession();
  } else {
    setSession(session.username, newRole);
  }

  window.location.reload();
}

function handleLogoutClick() {
  clearSession();
  window.location.href = 'index.html';
}
