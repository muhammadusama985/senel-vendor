import sys
with open(r'src/pages/Negotiations/BulkOfferDetail.tsx', 'r', encoding='utf-8') as f:
    s = f.read()

old = '''        <p>
          <strong>Buyer:</strong> {offer.buyerSnapshot?.companyName || offer.buyerSnapshot?.email}
        </p>
        <p>
          <strong>Current terms:</strong> {offer.currentQty} units @ {offer.currentUnitPrice}{' '}
          {offer.currency} ={' '}
          <strong>{(offer.currentQty * offer.currentUnitPrice).toFixed(2)} {offer.currency}</strong>
        </p>'''

new = '''        <p>
          <strong>Buyer:</strong> {offer.buyerSnapshot?.companyName || offer.buyerSnapshot?.email}
        </p>
        {variantSku || (variantAttrs && Object.keys(variantAttrs).length > 0) ? (
          <p>
            <strong>Selected option:</strong>{' '}
            {variantAttrs && Object.keys(variantAttrs).length > 0
              ? Object.entries(variantAttrs)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' / ')
              : ''}
            {variantSku ? ` (SKU: ${variantSku})` : ''}
          </p>
        ) : null}
        <p>
          <strong>Current terms:</strong> {offer.currentQty} units @ {offer.currentUnitPrice}{' '}
          {offer.currency} ={' '}
          <strong>{(offer.currentQty * offer.currentUnitPrice).toFixed(2)} {offer.currency}</strong>
        </p>'''

if old in s:
    s = s.replace(old, new)
    with open(r'src/pages/Negotiations/BulkOfferDetail.tsx', 'w', encoding='utf-8') as f:
        f.write(s)
    print('Variant display added')
else:
    print('NOT FOUND')
    sys.exit(1)