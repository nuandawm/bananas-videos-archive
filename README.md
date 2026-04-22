# Band Video Archive

A full-stack web application designed to organize, tag, and view a collection of band performance videos stored in a Google Drive folder.

## Features

- **Google Drive Sync:** Securely fetches video files from a specified Google Drive folder using a service account.
- **Video Tagging System:** Easily categorize videos by assigning tags such as Song Name, Venue, and Type (Acoustic/Electric).
- **Partial Video Flag:** Mark incomplete or partial videos so they can be easily filtered out or identified.
- **Library Dashboard:** Group your video collection by Song Name or Venue and filter by performance type.
- **Embedded Player:** Watch the videos directly within the application.

## Tech Stack

- **Frontend:** React, Vite, React Router, Lucide React (Icons)
- **Backend:** Node.js, Express, SQLite3
- **Google API:** Googleapis (Drive v3 API)

## Project Structure

This project is a monorepo consisting of two main directories:

- `/client` - The React frontend application.
- `/server` - The Node.js + Express backend server.

## Getting Started

### Prerequisites
- Node.js (v18+)
- A Google Cloud Service Account with `credentials.json` (for Google Drive access).

### Backend Setup
1. Navigate to the `server` directory: `cd server`
2. Install dependencies: `npm install`
3. Place your Google Service Account `credentials.json` in the `server` folder.
4. Set up an `.env` file with `DRIVE_FOLDER_ID=your_folder_id` (optional, defaults to dummy).
5. Run the server: `node server.js` (Server runs on `http://localhost:3001`)

### Frontend Setup
1. Navigate to the `client` directory: `cd client`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open the UI at `http://localhost:5173/`

## Usage

- Start both the frontend and backend servers.
- Navigate to the **"Tag Videos"** view to pull your latest videos from Google Drive and add the necessary tags (Song Name, Venue, Type, Partial).
- Go to the **"Library"** to browse your organized video collection.
