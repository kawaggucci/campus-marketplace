/*
  page-moderator.js - logic of the moderator dashboard moderator.html

  The moderator works on the status of a listing, not on its content:
  active -> reported -> removed, or reported -> active when the report was
  not justified.
*/

$(document).ready(handlePageReady);

function handlePageReady() {
  initStore(startModeratorPage);
}

function startModeratorPage() {
  const session = getSession();

  // Role check: this page belongs to moderators only.
  if (session.role !== 'moderator') {
    $('#moderators-only').removeClass('is-hidden');
    return;
  }

  $('#moderator-area').removeClass('is-hidden');
  bindPageEvents();
  renderModerationLists();
}

function bindPageEvents() {
  // Event delegation, because the rows are created by JavaScript.
  $('#reported-list').on('click', '.js-remove', handleRemoveClick);
  $('#reported-list').on('click', '.js-dismiss-report', handleDismissReportClick);
}

/* ---------------------------------------------------------------------------
   Rendering
--------------------------------------------------------------------------- */

function renderModerationLists() {
  renderReportedListings();
  renderRemovedListings();
}

function renderReportedListings() {
  const listings = getReportedListings();
  const rows = listings.map(buildReportedRow);

  $('#reported-list').html(rows.join(''));
  $('#reported-empty').toggleClass('is-hidden', listings.length > 0);
}

function buildReportedRow(listing) {
  return '' +
    '<li class="row">' +
      '<div class="row-main">' +
        '<h3 class="row-title">' +
          '<a href="listing.html?id=' + Number(listing.id) + '">' + escapeHtml(listing.title) + '</a>' +
        '</h3>' +
        '<p class="card-meta">' +
          formatPrice(listing.price) + ' | ' +
          escapeHtml(formatCategory(listing.category)) + ' | ' +
          'seller: ' + escapeHtml(listing.sellerId) +
        '</p>' +
        '<p class="row-text"><strong>Reason:</strong> ' +
          escapeHtml(listing.reportReason || 'no reason given') +
        '</p>' +
        '<p class="row-text">' + escapeHtml(truncate(listing.description, 160)) + '</p>' +
      '</div>' +
      '<div class="row-actions">' +
        '<button type="button" class="button button-danger js-remove" data-id="' + Number(listing.id) + '">Remove listing</button>' +
        '<button type="button" class="button button-secondary js-dismiss-report" data-id="' + Number(listing.id) + '">Dismiss report</button>' +
      '</div>' +
    '</li>';
}

function renderRemovedListings() {
  const listings = getRemovedListings();
  const rows = listings.map(buildRemovedRow);

  $('#removed-list').html(rows.join(''));
  $('#removed-empty').toggleClass('is-hidden', listings.length > 0);
}

function getRemovedListings() {
  return getListings().filter(function (listing) {
    return listing.status === 'removed';
  });
}

function buildRemovedRow(listing) {
  return '' +
    '<li class="row">' +
      '<div class="row-main">' +
        '<h3 class="row-title">' + escapeHtml(listing.title) + '</h3>' +
        '<p class="card-meta">seller: ' + escapeHtml(listing.sellerId) + ' | ' + formatDate(listing.createdAt) + '</p>' +
        '<p class="badge badge-warn">Removed</p>' +
      '</div>' +
    '</li>';
}

/* ---------------------------------------------------------------------------
   The two moderator decisions
--------------------------------------------------------------------------- */

function handleRemoveClick(event) {
  const listing = getListingById($(event.currentTarget).data('id'));
  if (!listing) {
    return;
  }
  if (!window.confirm('Remove "' + listing.title + '" from the marketplace?')) {
    return;
  }

  removeListing(listing.id);
  renderModerationLists();
}

function handleDismissReportClick(event) {
  const listing = getListingById($(event.currentTarget).data('id'));
  if (!listing) {
    return;
  }

  clearReport(listing.id);
  renderModerationLists();
}
