/*
  page-listing.js - logic of the detail page listing.html?id=...

  It reads the id from the address, asks the store for that listing and fills
  the empty elements of the page. Every value written into the page goes
  through .text(), so text that a user wrote can never become markup.
*/

// The listing shown on this page. Set once when the page starts.
let currentListingId = null;

$(document).ready(handlePageReady);

function handlePageReady() {
  initStore(startListingPage);
}

function startListingPage() {
  currentListingId = readListingIdFromUrl();

  const listing = getListingById(currentListingId);
  if (!listing || listing.status === 'removed') {
    showNotFound();
    return;
  }

  bindPageEvents();
  renderListing(listing);
}

// "listing.html?id=5" gives back "5".
function readListingIdFromUrl() {
  const parameters = new URLSearchParams(window.location.search);
  return parameters.get('id');
}

function showNotFound() {
  $('#not-found').removeClass('is-hidden');
}

/* ---------------------------------------------------------------------------
   Events
--------------------------------------------------------------------------- */

function bindPageEvents() {
  $('#favorite-button').on('click', handleFavoriteClick);
  $('#inquiry-form').on('submit', handleInquirySubmit);
  $('#report-toggle').on('click', handleReportToggle);
  $('#report-form').on('submit', handleReportSubmit);
}

/* ---------------------------------------------------------------------------
   Rendering
--------------------------------------------------------------------------- */

function renderListing(listing) {
  const session = getSession();

  $('#detail-icon').text(categoryIcon(listing.category));
  $('#detail-title').text(listing.title);
  $('#detail-price').text(formatPrice(listing.price));
  $('#detail-meta').text(
    formatCategory(listing.category) + ' | ' +
    listing.sellerId + ' | ' +
    formatDate(listing.createdAt)
  );
  $('#detail-description').text(listing.description);
  $('#detail-reported').toggleClass('is-hidden', listing.status !== 'reported');
  $('#listing-detail').removeClass('is-hidden');

  renderOwnerActions(listing, session);
  renderFavoriteButton(listing, session);
  renderInquirySection(listing, session);
  renderReportSection(listing, session);
}

// Only the member who wrote the listing may edit it.
function renderOwnerActions(listing, session) {
  const isOwner = isListingOwner(listing, session);
  $('#edit-link')
    .attr('href', 'manage.html?edit=' + Number(listing.id))
    .toggleClass('is-hidden', !isOwner);
}

function isListingOwner(listing, session) {
  return session.role === 'member' && session.username === listing.sellerId;
}

// Favorites belong to a member account, so a visitor does not see the button.
function renderFavoriteButton(listing, session) {
  const isMember = session.role === 'member';
  $('#favorite-button')
    .toggleClass('is-hidden', !isMember)
    .text(favoriteButtonLabel(isMember && isFavorite(session.username, listing.id)));
}

/*
  The seller does not write inquiries to themselves: they read them in their
  dashboard. Everybody else sees the contact form.
*/
function renderInquirySection(listing, session) {
  const isOwner = isListingOwner(listing, session);
  $('#inquiry-section').removeClass('is-hidden');

  if (isOwner) {
    $('#inquiry-form').addClass('is-hidden');
    $('#inquiry-note').text('This is your own listing. Inquiries about it are collected in your area.');
    return;
  }

  $('#inquiry-form').removeClass('is-hidden');
  $('#inquiry-note').text('The seller sees your message and your email address.');
}

// A listing that is already reported cannot be reported a second time, and
// nobody reports their own listing.
function renderReportSection(listing, session) {
  const canReport = !isListingOwner(listing, session) && listing.status === 'active';
  $('#report-section').toggleClass('is-hidden', !canReport);
}

/* ---------------------------------------------------------------------------
   Favorites
--------------------------------------------------------------------------- */

function handleFavoriteClick() {
  const session = getSession();
  if (session.role !== 'member') {
    return;
  }

  const nowFavorite = toggleFavorite(session.username, currentListingId);
  $('#favorite-button').text(favoriteButtonLabel(nowFavorite));
}

/* ---------------------------------------------------------------------------
   Inquiry form
--------------------------------------------------------------------------- */

function handleInquirySubmit(event) {
  event.preventDefault();
  clearFormErrors('#inquiry-form');
  $('#inquiry-success').addClass('is-hidden');

  const name = $.trim($('#inquiry-name').val());
  const email = $.trim($('#inquiry-email').val());
  const message = $.trim($('#inquiry-message').val());

  if (!isInquiryValid(name, email, message)) {
    return;
  }

  addInquiry({
    listingId: currentListingId,
    fromName: name,
    fromContact: email,
    message: message
  });

  $('#inquiry-form')[0].reset();
  $('#inquiry-success').removeClass('is-hidden').hide().fadeIn(250);
}

// Validation only checks that the input is well formed. Making it safe to
// display is a separate step and happens when the text is rendered.
function isInquiryValid(name, email, message) {
  let isValid = true;

  if (name === '') {
    showFieldError('inquiry-name', 'Please enter your name.');
    isValid = false;
  } else if (name.length < 2) {
    showFieldError('inquiry-name', 'The name needs at least 2 characters.');
    isValid = false;
  }

  if (email === '') {
    showFieldError('inquiry-email', 'Please enter your email address.');
    isValid = false;
  } else if (!isValidEmail(email)) {
    showFieldError('inquiry-email', 'This does not look like an email address.');
    isValid = false;
  }

  if (message === '') {
    showFieldError('inquiry-message', 'Please write a message.');
    isValid = false;
  } else if (message.length < 10) {
    showFieldError('inquiry-message', 'The message needs at least 10 characters.');
    isValid = false;
  }

  return isValid;
}

/* ---------------------------------------------------------------------------
   Report form
--------------------------------------------------------------------------- */

// slideToggle is the visual effect from the jQuery lecture.
function handleReportToggle() {
  const $form = $('#report-form');
  const $button = $('#report-toggle');
  const isOpen = $button.attr('aria-expanded') === 'true';

  if (isOpen) {
    $form.slideUp(200);
  } else {
    // The form starts hidden through the CSS class. slideDown expects an
    // element that jQuery itself hid, so the class goes away and .hide()
    // takes over before the animation starts.
    $form.removeClass('is-hidden').hide().slideDown(200);
  }

  $button.attr('aria-expanded', String(!isOpen));
}

function handleReportSubmit(event) {
  event.preventDefault();
  clearFormErrors('#report-form');

  const reason = $.trim($('#report-reason').val());
  if (reason.length < 5) {
    showFieldError('report-reason', 'Please write at least 5 characters.');
    return;
  }

  reportListing(currentListingId, reason);

  $('#report-form').addClass('is-hidden');
  $('#report-toggle').addClass('is-hidden');
  $('#report-success').removeClass('is-hidden').hide().fadeIn(250);
  $('#detail-reported').removeClass('is-hidden');
}
