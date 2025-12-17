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
    // Create a simple URL based on itemType and itemId
    let url;
    if (item.itemType === 'job' || item.itemType === 'jobs') {
      url = `/event-detail/jobs/${item.itemId}`;
    } else if (item.itemType === 'event' || item.itemType === 'events') {
      url = `/event-detail/events/${item.itemId}`;
    } else if (item.itemType === 'internship' || item.itemType === 'internships') {
      url = `/event-detail/internships/${item.itemId}`;
    } else {
      url = `/event-detail/${item.itemType}/${item.itemId}`;
    }
    navigate(url);
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
            {itemData?.title || `${item.itemType} - ${item.itemId?.substring(0, 8)}`}
          </h3>
          <div className="item-meta">
            <div className="meta-item">
              <Building size={14} />
              <span>{itemData?.companyName || itemData?.organizerName || 'Company'}</span>
            </div>
            {itemData?.location && (
              <div className="meta-item">
                <MapPin size={14} />
                <span>{itemData.location}</span>
              </div>
            )}
            <div className="meta-item">
              <Clock size={14} />
              <span>Saved on {formatDate(item.createdAt)}</span>
            </div>
          </div>
          {itemData?.description ? (
            <p className="item-description">
              {itemData.description.length > 150 
                ? `${itemData.description.substring(0, 150)}...` 
                : itemData.description}
            </p>
          ) : (
            <p className="item-description">
              {type === 'bookmark' ? 'Bookmarked' : 'Liked'} {item.itemType} - Click to view details
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