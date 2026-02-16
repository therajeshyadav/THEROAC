import React, { useState } from 'react';
import { Upload, X, Image } from 'lucide-react';
import '../StepStyles.css';

const BannerThemeStep = ({ formData, setFormData }) => {
  const [bannerWebPreview, setBannerWebPreview] = useState(formData.bannerImage || null);
  const [bannerMobilePreview, setBannerMobilePreview] = useState(formData.mobileBanner || null);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleBannerWebUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerWebPreview(reader.result);
        handleChange('bannerImage', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerMobileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerMobilePreview(reader.result);
        handleChange('mobileBanner', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBannerWeb = () => {
    setBannerWebPreview(null);
    handleChange('bannerImage', null);
  };

  const removeBannerMobile = () => {
    setBannerMobilePreview(null);
    handleChange('mobileBanner', null);
  };

  const themeColors = [
    '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', 
    '#8D6E63', '#FF8A65', '#FF5722', '#D84315', '#4CAF50',
    '#009688', '#673AB7', '#5E35B1', '#512DA8', '#4527A0',
    '#E91E63', '#424242'
  ];

  return (
    <div className="unified-step-container">
      <div className="unified-step-header">
        <h2 className="unified-step-title">Banner / Theme</h2>
        <p className="unified-step-description">
          Default banners will be applied if no custom desktop or mobile banners are uploaded. You can update them anytime and choose from available color themes.
        </p>
      </div>

      <div className="unified-form-grid">
        {/* Banner Settings Header */}
        <div className="unified-form-group unified-full-width">
          <h3 style={{ fontSize: '1.1rem', color: '#FFD600', marginBottom: '0.5rem' }}>
            Banner Settings
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem' }}>
            You can upload custom banners. We recommend uploading both mobile and desktop banners
          </p>
        </div>

        {/* Banner for web / Thumbnail */}
        <div className="unified-form-group unified-full-width">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <label className="unified-form-label">Banner for web / Thumbnail</label>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>1920×557</span>
          </div>
          
          {!bannerWebPreview ? (
            <label 
              htmlFor="banner-web-upload" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 2rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '2px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = '#FFD600';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                padding: '0.25rem 0.75rem',
                background: '#000',
                borderRadius: '4px',
                fontSize: '0.75rem',
                color: '#fff',
                fontWeight: '600'
              }}>
                No file chosen
              </div>
              <Upload size={48} style={{ color: '#FFD600', marginBottom: '1rem' }} />
              <div style={{ fontSize: '1rem', color: '#FFD600', marginBottom: '0.5rem', fontWeight: '600' }}>
                Choose file
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                Recommended image resolution is 1920×557
              </div>
              <input
                id="banner-web-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleBannerWebUpload}
              />
            </label>
          ) : (
            <div style={{ position: 'relative' }}>
              <img 
                src={bannerWebPreview} 
                alt="Banner web preview" 
                style={{ 
                  width: '100%', 
                  height: '200px', 
                  objectFit: 'cover', 
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }} 
              />
              <button 
                onClick={removeBannerWeb}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  padding: '0.5rem',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Banner for mobile / Thumbnail */}
        <div className="unified-form-group unified-full-width">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <label className="unified-form-label">Banner for mobile / Thumbnail</label>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>700×400</span>
          </div>
          
          {!bannerMobilePreview ? (
            <label 
              htmlFor="banner-mobile-upload" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 2rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '2px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = '#FFD600';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                padding: '0.25rem 0.75rem',
                background: '#000',
                borderRadius: '4px',
                fontSize: '0.75rem',
                color: '#fff',
                fontWeight: '600'
              }}>
                No file chosen
              </div>
              <Upload size={48} style={{ color: '#FFD600', marginBottom: '1rem' }} />
              <div style={{ fontSize: '1rem', color: '#FFD600', marginBottom: '0.5rem', fontWeight: '600' }}>
                Choose file
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                Recommended image resolution is 700×400
              </div>
              <input
                id="banner-mobile-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleBannerMobileUpload}
              />
            </label>
          ) : (
            <div style={{ position: 'relative' }}>
              <img 
                src={bannerMobilePreview} 
                alt="Banner mobile preview" 
                style={{ 
                  width: '100%', 
                  height: '200px', 
                  objectFit: 'cover', 
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }} 
              />
              <button 
                onClick={removeBannerMobile}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  padding: '0.5rem',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Theme Color */}
        <div className="unified-form-group unified-full-width" style={{ marginTop: '2rem' }}>
          <label className="unified-form-label" style={{ marginBottom: '1rem' }}>Theme color</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {themeColors.map((color) => (
              <div
                key={color}
                onClick={() => handleChange('themeColor', color)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: color,
                  cursor: 'pointer',
                  border: formData.themeColor === color ? '3px solid #FFD600' : '3px solid transparent',
                  boxShadow: formData.themeColor === color ? '0 0 0 2px rgba(255, 214, 0, 0.3)' : 'none',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (formData.themeColor !== color) {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {formData.themeColor === color && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: color
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerThemeStep;
