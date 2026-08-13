const fs = require('fs');
const b = fs.readFileSync('./src/types/product.ts');
console.log('first bytes:', b.slice(0, 3).toString('hex'));
console.log('total bytes:', b.length);
const text = b.toString('utf8');
const lines = text.split('\n');
console.log('line 13-19:');
for (let i = 12; i < 20; i++) {
  console.log(`Line ${i+1}: ${JSON.stringify(lines[i])}`);
}
