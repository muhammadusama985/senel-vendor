const fs = require('fs');
const c = fs.readFileSync('./src/types/product.ts', 'utf8');
console.log('chars 450-800:');
console.log(JSON.stringify(c.slice(450, 800)));
console.log('---');
console.log(c.slice(450, 800));
