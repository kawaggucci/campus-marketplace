/*
  seed-data.js
  Fallback copy of data/listings.json.

  The app normally loads the seed data with $.getJSON('data/listings.json').
  That is an AJAX request, and browsers block AJAX requests when the page is
  opened directly from the file system (file:// protocol, CORS). In that case
  the AJAX call fails and store.js uses this array instead, so the page is
  never empty. Keep this file in sync with data/listings.json.
*/

const SEED_LISTINGS = [
  {
    "id": 1,
    "title": "Introduction to Software Architecture (5th edition)",
    "description": "Textbook for module B10. Some pencil notes in the first chapter, otherwise clean. Pick up near campus Wilhelminenhof.",
    "category": "books",
    "price": 18,
    "sellerId": "maria",
    "createdAt": "2026-07-21T09:30:00Z",
    "status": "active",
    "image": "images/software-architecture-book.jpg"
  },
  {
    "id": 2,
    "title": "Discrete Mathematics textbook bundle",
    "description": "Two books plus my solved exercise sheets from last semester. Good preparation for the maths exam.",
    "category": "books",
    "price": 25,
    "sellerId": "jonas",
    "createdAt": "2026-07-23T14:05:00Z",
    "status": "active",
    "image": "images/discrete-maths-books.jpg"
  },
  {
    "id": 3,
    "title": "German grammar workbook, level B2",
    "description": "Workbook with the answer key at the end. I finished the course, so it is free for the next one.",
    "category": "books",
    "price": 12,
    "sellerId": "aylin",
    "createdAt": "2026-07-24T10:10:00Z",
    "status": "active",
    "image": "images/german-grammar-book.jpg"
  },
  {
    "id": 4,
    "title": "Physics for engineers, hardcover",
    "description": "Heavy but complete. All the formulas you need for the first two semesters, in German.",
    "category": "books",
    "price": 30,
    "sellerId": "lukas",
    "createdAt": "2026-07-26T16:45:00Z",
    "status": "active",
    "image": "images/physics-book.jpg"
  },
  {
    "id": 5,
    "title": "Five English paperbacks",
    "description": "Novels I read on the train. All in good shape, take them together or pick three for 6 euro.",
    "category": "books",
    "price": 10,
    "sellerId": "nina",
    "createdAt": "2026-07-27T12:00:00Z",
    "status": "active",
    "image": "images/paperback-novels.jpg"
  },
  {
    "id": 6,
    "title": "Statistics exercise book with solutions",
    "description": "Every exercise has a worked solution, which helped me a lot before the exam. No writing inside.",
    "category": "books",
    "price": 15,
    "sellerId": "maria",
    "createdAt": "2026-07-29T08:55:00Z",
    "status": "active",
    "image": "images/statistics-book.jpg"
  },
  {
    "id": 7,
    "title": "Desk, white, 120 x 60 cm",
    "description": "Used for two semesters, stable and no scratches on the top. You have to pick it up yourself, I can help carrying it down.",
    "category": "furniture",
    "price": 35,
    "sellerId": "aylin",
    "createdAt": "2026-07-25T18:40:00Z",
    "status": "active",
    "image": "images/white-desk.jpg"
  },
  {
    "id": 8,
    "title": "Office chair with adjustable height",
    "description": "Black office chair, all five wheels work. The armrests can be removed if you need more space.",
    "category": "furniture",
    "price": 40,
    "sellerId": "maria",
    "createdAt": "2026-07-27T11:15:00Z",
    "status": "active",
    "image": "images/office-chair.jpg"
  },
  {
    "id": 9,
    "title": "Bookshelf with five compartments",
    "description": "Fits a whole semester of folders. Light wood, 180 cm high, comes apart for transport.",
    "category": "furniture",
    "price": 28,
    "sellerId": "jonas",
    "createdAt": "2026-07-30T09:20:00Z",
    "status": "active",
    "image": "images/bookshelf.jpg"
  },
  {
    "id": 10,
    "title": "Small kitchen table with two chairs",
    "description": "Perfect for a student flat, the table seats two and folds down on one side.",
    "category": "furniture",
    "price": 55,
    "sellerId": "lukas",
    "createdAt": "2026-08-01T15:30:00Z",
    "status": "active",
    "image": "images/kitchen-table.jpg"
  },
  {
    "id": 11,
    "title": "Sofa bed for a student flat",
    "description": "Grey fabric sofa that folds out into a bed for one person. Cover has been washed.",
    "category": "furniture",
    "price": 80,
    "sellerId": "nina",
    "createdAt": "2026-08-02T17:05:00Z",
    "status": "active",
    "image": "images/sofa-bed.jpg"
  },
  {
    "id": 12,
    "title": "Wardrobe with two doors",
    "description": "Simple white wardrobe with a rail and one shelf. I can help to take it apart on Saturday.",
    "category": "furniture",
    "price": 60,
    "sellerId": "aylin",
    "createdAt": "2026-08-03T11:45:00Z",
    "status": "active",
    "image": "images/wardrobe.jpg"
  },
  {
    "id": 13,
    "title": "City bike, 28 inch, 7 gears",
    "description": "Reliable bike for the way to university. New tires this spring, lights work. Lock included.",
    "category": "bikes",
    "price": 120,
    "sellerId": "jonas",
    "createdAt": "2026-07-28T08:20:00Z",
    "status": "active",
    "image": "images/city-bike.jpg"
  },
  {
    "id": 14,
    "title": "Vintage road bike, frame size 56",
    "description": "Steel frame from the 90s, fully serviced last month. Fast and light, but no luggage rack.",
    "category": "bikes",
    "price": 190,
    "sellerId": "aylin",
    "createdAt": "2026-07-30T16:00:00Z",
    "status": "active",
    "image": "images/road-bike.jpg"
  },
  {
    "id": 15,
    "title": "Bike helmet, size M",
    "description": "Barely used helmet, never had an accident with it. Colour is dark grey, adjustable at the back.",
    "category": "bikes",
    "price": 15,
    "sellerId": "maria",
    "createdAt": "2026-08-01T10:45:00Z",
    "status": "active",
    "image": "images/bike-helmet.jpg"
  },
  {
    "id": 16,
    "title": "Folding bike for the train",
    "description": "Folds in under a minute and travels free on the regional train. Small wheels, but surprisingly quick.",
    "category": "bikes",
    "price": 150,
    "sellerId": "lukas",
    "createdAt": "2026-08-04T07:50:00Z",
    "status": "active",
    "image": "images/folding-bike.jpg"
  },
  {
    "id": 17,
    "title": "Mountain bike, 27.5 inch",
    "description": "Front suspension and disc brakes. I used it in Grunewald on weekends, chain and brakes are new.",
    "category": "bikes",
    "price": 210,
    "sellerId": "nina",
    "createdAt": "2026-08-05T18:15:00Z",
    "status": "active",
    "image": "images/mountain-bike.jpg"
  },
  {
    "id": 18,
    "title": "Bike basket for the handlebar",
    "description": "Metal basket that clicks onto the handlebar. Holds a full shopping bag and comes off in one move.",
    "category": "bikes",
    "price": 8,
    "sellerId": "jonas",
    "createdAt": "2026-08-06T14:25:00Z",
    "status": "active",
    "image": "images/bike-basket.jpg"
  },
  {
    "id": 19,
    "title": "24 inch monitor, Full HD",
    "description": "HDMI and VGA input, stand included. Perfect as a second screen for programming.",
    "category": "electronics",
    "price": 65,
    "sellerId": "jonas",
    "createdAt": "2026-08-02T13:10:00Z",
    "status": "active",
    "image": "images/monitor.jpg"
  },
  {
    "id": 20,
    "title": "Mechanical keyboard, German layout",
    "description": "Brown switches, so it is not too loud for the library. The USB cable is detachable.",
    "category": "electronics",
    "price": 45,
    "sellerId": "aylin",
    "createdAt": "2026-08-04T19:25:00Z",
    "status": "active",
    "image": "images/keyboard.jpg"
  },
  {
    "id": 21,
    "title": "USB-C docking station",
    "description": "Two HDMI ports, three USB-A ports and an ethernet port. I only sell it because I got a new laptop.",
    "category": "electronics",
    "price": 30,
    "sellerId": "maria",
    "createdAt": "2026-08-06T09:00:00Z",
    "status": "active",
    "image": "images/docking-station.jpg"
  },
  {
    "id": 22,
    "title": "Headphones with noise cancelling",
    "description": "Over ear headphones, they make the library silent. Battery lasts a whole day, cable included.",
    "category": "electronics",
    "price": 70,
    "sellerId": "lukas",
    "createdAt": "2026-08-07T12:35:00Z",
    "status": "active",
    "image": "images/headphones.jpg"
  },
  {
    "id": 23,
    "title": "Camera with 18-55 lens",
    "description": "My first camera, still takes great photos. Comes with the lens, a charger and two batteries.",
    "category": "electronics",
    "price": 180,
    "sellerId": "nina",
    "createdAt": "2026-08-08T16:40:00Z",
    "status": "active",
    "image": "images/camera.jpg"
  },
  {
    "id": 24,
    "title": "Free laptop, only pay the shipping fee",
    "description": "Write me on my private number and transfer the shipping fee first, then I send the laptop.",
    "category": "electronics",
    "price": 0,
    "sellerId": "jonas",
    "createdAt": "2026-08-11T07:50:00Z",
    "status": "reported",
    "image": "images/scam-laptop.jpg",
    "reportReason": "Looks like a scam, asks for money before delivery."
  },
  {
    "id": 25,
    "title": "LED desk lamp, dimmable",
    "description": "Three brightness levels, warm and cold light. Good for late evening study sessions.",
    "category": "other",
    "price": 12,
    "sellerId": "jonas",
    "createdAt": "2026-08-08T20:15:00Z",
    "status": "active",
    "image": "images/desk-lamp.jpg"
  },
  {
    "id": 26,
    "title": "Moving boxes, 10 pieces",
    "description": "Stable boxes from my last move, all of them are still in one piece. Can be folded flat for transport.",
    "category": "other",
    "price": 8,
    "sellerId": "aylin",
    "createdAt": "2026-08-10T12:30:00Z",
    "status": "active",
    "image": "images/moving-boxes.jpg"
  },
  {
    "id": 27,
    "title": "Coffee machine with milk frother",
    "description": "Makes espresso and cappuccino. Descaled last week, I am switching to a filter machine.",
    "category": "other",
    "price": 45,
    "sellerId": "maria",
    "createdAt": "2026-08-09T08:10:00Z",
    "status": "active",
    "image": "images/coffee-machine.jpg"
  },
  {
    "id": 28,
    "title": "Acoustic guitar with a soft bag",
    "description": "Western guitar with new strings. I learned three chords and gave up, maybe you get further.",
    "category": "other",
    "price": 75,
    "sellerId": "lukas",
    "createdAt": "2026-08-10T19:50:00Z",
    "status": "active",
    "image": "images/guitar.jpg"
  },
  {
    "id": 29,
    "title": "Winter jacket, size M",
    "description": "Warm enough for Berlin in January. Dark blue, hood can be zipped off, no stains.",
    "category": "other",
    "price": 35,
    "sellerId": "nina",
    "createdAt": "2026-08-11T13:20:00Z",
    "status": "active",
    "image": "images/winter-jacket.jpg"
  },
  {
    "id": 30,
    "title": "Three board games for the flat share",
    "description": "Two strategy games and one card game, all complete with the rules. Perfect for a rainy evening.",
    "category": "other",
    "price": 22,
    "sellerId": "aylin",
    "createdAt": "2026-08-12T17:00:00Z",
    "status": "active",
    "image": "images/board-games.jpg"
  }
];
