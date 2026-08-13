const fs = require('fs');
const buf = fs.readFileSync('src/pages/Products/components/ProductForm.tsx');
console.log('First 3 bytes:', buf.slice(0, 3).toString('hex'));
