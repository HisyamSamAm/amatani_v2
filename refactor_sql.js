const fs = require('fs');
const path = require('path');

const files = [
    "app/actions/v2/dashboard/admin/faq/faqActions.js",
    "app/actions/v2/dashboard/admin/faq/categoriesActions.js",
    "app/actions/v2/dashboard/admin/products/categoriesActions.js",
    "app/actions/v2/dashboard/admin/products/productsActions.js",
    "app/actions/v2/dashboard/admin/sd/foodCategories.js",
    "app/actions/v2/customer/cartActions.js"
];

files.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) return;
    
    let content = fs.readFileSync(fullPath, 'utf8');

    // faq_category
    content = content.replace(/FROM faq_category WHERE category_id =/gi, 'FROM faq_category WHERE id =');
    // faq
    content = content.replace(/from faq where faq_id =/gi, 'from faq where id =');
    content = content.replace(/where id = \$\{faq_id\}/gi, 'where id = ${faq_id}');
    // categories
    content = content.replace(/from categories where category_id =/gi, 'from categories where id =');
    // products table specifically
    content = content.replace(/FROM products WHERE product_id =/gi, 'FROM products WHERE id =');
    content = content.replace(/UPDATE products[\s\S]*?WHERE product_id =/gi, (match) => match.replace('product_id =', 'id ='));
    content = content.replace(/DELETE FROM products WHERE product_id =/gi, 'DELETE FROM products WHERE id =');
    // foodCategories
    content = content.replace(/WHERE food_category_id =/gi, 'WHERE id =');

    // cartActions
    content = content.replace(/WHERE cart_items_id =/gi, 'WHERE id =');

    fs.writeFileSync(fullPath, content);
    console.log(`Refactored SQL WHERE in: ${file}`);
});
