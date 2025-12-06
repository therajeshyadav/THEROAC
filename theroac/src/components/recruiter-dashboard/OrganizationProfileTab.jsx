import { useState, useEffect } from 'react';
import { Building2, Globe, Mail, Phone, MapPin, Save, Upload } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import axios from 'axios';
import { toast } from 'react-toastify';
import './OrganizationProfileTab.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const OrganizationProfileTab = ({ authUser }) => {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    industry: '',
    companySize: '',
    foundedYear: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: ''
    }
  });

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/organizations/my-organizations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.organizations && response.data.organizations.length > 0) {
        const org = response.data.organizations[0];
        setOrganization(org);
        setFormData({
          name: org.name || '',
          description: org.description || '',
          website: org.website || '',
          email: org.email || '',
          phone: org.phone || '',
          industry: org.industry || '',
          companySize: org.companySize || '',
          foundedYear: org.foundedYear || '',
          address: org.address || {
            street: '',
            city: '',
            state: '',
            country: '',
            zipCode: ''
          },
          socialLinks: org.socialLinks || {
            linkedin: '',
            twitter: '',
            facebook: '',
            instagram: ''
          }
        });
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
      toast.error('Failed to load organization profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      if (organization) {
        // Update existing organization
        await axios.put(
          `${API_URL}/organizations/${organization.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Organization updated successfully!');
      } else {
        // Create new organization
        await axios.post(
          `${API_URL}/organizations`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Organization created successfully!');
      }

      fetchOrganization();
    } catch (error) {
      console.error('Error saving organization:', error);
      toast.error(error.response?.data?.error || 'Failed to save organization');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="organization-profile-container">
      <style>{`
        .organization-profile-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .profile-header {
          margin-bottom: 2rem;
        }

        .profile-header h2 {
          color: #fff;
          margin: 0 0 0.5rem 0;
        }

        .profile-header p {
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }

        .profile-form {
          display: grid;
          gap: 2rem;
        }

        .form-section {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 2rem;
        }

        .section-title {
          color: #FFD600;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 1.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-grid.single {
          grid-template-columns: 1fr;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          color: #fff;
          margin-bottom: 0.5rem;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #FFD600;
          background: rgba(255, 255, 255, 0.08);
        }

        .form-group textarea {
          min-height: 120px;
          resize: vertical;
        }

        .save-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: #FFD600;
          color: #000;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s;
          margin-top: 2rem;
        }

        .save-btn:hover {
          background: #FFC107;
          transform: translateY(-2px);
        }

        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>

      <div className="profile-header">
        <h2>Organization Profile</h2>
        <p>Manage your organization information and settings</p>
      </div>

      <div className="profile-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3 className="section-title">
            <Building2 className="w-5 h-5" />
            Basic Information
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Organization Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter organization name"
              />
            </div>
            <div className="form-group">
              <label>Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                placeholder="e.g., Technology, Healthcare"
              />
            </div>
            <div className="form-group">
              <label>Company Size</label>
              <select
                value={formData.companySize}
                onChange={(e) => handleInputChange('companySize', e.target.value)}
              >
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
            <div className="form-group">
              <label>Founded Year</label>
              <input
                type="number"
                value={formData.foundedYear}
                onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                placeholder="e.g., 2020"
              />
            </div>
          </div>
          <div className="form-grid single" style={{ marginTop: '1.5rem' }}>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell us about your organization..."
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <h3 className="section-title">
            <Mail className="w-5 h-5" />
            Contact Information
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@company.com"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.company.com"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="form-section">
          <h3 className="section-title">
            <MapPin className="w-5 h-5" />
            Address
          </h3>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Street Address</label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                placeholder="123 Main Street"
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                placeholder="San Francisco"
              />
            </div>
            <div className="form-group">
              <label>State/Province</label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                placeholder="California"
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                value={formData.address.country}
                onChange={(e) => handleNestedChange('address', 'country', e.target.value)}
                placeholder="United States"
              />
            </div>
            <div className="form-group">
              <label>ZIP/Postal Code</label>
              <input
                type="text"
                value={formData.address.zipCode}
                onChange={(e) => handleNestedChange('address', 'zipCode', e.target.value)}
                placeholder="94102"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="form-section">
          <h3 className="section-title">
            <Globe className="w-5 h-5" />
            Social Media
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label>LinkedIn</label>
              <input
                type="url"
                value={formData.socialLinks.linkedin}
                onChange={(e) => handleNestedChange('socialLinks', 'linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/..."
              />
            </div>
            <div className="form-group">
              <label>Twitter</label>
              <input
                type="url"
                value={formData.socialLinks.twitter}
                onChange={(e) => handleNestedChange('socialLinks', 'twitter', e.target.value)}
                placeholder="https://twitter.com/..."
              />
            </div>
            <div className="form-group">
              <label>Facebook</label>
              <input
                type="url"
                value={formData.socialLinks.facebook}
                onChange={(e) => handleNestedChange('socialLinks', 'facebook', e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="form-group">
              <label>Instagram</label>
              <input
                type="url"
                value={formData.socialLinks.instagram}
                onChange={(e) => handleNestedChange('socialLinks', 'instagram', e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>
        </div>

        <button
          className="save-btn"
          onClick={handleSave}
          disabled={saving || !formData.name}
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default OrganizationProfileTab;
