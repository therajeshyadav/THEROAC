import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Video, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import './ImageUpload.css';
import './MediaUpload.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const MediaUpload = ({ 
  label = "Media Gallery", 
  value = [], // Array of media items
  onChange, 
  type = 'events',
  maxItems = 10
}) => {
  const [uploading, setUploading] = useState(false);
  const [newMediaType, setNewMediaType] = useState('image');
  const [newMediaUrl, setNewMediaUrl] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if we've reached max items
    if (value.length >= maxItems) {
      toast.error(`Maximum ${maxItems} media items allowed`);
      return;
    }

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      toast.error('Please select an image or video file');
      return;
    }

    // Validate file size (10MB for images, 50MB for videos)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File size should be less than ${isVideo ? '50MB' : '10MB'}`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('media', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/${type}/upload-media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      const newMediaItem = {
        type: result.type || (isVideo ? 'video' : 'image'),
        url: result.url,
        thumbnail: result.thumbnail || result.url
      };

      onChange([...value, newMediaItem]);
      toast.success(`${isVideo ? 'Video' : 'Image'} uploaded successfully!`);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const addMediaUrl = () => {
    if (!newMediaUrl.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    if (value.length >= maxItems) {
      toast.error(`Maximum ${maxItems} media items allowed`);
      return;
    }

    const newMediaItem = {
      type: newMediaType,
      url: newMediaUrl.trim(),
      thumbnail: newMediaType === 'video' ? newMediaUrl.replace('watch?v=', 'vi/') + '/maxresdefault.jpg' : newMediaUrl.trim()
    };

    onChange([...value, newMediaItem]);
    setNewMediaUrl('');
    toast.success('Media added successfully!');
  };

  const removeMedia = (index) => {
    const newMedia = value.filter((_, i) => i !== index);
    onChange(newMedia);
    toast.info('Media removed');
  };

  return (
    <div className="media-upload-container">
      <label className="form-label">{label}</label>
      
      {/* Existing Media Items */}
      {value.length > 0 && (
        <div className="media-list">
          {value.map((item, index) => (
            <div key={index} className="media-item-preview">
              <div className="media-preview">
                {item.type === 'video' ? (
                  <div className="video-preview">
                    <img src={item.thumbnail} alt="Video thumbnail" />
                    <div className="video-overlay">
                      <Video size={20} />
                    </div>
                  </div>
                ) : (
                  <img src={item.url} alt="Media preview" />
                )}
              </div>
              <div className="media-info">
                <span className="media-type">{item.type}</span>
                <span className="media-url">{item.url.length > 40 ? item.url.substring(0, 40) + '...' : item.url}</span>
              </div>
              <button 
                type="button" 
                className="btn-remove" 
                onClick={() => removeMedia(index)}
                title="Remove media"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Section */}
      {value.length < maxItems && (
        <div className="media-upload-section">
          {/* File Upload */}
          <div className="upload-option">
            <label className="upload-button" htmlFor="media-file-upload">
              <Upload size={20} />
              <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
            </label>
            <input
              id="media-file-upload"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="file-input"
              style={{ display: 'none' }}
            />
          </div>

          {/* URL Input */}
          <div className="url-input-section">
            <div className="url-input-group">
              <select 
                value={newMediaType} 
                onChange={(e) => setNewMediaType(e.target.value)}
                className="media-type-select"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              <input
                type="url"
                value={newMediaUrl}
                onChange={(e) => setNewMediaUrl(e.target.value)}
                placeholder="Enter media URL..."
                className="url-input"
              />
              <button 
                type="button" 
                className="btn-add-url" 
                onClick={addMediaUrl}
                disabled={!newMediaUrl.trim()}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {value.length >= maxItems && (
        <p className="max-items-message">
          Maximum {maxItems} media items reached
        </p>
      )}
    </div>
  );
};

export default MediaUpload;