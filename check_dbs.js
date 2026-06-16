import postgres from 'postgres';
const sql = postgres("postgresql://postgres:sampost@localhost:5432/postgres?sslmode=disable");

async function checkDbs() {
    try {
        const dbs = await sql`SELECT datname FROM pg_database;`;
        console.log(dbs.map(d => d.datname).join(', '));
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
checkDbs();
