const fs = require('fs');
const buf = fs.readFileSync('../senel-backend/src/controllers/product.controller.js');
console.log('first bytes:', buf.slice(0, 3).toString('hex'));
const text = buf.toString('utf8');
const lines = text.split('\n');
console.log('line 553-560:');
for (let i = 552; i < 560; i++) {
  console.log(`Line ${i+1}: ${JSON.stringify(lines[i])}`);
}
console.log('line 553-569:');
for (let i = 552; i < 570; i++) {
  console.log(`Line ${i+1}: ${lines[i]}`);
}
