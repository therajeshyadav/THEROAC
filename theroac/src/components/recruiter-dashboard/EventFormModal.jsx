import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import './JobFormModal.css'; // Reuse same CSS
import ImageUpload from './ImageUpload';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const EventFormModal = ({ event, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    locationType: 'online',
    location: '',
    venue: '',
    city: '',
    state: '',
    country: '',
    venueAddress: '',
    mapLink: '',
    
    // Event Details
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: '',
    registrationFee: { amount: '', currency: 'USD', type: 'free' },
    registrationLink: '',
    
    // Content
    tags: [],
    categories: [],
    requirements: '',
    whatToBring: [],
    
    // Media
    bannerImage: '',
    thumbnailImage: '',
    media: [],
    
    // Contact
    contactInfo: { email: '', phone: '', website: '' },
    socials: { facebook: '', twitter: '', linkedin: '', instagram: '' },
    
    // Advanced
    agenda: [],
    speakers: [],
    sponsors: [],
    prizes: [],
    eligibility: {},
    featured: false,
    status: 'upcoming'
  });

  const [newTag, setNewTag] = useState('');
  const [newItem, setNewItem] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState('image');

  useEffect(() => {
    if (event) {
      setFormData({
        ...formData,
        ...event,
        registrationFee: event.registrationFee || { amount: '', currency: 'USD', type: 'free' },
        contactInfo: event.contactInfo || { email: '', phone: '', website: '' },
        socials: event.socials || { facebook: '', twitter: '', linkedin: '', instagram: '' },
        tags: event.tags || [],
        categories: event.categories || [],
        whatToBring: event.whatToBring || [],
        media: event.media || [],
        agenda: event.agenda || [],
        speakers: event.speakers || [],
        sponsors: event.sponsors || [],
        prizes: event.prizes || []
      });
    }
  }, [event]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addWhatToBring = () => {
    if (newItem.trim() && !formData.whatToBring.includes(newItem.trim())) {
      setFormData(prev => ({
        ...prev,
        whatToBring: [...prev.whatToBring, newItem.trim()]
      }));
      setNewItem('');
    }
  };

  const removeWhatToBring = (item) => {
    setFormData(prev => ({
      ...prev,
      whatToBring: prev.whatToBring.filter(i => i !== item)
    }));
  };

  const addMedia = () => {
    if (newMediaUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        media: [...prev.media, { type: newMediaType, url: newMediaUrl.trim() }]
      }));
      setNewMediaUrl('');
    }
  };

  const removeMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = event 
        ? `${API_URL}/events/${event.id}`
        : `${API_URL}/events`;
      
      const method = event ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (event) {
          toast.success('Event updated successfully!');
        } else {
          // Show approval message for new events
          if (data.requiresApproval) {
            toast.success('Event created successfully! It will be visible after admin approval.', {
              autoClose: 5000,
              style: {
                background: '#fff8e1',
                color: '#d97706',
                border: '1px solid #ffd600'
              }
            });
          } else {
            toast.success('Event created successfully!');
          }
        }
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save event');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'details', label: 'Event Details' },
    { id: 'location', label: 'Location' },
    { id: 'media', label: 'Media & Images' },
    { id: 'contact', label: 'Contact & Apply' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="job-form-modal modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event ? 'Edit Event' : 'Create New Event'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {activeTab === 'basic' && (
              <div className="form-section">
                <h3>Basic Information</h3>
                
                <div className="form-group">
                  <label>Event Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Tech Career Fair 2024"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your event..."
                    rows="6"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date *</label>
                    <input
                      type="datetime-local"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Tags</label>
                  <div className="tags-input">
                    <div className="tags-list">
                      {formData.tags.map(tag => (
                        <span key={tag} className="tag">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)}>
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="tag-input-row">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add tag..."
                      />
                      <button type="button" className="btn-add" onClick={addTag}>
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                    />
                    Featured Event
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="form-section">
                <h3>Event Details</h3>

                <div className="form-group">
                  <label>Registration Deadline</label>
                  <input
                    type="datetime-local"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Max Participants</label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div className="form-group">
                  <label>Registration Fee Type</label>
                  <select 
                    value={formData.registrationFee.type}
                    onChange={(e) => handleNestedChange('registrationFee', 'type', e.target.value)}
                  >
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                {formData.registrationFee.type === 'paid' && (
                  <div className="salary-inputs">
                    <input
                      type="number"
                      value={formData.registrationFee.amount}
                      onChange={(e) => handleNestedChange('registrationFee', 'amount', e.target.value)}
                      placeholder="Amount"
                    />
                    <select
                      value={formData.registrationFee.currency}
                      onChange={(e) => handleNestedChange('registrationFee', 'currency', e.target.value)}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="INR">INR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Registration Link</label>
                  <input
                    type="url"
                    name="registrationLink"
                    value={formData.registrationLink}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group">
                  <label>Requirements</label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder="What participants need to know or have..."
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>What to Bring</label>
                  <div className="tags-input">
                    <div className="tags-list">
                      {formData.whatToBring.map(item => (
                        <span key={item} className="tag">
                          {item}
                          <button type="button" onClick={() => removeWhatToBring(item)}>
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="tag-input-row">
                      <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWhatToBring())}
                        placeholder="Add item..."
                      />
                      <button type="button" className="btn-add" onClick={addWhatToBring}>
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="form-section">
                <h3>Location Details</h3>

                <div className="form-group">
                  <label>Location Type *</label>
                  <select name="locationType" value={formData.locationType} onChange={handleInputChange}>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                {(formData.locationType === 'offline' || formData.locationType === 'hybrid') && (
                  <>
                    <div className="form-group">
                      <label>Venue Name</label>
                      <input
                        type="text"
                        name="venue"
                        value={formData.venue}
                        onChange={handleInputChange}
                        placeholder="e.g. Tech Hub Conference Center"
                      />
                    </div>

                    <div className="form-group">
                      <label>Venue Address</label>
                      <textarea
                        name="venueAddress"
                        value={formData.venueAddress}
                        onChange={handleInputChange}
                        placeholder="Full address..."
                        rows="3"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Country</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Map Link (Google Maps)</label>
                      <input
                        type="url"
                        name="mapLink"
                        value={formData.mapLink}
                        onChange={handleInputChange}
                        placeholder="https://maps.google.com/..."
                      />
                    </div>
                  </>
                )}

                {(formData.locationType === 'online' || formData.locationType === 'hybrid') && (
                  <div className="form-group">
                    <label>Online Platform/Link</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Zoom, Google Meet, or meeting link"
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'media' && (
              <div className="form-section">
                <h3>Media & Images</h3>

                <ImageUpload
                  label="Banner Image"
                  value={formData.bannerImage}
                  onChange={(url) => setFormData(prev => ({ ...prev, bannerImage: url }))}
                  type="events"
                  fieldName="bannerImage"
                  previewClass="banner"
                />

                <ImageUpload
                  label="Thumbnail Image"
                  value={formData.thumbnailImage}
                  onChange={(url) => setFormData(prev => ({ ...prev, thumbnailImage: url }))}
                  type="events"
                  fieldName="thumbnailImage"
                />

                <div className="form-group">
                  <label>Additional Media</label>
                  {formData.media.length > 0 && (
                    <div className="media-list">
                      {formData.media.map((item, index) => (
                        <div key={index} className="media-item">
                          <span className="media-type">{item.type}</span>
                          <span className="media-url">{item.url}</span>
                          <button type="button" className="btn-remove" onClick={() => removeMedia(index)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="media-input-group">
                    <select value={newMediaType} onChange={(e) => setNewMediaType(e.target.value)}>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                    <input
                      type="url"
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      placeholder="Media URL..."
                    />
                    <button type="button" className="btn-add" onClick={addMedia}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="form-section">
                <h3>Contact Information</h3>

                <div className="contact-inputs">
                  <div className="form-group">
                    <label>Contact Email</label>
                    <input
                      type="email"
                      value={formData.contactInfo.email}
                      onChange={(e) => handleNestedChange('contactInfo', 'email', e.target.value)}
                      placeholder="contact@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.contactInfo.phone}
                      onChange={(e) => handleNestedChange('contactInfo', 'phone', e.target.value)}
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      value={formData.contactInfo.website}
                      onChange={(e) => handleNestedChange('contactInfo', 'website', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <h3 style={{ marginTop: '2rem' }}>Social Media</h3>

                <div className="social-inputs">
                  <div className="form-group">
                    <label>Facebook</label>
                    <input
                      type="url"
                      value={formData.socials.facebook}
                      onChange={(e) => handleNestedChange('socials', 'facebook', e.target.value)}
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Twitter</label>
                    <input
                      type="url"
                      value={formData.socials.twitter}
                      onChange={(e) => handleNestedChange('socials', 'twitter', e.target.value)}
                      placeholder="https://twitter.com/..."
                    />
                  </div>

                  <div className="form-group">
                    <label>LinkedIn</label>
                    <input
                      type="url"
                      value={formData.socials.linkedin}
                      onChange={(e) => handleNestedChange('socials', 'linkedin', e.target.value)}
                      placeholder="https://linkedin.com/..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Instagram</label>
                    <input
                      type="url"
                      value={formData.socials.instagram}
                      onChange={(e) => handleNestedChange('socials', 'instagram', e.target.value)}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;
