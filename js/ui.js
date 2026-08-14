/*
  ui.js - helpers that every page needs.

  These functions prepare text and markup for the page and switch parts of the
  interface on and off. They never read or write localStorage, that is the job
  of store.js.
*/

// Emoji instead of photos: the project does not handle image uploads.
const CATEGORY_ICONS = {
  books: '📚',
  furniture: '🪑',
  bikes: '🚲',
  electronics: '💻',
  other: '📦'
};

/* ---------------------------------------------------------------------------
   Security helper
--------------------------------------------------------------------------- */

/*
  escapeHtml is the central security helper of this project.

  All content on this site is written by users, so it must never be inserted
  into the page as markup. This function turns the characters that make markup
  work into harmless HTML entities. A payload like

      <img src=x onerror="alert(1)">

  is then shown as plain text instead of being executed by the browser.

  Where a single value is written into an existing element we use the jQuery
  method .text() instead, which is safe for the same reason. escapeHtml is
  used when a whole block of HTML has to be built as a string.
*/
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ---------------------------------------------------------------------------
   Formatting
--------------------------------------------------------------------------- */

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// "18 €", or "Free" when the seller gives the item away.
function formatPrice(price) {
  if (Number(price) === 0) {
    return 'Free';
  }
  return Number(price) + ' €';
}

// "2026-07-21T09:30:00Z" becomes "21/07/2026"
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-GB');
}

// "books" becomes "Books"
function formatCategory(category) {
  return capitalize(category);
}

function categoryIcon(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.other;
}

// Long descriptions are cut off on the cards.
function truncate(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}

/* ---------------------------------------------------------------------------
   Roles: showing and hiding parts of the interface
--------------------------------------------------------------------------- */

/*
  Every element that belongs to certain roles carries a data-role attribute,
  for example data-role="member" or data-role="member moderator". This
  function hides all of them and shows again only the ones that list the
  current role. The attribute selector [data-role~="member"] matches one word
  inside such a space separated list.
*/
function applyRoleVisibility(role) {
  $('[data-role]').addClass('is-hidden');
  $('[data-role~="' + role + '"]').removeClass('is-hidden');
}

// One sentence about who is using the site at the moment.
function describeSession(session) {
  if (session.role === 'visitor') {
    return 'You are browsing as a visitor. Log in as a member to post listings.';
  }
  return 'Logged in as ' + session.username + ' (' + capitalize(session.role) + ').';
}

/* ---------------------------------------------------------------------------
   Form validation helpers
--------------------------------------------------------------------------- */

/*
  Every input that can be wrong has an error paragraph next to it, and the id
  of that paragraph is "error-" plus the id of the input. So the input
  #username belongs to the message #error-username.
*/
function showFieldError(fieldId, message) {
  $('#error-' + fieldId).text(message);
  $('#' + fieldId).addClass('has-error');
}

function clearFormErrors(formSelector) {
  const $form = $(formSelector);
  $form.find('.error-message').text('');
  $form.find('.has-error').removeClass('has-error');
}

// Simple check: something, an @, something, a dot, something.
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/* ---------------------------------------------------------------------------
   Listing cards
--------------------------------------------------------------------------- */

/*
  Builds the markup of one listing card. Every piece of text that a user wrote
  (title, description, seller name) goes through escapeHtml first.

  options.showFavorite  true when the current user may use the favorites
  options.isFavorite    true when this listing already is a favorite
*/
function buildListingCard(listing, options) {
  return '' +
    '<li class="card">' +
      '<article class="card-inner">' +
        '<p class="card-media" aria-hidden="true">' + categoryIcon(listing.category) + '</p>' +
        '<div class="card-body">' +
          '<h3 class="card-title">' +
            '<a href="listing.html?id=' + Number(listing.id) + '">' + escapeHtml(listing.title) + '</a>' +
          '</h3>' +
          '<p class="card-price">' + formatPrice(listing.price) + '</p>' +
          '<p class="card-meta">' +
            escapeHtml(formatCategory(listing.category)) + ' | ' +
            escapeHtml(listing.sellerId) + ' | ' +
            formatDate(listing.createdAt) +
          '</p>' +
          '<p class="card-text">' + escapeHtml(truncate(listing.description, 90)) + '</p>' +
          buildReportedBadge(listing) +
          buildFavoriteButton(listing, options) +
        '</div>' +
      '</article>' +
    '</li>';
}

function buildReportedBadge(listing) {
  if (listing.status !== 'reported') {
    return '';
  }
  return '<p class="badge badge-warn">Reported, waiting for a moderator</p>';
}

function buildFavoriteButton(listing, options) {
  if (!options.showFavorite) {
    return '';
  }
  return '<button type="button" class="button button-secondary js-favorite" data-id="' +
    Number(listing.id) + '">' + favoriteButtonLabel(options.isFavorite) + '</button>';
}

function favoriteButtonLabel(isFavorite) {
  if (isFavorite) {
    return 'In favorites';
  }
  return 'Add to favorites';
}
