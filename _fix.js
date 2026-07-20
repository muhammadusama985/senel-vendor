const fs = require('fs');
const path = require('path');
const file = 'src/pages/Products/ProductDetail.tsx';
let c = fs.readFileSync(file, 'utf8');
const isCRLF = c.includes('\r\n');
let cLF = c.replace(/\r\n/g, '\n');

// Wrap the description <p> in a scrollable container so long descriptions
// stay inside their card instead of pushing the rest of the page down.
const oldDesc =
'          <div style={{ ...cardStyle, marginBottom: \'2rem\' }}>\n' +
'            <h3 style={{ color: colors.text, marginBottom: \'0.5rem\' }}>{t(\'descriptionLabel\', \'Description\')}</h3>\n' +
'            <p style={{ color: colors.textMuted, lineHeight: \'1.6\' }}>{product.description || t(\'noDescriptionProvided\', \'No description provided.\')}</p>\n' +
'          </div>';

const newDesc =
'          <div style={{ ...cardStyle, marginBottom: \'2rem\' }}>\n' +
'            <h3 style={{ color: colors.text, marginBottom: \'0.5rem\' }}>{t(\'descriptionLabel\', \'Description\')}</h3>\n' +
'            <div\n' +
'              className="vendor-product-description-scroller"\n' +
'              style={{\n' +
'                // Fixed ceiling so long descriptions scroll inside this card\n' +
'                // instead of pushing the rest of the view page down.\n' +
'                maxHeight: \'220px\',\n' +
'                overflowY: \'auto\',\n' +
'                paddingRight: \'0.5rem\',\n' +
'              }}\n' +
'            >\n' +
'              <p\n' +
'                className="vendor-product-description-text"\n' +
'                style={{ color: colors.textMuted, lineHeight: \'1.6\', margin: 0 }}\n' +
'              >\n' +
'                {product.description || t(\'noDescriptionProvided\', \'No description provided.\')}\n' +
'              </p>\n' +
'            </div>\n' +
'          </div>';

if (!cLF.includes(oldDesc)) {
  console.error('OLD DESC BLOCK NOT FOUND');
  process.exit(1);
}
cLF = cLF.replace(oldDesc, newDesc);

let out = cLF;
if (isCRLF) out = out.replace(/\n/g, '\r\n');
fs.writeFileSync(file, out);
console.log('OK');