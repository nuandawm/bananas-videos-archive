# Implementation Plan - Mobile-First View

This plan introduces a new, mobile-first, read-only view for the video archive app, accessible at the path `/mobile`.

## User Review Required

> [!NOTE]
> The mobile page will hide the global header (containing navigation and the "Sync Drive" button) to focus strictly on a clean mobile-only reading & playback experience. Instead, it will feature its own simplified mobile header.

## Proposed Changes

We will modify three files and add one new component file.

---

### Frontend

#### [NEW] [MobileView.jsx](file:///c:/Users/danna/Documents/Giuliano/MyProjects/bananas-videos-archive/client/src/components/MobileView.jsx)
- Implement a new functional component for the `/mobile` page.
- Load and filter the already-tagged videos (`video.song_name` is present).
- Support filtering by:
  - Group By: `song_name` or `venue`
  - Type: `all`, `acoustic`, or `electric`
  - Show/Hide Partials: Toggle switch/checkbox
- Group videos based on the select option, sorting groups alphabetically.
- Render videos in a list format optimized for thumbs (smaller row layout instead of desktop grid).
- Clicking an item in the list will trigger a modal player.
- Display the video title and relevant tags (Type, Venue, Partial status) on each item.
- Integrate the existing `VideoPlayerModal` component.

#### [MODIFY] [index.css](file:///c:/Users/danna/Documents/Giuliano/MyProjects/bananas-videos-archive/client/src/index.css)
- Add styling for the mobile list view: `.mobile-video-list`, `.mobile-video-item`, `.mobile-video-thumbnail`, `.mobile-video-info`, `.mobile-video-title`, and `.mobile-video-tags`.
- Update `.filters-bar` with a media query to wrap or stack vertically on smaller screens (below `768px`) for mobile ease.
- Adjust the container layout padding for mobile viewports.

#### [MODIFY] [App.jsx](file:///c:/Users/danna/Documents/Giuliano/MyProjects/bananas-videos-archive/client/src/App.jsx)
- Wrap the main application body in a helper component `AppContent` (or use location conditionally) to avoid showing the global `<header>` (nav links and "Sync Drive" button) when visiting `/mobile`.
- Define a new Route for `/mobile` that renders `<MobileView videos={videos} />`.

---

## Verification Plan

### Automated/Tool Verification
- Verify code validity by inspecting ESLint/Vite console warnings.
- Run a browser subagent task to navigate to `/mobile`, verify the filters work, make sure the video list displays correctly, and clicking a list item opens the modal player.

### Manual Verification
- The user can verify the responsiveness on their mobile device or using Chrome DevTools (mobile emulation) at the `/mobile` route.
