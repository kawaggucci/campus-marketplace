/*
  store.js - the data layer of the application (the "Model" part).

  This file is the single source of truth for the data. It is the only file
  that talks to localStorage. It contains NO DOM code: it does not read from
  the page and it does not write into the page. Page scripts call these
  functions and render the result themselves.

  Every write follows the pattern from the lecture:
  get -> parse -> modify -> stringify -> set

  CRUD is done with the array methods from the lecture:
  Create = push(), Read = forEach()/filter(), Update = find() + change,
  Delete = filter()
*/

/* ---------------------------------------------------------------------------
   Storage keys and constants
--------------------------------------------------------------------------- */

const KEY_LISTINGS = 'marketplace.listings';
const KEY_INQUIRIES = 'marketplace.inquiries';
const KEY_FAVORITES = 'marketplace.favorites';
const KEY_SESSION = 'marketplace.session';

// The categories a listing can belong to. Used by the forms and the filter.
const CATEGORIES = ['books', 'furniture', 'bikes', 'electronics', 'other'];

// A visitor is not logged in, so this is the session we use by default.
const GUEST_SESSION = { username: '', role: 'visitor' };

// Callback that runs after the seed data is ready (see initStore).
let storeReadyCallback = null;

// True when the backend answered and the data comes from there.
let usingApi = false;

// A page can register a function that renders it again. It is called when an
// answer from the backend changes something after the page was drawn, for
// example when a new listing gets its real id from the server.
let storeSyncHandler = null;

function setStoreSyncHandler(handler) {
  storeSyncHandler = handler;
}

function notifyStoreSynced() {
  if (storeSyncHandler) {
    storeSyncHandler();
  }
}

function isUsingApi() {
  return usingApi;
}

// A write that the backend did not accept is only in this browser. The user
// keeps working, but the console says what happened.
function handleApiWriteFailed(request) {
  console.warn(
    'The backend did not accept the change (status ' + request.status +
    '). It is stored in this browser only.'
  );
}

/* ---------------------------------------------------------------------------
   Low level helpers: reading and writing localStorage
--------------------------------------------------------------------------- */

// get -> parse. Returns an empty array when there is nothing stored yet.
function readArray(key) {
  const text = localStorage.getItem(key);
  if (!text) {
    return [];
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn('Could not parse stored data for ' + key + ', starting empty.', error);
    return [];
  }
}

// stringify -> set
function saveArray(key, array) {
  localStorage.setItem(key, JSON.stringify(array));
}

// Same idea, but for the two values that are objects and not arrays.
function readObject(key, fallback) {
  const text = localStorage.getItem(key);
  if (!text) {
    return fallback;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn('Could not parse stored data for ' + key + ', using default.', error);
    return fallback;
  }
}

