import React, { useState, useMemo } from 'react';
import VideoGrid from './VideoGrid';
import VideoPlayerModal from './VideoPlayerModal';
import { Filter, List } from 'lucide-react';

const Dashboard = ({ videos }) => {
  const [groupBy, setGroupBy] = useState('song_name'); // 'song_name' or 'venue'
  const [filterType, setFilterType] = useState('all'); // 'all', 'acoustic', 'electric'
  const [activeVideo, setActiveVideo] = useState(null);

  const filteredVideos = useMemo(() => {
    // Only show tagged videos in the dashboard
    let vids = videos.filter(v => v.song_name);

    if (filterType !== 'all') {
      vids = vids.filter(v => v.type === filterType);
    }
    return vids;
  }, [videos, filterType]);

  const groupedVideos = useMemo(() => {
    const groups = {};
    filteredVideos.forEach(video => {
      const key = video[groupBy] || 'Unknown';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(video);
    });
    return groups;
  }, [filteredVideos, groupBy]);

  return (
    <div>
      <div className="filters-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <List size={20} style={{ color: 'var(--text-muted)' }} />
          <strong style={{ whiteSpace: 'nowrap' }}>Group By:</strong>
          <select 
            value={groupBy} 
            onChange={(e) => setGroupBy(e.target.value)}
            style={{ maxWidth: '200px' }}
          >
            <option value="song_name">Song Name</option>
            <option value="venue">Venue</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={20} style={{ color: 'var(--text-muted)' }} />
          <strong style={{ whiteSpace: 'nowrap' }}>Type:</strong>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            style={{ maxWidth: '200px' }}
          >
            <option value="all">All (Both)</option>
            <option value="acoustic">Acoustic</option>
            <option value="electric">Electric</option>
          </select>
        </div>
      </div>

      {Object.keys(groupedVideos).length === 0 ? (
        <div className="card text-center" style={{ padding: '4rem 2rem', opacity: 0.7 }}>
          <h3 style={{ marginBottom: '1rem' }}>No videos found</h3>
          <p>Tag some videos or change your filters to see them here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(groupedVideos)
            .sort((a,b) => a[0].localeCompare(b[0]))
            .map(([groupName, groupVideos]) => (
            <div key={groupName}>
              <div className="group-header">
                <h2 style={{ color: 'var(--accent-primary)' }}>{groupName}</h2>
                <span className="badge" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-muted)', border: 'none' }}>
                  {groupVideos.length} videos
                </span>
              </div>
              <VideoGrid videos={groupVideos} onPlay={setActiveVideo} />
            </div>
          ))}
        </div>
      )}

      {activeVideo && (
        <VideoPlayerModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  );
};

export default Dashboard;
