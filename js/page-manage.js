/*
  page-manage.js - logic of the member dashboard manage.html

  Four areas on one page: the create and edit form, the own listings, the
  favorites and the inbox with the inquiries. The handlers call store.js and
  render the result again, they never touch localStorage themselves.
*/

// null means the form creates a new listing, an id means it edits that one.
let editingListingId = null;

$(document).ready(handlePageReady);

function handlePageReady() {
  initStore(startManagePage);
}

function startManagePage() {
  const session = getSession();

  // Role check: this page belongs to members only.
  if (session.role !== 'member') {
    $('#members-only').removeClass('is-hidden');
    return;
  }

  $('#member-area').removeClass('is-hidden');
  $('#photo-field').toggleClass('is-hidden', !isUsingApi());
  fillCategorySelect();
  bindPageEvents();
  startEditFromUrl(session);

  // When the backend answers later and changes something, draw the page again.
  setStoreSyncHandler(renderAfterSync);
  renderAllSections(session);
}

function renderAfterSync() {
  renderAllSections(getSession());
}

function bindPageEvents() {
  $('#listing-form').on('submit', handleListingSubmit);
  $('#cancel-edit').on('click', handleCancelEdit);

  // Event delegation: the rows are built by JavaScript, so the handlers sit
  // on the lists that already exist in the HTML.
  $('#my-listings').on('click', '.js-edit', handleEditClick);
  $('#my-listings').on('click', '.js-delete', handleDeleteClick);
  $('#favorites-grid').on('click', '.js-favorite', handleFavoriteClick);
  $('#inbox').on('click', '.js-dismiss', handleDismissClick);
}

/* ---------------------------------------------------------------------------
   Rendering the three lists
--------------------------------------------------------------------------- */

function renderAllSections(session) {
  renderMyListings(session);
  renderFavorites(session);
  renderInbox(session);
}

function renderMyListings(session) {
  const listings = getListingsBySeller(session.username);
  const rows = listings.map(buildMyListingRow);

  $('#my-listings').html(rows.join(''));
  $('#my-listings-empty').toggleClass('is-hidden', listings.length > 0);
}

function buildMyListingRow(listing) {
  return '' +
    '<li class="row">' +
      '<div class="row-main">' +
        '<h3 class="row-title">' +
          '<a href="listing.html?id=' + Number(listing.id) + '">' + escapeHtml(listing.title) + '</a>' +
        '</h3>' +
        '<p class="card-meta">' +
          formatPrice(listing.price) + ' | ' +
          escapeHtml(formatCategory(listing.category)) + ' | ' +
          formatDate(listing.createdAt) +
        '</p>' +
        buildStatusBadge(listing) +
      '</div>' +
      '<div class="row-actions">' +
        '<button type="button" class="button button-secondary js-edit" data-id="' + Number(listing.id) + '">Edit</button>' +
        '<button type="button" class="button button-danger js-delete" data-id="' + Number(listing.id) + '">Delete</button>' +
      '</div>' +
    '</li>';
}

function buildStatusBadge(listing) {
  if (listing.status === 'reported') {
    return '<p class="badge badge-warn">Reported, a moderator is checking it</p>';
  }
  if (listing.status === 'removed') {
    return '<p class="badge badge-warn">Removed by a moderator</p>';
  }
  return '<p class="badge badge-ok">Online</p>';
}

function renderFavorites(session) {
  const listings = getFavoriteListings(session.username);
  const cards = listings.map(function (listing) {
    return buildListingCard(listing, { showFavorite: true, isFavorite: true });
  });

  $('#favorites-grid').html(cards.join(''));
  $('#favorites-empty').toggleClass('is-hidden', listings.length > 0);
}

function renderInbox(session) {
  const inquiries = getOpenInquiries(session.username);
  const rows = inquiries.map(buildInquiryRow);

  $('#inbox').html(rows.join(''));
  $('#inbox-empty').toggleClass('is-hidden', inquiries.length > 0);
}

