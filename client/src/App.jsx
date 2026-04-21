import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Video, Tags, Library } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Tagger from './components/Tagger';

function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch videos from our backend
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/videos');
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleUpdateTags = async (id, tags) => {
    try {
      const response = await fetch(`http://localhost:3001/api/videos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tags),
      });
      if (response.ok) {
        setVideos(videos.map(v => v.id === id ? { ...v, ...tags } : v));
      }
    } catch (error) {
      console.error('Error updating tags:', error);
    }
  };

  return (
    <Router>
      <div className="container">
        <header>
          <h1><Video className="inline-block mr-2" /> Band Archive</h1>
          <nav>
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Library className="inline-block w-4 h-4 mr-2" /> Library
            </NavLink>
            <NavLink to="/tagger" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Tags className="inline-block w-4 h-4 mr-2" /> Tag Videos
            </NavLink>
          </nav>
        </header>

        <main>
          {loading ? (
            <div className="flex justify-center p-12">Loading...</div>
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard videos={videos} />} />
              <Route path="/tagger" element={<Tagger videos={videos} onUpdateTags={handleUpdateTags} />} />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
