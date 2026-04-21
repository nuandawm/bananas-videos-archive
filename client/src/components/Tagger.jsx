import React, { useState, useMemo } from 'react';
import VideoPlayerModal from './VideoPlayerModal';
import { PlayCircle, Save } from 'lucide-react';

const Tagger = ({ videos, onUpdateTags }) => {
  const [activeVideo, setActiveVideo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formState, setFormState] = useState({ song_name: '', venue: '', type: 'electric' });

  // Untagged videos first, then tagged
  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => {
      if (!a.song_name && b.song_name) return -1;
      if (a.song_name && !b.song_name) return 1;
      return 0;
    });
  }, [videos]);

  const uniqueSongNames = useMemo(() => {
    const songs = videos.map(v => v.song_name).filter(Boolean);
    return [...new Set(songs)].sort();
  }, [videos]);

  const uniqueVenues = useMemo(() => {
    const venues = videos.map(v => v.venue).filter(Boolean);
    return [...new Set(venues)].sort();
  }, [videos]);

  const handleEditClick = (video) => {
    setEditingId(video.id);
    setFormState({
      song_name: video.song_name || '',
      venue: video.venue || '',
      type: video.type || 'electric'
    });
  };

  const handleSave = (video) => {
    onUpdateTags(video.id, formState);
    setEditingId(null);
  };

  if (videos.length === 0) {
    return <div>No videos loaded yet. Check your Google Drive Sync.</div>;
  }

  return (
    <div>
      <datalist id="song-names">
        {uniqueSongNames.map(name => <option key={name} value={name} />)}
      </datalist>
      <datalist id="venues">
        {uniqueVenues.map(venue => <option key={venue} value={venue} />)}
      </datalist>

      <h2 style={{ marginBottom: '1.5rem' }}>Tag Videos</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem', alignItems: 'start' }}>
        
        {/* List side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sortedVideos.map((video) => (
            <div key={video.id} className="card flex gap-4" style={{ 
                borderLeft: !video.song_name ? '4px solid var(--warning)' : '4px solid var(--success)',
                display: 'flex', gap: '1.5rem', alignItems: 'center'
              }}>
              
              <div 
                style={{
                  width: '120px',
                  aspectRatio: '16/9',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                onClick={() => setActiveVideo(video)}
              >
                <PlayCircle size={32} style={{ color: 'var(--accent-primary)', opacity: 0.8 }}/>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', wordBreak: 'break-all' }}>
                  {video.name}
                </div>
                
                {editingId === video.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                    <input 
                      list="song-names"
                      placeholder="Song Name" 
                      value={formState.song_name}
                      onChange={e => setFormState({...formState, song_name: e.target.value})}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        list="venues"
                        placeholder="Venue" 
                        value={formState.venue}
                        onChange={e => setFormState({...formState, venue: e.target.value})}
                      />
                      <select 
                        value={formState.type}
                        onChange={e => setFormState({...formState, type: e.target.value})}
                      >
                         <option value="acoustic">Acoustic</option>
                         <option value="electric">Electric</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                       <button className="btn-secondary" onClick={() => setEditingId(null)} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                       <button className="btn-primary" onClick={() => handleSave(video)} style={{ padding: '0.5rem 1rem' }}><Save size={16}/> Save</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                        {video.song_name || <span style={{ color: 'var(--warning)', fontStyle: 'italic', fontWeight: 400 }}>Untagged</span>}
                      </h4>
                      {(video.venue || video.type) && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {video.type && <span className={`badge ${video.type}`}>{video.type}</span>}
                          {video.venue && <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ccc', borderColor: 'rgba(255,255,255,0.2)' }}>{video.venue}</span>}
                        </div>
                      )}
                    </div>
                    <button className="btn-secondary" onClick={() => handleEditClick(video)}>
                      Edit Tags
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info panel side (Optional) */}
        <div className="card sticky" style={{ top: '2rem' }}>
          <h3>Tagging Workflow</h3>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Go through your videos and make sure they have a <strong style={{color: 'var(--text-main)'}}>Song Name</strong>. 
            Videos without a song name will appear at the top of this list and will not be visible in the Library.
          </p>
        </div>

      </div>

      {activeVideo && (
        <VideoPlayerModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  );
};

export default Tagger;
