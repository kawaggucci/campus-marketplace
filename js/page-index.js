/*
  page-index.js - logic of the listings page.

  Step 1 of the project: it only proves that the data layer works. The real
  grid with search and filter is built on top of this in the next step.
*/

$(document).ready(handlePageReady);

// The store loads the seed data first, then we can render.
function handlePageReady() {
  initStore(renderListings);
}

function renderListings() {
  const listings = getVisibleListings();
  const $list = $('#listings');

  $list.empty();

  // Read = forEach over the array from the store.
  listings.forEach(function (listing) {
    // .text() and not .html(): the title is written by a user.
    const $item = $('<li></li>').text(
      categoryIcon(listing.category) + ' ' + listing.title +
      ' - ' + formatPrice(listing.price) +
      ' (' + listing.sellerId + ', ' + formatDate(listing.createdAt) + ')'
    );
    $list.append($item);
  });

  $('#status-message').text(listings.length + ' listings loaded from the store.');
}
