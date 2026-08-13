// Try parsing the file as JavaScript via the VM module
const fs = require('fs');
const vm = require('vm');
const path = '../senel-backend/src/controllers/product.controller.js';
const text = fs.readFileSync(path, 'utf8');

try {
  // Just parse, don't execute (this won't check requires, only syntax)
  new vm.Script(text, { filename: path });
  console.log('SYNTAX OK');
} catch (e) {
  console.log('SYNTAX ERROR:', e.message);
}
