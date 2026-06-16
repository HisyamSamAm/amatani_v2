import { list, del } from '@vercel/blob';

async function clearStorage() {
    console.log("Fetching blobs to delete...");
    try {
        let hasMore = true;
        let cursor;
        let deletedCount = 0;

        while (hasMore) {
            const { blobs, cursor: nextCursor, hasMore: more } = await list({
                token: process.env.BLOB_READ_WRITE_TOKEN,
                cursor,
            });

            if (blobs.length > 0) {
                const urls = blobs.map(b => b.url);
                await del(urls, { token: process.env.BLOB_READ_WRITE_TOKEN });
                deletedCount += urls.length;
                console.log(`Deleted ${urls.length} blobs...`);
            }

            hasMore = more;
            cursor = nextCursor;
        }

        console.log(`Storage cleared. Total deleted: ${deletedCount}`);
        process.exit(0);
    } catch (error) {
        console.error("Error clearing storage:", error);
        process.exit(1);
    }
}

clearStorage();
