import React, { useState } from 'react';
import { PlayCircle } from 'lucide-react';

const VideoGrid = ({ videos, onPlay }) => {
  if (videos.length === 0) {
    return <div style={{ opacity: 0.5, padding: '2rem 0' }}>No videos here yet.</div>;
  }

  return (
    <div className="video-grid">
      {videos.map(video => (
        <div key={video.id} className="card animate-fade-in flex flex-col gap-3">
          <div 
            style={{ 
              aspectRatio: '16/9', 
              backgroundColor: 'rgba(0,0,0,0.3)', 
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
            onClick={() => onPlay(video)}
            className="group"
          >
            <PlayCircle size={48} style={{ opacity: 0.8, color: 'var(--accent-primary)' }} />
          </div>
          
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {video.song_name || video.name}
            </h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {video.type && (
                <span className={`badge ${video.type}`}>{video.type}</span>
              )}
              {video.venue && (
                <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ccc', borderColor: 'rgba(255,255,255,0.2)' }}>
                  {video.venue}
                </span>
              )}
              {!!video.partial && (
                <span className="badge" style={{ backgroundColor: 'var(--warning)', color: '#000' }}>
                  Partial
                </span>
              )}
            </div>
            {!video.song_name && (
              <div style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: '0.5rem' }}>
                Needs tagging
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