// Dismissed inquiries stay in storage but leave the inbox.
function getOpenInquiries(username) {
  return getInquiriesForSeller(username).filter(function (inquiry) {
    return !inquiry.dismissed;
  });
}

function buildInquiryRow(inquiry) {
  const listing = getListingById(inquiry.listingId);
  const listingTitle = listing ? listing.title : 'a deleted listing';

  return '' +
    '<li class="row">' +
      '<div class="row-main">' +
        '<h3 class="row-title">' + escapeHtml(inquiry.fromName) + '</h3>' +
        '<p class="card-meta">' +
          'about ' + escapeHtml(listingTitle) + ' | ' +
          escapeHtml(inquiry.fromContact) + ' | ' +
          formatDate(inquiry.createdAt) +
        '</p>' +
        '<p class="row-text">' + escapeHtml(inquiry.message) + '</p>' +
      '</div>' +
      '<div class="row-actions">' +
        '<button type="button" class="button button-secondary js-dismiss" data-id="' + Number(inquiry.id) + '">Dismiss</button>' +
      '</div>' +
    '</li>';
}

/* ---------------------------------------------------------------------------
   The create and edit form
--------------------------------------------------------------------------- */

function fillCategorySelect() {
  const $select = $('#listing-category');
  CATEGORIES.forEach(function (category) {
    $select.append($('<option></option>').val(category).text(formatCategory(category)));
  });
}

// "manage.html?edit=5" opens the form with that listing already filled in.
function startEditFromUrl(session) {
  const parameters = new URLSearchParams(window.location.search);
  const id = parameters.get('edit');
  if (id) {
    startEditing(id, session);
  }
}

function startEditing(id, session) {
  const listing = getListingById(id);

  // Role check: a member may only edit their own listing.
  if (!listing || listing.sellerId !== session.username) {
    return;
  }

  editingListingId = listing.id;
  $('#listing-title').val(listing.title);
  $('#listing-category').val(listing.category);
  $('#listing-price').val(listing.price);
  $('#listing-description').val(listing.description);

  $('#form-heading').text('Edit listing');
  $('#listing-submit').text('Save changes');
  $('#cancel-edit').removeClass('is-hidden');
  clearFormErrors('#listing-form');
}

function stopEditing() {
  editingListingId = null;
  $('#listing-form')[0].reset();
  $('#form-heading').text('Post a new listing');
  $('#listing-submit').text('Publish listing');
  $('#cancel-edit').addClass('is-hidden');
  clearFormErrors('#listing-form');
}

function handleCancelEdit() {
  stopEditing();
  $('#listing-success').addClass('is-hidden');
}

/*
  One submit handler for both jobs. Which of the two runs depends on
  editingListingId: Create with push() or Update with find() and change.
*/
function handleListingSubmit(event) {
  event.preventDefault();
  clearFormErrors('#listing-form');
  $('#listing-success').addClass('is-hidden');

  const session = getSession();
  const data = readListingForm();
  const photo = readSelectedPhoto();

  if (!isListingValid(data) || !isPhotoValid(photo)) {
    return;
  }

  // The input gives the price as text, the store keeps it as a number.
  data.price = Number(data.price);

  if (editingListingId) {
    const listingId = editingListingId;
    updateListing(listingId, data);
    uploadPhoto(listingId, photo);
    showListingSuccess('The listing was updated.');
  } else {
    data.sellerId = session.username;
    // The picture can only be sent once the backend has given the listing its
    // real id, which is what the second argument waits for.
    createListing(data, function (saved) {
      uploadPhoto(saved.id, photo);
    });
    showListingSuccess('The listing is online now.');
  }

  stopEditing();
  renderAllSections(session);
}

/* ---------------------------------------------------------------------------
   The photo of a listing
--------------------------------------------------------------------------- */

// The file input holds a list, we take the first entry or nothing.
function readSelectedPhoto() {
  const input = document.getElementById('listing-photo');
  if (!input || !input.files || input.files.length === 0) {
    return null;
  }
  return input.files[0];
}

