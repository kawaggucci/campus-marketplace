# Campus Marketplace

Final project for the module **B10 Web Application and Software Architecture**
(HTW Berlin, summer semester 2026), Scenario 2: a local marketplace where a
campus community buys and sells used textbooks, furniture, bikes and
electronics.

The application is front end only. It is built with HTML, CSS, JavaScript and
jQuery. There is no backend and no database: the seed data comes from a JSON
file and everything the user creates is stored in the browser with
localStorage.

## Live version

* the site: <https://kawaggucci.github.io/campus-marketplace/>
* the backend it talks to: <https://campus-marketplace-api.azurewebsites.net>
  (documentation at `/docs`)

The backend is a separate project:
<https://github.com/kawaggucci/campus-marketplace-api>. It is an addition, not
a requirement: the site works without it, see the next section.

## How to run

There are three sources of data, and the application takes the first one that
answers:

1. the backend, when it is reachable. Then the data is stored on a server and
   every change is sent there,
2. `data/listings.json`, loaded with `$.getJSON`,
3. the same listings as a plain array in `js/seed-data.js`.

Which one was used is written to the browser console. The site is therefore
complete on its own, with no server at all.

### 1. With a local web server (recommended)

Open a terminal in the project folder and start any static server, for example
the one that comes with Python:

    python -m http.server 8000

Then open <http://localhost:8000> in the browser. The Live Server extension of
VS Code or `php -S localhost:8000` work the same way.

This is the recommended way because the seed data is then loaded with
`$.getJSON('data/listings.json')`, which is the normal AJAX path.

### 2. By opening index.html directly

Double clicking `index.html` also works. In that case the page runs on the
`file://` protocol, where the browser blocks AJAX requests for security
reasons (the request has no real origin, so it fails the CORS check).

The application notices this: when `$.getJSON` fails, it falls back to the
same data as a plain JavaScript array in `js/seed-data.js`. The page is never
empty. Which of the two paths was used is written to the browser console:

    Seed data: loaded from data/listings.json with $.getJSON.
    Seed data: $.getJSON failed, used the fallback array from js/seed-data.js.

jQuery is loaded from the CDN that was used in the course. If there is no
internet connection, the local copy in `js/vendor/` is loaded instead, so the
project also works offline.

## Roles and test users

There is no real authentication. `login.html` is a role switch: it stores a
name and a role in localStorage and the interface changes accordingly. After
the login the header shows an account button on the right. It opens a small
menu where the role can be changed at any time, which makes it quick to see
the same page through the eyes of each role.

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
* There are no image uploads. Every category is shown with an emoji instead.
