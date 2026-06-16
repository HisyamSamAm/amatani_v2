const fs = require('fs');
const path = require('path');

const files = [
    "app/actions/v2/customer/cartActions.js",
    "app/actions/v2/dashboard/admin/products/productsActions.js",
    "app/actions/v2/public/product/productActions.js",
    "app/actions/v2/public/landingPage.js"
];

files.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) return;
    
    let content = fs.readFileSync(fullPath, 'utf8');

    content = content.replace(/w\.id = p\.id/g, 'w.product_id = p.id');
    content = content.replace(/pi\.id = p\.id/g, 'pi.product_id = p.id');
    content = content.replace(/p\.id = f\.id/g, 'p.id = f.product_id');
    content = content.replace(/lfc\.id = c\.id/g, 'lfc.category_id = c.id');

    fs.writeFileSync(fullPath, content);
    console.log(`Fixed SQL JOINs in: ${file}`);
});
