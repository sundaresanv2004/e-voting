const fs = require('fs');
fetch('http://localhost:3000/api/upload', {
  method: 'POST',
  headers: {
    'Cookie': 'YOUR_SESSION_COOKIE_HERE', // I don't have this
  },
  body: new FormData()
})
