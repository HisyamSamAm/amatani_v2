import sql from './lib/postgres.js';

async function getTables() {
    try {
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
        `;
        console.log(tables.map(t => t.table_name).join(', '));
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
getTables();
