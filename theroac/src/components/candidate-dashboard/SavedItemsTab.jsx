// src/components/candidate-dashboard/SavedItemsTab.jsx
import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, Calendar, MapPin, Building, Clock, Eye, RefreshCw } from 'lucide-react';
import apiService from '../../services/api';
import { createJobURL, createEventURL, createHubContentURL } from '../../utils/urlUtils';
import { useNavigate } from 'react-router-dom';
import './SavedItemsTab.css';

const SavedItemsTab = () => {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState('bookmarks');
  const [bookmarkedItems, setBookmarkedItems] = useState([]);
  const [likedItems, setLikedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedItems();
  }, []);

  // Refresh saved items when tab becomes active
  useEffect(() => {
    const handleFocus = () => {
      loadSavedItems();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadSavedItems = async () => {
    try {
      setLoading(true);
      console.log('Loading saved items...');
      
      const [bookmarksResponse, likesResponse] = await Promise.allSettled([
        apiService.getMyBookmarks(),
        apiService.getMyLikes()
      ]);

      console.log('Bookmarks response:', bookmarksResponse);
      console.log('Likes response:', likesResponse);

      if (bookmarksResponse.status === 'fulfilled') {
        console.log('Full bookmarks response value:', bookmarksResponse.value);
        // Try different possible response formats
        const bookmarks = bookmarksResponse.value.bookmarks || 
                         bookmarksResponse.value || 
                         [];
        console.log('Setting bookmarked items:', bookmarks);
        setBookmarkedItems(bookmarks);
      } else {
        console.error('Bookmarks request failed:', bookmarksResponse.reason);
      }

      if (likesResponse.status === 'fulfilled') {
        console.log('Full likes response value:', likesResponse.value);
        // Try different possible response formats
        const likes = likesResponse.value.likes || 
                     likesResponse.value || 
                     [];
        console.log('Setting liked items:', likes);
        setLikedItems(likes);
      } else {
        console.error('Likes request failed:', likesResponse.reason);
      }
    } catch (error) {
      console.error('Error loading saved items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (item) => {
    console.log('SavedItemsTab - handleViewDetails item:', item);
    const itemData = item.Job || item.Event || item.HubContent || item;
    console.log('SavedItemsTab - itemData:', itemData);
    let url;
    
    try {
      if (item.itemType === 'jobs') {
        // Use createJobURL for jobs
        const jobData = {
          slug: itemData?.slug,
          title: itemData?.title || 'Job',
          company: itemData?.companyName || itemData?.company || 'Company'
        };
        console.log('SavedItemsTab - jobData for URL:', jobData);
        url = createJobURL(jobData);
      } else if (item.itemType === 'events') {
        // Use createEventURL for events
        const eventData = {
          slug: itemData?.slug,
          title: itemData?.title || 'Event'
        };
        console.log('SavedItemsTab - eventData for URL:', eventData);
        url = createEventURL(eventData);
      } else if (item.itemType === 'internships') {
        // Use createHubContentURL for internships/hub content
        const hubData = {
          slug: itemData?.slug,
          title: itemData?.title || 'Internship'
        };
        console.log('SavedItemsTab - hubData for URL:', hubData);
        url = createHubContentURL(hubData);
      } else {
        // Fallback for unknown types
        url = `/event-detail/${item.itemType}/${item.itemId}`;
      }
      
      console.log('SavedItemsTab - Generated URL:', url);
      navigate(url);
    } catch (error) {
      console.error('SavedItemsTab - Error generating URL:', error);
      // Fallback to ID-based URL like EventSlider does
      const id = item.itemId || '1';
      const type = item.itemType === 'jobs' ? 'jobs' : 
                   item.itemType === 'events' ? 'events' : 
                   item.itemType === 'internships' ? 'internships' : 'jobs';
      url = `/event-detail/${type}/${id}`;
      console.log('SavedItemsTab - Fallback URL:', url);
      navigate(url);
    }
  };

  const handleRemoveBookmark = async (itemId, itemType) => {
    try {
      await apiService.toggleBookmark(itemId, itemType);
      setBookmarkedItems(prev => prev.filter(item => 
        !(item.itemId === itemId && item.itemType === itemType)
      ));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const handleRemoveLike = async (itemId, itemType) => {
    try {
      await apiService.toggleLike(itemId, itemType);
      setLikedItems(prev => prev.filter(item => 
        !(item.itemId === itemId && item.itemType === itemType)
      ));
    } catch (error) {
      console.error('Error removing like:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getItemTypeIcon = (itemType) => {
    switch (itemType) {
      case 'job':
        return <Building size={16} className="item-type-icon job" />;
      case 'event':
        return <Calendar size={16} className="item-type-icon event" />;
      case 'internship':
        return <Clock size={16} className="item-type-icon internship" />;
      default:
        return <Building size={16} className="item-type-icon" />;
    }
  };

  const renderItemCard = (item, type) => {
    console.log('Rendering item:', item);
    const itemData = item.Job || item.Event || item.HubContent || item;
    
    return (
      <div key={`${item.itemType}-${item.itemId}`} className="saved-item-card">
        <div className="saved-item-header">
          <div className="item-type-badge">
            {getItemTypeIcon(item.itemType)}
            <span className="item-type-text">
              {item.itemType === 'job' ? 'Job' : 
               item.itemType === 'event' ? 'Event' : 
               item.itemType === 'internship' ? 'Internship' : 'Opportunity'}
            </span>
          </div>
          <div className="saved-item-actions">
            <button
              className="action-btn view-btn"
              onClick={() => handleViewDetails(item)}
              title="View Details"
            >
              <Eye size={16} />
              <span>View</span>
            </button>
            {type === 'bookmark' ? (
              <button
                className="action-btn remove-btn bookmark-remove"
                onClick={() => handleRemoveBookmark(item.itemId, item.itemType)}
                title="Remove Bookmark"
              >
                <Bookmark size={16} fill="currentColor" />
                <span>Remove</span>
              </button>
            ) : (
              <button
                className="action-btn remove-btn like-remove"
                onClick={() => handleRemoveLike(item.itemId, item.itemType)}
                title="Remove Like"
              >
                <Heart size={16} fill="currentColor" />
                <span>Unlike</span>
              </button>
            )}
          </div>
        </div>

        <div className="saved-item-content">
          <h3 className="item-title">
            {itemData?.title || 
             (item.itemType === 'jobs' ? 'Job ' : 
              item.itemType === 'events' ? 'Event' : 
              item.itemType === 'internships' ? 'Internship ' : 'Opportunity')}
          </h3>
          <div className="item-meta">
            <div className="meta-item">
              <Building size={14} />
              <span>{itemData?.companyName || itemData?.organizerName || itemData?.company || 'Company'}</span>
            </div>
            {itemData?.location && (
              <div className="meta-item">
                <MapPin size={14} />
                <span>{itemData.location}</span>
              </div>
            )}
            
            {/* Show salary for jobs/internships */}
            {(item.itemType === 'jobs' || item.itemType === 'internships') && (
              <div className="meta-item">
                <span style={{ color: '#FFD600', marginRight: '4px' }}>₹</span>
                <span>
                  {item.itemType === 'internships' && itemData?.stipend ? (
                    typeof itemData.stipend === 'object' 
                      ? `${itemData.stipend.currency || '₹'}${itemData.stipend.amount}/${itemData.stipend.period || 'month'}`
                      : itemData.stipend
                  ) : itemData?.salary ? (
                    typeof itemData.salary === 'object' && itemData.salary !== null
                      ? (itemData.salary.min && itemData.salary.max 
                          ? `${itemData.salary.currency || '₹'}${itemData.salary.min} - ${itemData.salary.currency || '₹'}${itemData.salary.max}` 
                          : itemData.salary.min 
                            ? `${itemData.salary.currency || '₹'}${itemData.salary.min}+` 
                            : 'Competitive')
                      : itemData.salary
                  ) : 'Competitive'}
                </span>
              </div>
            )}
            
            {/* Show event date for events */}
            {item.itemType === 'events' && itemData?.date && (
              <div className="meta-item">
                <span style={{ color: '#FFD600', marginRight: '4px' }}>📅</span>
                <span>{new Date(itemData.date).toLocaleDateString()}</span>
              </div>
            )}
            
            {/* Show job type/experience */}
            {(item.itemType === 'jobs' || item.itemType === 'internships') && (
              <div className="meta-item">
                <span style={{ color: '#FFD600', marginRight: '4px' }}>💼</span>
                <span>
                  {item.itemType === 'internships' 
                    ? (itemData?.duration || 'Internship')
                    : (itemData?.jobType || itemData?.type || 'Full-time')} • {itemData?.experienceLevel || itemData?.experience || 'All levels'}
                </span>
              </div>
            )}
            
            {/* Show event type for events */}
            {item.itemType === 'events' && (
              <div className="meta-item">
                <span style={{ color: '#FFD600', marginRight: '4px' }}>🎯</span>
                <span>{itemData?.type || itemData?.category || 'Event'}</span>
              </div>
            )}
            
            <div className="meta-item">
              <Clock size={14} />
              <span>Saved on {formatDate(item.createdAt)}</span>
            </div>
          </div>
          
          {/* Show skills/tags if available */}
          {itemData?.skills && Array.isArray(itemData.skills) && itemData.skills.length > 0 && (
            <div className="item-skills" style={{ marginTop: '12px', marginBottom: '8px' }}>
              {itemData.skills.slice(0, 3).map((skill, index) => (
                <span key={index} style={{
                  display: 'inline-block',
                  background: 'rgba(255, 214, 0, 0.2)',
                  color: '#FFD600',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  marginRight: '6px',
                  marginBottom: '4px'
                }}>
                  {skill}
                </span>
              ))}
              {itemData.skills.length > 3 && (
                <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
                  +{itemData.skills.length - 3} more
                </span>
              )}
            </div>
          )}
          
          {/* Show description if available, otherwise show key details */}
          {itemData?.description ? (
            <p className="item-description">
              {itemData.description.length > 120 
                ? `${itemData.description.substring(0, 120)}...` 
                : itemData.description}
            </p>
          ) : (
            <p className="item-description" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {item.itemType === 'jobs' && `${itemData?.jobType || 'Full-time'} position at ${itemData?.companyName || 'Company'}`}
              {item.itemType === 'events' && `${itemData?.type || 'Event'} organized by ${itemData?.organizerName || itemData?.organizer || 'Organizer'}`}
              {item.itemType === 'internships' && `${itemData?.duration || 'Internship'} opportunity at ${itemData?.companyName || itemData?.company || 'Company'}`}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="saved-items-tab">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading saved items...</p>
        </div>
      </div>
    );
  }

  const currentItems = activeSubTab === 'bookmarks' ? bookmarkedItems : likedItems;

  return (
    <div className="saved-items-tab">
      <div className="saved-items-header">
        <div className="header-content">
          <div>
            <h2>Saved Items</h2>
            <p>Manage your bookmarked and liked opportunities</p>
          </div>
          <button
            className="refresh-btn"
            onClick={loadSavedItems}
            disabled={loading}
            title="Refresh saved items"
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      <div className="saved-items-nav">
        <button
          className={`nav-btn ${activeSubTab === 'bookmarks' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('bookmarks')}
        >
          <Bookmark size={18} />
          <span>Bookmarks ({bookmarkedItems.length})</span>
        </button>
        <button
          className={`nav-btn ${activeSubTab === 'likes' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('likes')}
        >
          <Heart size={18} />
          <span>Liked Items ({likedItems.length})</span>
        </button>
      </div>

      <div className="saved-items-content">
        {currentItems.length === 0 ? (
          <div className="empty-state">
            {activeSubTab === 'bookmarks' ? (
              <>
                <Bookmark size={48} className="empty-icon" />
                <h3>No Bookmarks Yet</h3>
                <p>Start bookmarking jobs and events you're interested in!</p>
              </>
            ) : (
              <>
                <Heart size={48} className="empty-icon" />
                <h3>No Liked Items Yet</h3>
                <p>Like jobs and events to save them here for quick access!</p>
              </>
            )}
          </div>
        ) : (
          <div className="saved-items-grid">
            {currentItems.map(item => renderItemCard(item, activeSubTab === 'bookmarks' ? 'bookmark' : 'like'))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedItemsTab;