# Campus Marketplace

Final project for the module **B10 Web Application and Software Architecture**
(HTW Berlin, summer semester 2026), Scenario 2: a local marketplace where a
campus community buys and sells used textbooks, furniture, bikes and
electronics.

The application is front end only: HTML, CSS, JavaScript and jQuery, without a
framework and without a build step. It works on its own, with the data in the
browser. A backend exists as an addition and gives it a server, accounts and
photos, but nothing here depends on it.

## How to run it

### 1. Open the published site

<https://kawaggucci.github.io/campus-marketplace/>

This is the complete version: it talks to the backend at
<https://campus-marketplace-api.azurewebsites.net>, so the listings have
photos, accounts have passwords and the data is the same for every visitor.
The backend is a separate project,
<https://github.com/kawaggucci/campus-marketplace-api>, with its own README.

### 2. Open index.html from the folder

Double click `index.html`. The page then runs on the `file://` protocol and
uses the backend as well, as long as there is an internet connection.

Without one, the application falls back to the data that ships with it: the
board is complete, the listings show the icon of their category instead of a
photo, and the login page offers a plain role switch instead of a password.

No local web server is needed for either way. Serving the folder with, for
example, `python -m http.server 8000` also works and is what was used while
developing, but it is not required to look at the project.

## Where the data comes from

The application tries three sources and takes the first one that answers.
Which one it was is written to the browser console.

1. **the backend**, when it answers `GET /api/health`. It is then the source
   of truth: every change is sent to it and the listings have photos,
2. **`data/listings.json`**, loaded with `$.getJSON`. This is the AJAX way,
   and it only works when the page is served over http, because browsers block
   such a request from `file://`,
3. **`js/seed-data.js`**, the same listings as a plain JavaScript array. This
   is what a double clicked page without internet ends up with, so it is never
   empty.

jQuery itself follows the same idea: it comes from the CDN used in the course,
and if that cannot be reached, the local copy in `js/vendor/` is loaded.

## Roles and test users

The login page works in two modes, depending on whether the backend answers.

**With the backend.** A real login: the password is checked against a stored
hash on the server, and the answer is a token that the site sends with every
request. The role belongs to the account, so the header only shows it as text.
Accounts for trying it out:

| Username | Password | Role |
|---|---|---|
| `maria`, `jonas`, `aylin` | `campus2026` | member |
| `moderator` | `moderate2026` | moderator |

New accounts can be created on the login page and are always members.

**Without the backend.** There is nothing to check a password against, so the
page falls back to a demo role switch: pick any name and any role. The account
menu in the header then lets the role be changed at any time, which makes it
quick to see the same page through the eyes of each role.

| Role | What it can do | How to try it |
|---|---|---|
| Visitor | browse, search and filter listings, send an inquiry to a seller | just open the page, do not log in |
| Member | everything a visitor can, plus post listings, edit and delete own listings, keep favorites, read inquiries | log in with any name, role "Member" |
| Moderator | review reported listings, remove them or dismiss the report | log in with any name, role "Moderator", or switch the role in the header menu |

The seed listings belong to the members **maria**, **jonas** and **aylin**.
Log in with one of these names to see a dashboard that already has content.
"Log out" returns to the visitor role.

The button **Reset demo data** in the footer of the start page deletes
everything this application stored and loads the seed data again.

## Pages

| File | What it shows |
|---|---|
| `index.html` | all listings as a grid, search and filter |
| `login.html` | the demo login: a name and a starting role |
| `listing.html?id=...` | one listing in detail, the inquiry form and the report form |
| `manage.html` | member dashboard: create and edit form, own listings, favorites, inquiries |
| `moderator.html` | moderator dashboard: reported listings, removed listings |

## Features

* Search and filter by keyword, category and price range. The list is
  re-rendered by JavaScript, the page never reloads.
* Full CRUD on the primary entity **Listing**: create and edit through one
  form, delete with a confirmation, all of it stored in localStorage.
* Inquiries from visitors and members to the seller, collected in the seller
  dashboard.
* Favorites per member.
* Report flow with the listing states `active`, `reported` and `removed`.
* Client side validation on every form with inline error messages.
* jQuery is used for the event handling, the DOM manipulation, the AJAX load
  of the seed data and two visual effects (`slideToggle` for the filter and
  the report form, `fadeIn` for new results and confirmations).

## Project structure

    index.html          listings, search and filter
    login.html          demo login
    listing.html        detail page with inquiry and report form
    manage.html         member dashboard
    moderator.html      moderator dashboard
    css/style.css       the only stylesheet, mobile first
    js/store.js         data layer: localStorage, CRUD, session, favorites
    js/ui.js            shared helpers: escaping, formatting, cards, roles
    js/account.js       the account menu in the header, shared by all pages
    js/page-*.js        the logic of one page each
    js/seed-data.js     fallback copy of the seed data for file://
    js/vendor/          local copy of jQuery
    data/listings.json  seed data

The code is organized in three layers, which is also how the report describes
it: the data layer (`store.js`, the only file that talks to localStorage), the
presentation (the HTML pages and `style.css`) and the logic (the event
handlers in the `page-*.js` files). Seen as MVC, the array in localStorage is
the model, the rendered list is the view and the handlers are the controller.

## Security

All content on this site is written by users, so no user text is ever
inserted into the page as markup:

* values that go into an existing element are written with the jQuery method
  `.text()`,
* text that becomes part of a longer HTML string first goes through the helper
  `escapeHtml()` in `js/ui.js`.

Tested with the payload from the lecture: a listing whose title and
description are `<img src=x onerror="alert(1)">` shows the text on the page
and executes nothing.

Validation and sanitization are two different steps here. Validation checks
that the input is well formed (required fields, a price that is a positive
number, an email that looks like an email, maximum lengths) and happens before
anything is stored. Sanitization makes the stored text safe to display and
happens when it is rendered.

## Known limitations

* All checks run in the browser and can be bypassed, for example with the
  developer tools. In a real product the backend would have to enforce the
  same rules, because the client cannot be trusted.
* The login is a role switch without passwords. It shows role dependent
  interfaces, it is not authentication.
* HTTPS is not part of the project: the data never leaves the browser, so
  there is no transport to secure. In a real product it would be required.
* The data is stored per browser. Another browser or another computer sees the
  seed data again, and clearing the browser storage deletes everything.
* Photos only exist together with the backend, because it stores them. A
  member can upload one for their own listing, and the demo listings ship with
  theirs. Without the backend, and for listings without a photo, the icon of
  the category is shown instead.