// A quick answer in the browser. The server checks the same things again,
// and it checks the content, which the browser cannot do here.
function isPhotoValid(photo) {
  if (!photo) {
    return true;
  }
  if (photo.size > 3 * 1024 * 1024) {
    showFieldError('listing-photo', 'The picture is larger than 3 MB.');
    return false;
  }
  if (photo.type !== 'image/jpeg' && photo.type !== 'image/png') {
    showFieldError('listing-photo', 'Please choose a JPEG or a PNG picture.');
    return false;
  }
  return true;
}

function uploadPhoto(listingId, photo) {
  if (!photo) {
    return;
  }
  saveListingPhoto(listingId, photo, handlePhotoUploadDone);
}

function handlePhotoUploadDone(problem) {
  if (!problem) {
    showListingSuccess('The listing was saved and the picture was uploaded.');
    return;
  }

  const answer = problem.responseJSON;
  const reason = answer && answer.detail ? answer.detail : 'The picture could not be uploaded.';
  showFieldError('listing-photo', reason);
}

function readListingForm() {
  return {
    title: $.trim($('#listing-title').val()),
    category: $('#listing-category').val(),
    price: $.trim($('#listing-price').val()),
    description: $.trim($('#listing-description').val())
  };
}

// Validation: every field well formed before anything is stored.
function isListingValid(data) {
  let isValid = true;

  if (data.title === '') {
    showFieldError('listing-title', 'Please enter a title.');
    isValid = false;
  } else if (data.title.length < 5) {
    showFieldError('listing-title', 'The title needs at least 5 characters.');
    isValid = false;
  }

  if (CATEGORIES.indexOf(data.category) === -1) {
    showFieldError('listing-category', 'Please choose a category.');
    isValid = false;
  }

  if (!isPriceValid(data.price)) {
    isValid = false;
  }

  if (data.description === '') {
    showFieldError('listing-description', 'Please describe the item.');
    isValid = false;
  } else if (data.description.length < 10) {
    showFieldError('listing-description', 'The description needs at least 10 characters.');
    isValid = false;
  }

  return isValid;
}

function isPriceValid(price) {
  if (price === '') {
    showFieldError('listing-price', 'Please enter a price. Write 0 if you give it away.');
    return false;
  }
  if (isNaN(Number(price))) {
    showFieldError('listing-price', 'The price must be a number.');
    return false;
  }
  if (Number(price) < 0) {
    showFieldError('listing-price', 'The price cannot be negative.');
    return false;
  }
  if (Number(price) > 100000) {
    showFieldError('listing-price', 'That price is too high for this board.');
    return false;
  }
  return true;
}

function showListingSuccess(message) {
  $('#listing-success').text(message).removeClass('is-hidden').hide().fadeIn(250);
}

/* ---------------------------------------------------------------------------
   Actions in the lists
--------------------------------------------------------------------------- */

function handleEditClick(event) {
  const session = getSession();
  startEditing($(event.currentTarget).data('id'), session);
  document.getElementById('listing-form').scrollIntoView();
}

function handleDeleteClick(event) {
  const session = getSession();
  const listing = getListingById($(event.currentTarget).data('id'));

  // Role check: only the owner deletes, and only after a confirmation.
  if (!listing || listing.sellerId !== session.username) {
    return;
  }
  if (!window.confirm('Delete "' + listing.title + '"? This cannot be undone.')) {
    return;
  }

  deleteListing(listing.id);
  if (editingListingId === listing.id) {
    stopEditing();
  }
  renderAllSections(session);
}

function handleFavoriteClick(event) {
  const session = getSession();
  toggleFavorite(session.username, $(event.currentTarget).data('id'));
  renderFavorites(session);
}

function handleDismissClick(event) {
  const session = getSession();
  dismissInquiry($(event.currentTarget).data('id'));
  renderInbox(session);
}
