const fs = require('fs');
const file = 'e:/try/senel-vendor/src/pages/Products/components/ProductForm.tsx';
let c = fs.readFileSync(file, 'utf8');
const isCRLF = c.includes('\r\n');
let cLF = c.replace(/\r\n/g, '\n');

// Add the sequential-tier validation right after the "all tiers >= MOQ"
// check and before the duplicate-minQty check, since it logically sits
// between them.
const oldBlock =
'    // Every tier\'s minQty must be at least the product MOQ (any tier whose\n' +
'    // minQty is below MOQ would mean the customer can never order the\n' +
'    // advertised bulk quantity at that price).\n' +
'    if (formData.moq > 0 && sortedTiers.some((tier) => tier.minQty > 0 && tier.minQty < formData.moq)) {\n' +
'      alert(\'Each price tier minimum quantity must be at or above the MOQ (\' + formData.moq + \' units).\');\n' +
'      return;\n' +
'    }\n' +
'\n' +
'    const duplicateTierQty = sortedTiers.find((tier, index) => index > 0 && tier.minQty === sortedTiers[index - 1].minQty);';

const newBlock =
'    // Every tier\'s minQty must be at least the product MOQ (any tier whose\n' +
'    // minQty is below MOQ would mean the customer can never order the\n' +
'    // advertised bulk quantity at that price).\n' +
'    if (formData.moq > 0 && sortedTiers.some((tier) => tier.minQty > 0 && tier.minQty < formData.moq)) {\n' +
'      alert(\'Each price tier minimum quantity must be at or above the MOQ (\' + formData.moq + \' units).\');\n' +
'      return;\n' +
'    }\n' +
'\n' +
'    // Sequential ordering rules for the tiers (left to right after sort):\n' +
'    //  1. The lowest tier (sorted first) must have minQty equal to the\n' +
'    //     product MOQ — this is the entry point the customer can reach.\n' +
'    //  2. Every subsequent tier must have a strictly larger minQty than\n' +
'    //     the previous one, so the ladder never overlaps and the customer\n' +
'    //     always moves "up" into the next price break.\n' +
'    if (formData.moq > 0 && sortedTiers.length > 0) {\n' +
'      const firstTier = sortedTiers[0];\n' +
'      if (firstTier.minQty !== formData.moq) {\n' +
'        alert(\'The first price tier minimum quantity must be exactly the MOQ (\' + formData.moq + \' units).\');\n' +
'        return;\n' +
'      }\n' +
'      for (let i = 1; i < sortedTiers.length; i++) {\n' +
'        if (sortedTiers[i].minQty <= sortedTiers[i - 1].minQty) {\n' +
'          alert(\'Each price tier must have a higher minimum quantity than the one before it.\');\n' +
'          return;\n' +
'        }\n' +
'      }\n' +
'    }\n' +
'\n' +
'    const duplicateTierQty = sortedTiers.find((tier, index) => index > 0 && tier.minQty === sortedTiers[index - 1].minQty);';

if (!cLF.includes(oldBlock)) {
  console.error('OLD BLOCK NOT FOUND');
  process.exit(1);
}
cLF = cLF.replace(oldBlock, newBlock);

let out = cLF;
if (isCRLF) out = out.replace(/\n/g, '\r\n');
fs.writeFileSync(file, out);
console.log('OK');
