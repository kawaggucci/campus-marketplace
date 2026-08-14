/*
  ui.js - small helpers that every page needs.

  These functions only prepare text for the page. They never read or write
  localStorage, that is the job of store.js.
*/

// Emoji instead of photos: the project does not handle image uploads.
const CATEGORY_ICONS = {
  books: '📚',
  furniture: '🪑',
  bikes: '🚲',
  electronics: '💻',
  other: '📦'
};

/*
  escapeHtml is the central security helper of this project.

  All text on this site is written by users, so it must never be inserted into
  the page as markup. This function turns the characters that make markup work
  into harmless HTML entities. A payload like

      <img src=x onerror="alert(1)">

  is then shown as plain text instead of being executed.

  Wherever possible we use the jQuery method .text() instead, which does the
  same thing internally. escapeHtml is used when a whole block of HTML has to
  be built as a string.
*/
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// "18 €", or "Free" when the seller gives the item away.
function formatPrice(price) {
  if (Number(price) === 0) {
    return 'Free';
  }
  return Number(price) + ' €';
}

// "2026-07-21T09:30:00Z" -> "21/07/2026"
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-GB');
}

// "books" -> "Books"
function formatCategory(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function categoryIcon(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.other;
}
