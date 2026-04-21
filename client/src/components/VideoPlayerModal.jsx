import React from 'react';
import { X, ExternalLink } from 'lucide-react';

const VideoPlayerModal = ({ video, onClose }) => {
  if (!video) return null;

  // We need to extract the ID from the Drive webViewLink or use it directly
  // Drive's webViewLink usually looks like: https://drive.google.com/file/d/xxxxx/view?usp=drivesdk
  // For embedding, the safest approach without Drive API changes is to try iframe with /preview
  
  // Actually, since we don't have the webViewLink for the mock data, let's build the embed url
  const embedUrl = `https://drive.google.com/file/d/${video.drive_file_id}/preview`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-bold truncate max-w-[80%]">{video.song_name || video.name}</h3>
          <div className="flex gap-2">
            <a 
              href={`https://drive.google.com/file/d/${video.drive_file_id}/view`}
              target="_blank" 
              rel="noreferrer"
              className="btn-secondary"
              title="Open in Google Drive"
              style={{ padding: '0.5rem' }}
            >
              <ExternalLink size={18} />
            </a>
            <button onClick={onClose} className="btn-secondary" style={{ padding: '0.5rem' }}>
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="modal-body">
          <iframe 
            src={embedUrl} 
            width="100%" 
            height="100%" 
            allow="autoplay" 
            title="Video Player"
            style={{ border: 'none' }}
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerModal;
