const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) return;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;

    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }

    if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Patched: ${filePath}`);
    }
}

// Fix faqCategoriesActions.js
const faqCatFiles = [
    "app/actions/v2/dashboard/admin/faq/categoriesActions.js",
    "app/actions/v2/public/faq/faqCategoriesActions.js"
];
faqCatFiles.forEach(file => {
    replaceInFile(file, [
        ["SELECT category_id, name, created_at FROM faq_category", "SELECT id, name, created_at FROM faq_category"]
    ]);
});

// Fix faqActions.js
const faqActionsFiles = [
    "app/actions/v2/dashboard/admin/faq/faqActions.js",
    "app/actions/v2/public/faq/faqActions.js"
];
faqActionsFiles.forEach(file => {
    replaceInFile(file, [
        ["c.category_id,", "c.id,"],
        ["c.category_id", "c.id"],
        ["ON f.category_id = c.id", "ON f.category_id = c.id"], // just in case
    ]);
});
