const fs = require('fs');
const path = require('path');
const c = fs.readFileSync(path.resolve('src/pages/Products/ProductDetail.tsx'), 'utf8');
const cLF = c.replace(/\r\n/g, '\n');
const i = cLF.indexOf('vendor-product-description');
console.log(cLF.substring(Math.max(0, i - 100), i + 800));