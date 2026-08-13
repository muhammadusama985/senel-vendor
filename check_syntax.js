const fs = require('fs');
const path = '../senel-backend/src/controllers/product.controller.js';
const text = fs.readFileSync(path, 'utf8');
// Count braces as a quick sanity check
let depth = 0;
let inString = false;
let stringChar = '';
let inComment = false;
let inBlockComment = false;
let escape = false;
for (let i = 0; i < text.length; i++) {
  const c = text[i];
  const next = text[i + 1];
  if (escape) { escape = false; continue; }
  if (inBlockComment) {
    if (c === '*' && next === '/') { inBlockComment = false; i++; }
    continue;
  }
  if (inComment) {
    if (c === '\n') inComment = false;
    continue;
  }
  if (inString) {
    if (c === '\\') escape = true;
    else if (c === stringChar) inString = false;
    continue;
  }
  if (c === '/' && next === '/') { inComment = true; i++; continue; }
  if (c === '/' && next === '*') { inBlockComment = true; i++; continue; }
  if (c === '"' || c === "'" || c === '`') { inString = true; stringChar = c; continue; }
  if (c === '{') depth++;
  if (c === '}') depth--;
}
console.log('final brace depth (should be 0):', depth);
