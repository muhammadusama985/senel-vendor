const fs = require('fs');
const us = JSON.parse(fs.readFileSync('./public/location-data/cities/US.json', 'utf8'));
const tr = JSON.parse(fs.readFileSync('./public/location-data/cities/TR.json', 'utf8'));
console.log('US unique countryCodes:', [...new Set(us.map(c => c.countryCode))]);
console.log('TR unique countryCodes:', [...new Set(tr.map(c => c.countryCode))]);
console.log('US cities count:', us.length);
console.log('TR cities count:', tr.length);
