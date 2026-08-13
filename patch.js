const fs = require('fs');

const path = '../senel-backend/src/controllers/product.controller.js';
let text = fs.readFileSync(path, 'utf8');

// Detect line ending
const crlf = text.includes('\r\n');
console.log('CRLF:', crlf);

// Use the same line endings as the file
const EOL = crlf ? '\r\n' : '\n';

const oldStr =
  'async function vendorUpdateMyProduct(req, res) {' + EOL +
  '  const body = updateProductSchema.parse(req.body);' + EOL +
  EOL +
  '  const vendor = await Vendor.findOne({ ownerUserId: req.user._id });' + EOL +
  '  if (!vendor) return res.status(404).json({ message: "Vendor profile not found" });' + EOL +
  EOL +
  '  const product = await Product.findOne({ _id: req.params.productId, vendorId: vendor._id });' + EOL +
  '  if (!product) return res.status(404).json({ message: "Product not found" });';

const newStr =
  'async function vendorUpdateMyProduct(req, res) {' + EOL +
  '  // Mirrors adminUpdateProduct but scoped to the vendor\'s own catalogue.' + EOL +
  '  // IMPORTANT: there is intentionally NO status check here — vendors' + EOL +
  '  // must be able to edit their own products regardless of whether the' + EOL +
  '  // product is in `draft`, `submitted`, `approved`, `rejected`,' + EOL +
  '  // `blocked` or `archived` status (the admin can edit any product in' + EOL +
  '  // any status, so the vendor must be able to do the same for their' + EOL +
  '  // own catalogue). The vendor can NOT change `status`, `isFeatured`' + EOL +
  '  // or any other admin-only fields; those are deliberately excluded' + EOL +
  '  // from `updateProductSchema`.' + EOL +
  '  const body = updateProductSchema.parse(req.body);' + EOL +
  EOL +
  '  const vendor = await Vendor.findOne({ ownerUserId: req.user._id });' + EOL +
  '  if (!vendor) return res.status(404).json({ message: "Vendor profile not found" });' + EOL +
  EOL +
  '  const product = await Product.findOne({ _id: req.params.productId, vendorId: vendor._id });' + EOL +
  '  if (!product) return res.status(404).json({ message: "Product not found" });';

if (!text.includes(oldStr)) {
  console.error('OLD STRING NOT FOUND');
  process.exit(1);
}

text = text.replace(oldStr, newStr);

fs.writeFileSync(path, text);
console.log('OK: vendorUpdateMyProduct header updated.');