function saveObject(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// New records get the highest existing id plus one.
function nextId(records) {
  let highest = 0;
  records.forEach(function (record) {
    if (record.id > highest) {
      highest = record.id;
    }
  });
  return highest + 1;
}

/* ---------------------------------------------------------------------------
   Start up: load the seed data once, then keep working with localStorage
--------------------------------------------------------------------------- */

/*
  initStore gets the data ready and calls onReady when the page may render.

  There are three sources, tried in this order:

  1. the backend, if it answers the health check. Then it is the source of
     truth and every change is sent to it as well,
  2. data/listings.json loaded with $.getJSON, the AJAX way from the lecture.
     The browser blocks such a request when the page is opened directly from
     the hard disk (file:// protocol),
  3. the array in js/seed-data.js, so even a double clicked index.html shows
     a full page.

  Which path was used is written to the console.
*/
function initStore(onReady) {
  storeReadyCallback = onReady;

  apiCheckHealth()
    .done(handleApiAvailable)
    .fail(handleApiMissing);
}

function handleApiAvailable() {
  usingApi = true;
  console.log('Data source: the backend at ' + apiBaseUrl() + '.');
  dropSessionWithoutAccount();
  loadListingsFromApi();
}

/*
  A session that was created in the offline demo mode has a name and a role,
  but no token, so the backend would refuse every request it makes. As soon as
  a backend is there, such a session is dropped and the user logs in properly.
*/
function dropSessionWithoutAccount() {
  const session = getSession();
  if (session.role !== 'visitor' && !session.token) {
    console.log('The demo session has no account behind it, logging out.');
    clearSession();
  }
}

function handleApiMissing() {
  usingApi = false;
  console.log('Data source: no backend reachable, working with local data only.');
  loadSeedData();
}

/* ---------------------------------------------------------------------------
   Loading everything the current user may see from the backend
--------------------------------------------------------------------------- */

function loadListingsFromApi() {
  apiGetListings()
    .done(function (records) {
      saveArray(KEY_LISTINGS, toFrontendListings(records));
      loadRemovedListingsFromApi();
    })
    .fail(function () {
      console.warn('The backend answered the health check but not the listings, using local data.');
      usingApi = false;
      loadSeedData();
    });
}

// The public list leaves removed listings out, but a moderator has to see
// what was taken off the board.
function loadRemovedListingsFromApi() {
  if (getSession().role !== 'moderator') {
    loadInquiriesFromApi();
    return;
  }

  apiGetRemovedListings()
    .done(function (records) {
      saveArray(KEY_LISTINGS, getListings().concat(toFrontendListings(records)));
    })
    .always(loadInquiriesFromApi);
}

function loadInquiriesFromApi() {
  if (getSession().role !== 'member') {
    finishApiLoad();
    return;
  }

  apiGetInquiries()
    .done(function (records) {
      saveArray(KEY_INQUIRIES, toFrontendInquiries(records));
    })
    .always(loadFavoritesFromApi);
}

function loadFavoritesFromApi() {
  apiGetFavorites()
    .done(function (records) {
      const favorites = getFavoritesMap();
      favorites[getSession().username] = records.map(function (listing) {
        return listing.id;
      });
      saveObject(KEY_FAVORITES, favorites);
    })
    .always(finishApiLoad);
}

function finishApiLoad() {
  storeReadyCallback();
}

/* ---------------------------------------------------------------------------
   Local data: the seed file, or the fallback array
--------------------------------------------------------------------------- */

function loadSeedData() {
  // Seeding happens only once. After that localStorage is the source of truth.
  if (localStorage.getItem(KEY_LISTINGS)) {
    console.log('Seed data: not needed, listings were loaded from localStorage.');
    storeReadyCallback();
    return;
  }

  $.getJSON('data/listings.json')
    .done(handleSeedLoaded)
    .fail(handleSeedFailed);
}

// AJAX worked (the page is served over http://).
function handleSeedLoaded(listings) {
  saveArray(KEY_LISTINGS, listings);
  console.log('Seed data: loaded from data/listings.json with $.getJSON.');
  storeReadyCallback();
}

// AJAX failed (most likely the page was opened as file://).
function handleSeedFailed() {
  saveArray(KEY_LISTINGS, SEED_LISTINGS);
  console.log('Seed data: $.getJSON failed, used the fallback array from js/seed-data.js.');
  storeReadyCallback();
}

// Deletes everything this app stored, so the seed data is loaded again on the
// next page load. Used by the "reset demo data" button.
function resetStore() {
  localStorage.removeItem(KEY_LISTINGS);
  localStorage.removeItem(KEY_INQUIRIES);
  localStorage.removeItem(KEY_FAVORITES);
  localStorage.removeItem(KEY_SESSION);
}

/* ---------------------------------------------------------------------------
   Listings - the primary entity (full CRUD)
--------------------------------------------------------------------------- */

// Read: every listing, including the ones a moderator removed.
function getListings() {
  return readArray(KEY_LISTINGS);
}

// Read: the listings that are shown to normal users. A reported listing is
// still visible, only a removed one disappears from the public pages.
function getVisibleListings() {
  return getListings().filter(function (listing) {
    return listing.status !== 'removed';
  });
}

// Searches one listing inside an array that was already read from storage.
// Used by every function that has to change a single listing.
function findListing(listings, id) {
  const wantedId = Number(id);
  return listings.find(function (listing) {
    return listing.id === wantedId;
  });
}

function getListingById(id) {
  return findListing(getListings(), id);
}

function getListingsBySeller(sellerId) {
  return getListings().filter(function (listing) {
    return listing.sellerId === sellerId;
  });
}

function getReportedListings() {
  return getListings().filter(function (listing) {
    return listing.status === 'reported';
  });
}

// Create: push a new record and save the whole array back.
function createListing(data) {
  const listings = getListings();
  const listing = {
    id: nextId(listings),
    title: data.title,
    description: data.description,
    category: data.category,
    price: data.price,
    sellerId: data.sellerId,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  listings.push(listing);
  saveArray(KEY_LISTINGS, listings);

  if (usingApi) {
    // The backend gives the record its real id, so the local one is replaced
    // as soon as the answer arrives and the page is drawn again.
    const temporaryId = listing.id;
    apiCreateListing(listing)
      .done(function (record) {
        replaceListing(temporaryId, toFrontendListing(record));
        notifyStoreSynced();
      })
      .fail(handleApiWriteFailed);
  }

  return listing;
}

// Puts a record from the backend in the place of the local one.
function replaceListing(oldId, listing) {
  const listings = getListings().map(function (item) {
    if (item.id === oldId) {
      return listing;
    }
    return item;
  });
  saveArray(KEY_LISTINGS, listings);
}

// Update: find the record, change the fields, save the array back.
function updateListing(id, changes) {
  const listings = getListings();
  const listing = findListing(listings, id);
  if (!listing) {
    return null;
  }
  listing.title = changes.title;
  listing.description = changes.description;
  listing.category = changes.category;
  listing.price = changes.price;
  saveArray(KEY_LISTINGS, listings);

  if (usingApi) {
    apiUpdateListing(listing.id, listing).fail(handleApiWriteFailed);
  }

  return listing;
}

// Delete: keep everything except the record with this id.
function deleteListing(id) {
  const wantedId = Number(id);
  const remaining = getListings().filter(function (listing) {
    return listing.id !== wantedId;
  });
  saveArray(KEY_LISTINGS, remaining);
  removeInquiriesForListing(wantedId);

  if (usingApi) {
    apiDeleteListing(wantedId).fail(handleApiWriteFailed);
  }
}

/* ---------------------------------------------------------------------------
   Listing status: active -> reported -> removed
--------------------------------------------------------------------------- */

// Any user can report a listing.
function reportListing(id, reason) {
  const listings = getListings();
  const listing = findListing(listings, id);
  if (!listing || listing.status === 'removed') {
    return null;
  }
  listing.status = 'reported';
  listing.reportReason = reason;
  saveArray(KEY_LISTINGS, listings);

  if (usingApi) {
    apiReportListing(listing.id, reason).fail(handleApiWriteFailed);
  }

  return listing;
}

// Moderator: take the listing off the public pages but keep the record.
function removeListing(id) {
  const listings = getListings();
  const listing = findListing(listings, id);
  if (!listing) {
    return null;
  }
  listing.status = 'removed';
  saveArray(KEY_LISTINGS, listings);

  if (usingApi) {
    apiRemoveListing(listing.id).fail(handleApiWriteFailed);
  }

  return listing;
}

// Moderator: the report was not justified, the listing goes back online.
function clearReport(id) {
  const listings = getListings();
  const listing = findListing(listings, id);
  if (!listing) {
    return null;
  }
  listing.status = 'active';
  delete listing.reportReason;
  saveArray(KEY_LISTINGS, listings);

  if (usingApi) {
    apiDismissReport(listing.id).fail(handleApiWriteFailed);
  }

  return listing;
}

/* ---------------------------------------------------------------------------
   Inquiries - messages a visitor or member sends to a seller
--------------------------------------------------------------------------- */

function getInquiries() {
  return readArray(KEY_INQUIRIES);
}

function addInquiry(data) {
  const inquiries = getInquiries();
  const inquiry = {
    id: nextId(inquiries),
    listingId: Number(data.listingId),
    fromName: data.fromName,
    fromContact: data.fromContact,
    message: data.message,
    createdAt: new Date().toISOString(),
    dismissed: false
  };
  inquiries.push(inquiry);
  saveArray(KEY_INQUIRIES, inquiries);

  if (usingApi) {
    apiAddInquiry(inquiry).fail(handleApiWriteFailed);
  }

  return inquiry;
}

// The inbox of one seller: all inquiries that belong to one of their listings.
function getInquiriesForSeller(sellerId) {
  const ownListingIds = getListingsBySeller(sellerId).map(function (listing) {
    return listing.id;
  });
  return getInquiries().filter(function (inquiry) {
    return ownListingIds.indexOf(inquiry.listingId) !== -1;
  });
}

function dismissInquiry(id) {
  const inquiries = getInquiries();
  const wantedId = Number(id);
  const inquiry = inquiries.find(function (inquiryItem) {
    return inquiryItem.id === wantedId;
  });
  if (!inquiry) {
    return null;
  }
  inquiry.dismissed = true;
  saveArray(KEY_INQUIRIES, inquiries);

  if (usingApi) {
    apiDismissInquiry(inquiry.id).fail(handleApiWriteFailed);
  }

  return inquiry;
}

// When a listing is deleted its inquiries have no owner any more.
function removeInquiriesForListing(listingId) {
  const wantedId = Number(listingId);
  const remaining = getInquiries().filter(function (inquiry) {
    return inquiry.listingId !== wantedId;
  });
  saveArray(KEY_INQUIRIES, remaining);
}

/* ---------------------------------------------------------------------------
   Favorites - stored per member as { username: [listingId, ...] }
--------------------------------------------------------------------------- */

function getFavoritesMap() {
  return readObject(KEY_FAVORITES, {});
}

function getFavorites(username) {
  const favorites = getFavoritesMap();
  return favorites[username] || [];
}

function isFavorite(username, listingId) {
  return getFavorites(username).indexOf(Number(listingId)) !== -1;
}

// Adds the listing to the favorites, or removes it when it is already there.
// Returns true when the listing is a favorite after the change.
function toggleFavorite(username, listingId) {
  const wantedId = Number(listingId);
  const favorites = getFavoritesMap();
  const own = favorites[username] || [];
  const alreadyFavorite = own.indexOf(wantedId) !== -1;

  if (alreadyFavorite) {
    favorites[username] = own.filter(function (id) {
      return id !== wantedId;
    });
  } else {
    own.push(wantedId);
    favorites[username] = own;
  }

  saveObject(KEY_FAVORITES, favorites);

  if (usingApi) {
    sendFavoriteToApi(wantedId, !alreadyFavorite);
  }

  return !alreadyFavorite;
}

function sendFavoriteToApi(listingId, isFavoriteNow) {
  if (isFavoriteNow) {
    apiAddFavorite(listingId).fail(handleApiWriteFailed);
  } else {
    apiRemoveFavorite(listingId).fail(handleApiWriteFailed);
  }
}

// The favorite listings of a member as full records, without removed ones.
function getFavoriteListings(username) {
  const ids = getFavorites(username);
  return getVisibleListings().filter(function (listing) {
    return ids.indexOf(listing.id) !== -1;
  });
}

/* ---------------------------------------------------------------------------
   Session - who is "logged in" and with which role
--------------------------------------------------------------------------- */

function getSession() {
  return readObject(KEY_SESSION, GUEST_SESSION);
}

/*
  The token is what the backend gave us at the login. It is stored with the
  session and sent with every request that needs an account. Without a backend
  there is no token, and the session is only the demo role switch.
*/
function getToken() {
  return getSession().token || '';
}

function setSession(username, role, token) {
  saveObject(KEY_SESSION, {
    username: username,
    role: role,
    token: token || ''
  });
}

function clearSession() {
  localStorage.removeItem(KEY_SESSION);
}
