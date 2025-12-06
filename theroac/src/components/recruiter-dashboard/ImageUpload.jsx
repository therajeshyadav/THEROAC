import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import './ImageUpload.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const ImageUpload = ({ 
  label, 
  value, 
  onChange, 
  type = 'jobs', // jobs, internships, events
  fieldName = 'image',
  preview = true,
  previewClass = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append(fieldName, file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/${type}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        onChange(data.imageUrl);
        toast.success('Image uploaded successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (e) => {
    onChange(e.target.value);
  };

  const clearImage = () => {
    onChange('');
  };

  return (
    <div className="image-upload-container">
      <label className="image-upload-label">{label}</label>
      
      <div className="upload-mode-toggle">
        <button
          type="button"
          className={`mode-btn ${uploadMode === 'url' ? 'active' : ''}`}
          onClick={() => setUploadMode('url')}
        >
          URL
        </button>
        <button
          type="button"
          className={`mode-btn ${uploadMode === 'file' ? 'active' : ''}`}
          onClick={() => setUploadMode('file')}
        >
          Upload File
        </button>
      </div>

      {uploadMode === 'url' ? (
        <div className="url-input-group">
          <input
            type="url"
            value={value || ''}
            onChange={handleUrlChange}
            placeholder="https://example.com/image.jpg"
            className="url-input"
          />
          {value && (
            <button type="button" className="clear-btn" onClick={clearImage}>
              <X size={18} />
            </button>
          )}
        </div>
      ) : (
        <div className="file-upload-group">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            id={`file-${fieldName}`}
            className="file-input"
            disabled={uploading}
          />
          <label htmlFor={`file-${fieldName}`} className="file-upload-label">
            <Upload size={20} />
            {uploading ? 'Uploading...' : 'Choose Image'}
          </label>
          {value && (
            <button type="button" className="clear-btn" onClick={clearImage}>
              <X size={18} />
            </button>
          )}
        </div>
      )}

      {preview && value && (
        <div className={`image-preview ${previewClass}`}>
          <img src={value} alt={label} onError={(e) => {
            e.target.style.display = 'none';
            toast.error('Failed to load image');
          }} />
        </div>
      )}

      {!value && preview && (
        <div className="image-placeholder">
          <ImageIcon size={48} />
          <span>No image selected</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
