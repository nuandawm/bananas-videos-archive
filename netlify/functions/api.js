require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const serverless = require('serverless-http');
const { createClient } = require('@libsql/client');

const app = express();

app.use(cors());
app.use(express.json());

// Debug endpoint
app.all('/api/debug', (req, res) => {
    res.json({
        cwd: process.cwd(),
        dbUrl: process.env.TURSO_DATABASE_URL || 'undefined',
        method: req.method,
        body: req.body,
        hasApiGateway: !!req.apiGateway,
        apiGatewayBody: req.apiGateway ? req.apiGateway.event.body : null
    });
});

// Initialize Turso DB Client
const db = createClient({
    url: process.env.TURSO_DATABASE_URL || 'libsql://dummy',
    authToken: process.env.TURSO_AUTH_TOKEN || 'dummy'
});

const FOLDER_ID = process.env.DRIVE_FOLDER_ID || 'dummy_folder_id';

let driveService = null;
try {
    let authOptions = {
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    };

    if (process.env.GOOGLE_CREDENTIALS) {
        authOptions.credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        const auth = new google.auth.GoogleAuth(authOptions);
        driveService = google.drive({ version: 'v3', auth });
        console.log('Google Drive API initialized successfully.');
    } else {
        console.log('GOOGLE_CREDENTIALS environment variable not set. Drive API will not be initialized.');
    }
} catch (error) {
    console.log('Google Drive API not initialized. Ensure GOOGLE_CREDENTIALS is valid JSON.', error.message);
}

// Function to fetch files from Google Drive
async function getDriveFiles() {
    if (!driveService) return [];

    try {
        const response = await driveService.files.list({
            q: `'${FOLDER_ID}' in parents and mimeType contains 'video/' and trashed = false`,
            fields: 'files(id, name, webViewLink)',
        });
        return response.data.files;
    } catch (error) {
        console.error('Error fetching files from Drive:', error);
        return [];
    }
}

// Ensure Drive files exist in DB
app.get('/api/sync', async (req, res) => {
    if (!driveService) {
        return res.json({ message: 'Drive Service not configured. Skipped sync.' });
    }

    try {
        const driveFiles = await getDriveFiles();

        // Prepare batch statements to insert files if they don't exist
        const batchStatements = driveFiles.map(file => ({
            sql: 'INSERT OR IGNORE INTO videos (drive_file_id, name) VALUES (?, ?)',
            args: [file.id, file.name]
        }));

        if (batchStatements.length > 0) {
            await db.batch(batchStatements);
        }

        res.json({ message: 'Sync complete', synced: driveFiles.length });
    } catch (error) {
        console.error('Sync Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all videos
app.get('/api/videos', async (req, res) => {
    try {
        const result = await db.execute('SELECT * FROM videos');
        res.json(result.rows);
    } catch (error) {
        if (error.message && error.message.includes('no such table: videos')) {
            try {
                await db.execute(`
                    CREATE TABLE IF NOT EXISTS videos (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        drive_file_id TEXT UNIQUE NOT NULL,
                        name TEXT NOT NULL,
                        song_name TEXT,
                        venue TEXT,
                        type TEXT,
                        partial INTEGER DEFAULT 0
                    )
                `);
                console.log('Created videos table successfully.');
                return res.json([]);
            } catch (createError) {
                console.error('Error creating videos table:', createError);
                return res.status(500).json({ error: createError.message });
            }
        }
        console.error('Fetch Videos Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update video tags
app.put('/api/videos/:id', async (req, res) => {
    let body = req.body;
    
    try {
        if (Buffer.isBuffer(body)) {
            body = JSON.parse(body.toString('utf8'));
        } else if (typeof body === 'string') {
            body = JSON.parse(body);
        } else if (!body || Object.keys(body).length === 0) {
            // Fallback to raw apiGateway event if req.body is empty
            if (req.apiGateway && req.apiGateway.event && req.apiGateway.event.body) {
                let rawBody = req.apiGateway.event.body;
                if (req.apiGateway.event.isBase64Encoded) {
                    rawBody = Buffer.from(rawBody, 'base64').toString('utf8');
                }
                body = JSON.parse(rawBody);
            }
        }
    } catch (e) {
        console.error('Error parsing body:', e);
    }
    
    const { id } = req.params;
    const { song_name, venue, type, partial } = body || {};
    const args = [
        song_name != null ? String(song_name) : null,
        venue != null ? String(venue) : null,
        type != null ? String(type) : null,
        partial ? 1 : 0,
        Number(id)
    ];

    try {
        const result = await db.execute({
            sql: 'UPDATE videos SET song_name = ?, venue = ?, type = ?, partial = ? WHERE id = ? RETURNING *',
            args: args
        });
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Video not found' });
        }
        
        // SQLite/libSQL returns 1 or 0 for integers. We cast it back to boolean 
        // to exactly match the payload sent from the frontend.
        const updatedVideo = result.rows[0];
        updatedVideo.partial = !!updatedVideo.partial;

        res.json({ message: 'Updated', video: updatedVideo, changes: result.rowsAffected });
    } catch (error) {
        console.error('Update Video Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Optional: Initial mock data creation if db is empty (for testing frontend)
app.post('/api/mock-data', async (req, res) => {
    try {
        // Create table if it doesn't exist (Turso might not have it yet)
        await db.execute(`
            CREATE TABLE IF NOT EXISTS videos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                drive_file_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                song_name TEXT,
                venue TEXT,
                type TEXT,
                partial INTEGER DEFAULT 0
            )
        `);

        const result = await db.execute('SELECT COUNT(*) as count FROM videos');
        const count = result.rows[0].count;

        if (count === 0) {
            const mockVideos = [
                { drive_file_id: 'mock1', name: 'rehearsal_01.mp4', song_name: 'Smells Like Teen Spirit', venue: 'Rehearsals', type: 'electric', partial: 0 },
                { drive_file_id: 'mock2', name: 'gig_track2.mp4', song_name: 'Smells Like Teen Spirit', venue: 'Billy Bootleggers gig', type: 'electric', partial: 0 },
                { drive_file_id: 'mock3', name: 'acoustic_jam.mp4', song_name: 'Wonderwall', venue: 'Rehearsals', type: 'acoustic', partial: 1 },
                { drive_file_id: 'mock4', name: 'nav_gig_01.mp4', song_name: 'Wonderwall', venue: 'Navigation gig', type: 'electric', partial: 0 },
                { drive_file_id: 'mock5', name: 'unknown_clip.mp4', song_name: null, venue: null, type: null, partial: 0 },
            ];

            const batchStatements = mockVideos.map(v => ({
                sql: 'INSERT INTO videos (drive_file_id, name, song_name, venue, type, partial) VALUES (?, ?, ?, ?, ?, ?)',
                args: [v.drive_file_id, v.name, v.song_name, v.venue, v.type, v.partial]
            }));

            await db.batch(batchStatements);
            res.json({ message: 'Mock data created' });
        } else {
            res.json({ message: 'Database is not empty' });
        }
    } catch (error) {
        console.error('Mock Data Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Export handler for Netlify Functions
const serverlessHandler = serverless(app);
module.exports.handler = async (event, context) => {
    console.log('Raw event.body:', event.body);
    console.log('Event HTTP Method:', event.httpMethod);
    return await serverlessHandler(event, context);
};
