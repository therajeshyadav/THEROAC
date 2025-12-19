import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import './JobFormModal.css'; // Reuse same CSS
import ImageUpload from './ImageUpload';
import MediaUpload from './MediaUpload';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const EventFormModal = ({ event, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    eventType: 'workshop', // Default event type
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
    faqs: [],
    eligibility: {},
    featured: false,
    status: 'upcoming'
  });

  const [newTag, setNewTag] = useState('');
  const [newItem, setNewItem] = useState('');


  useEffect(() => {
    if (event) {
      // Extract eventType from categories array (first category is the event type)
      const eventType = event.categories && event.categories.length > 0 ? event.categories[0] : 'workshop';
      
      setFormData({
        ...formData,
        ...event,
        eventType, // Set eventType from categories
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
        prizes: event.prizes || [],
        faqs: event.faqs || []
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

  // Agenda helper functions
  const addAgendaItem = () => {
    const newItem = { time: '', title: '', description: '', speaker: '' };
    setFormData(prev => ({
      ...prev,
      agenda: [...prev.agenda, newItem]
    }));
  };

  const updateAgendaItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeAgendaItem = (index) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  // Speaker helper functions
  const addSpeaker = () => {
    const newSpeaker = { name: '', title: '', bio: '', image: '', socials: {} };
    setFormData(prev => ({
      ...prev,
      speakers: [...prev.speakers, newSpeaker]
    }));
  };

  const updateSpeaker = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      speakers: prev.speakers.map((speaker, i) => 
        i === index ? { ...speaker, [field]: value } : speaker
      )
    }));
  };

  const removeSpeaker = (index) => {
    setFormData(prev => ({
      ...prev,
      speakers: prev.speakers.filter((_, i) => i !== index)
    }));
  };

  // Sponsor helper functions
  const addSponsor = () => {
    const newSponsor = { name: '', logo: '', tier: 'Bronze', website: '' };
    setFormData(prev => ({
      ...prev,
      sponsors: [...prev.sponsors, newSponsor]
    }));
  };

  const updateSponsor = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sponsors: prev.sponsors.map((sponsor, i) => 
        i === index ? { ...sponsor, [field]: value } : sponsor
      )
    }));
  };

  const removeSponsor = (index) => {
    setFormData(prev => ({
      ...prev,
      sponsors: prev.sponsors.filter((_, i) => i !== index)
    }));
  };

  // Prize helper functions
  const addPrize = () => {
    const newPrize = { position: '', prize: '', description: '' };
    setFormData(prev => ({
      ...prev,
      prizes: [...prev.prizes, newPrize]
    }));
  };

  const updatePrize = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.map((prize, i) => 
        i === index ? { ...prize, [field]: value } : prize
      )
    }));
  };

  const removePrize = (index) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.filter((_, i) => i !== index)
    }));
  };

  // FAQ helper functions
  const addFAQ = () => {
    const newFAQ = { question: '', answer: '' };
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, newFAQ]
    }));
  };

  const updateFAQ = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) => 
        i === index ? { ...faq, [field]: value } : faq
      )
    }));
  };

  const removeFAQ = (index) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
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

      // Map eventType to categories array (eventType becomes the first category)
      const submitData = {
        ...formData,
        categories: [formData.eventType, ...formData.categories.filter(cat => cat !== formData.eventType)]
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
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
    { id: 'agenda', label: 'Agenda & Timeline' },
    { id: 'speakers', label: 'Speakers' },
    { id: 'sponsors', label: 'Sponsors & Prizes' },
    { id: 'faq', label: 'FAQ' },
    { id: 'media', label: 'Media & Images' },
    { id: 'contact', label: 'Contact & Apply' }
  ];

  return (
    <div className="modal-overlay job-form-modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
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

                <div className="form-group">
                  <label>Event Type *</label>
                  <select 
                    name="eventType" 
                    value={formData.eventType} 
                    onChange={handleInputChange}
                    required
                  >
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="conference">Conference</option>
                    <option value="webinar">Webinar</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="competition">Competition</option>
                    <option value="networking">Networking Event</option>
                    <option value="career-fair">Career Fair</option>
                    <option value="training">Training Session</option>
                    <option value="meetup">Meetup</option>
                    <option value="other">Other</option>
                  </select>
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
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
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
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWhatToBring())}
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
                  fieldName="image"
                  previewClass="banner"
                />

                <ImageUpload
                  label="Thumbnail Image"
                  value={formData.thumbnailImage}
                  onChange={(url) => setFormData(prev => ({ ...prev, thumbnailImage: url }))}
                  type="events"
                  fieldName="image"
                />

                <MediaUpload
                  label="Event Photos & Videos"
                  value={formData.media}
                  onChange={(media) => setFormData(prev => ({ ...prev, media }))}
                  type="events"
                  maxItems={15}
                />
              </div>
            )}

            {activeTab === 'agenda' && (
              <div className="form-section">
                <h3>Event Agenda & Timeline</h3>

                <div className="agenda-section">
                  <div className="section-header">
                    <h4>Schedule</h4>
                    <button type="button" className="btn-add" onClick={addAgendaItem}>
                      <Plus size={16} /> Add Item
                    </button>
                  </div>

                  {formData.agenda.map((item, index) => (
                    <div key={index} className="agenda-item">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Time</label>
                          <input
                            type="text"
                            value={item.time}
                            onChange={(e) => updateAgendaItem(index, 'time', e.target.value)}
                            placeholder="e.g. 10:00 AM"
                          />
                        </div>
                        <div className="form-group" style={{ flex: 2 }}>
                          <label>Title</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateAgendaItem(index, 'title', e.target.value)}
                            placeholder="Session title"
                          />
                        </div>
                        <button 
                          type="button" 
                          className="btn-remove"
                          onClick={() => removeAgendaItem(index)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={item.description}
                          onChange={(e) => updateAgendaItem(index, 'description', e.target.value)}
                          placeholder="Session description"
                          rows="2"
                        />
                      </div>
                      <div className="form-group">
                        <label>Speaker (Optional)</label>
                        <input
                          type="text"
                          value={item.speaker}
                          onChange={(e) => updateAgendaItem(index, 'speaker', e.target.value)}
                          placeholder="Speaker name"
                        />
                      </div>
                    </div>
                  ))}

                  {formData.agenda.length === 0 && (
                    <div className="empty-state">
                      <p>No agenda items added yet. Click "Add Item" to create your event schedule.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'speakers' && (
              <div className="form-section">
                <h3>Event Speakers</h3>

                <div className="speakers-section">
                  <div className="section-header">
                    <h4>Speaker List</h4>
                    <button type="button" className="btn-add" onClick={addSpeaker}>
                      <Plus size={16} /> Add Speaker
                    </button>
                  </div>

                  {formData.speakers.map((speaker, index) => (
                    <div key={index} className="speaker-item">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Name</label>
                          <input
                            type="text"
                            value={speaker.name}
                            onChange={(e) => updateSpeaker(index, 'name', e.target.value)}
                            placeholder="Speaker name"
                          />
                        </div>
                        <div className="form-group">
                          <label>Title/Position</label>
                          <input
                            type="text"
                            value={speaker.title}
                            onChange={(e) => updateSpeaker(index, 'title', e.target.value)}
                            placeholder="e.g. Senior Developer"
                          />
                        </div>
                        <button 
                          type="button" 
                          className="btn-remove"
                          onClick={() => removeSpeaker(index)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="form-group">
                        <label>Bio</label>
                        <textarea
                          value={speaker.bio}
                          onChange={(e) => updateSpeaker(index, 'bio', e.target.value)}
                          placeholder="Speaker biography"
                          rows="3"
                        />
                      </div>
                      <div className="form-group">
                        <label>Profile Image URL</label>
                        <input
                          type="url"
                          value={speaker.image}
                          onChange={(e) => updateSpeaker(index, 'image', e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  ))}

                  {formData.speakers.length === 0 && (
                    <div className="empty-state">
                      <p>No speakers added yet. Click "Add Speaker" to add event speakers.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'sponsors' && (
              <div className="form-section">
                <h3>Sponsors & Prizes</h3>

                {/* Sponsors Section */}
                <div className="sponsors-section">
                  <div className="section-header">
                    <h4>Event Sponsors</h4>
                    <button type="button" className="btn-add" onClick={addSponsor}>
                      <Plus size={16} /> Add Sponsor
                    </button>
                  </div>

                  {formData.sponsors.map((sponsor, index) => (
                    <div key={index} className="sponsor-item">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Company Name</label>
                          <input
                            type="text"
                            value={sponsor.name}
                            onChange={(e) => updateSponsor(index, 'name', e.target.value)}
                            placeholder="Company name"
                          />
                        </div>
                        <div className="form-group">
                          <label>Tier</label>
                          <select
                            value={sponsor.tier}
                            onChange={(e) => updateSponsor(index, 'tier', e.target.value)}
                          >
                            <option value="Bronze">Bronze</option>
                            <option value="Silver">Silver</option>
                            <option value="Gold">Gold</option>
                            <option value="Platinum">Platinum</option>
                            <option value="Title">Title Sponsor</option>
                          </select>
                        </div>
                        <button 
                          type="button" 
                          className="btn-remove"
                          onClick={() => removeSponsor(index)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Logo URL</label>
                          <input
                            type="url"
                            value={sponsor.logo}
                            onChange={(e) => updateSponsor(index, 'logo', e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="form-group">
                          <label>Website</label>
                          <input
                            type="url"
                            value={sponsor.website}
                            onChange={(e) => updateSponsor(index, 'website', e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {formData.sponsors.length === 0 && (
                    <div className="empty-state">
                      <p>No sponsors added yet. Click "Add Sponsor" to add event sponsors.</p>
                    </div>
                  )}
                </div>

                {/* Prizes Section */}
                <div className="prizes-section" style={{ marginTop: '2rem' }}>
                  <div className="section-header">
                    <h4>Prizes & Awards</h4>
                    <button type="button" className="btn-add" onClick={addPrize}>
                      <Plus size={16} /> Add Prize
                    </button>
                  </div>

                  {formData.prizes.map((prize, index) => (
                    <div key={index} className="prize-item">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Position</label>
                          <input
                            type="text"
                            value={prize.position}
                            onChange={(e) => updatePrize(index, 'position', e.target.value)}
                            placeholder="e.g. 1st Place, Winner"
                          />
                        </div>
                        <div className="form-group">
                          <label>Prize</label>
                          <input
                            type="text"
                            value={prize.prize}
                            onChange={(e) => updatePrize(index, 'prize', e.target.value)}
                            placeholder="e.g. $10,000, Trophy"
                          />
                        </div>
                        <button 
                          type="button" 
                          className="btn-remove"
                          onClick={() => removePrize(index)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={prize.description}
                          onChange={(e) => updatePrize(index, 'description', e.target.value)}
                          placeholder="Prize description"
                          rows="2"
                        />
                      </div>
                    </div>
                  ))}

                  {formData.prizes.length === 0 && (
                    <div className="empty-state">
                      <p>No prizes added yet. Click "Add Prize" to add event prizes.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="form-section">
                <h3>Frequently Asked Questions</h3>

                <div className="faq-section">
                  <div className="section-header">
                    <h4>FAQ List</h4>
                    <button type="button" className="btn-add" onClick={addFAQ}>
                      <Plus size={16} /> Add FAQ
                    </button>
                  </div>

                  {formData.faqs.map((faq, index) => (
                    <div key={index} className="faq-item">
                      <div className="faq-header">
                        <h5>FAQ #{index + 1}</h5>
                        <button 
                          type="button" 
                          className="btn-remove"
                          onClick={() => removeFAQ(index)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="form-group">
                        <label>Question</label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                          placeholder="Enter the question..."
                        />
                      </div>
                      <div className="form-group">
                        <label>Answer</label>
                        <textarea
                          value={faq.answer}
                          onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                          placeholder="Enter the answer..."
                          rows="4"
                        />
                      </div>
                    </div>
                  ))}

                  {formData.faqs.length === 0 && (
                    <div className="empty-state">
                      <p>No FAQs added yet. Click "Add FAQ" to add frequently asked questions.</p>
                    </div>
                  )}
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
