/*
  page-index.js - logic of the listings page (the "Controller" part).

  The handlers here react to events, ask store.js for data or changes and then
  render the result. They do not talk to localStorage directly.
*/

$(document).ready(handlePageReady);

// The store loads the seed data first, then the page can be built.
function handlePageReady() {
  initStore(startListingsPage);
}

function startListingsPage() {
  fillCategoryFilter();
  bindPageEvents();
  showSession();
  renderResults();
}

/* ---------------------------------------------------------------------------
   Events
--------------------------------------------------------------------------- */

function bindPageEvents() {
  $('#login-form').on('submit', handleLoginSubmit);
  $('#logout-button').on('click', handleLogoutClick);

  $('#filter-toggle').on('click', handleFilterToggle);
  $('#filter-form').on('submit', handleFilterSubmit);
  $('#reset-filter').on('click', handleFilterReset);
  $('#keyword').on('input', handleFilterChange);
  $('#category').on('change', handleFilterChange);

  // Event delegation: the cards are created later by JavaScript, so the
  // handler is bound to the list that already exists in the HTML.
  $('#listing-grid').on('click', '.js-favorite', handleFavoriteClick);

  $('#reset-demo-data').on('click', handleResetDemoData);
}

/* ---------------------------------------------------------------------------
   Session and roles
--------------------------------------------------------------------------- */

function handleLoginSubmit(event) {
  event.preventDefault();
  clearFormErrors('#login-form');

  const username = $.trim($('#username').val());
  const role = $('#role').val();

  if (!isUsernameValid(username)) {
    return;
  }

  setSession(username, role);
  showSession();
  renderResults();
}

// Validation: is the input well formed? The name is escaped separately when
// it is displayed, that is sanitization and a different step.
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

function handleLogoutClick() {
  clearSession();
  clearFormErrors('#login-form');
  $('#username').val('');
  showSession();
  renderResults();
}

// Writes the current role into the page and shows the parts that belong to it.
function showSession() {
  const session = getSession();
  $('#session-info').text(describeSession(session));
  applyRoleVisibility(session.role);
}

/* ---------------------------------------------------------------------------
   Filter panel
--------------------------------------------------------------------------- */

function fillCategoryFilter() {
  const $select = $('#category');
  CATEGORIES.forEach(function (category) {
    $select.append($('<option></option>').val(category).text(formatCategory(category)));
  });
}

// slideToggle is the visual effect from the jQuery lecture.
function handleFilterToggle() {
  const $button = $('#filter-toggle');
  const isOpen = $button.attr('aria-expanded') === 'true';

  $('#filter-form').slideToggle(200);
  $button.attr('aria-expanded', String(!isOpen));
  $button.text(isOpen ? 'Show filters' : 'Hide filters');
}

function handleFilterSubmit(event) {
  event.preventDefault();
  renderResults();
}

// Typing in the keyword field already updates the list, without any reload.
function handleFilterChange() {
  renderResults();
}

function handleFilterReset() {
  clearFormErrors('#filter-form');
  $('#keyword').val('');
  $('#category').val('all');
  $('#min-price').val('');
  $('#max-price').val('');
  renderResults();
}

function readFilterCriteria() {
  return {
    keyword: $.trim($('#keyword').val()).toLowerCase(),
    category: $('#category').val(),
    minPrice: $('#min-price').val(),
    maxPrice: $('#max-price').val()
  };
}

function isPriceRangeValid(criteria) {
  const min = Number(criteria.minPrice);
  const max = Number(criteria.maxPrice);

  if (criteria.minPrice !== '' && min < 0) {
    showFieldError('min-price', 'The price cannot be negative.');
    return false;
  }
  if (criteria.maxPrice !== '' && max < 0) {
    showFieldError('max-price', 'The price cannot be negative.');
    return false;
  }
  if (criteria.minPrice !== '' && criteria.maxPrice !== '' && min > max) {
    showFieldError('max-price', 'The upper price must be higher than the lower one.');
    return false;
  }
  return true;
}

/* ---------------------------------------------------------------------------
   Filtering: one small function per condition
--------------------------------------------------------------------------- */

function filterListings(listings, criteria) {
  return listings.filter(function (listing) {
    return matchesKeyword(listing, criteria.keyword) &&
      matchesCategory(listing, criteria.category) &&
      matchesPrice(listing, criteria.minPrice, criteria.maxPrice);
  });
}

function matchesKeyword(listing, keyword) {
  if (keyword === '') {
    return true;
  }
  const haystack = (listing.title + ' ' + listing.description).toLowerCase();
  return haystack.indexOf(keyword) !== -1;
}

function matchesCategory(listing, category) {
  if (category === 'all') {
    return true;
  }
  return listing.category === category;
}

function matchesPrice(listing, minPrice, maxPrice) {
  if (minPrice !== '' && listing.price < Number(minPrice)) {
    return false;
  }
  if (maxPrice !== '' && listing.price > Number(maxPrice)) {
    return false;
  }
  return true;
}

// Newest listings first.
function sortByNewest(listings) {
  return listings.slice().sort(function (first, second) {
    return new Date(second.createdAt) - new Date(first.createdAt);
  });
}

/* ---------------------------------------------------------------------------
   Rendering
--------------------------------------------------------------------------- */

function renderResults() {
  clearFormErrors('#filter-form');

  const criteria = readFilterCriteria();
  if (!isPriceRangeValid(criteria)) {
    return;
  }

  const session = getSession();
  const listings = sortByNewest(filterListings(getVisibleListings(), criteria));
  const cards = listings.map(function (listing) {
    return buildListingCard(listing, buildCardOptions(listing, session));
  });

  // fadeIn is the second visual effect: the new result set appears softly.
  $('#listing-grid').hide().html(cards.join('')).fadeIn(250);

  $('#result-count').text(describeResultCount(listings.length));
  $('#empty-message').toggleClass('is-hidden', listings.length > 0);
}

// Only a logged in member can keep favorites.
function buildCardOptions(listing, session) {
  const isMember = session.role === 'member';
  return {
    showFavorite: isMember,
    isFavorite: isMember && isFavorite(session.username, listing.id)
  };
}

function describeResultCount(count) {
  if (count === 1) {
    return '1 listing found.';
  }
  return count + ' listings found.';
}

/* ---------------------------------------------------------------------------
   Favorites and demo data
--------------------------------------------------------------------------- */

function handleFavoriteClick(event) {
  const $button = $(event.currentTarget);
  const session = getSession();

  if (session.role !== 'member') {
    return;
  }

  const nowFavorite = toggleFavorite(session.username, $button.data('id'));
  $button.text(favoriteButtonLabel(nowFavorite));
}

function handleResetDemoData() {
  if (window.confirm('This deletes all listings, inquiries and favorites you created. Continue?')) {
    resetStore();
    window.location.reload();
  }
}
