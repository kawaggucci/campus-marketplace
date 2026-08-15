/*
  api.js - the connection to the backend.

  The project works without a server: the seed data comes from a JSON file and
  everything the user creates is kept in localStorage. This file adds an
  optional layer on top of it. When the backend answers, the data comes from
  there and every change is sent to it. When it does not answer, the app falls
  back to the browser only mode and nothing breaks.

  All requests go through jQuery AJAX, the same $.ajax that the lecture used.

  The backend names its fields in the Python style (seller_id, created_at),
  the front end uses the JavaScript style (sellerId, createdAt). The two
  translate functions at the bottom are the only place that knows about it.
*/

// Where the backend runs during development, and where it runs in production.
const LOCAL_API_URL = 'http://127.0.0.1:8001';
const HOSTED_API_URL = 'https://campus-marketplace-api.azurewebsites.net';

// How long we wait for the health check before deciding to work offline.
const API_TIMEOUT = 2000;

/*
  While developing, the page is served from localhost and the backend runs on
  the same machine. Everywhere else, including a page opened directly from the
  hard disk, the published backend is used.
*/
function apiBaseUrl() {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return LOCAL_API_URL;
  }
  return HOSTED_API_URL;
}

/* ---------------------------------------------------------------------------
   Requests
--------------------------------------------------------------------------- */

/*
  Every request that needs an account carries the token that the backend
  handed out at the login. Without a token the caller is a visitor, which is
  enough for browsing and for writing to a seller.

  The role is not sent at all. It belongs to the account in the database, and
  the server reads it from there, so a client cannot claim to be a moderator.
*/
function apiHeaders() {
  const token = getToken();
  if (!token) {
    return {};
  }
  return { Authorization: 'Bearer ' + token };
}

function apiRequest(method, path, data) {
  const options = {
    url: apiBaseUrl() + path,
    method: method,
    headers: apiHeaders(),
    dataType: 'json'
  };

  if (data) {
    options.contentType = 'application/json';
    options.data = JSON.stringify(data);
  }

  return $.ajax(options);
}

// Asks the backend whether it is there. Runs once when a page starts.
function apiCheckHealth() {
  return $.ajax({
    url: apiBaseUrl() + '/api/health',
    method: 'GET',
    dataType: 'json',
    timeout: API_TIMEOUT
  });
}

/* ---------------------------------------------------------------------------
   Accounts
--------------------------------------------------------------------------- */

function apiLogin(username, password) {
  return apiRequest('POST', '/api/auth/login', {
    username: username,
    password: password
  });
}

function apiRegister(username, password) {
  return apiRequest('POST', '/api/auth/register', {
    username: username,
    password: password
  });
}

/* ---------------------------------------------------------------------------
   Reading
--------------------------------------------------------------------------- */

function apiGetListings() {
  return apiRequest('GET', '/api/listings');
}

function apiGetReportedListings() {
  return apiRequest('GET', '/api/listings/reported');
}

function apiGetRemovedListings() {
  return apiRequest('GET', '/api/listings/removed');
}

function apiGetInquiries() {
  return apiRequest('GET', '/api/inquiries?include_dismissed=true');
}

function apiGetFavorites() {
  return apiRequest('GET', '/api/favorites');
}

/* ---------------------------------------------------------------------------
   Writing
--------------------------------------------------------------------------- */

function apiCreateListing(listing) {
  return apiRequest('POST', '/api/listings', toApiListing(listing));
}

function apiUpdateListing(id, listing) {
  return apiRequest('PUT', '/api/listings/' + Number(id), toApiListing(listing));
}

function apiDeleteListing(id) {
  return apiRequest('DELETE', '/api/listings/' + Number(id));
}

function apiReportListing(id, reason) {
  return apiRequest('POST', '/api/listings/' + Number(id) + '/report', { reason: reason });
}

function apiRemoveListing(id) {
  return apiRequest('POST', '/api/listings/' + Number(id) + '/remove');
}

function apiDismissReport(id) {
  return apiRequest('POST', '/api/listings/' + Number(id) + '/dismiss-report');
}

function apiAddInquiry(inquiry) {
  return apiRequest('POST', '/api/inquiries', {
    listing_id: Number(inquiry.listingId),
    from_name: inquiry.fromName,
    from_contact: inquiry.fromContact,
    message: inquiry.message
  });
}

function apiDismissInquiry(id) {
  return apiRequest('POST', '/api/inquiries/' + Number(id) + '/dismiss');
}

function apiAddFavorite(listingId) {
  return apiRequest('POST', '/api/favorites', { listing_id: Number(listingId) });
}

function apiRemoveFavorite(listingId) {
  return apiRequest('DELETE', '/api/favorites/' + Number(listingId));
}

/* ---------------------------------------------------------------------------
   Translating between the two field styles
--------------------------------------------------------------------------- */

// One listing as the backend sends it, in the shape the front end expects.
function toFrontendListing(record) {
  const listing = {
    id: record.id,
    title: record.title,
    description: record.description,
    category: record.category,
    price: record.price,
    sellerId: record.seller_id,
    createdAt: record.created_at,
    status: record.status
  };

  if (record.report_reason) {
    listing.reportReason = record.report_reason;
  }

  return listing;
}

function toFrontendListings(records) {
  return records.map(toFrontendListing);
}

// The other direction, for create and update. The backend fills in the
// seller, the date and the status itself, so they are not sent.
function toApiListing(listing) {
  return {
    title: listing.title,
    description: listing.description,
    category: listing.category,
    price: Number(listing.price)
  };
}

function toFrontendInquiry(record) {
  return {
    id: record.id,
    listingId: record.listing_id,
    fromName: record.from_name,
    fromContact: record.from_contact,
    message: record.message,
    createdAt: record.created_at,
    dismissed: record.dismissed
  };
}

function toFrontendInquiries(records) {
  return records.map(toFrontendInquiry);
}
