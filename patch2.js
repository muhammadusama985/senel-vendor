const fs = require('fs');

const path = '../senel-backend/src/controllers/product.controller.js';
let text = fs.readFileSync(path, 'utf8');

const crlf = text.includes('\r\n');
const EOL = crlf ? '\r\n' : '\n';

const oldStr =
  '  if (body.lengthCm !== undefined) product.lengthCm = body.lengthCm;' + EOL +
  '  if (body.widthCm !== undefined) product.widthCm = body.widthCm;' + EOL +
  '  if (body.heightCm !== undefined) product.heightCm = body.heightCm;' + EOL +
  EOL +
  '  await product.save();' + EOL +
  '  await searchService.indexProduct(product);' + EOL +
  EOL +
  '  await AuditLog.create({' + EOL +
  '    actorUserId: req.user._id,' + EOL +
  '    action: "PRODUCT_UPDATED",' + EOL +
  '    entityType: "Product",' + EOL +
  '    entityId: product._id,' + EOL +
  '    meta: { updates: body, status: product.status },' + EOL +
  '  });' + EOL +
  EOL +
  '  res.json({ product: localizeProduct(product.toObject(), req.lang) });' + EOL +
  '}';

const newStr =
  '  if (body.lengthCm !== undefined) product.lengthCm = body.lengthCm;' + EOL +
  '  if (body.widthCm !== undefined) product.widthCm = body.widthCm;' + EOL +
  '  if (body.heightCm !== undefined) product.heightCm = body.heightCm;' + EOL +
  EOL +
  '  product.updatedAt = new Date();' + EOL +
  '  await product.save();' + EOL +
  EOL +
  '  // Same resilient indexing pattern as adminUpdateProduct: if the search' + EOL +
  '  // service throws, log it but still let the update succeed so the' + EOL +
  '  // vendor\'s edit is never silently rolled back.' + EOL +
  '  try {' + EOL +
  '    await searchService.indexProduct(product);' + EOL +
  '  } catch (searchError) {' + EOL +
  '    console.error("[vendorUpdateMyProduct] Search indexing failed:", searchError.message);' + EOL +
  '  }' + EOL +
  EOL +
  '  await AuditLog.create({' + EOL +
  '    actorUserId: req.user._id,' + EOL +
  '    action: "PRODUCT_UPDATED",' + EOL +
  '    entityType: "Product",' + EOL +
  '    entityId: product._id,' + EOL +
  '    meta: { updates: body, status: product.status },' + EOL +
  '  });' + EOL +
  EOL +
  '  res.json({ product: localizeProduct(product.toObject(), req.lang) });' + EOL +
  '}';

if (!text.includes(oldStr)) {
  console.error('OLD STRING NOT FOUND');
  process.exit(1);
}

text = text.replace(oldStr, newStr);

fs.writeFileSync(path, text);
console.log('OK: vendorUpdateMyProduct trailing block updated.');
