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
  endpoint = 'upload-image', // custom endpoint
  preview = true,
  previewClass = '',
  uniqueId = null // Add unique identifier
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (50MB for images)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Image size should be less than 50MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append(fieldName, file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/${type}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        // Handle different response formats based on endpoint
        let imageUrl;
        
        if (endpoint === 'upload-banner-image') {
          imageUrl = data.bannerImage || data.imageUrl;
        } else if (endpoint === 'upload-thumbnail-image') {
          imageUrl = data.thumbnailImage || data.imageUrl;
        } else {
          // Fallback for other endpoints
          imageUrl = data.imageUrl || data.logoUrl || data.bannerUrl || data.companyLogo || data.bannerImage || data.thumbnailImage || data.logo;
        }
        
        onChange(imageUrl);
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

  const clearImage = () => {
    onChange('');
  };

  return (
    <div className="image-upload-container">
      <label className="image-upload-label">{label}</label>
      
      <div className="file-upload-group">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          id={`file-${uniqueId || fieldName}-${endpoint}`}
          className="file-input"
          disabled={uploading}
        />
        <label htmlFor={`file-${uniqueId || fieldName}-${endpoint}`} className="file-upload-label">
          <Upload size={20} />
          {uploading ? 'Uploading...' : 'Choose Image'}
        </label>
        {value && (
          <button type="button" className="clear-btn" onClick={clearImage}>
            <X size={18} />
          </button>
        )}
      </div>

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
