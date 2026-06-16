const fs = require('fs');
const path = require('path');

const files = [
    "app/(dashboard)/admin/faq/add/page.js",
    "app/(dashboard)/admin/faq/edit/[faq_id]/page.js",
    "app/(dashboard)/admin/faq/page.js",
    "app/(dashboard)/admin/orders/page.js",
    "app/(dashboard)/admin/products/add/page.js",
    "app/(dashboard)/admin/products/edit/[product_id]/page.js",
    "app/(dashboard)/admin/products/page.js",
    "app/(public)/(customer)/cart/page.js",
    "app/(public)/products/[product_id]/page.js",
    "app/(public)/products/page.js",
    "app/actions/v2/customer/cartActions.js",
    "app/actions/v2/dashboard/admin/faq/categoriesActions.js",
    "app/actions/v2/dashboard/admin/faq/faqActions.js",
    "app/actions/v2/dashboard/admin/orders/ordersActions.js",
    "app/actions/v2/dashboard/admin/products/categoriesActions.js",
    "app/actions/v2/dashboard/admin/products/productsActions.js",
    "app/actions/v2/dashboard/admin/sd/companyLogosActions.js",
    "app/actions/v2/dashboard/admin/sd/experienceActions.js",
    "app/actions/v2/dashboard/admin/sd/foodCategories.js",
    "app/actions/v2/dashboard/admin/sd/serviceActions.js",
    "app/actions/v2/public/faq/faqActions.js",
    "app/actions/v2/public/faq/faqCategoriesActions.js",
    "app/actions/v2/public/product/productActions.js",
    "app/actions/v2/public/landingPage.js"
];

files.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) return;
    
    let content = fs.readFileSync(fullPath, 'utf8');

    // GENERAL REPLACEMENTS (Safe)
    content = content.replace(/products_name/g, 'name');
    content = content.replace(/products_description/g, 'description');
    content = content.replace(/categories_name/g, 'name');

    // DB ALIASES & DIRECT ACCESS
    content = content.replace(/p\.product_id/g, 'p.id');
    content = content.replace(/products\.product_id/g, 'products.id');
    content = content.replace(/c\.categories_id/g, 'c.id');
    content = content.replace(/categories\.categories_id/g, 'categories.id');
    content = content.replace(/f\.faq_id/g, 'f.id');
    content = content.replace(/faq\.faq_id/g, 'faq.id');
    content = content.replace(/faq_category\.category_id/g, 'faq_category.id');

    // JSON RESULT ACCESS
    content = content.replace(/\.product_id/g, '.id');
    content = content.replace(/\.products_name/g, '.name');
    content = content.replace(/\.products_description/g, '.description');
    content = content.replace(/\.categories_id/g, '.category_id');
    content = content.replace(/\.categories_name/g, '.name');
    content = content.replace(/\.category_name/g, '.name');
    content = content.replace(/\.images_id/g, '.id');
    content = content.replace(/\.wholesale_prices_id/g, '.id');
    content = content.replace(/\.carts_id/g, '.id');
    content = content.replace(/\.cart_items_id/g, '.id');
    content = content.replace(/\.faq_id/g, '.id');
    content = content.replace(/\.food_categories_id/g, '.id');
    content = content.replace(/\.experience_id/g, '.id');
    content = content.replace(/\.cp_id/g, '.id');
    content = content.replace(/\.service_id/g, '.id');
    content = content.replace(/\.service_name/g, '.name');

    // SQL SELECT QUERIES
    content = content.replace(/categories_id/g, 'category_id'); // Mostly FKs
    content = content.replace(/wholesale_prices_id/g, 'id');
    content = content.replace(/images_id/g, 'id');
    content = content.replace(/carts_id/g, 'id');
    content = content.replace(/cart_items_id/g, 'id');
    content = content.replace(/food_categories_id/g, 'id');
    content = content.replace(/experience_id/g, 'id');
    content = content.replace(/cp_id/g, 'id');
    content = content.replace(/service_name/g, 'name');
    content = content.replace(/service_id/g, 'id');
    content = content.replace(/category_name/g, 'name'); 

    // Handle "category_id AS category_id" edge cases if they appear
    
    // DESTRUCTURING & OBJECT KEYS
    content = content.replace(/categories_id:/g, 'category_id:');
    
    // Specifically fix `product_id` which might just be an FK
    // We shouldn't globally replace product_id because it's used heavily as a parameter and FK.
    // The only time it should be 'id' is when referring to the primary key of 'products' or 'faq'
    // We handled .product_id and p.product_id already.

    fs.writeFileSync(fullPath, content);
});
console.log("Done refactoring script.");
