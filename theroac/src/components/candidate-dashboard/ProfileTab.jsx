// src/components/candidate-dashboard/ProfileTab.jsx
import React from 'react';
import { User } from 'lucide-react';

const ProfileTab = ({
  authUser,
  profileCompletion,
  isEditingProfile,
  profileData,
  onEditProfile,
  onSaveProfile,
  onCancelEdit,
  onProfileInputChange
}) => {
  return (
    <div className="tab-content">
      <div className="row">
        {/* Left summary card */}
        <div className="col-lg-4 mb-4">
          <div className="dashboard-card">
            <div className="profile-summary">
              <div className="profile-image-section">
                <div className="profile-icon-circle">
                  <User size={80} strokeWidth={1.5} />
                </div>
                <button className="change-photo-btn">
                  <i className="fas fa-camera" />
                </button>
              </div>
              <h4>{authUser?.fullName || authUser?.name || 'User'}</h4>
              <p>{authUser?.email || 'user@example.com'}</p>
              <div className="profile-completion-mini">
                <span>Profile: {profileCompletion}% Complete</span>
                <div className="mini-progress">
                  <div
                    className="mini-progress-fill"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right detail / form card */}
        <div className="col-lg-8">
          <div
            className="dashboard-card"
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,214,0,0.2)',
              borderRadius: '20px',
              padding: '2rem'
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '2rem',
                paddingBottom: '2rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div>
                <h3
                  style={{
                    color: '#fff',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    margin: '0 0 0.5rem 0'
                  }}
                >
                  {authUser?.fullName || authUser?.name || 'Candidate'}
                </h3>
                <span
                  style={{
                    color: 'rgba(255,214,0,0.9)',
                    fontSize: '0.9rem',
                    background: 'rgba(255,214,0,0.2)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    display: 'inline-block'
                  }}
                >
                  Candidate
                </span>
              </div>
              {!isEditingProfile && (
                <button
                  className="btn-host"
                  onClick={onEditProfile}
                  style={{
                    background: '#FFD600',
                    color: '#1A1719',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '25px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Edit / View section */}
            {isEditingProfile ? (
              <div className="profile-form">
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1.5rem',
                    marginBottom: '1.5rem'
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: 'rgba(255,255,255,0.8)',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.fullName}
                      onChange={(e) => onProfileInputChange('fullName', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,214,0,0.3)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: 'rgba(255,255,255,0.8)',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={profileData.email}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: 'rgba(255,255,255,0.5)',
                        cursor: 'not-allowed'
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: 'rgba(255,255,255,0.8)',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      value={profileData.phone}
                      onChange={(e) => onProfileInputChange('phone', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,214,0,0.3)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: 'rgba(255,255,255,0.8)',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      City
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.city}
                      placeholder="Add city"
                      onChange={(e) => onProfileInputChange('city', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,214,0,0.3)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: 'rgba(255,255,255,0.8)',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      State
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.state}
                      placeholder="Add state"
                      onChange={(e) => onProfileInputChange('state', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,214,0,0.3)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: 'rgba(255,255,255,0.8)',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.country}
                      placeholder="Add country"
                      onChange={(e) => onProfileInputChange('country', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,214,0,0.3)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div className="col-12 mb-3">
                    <label
                      style={{
                        display: 'block',
                        color: 'rgba(255,255,255,0.8)',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      Professional Summary
                    </label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={profileData.bio}
                      placeholder="Tell us about yourself..."
                      onChange={(e) => onProfileInputChange('bio', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,214,0,0.3)',
                        borderRadius: '8px',
                        color: '#fff',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end',
                    marginTop: '1.5rem'
                  }}
                >
                  <button
                    className="btn-cancel"
                    onClick={onCancelEdit}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '25px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-host"
                    onClick={onSaveProfile}
                    style={{
                      background: '#FFD600',
                      color: '#1A1719',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '25px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-view">
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1.5rem'
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: 'rgba(255,255,255,0.6)',
                        marginBottom: '0.5rem',
                        fontSize: '0.85rem'
                      }}
                    >
                      Full Name
                    </label>
                    <p style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>
                      {authUser?.fullName || authUser?.name || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: 'rgba(255,255,255,0.6)',
                        marginBottom: '0.5rem',
                        fontSize: '0.85rem'
                      }}
                    >
                      Email
                    </label>
                    <p style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>
                      {authUser?.email || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: 'rgba(255,255,255,0.6)',
                        marginBottom: '0.5rem',
                        fontSize: '0.85rem'
                      }}
                    >
                      Phone
                    </label>
                    <p style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>
                      {authUser?.phone || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: 'rgba(255,255,255,0.6)',
                        marginBottom: '0.5rem',
                        fontSize: '0.85rem'
                      }}
                    >
                      Location
                    </label>
                    <p style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>
                      {[authUser?.city, authUser?.state, authUser?.country]
                        .filter(Boolean)
                        .join(', ') || 'Not set'}
                    </p>
                  </div>
                </div>
                {authUser?.bio && (
                  <div
                    style={{
                      marginTop: '1.5rem',
                      paddingTop: '1.5rem',
                      borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <label
                      style={{
                        display: 'block',
                        color: 'rgba(255,255,255,0.6)',
                        marginBottom: '0.5rem',
                        fontSize: '0.85rem'
                      }}
                    >
                      Professional Summary
                    </label>
                    <p
                      style={{
                        color: '#fff',
                        margin: 0,
                        fontSize: '1rem',
                        lineHeight: '1.6'
                      }}
                    >
                      {authUser.bio}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
