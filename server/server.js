require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const db = require('./database');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Load credentials from a specific path (provided by the user later)
// For now, we'll try to read from a local credentials.json if it exists,
// or we can just mock it if it's missing (to allow development)
const CREDENTIALS_PATH = path.resolve(__dirname, 'credentials.json');
const FOLDER_ID = process.env.DRIVE_FOLDER_ID || 'dummy_folder_id'; 

let driveService = null;
try {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  driveService = google.drive({ version: 'v3', auth });
  console.log('Google Drive API initialized successfully.');
} catch (error) {
    console.log('Google Drive API not initialized. Ensure credentials.json exists.');
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
    // For development, if no Drive config, just return DB contents
    if (!driveService) {
        return res.json({ message: 'Drive Service not configured. Skipped sync.'});
    }

    const driveFiles = await getDriveFiles();
    
    // Insert into DB if they don't exist
    const insertStmt = db.prepare(`
        INSERT OR IGNORE INTO videos (drive_file_id, name) VALUES (?, ?)
    `);

    for (const file of driveFiles) {
        insertStmt.run(file.id, file.name);
    }
    insertStmt.finalize();

    res.json({ message: 'Sync complete', synced: driveFiles.length });
});

// Get all videos
app.get('/api/videos', (req, res) => {
    db.all('SELECT * FROM videos', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Update video tags
app.put('/api/videos/:id', (req, res) => {
    const { id } = req.params;
    const { song_name, venue, type, partial } = req.body;

    db.run(
        'UPDATE videos SET song_name = ?, venue = ?, type = ?, partial = ? WHERE id = ?',
        [song_name, venue, type, partial ? 1 : 0, id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Updated', changes: this.changes });
        }
    );
});

// Optional: Initial mock data creation if db is empty (for testing frontend)
app.post('/api/mock-data', (req, res) => {
    db.get('SELECT COUNT(*) as count FROM videos', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (row.count === 0) {
            const mockVideos = [
                { drive_file_id: 'mock1', name: 'rehearsal_01.mp4', song_name: 'Smells Like Teen Spirit', venue: 'Rehearsals', type: 'electric', partial: 0 },
                { drive_file_id: 'mock2', name: 'gig_track2.mp4', song_name: 'Smells Like Teen Spirit', venue: 'Billy Bootleggers gig', type: 'electric', partial: 0 },
                { drive_file_id: 'mock3', name: 'acoustic_jam.mp4', song_name: 'Wonderwall', venue: 'Rehearsals', type: 'acoustic', partial: 1 },
                { drive_file_id: 'mock4', name: 'nav_gig_01.mp4', song_name: 'Wonderwall', venue: 'Navigation gig', type: 'electric', partial: 0 },
                { drive_file_id: 'mock5', name: 'unknown_clip.mp4', song_name: null, venue: null, type: null, partial: 0 },
            ];

            const insertStmt = db.prepare('INSERT INTO videos (drive_file_id, name, song_name, venue, type, partial) VALUES (?, ?, ?, ?, ?, ?)');
            for (const v of mockVideos) {
                insertStmt.run(v.drive_file_id, v.name, v.song_name, v.venue, v.type, v.partial);
            }
            insertStmt.finalize();
            res.json({ message: 'Mock data created' });
        } else {
            res.json({ message: 'Database is not empty' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
