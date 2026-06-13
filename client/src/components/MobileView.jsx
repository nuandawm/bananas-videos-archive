import React, { useState, useMemo } from 'react';
import { Filter, List, Play, Video } from 'lucide-react';
import VideoPlayerModal from './VideoPlayerModal';

const MobileView = ({ videos }) => {
  const [groupBy, setGroupBy] = useState('song_name'); // 'song_name' or 'venue'
  const [filterType, setFilterType] = useState('all'); // 'all', 'acoustic', 'electric'
  const [showPartial, setShowPartial] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

  const filteredVideos = useMemo(() => {
    // Only show tagged videos on the mobile view
    let vids = videos.filter(v => v.song_name);

    if (filterType !== 'all') {
      vids = vids.filter(v => v.type === filterType);
    }

    if (!showPartial) {
      vids = vids.filter(v => !v.partial);
    }

    return vids;
  }, [videos, filterType, showPartial]);

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
    <div style={{ padding: '0 0.25rem' }}>
      <header className="mobile-header">
        <h2>
          <Video className="inline-block mr-2" style={{ color: 'var(--accent-primary)', marginRight: '0.5rem' }} />
          Band Archive
        </h2>
      </header>

      <div className="filters-bar" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
          <List size={18} style={{ color: 'var(--text-muted)' }} />
          <strong style={{ whiteSpace: 'nowrap', fontSize: '0.9rem' }}>Group By:</strong>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="song_name">Song Name</option>
            <option value="venue">Venue</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
          <Filter size={18} style={{ color: 'var(--text-muted)' }} />
          <strong style={{ whiteSpace: 'nowrap', fontSize: '0.9rem' }}>Type:</strong>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="all">All (Both)</option>
            <option value="acoustic">Acoustic</option>
            <option value="electric">Electric</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
          <input
            type="checkbox"
            id="show-partial-mobile"
            checked={showPartial}
            onChange={(e) => setShowPartial(e.target.checked)}
            style={{ width: 'auto', margin: 0 }}
          />
          <label htmlFor="show-partial-mobile" style={{ cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
            Show Partial
          </label>
        </div>
      </div>

      {Object.keys(groupedVideos).length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem 1.5rem', opacity: 0.7 }}>
          <h4 style={{ marginBottom: '0.5rem' }}>No videos found</h4>
          <p style={{ fontSize: '0.875rem' }}>Try changing your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {Object.entries(groupedVideos)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([groupName, groupVideos]) => (
              <div key={groupName}>
                <div className="group-header" style={{ marginTop: '1rem', marginBottom: '0.75rem', paddingBottom: '0.25rem' }}>
                  <h3 style={{ color: 'var(--accent-primary)', fontSize: '1.15rem' }}>{groupName}</h3>
                  <span className="badge" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-muted)', border: 'none', fontSize: '0.7rem' }}>
                    {groupVideos.length} {groupVideos.length === 1 ? 'video' : 'videos'}
                  </span>
                </div>
                <div className="mobile-video-list">
                  {groupVideos.map(video => (
                    <div
                      key={video.id}
                      className="mobile-video-item"
                      onClick={() => setActiveVideo(video)}
                    >
                      <div className="mobile-video-thumbnail">
                        <Play size={20} fill="var(--accent-primary)" style={{ opacity: 0.9 }} />
                      </div>
                      <div className="mobile-video-info">
                        <div className="mobile-video-title">
                          {video.song_name}
                        </div>
                        <div className="mobile-video-tags">
                          {video.type && (
                            <span className={`badge ${video.type}`}>{video.type}</span>
                          )}
                          {video.venue && (
                            <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#ccc', borderColor: 'rgba(255,255,255,0.15)' }}>
                              {video.venue}
                            </span>
                          )}
                          {!!video.partial && (
                            <span className="badge" style={{ backgroundColor: 'var(--warning)', color: '#000', borderColor: 'transparent' }}>
                              Partial
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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

export default MobileView;
