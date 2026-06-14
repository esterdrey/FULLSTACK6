const mysql = require('mysql2/promise');

const ALBUM_NAMES = [
    'Summer Vacation', 'Beach Day', 'Family Reunion', 'Road Trip', 'Birthday Party',
    'Wedding', 'Nature Walk', 'City Lights', 'Holiday Season', 'Graduation',
    'Weekend Getaway', 'Camping', 'Sports Day', 'Food Tour', 'Friends Hangout',
    'Sunset Photos', 'Mountain Hike', 'Garden Party', 'Winter Memories', 'Spring Bloom',
    'Autumn Colors', 'Night Out', 'Pet Photos', 'Home Moments', 'Kids Growing Up',
];

async function reseed() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root1234',
        database: 'json_project',
    });

    // Delete photos belonging to seed albums
    await db.query('DELETE FROM photos WHERE albumId BETWEEN 9 AND 70');
    console.log('Deleted photos for albums 9–70');

    // Delete seed albums
    await db.query('DELETE FROM albums WHERE id BETWEEN 9 AND 70');
    console.log('Deleted albums 9–70');

    const ALBUMS_PER_USER = 3;
    const PHOTOS_PER_ALBUM = 5;
    let picsumId = 100;

    for (let userId = 14; userId <= 34; userId++) {
        // Pick 3 unique album names for this user
        const shuffled = [...ALBUM_NAMES].sort(() => Math.random() - 0.5);
        const userAlbums = shuffled.slice(0, ALBUMS_PER_USER);

        for (const albumName of userAlbums) {
            const [albumResult] = await db.query(
                'INSERT INTO albums (userId, title) VALUES (?, ?)',
                [userId, albumName]
            );
            const albumId = albumResult.insertId;

            for (let j = 0; j < PHOTOS_PER_ALBUM; j++) {
                const id = picsumId++;
                await db.query(
                    'INSERT INTO photos (albumId, title, url, thumbnailUrl) VALUES (?, ?, ?, ?)',
                    [
                        albumId,
                        `Photo ${j + 1}`,
                        `https://picsum.photos/id/${id}/600/600`,
                        `https://picsum.photos/id/${id}/150/150`,
                    ]
                );
            }

            console.log(`User ${userId} → "${albumName}" (albumId: ${albumId}) with ${PHOTOS_PER_ALBUM} photos`);
        }
    }

    console.log('Done!');
    await db.end();
}

reseed().catch(console.error);