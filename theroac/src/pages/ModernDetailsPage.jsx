import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Facebook, Twitter, Linkedin, Instagram, Link as LinkIcon, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { parseSlugForLookup, createSEOSlug } from '../utils/urlUtils';
import './ModernDetailsPage.css';

const ModernDetailsPage = () => {
    const { type, slug } = useParams();
    const slugInfo = parseSlugForLookup(slug);
    const id = slugInfo.id;
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('');
    const [isHeaderSticky, setIsHeaderSticky] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const contentRef = useRef(null);
    const heroRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!type || !slug) return;

            try {
                let fetchedData = null;

                switch (type) {
                    case 'jobs':
                        if (id) {
                            fetchedData = await apiService.getJobById(id);
                        } else {
                            fetchedData = await apiService.getJobBySlug(slug);
                        }
                        break;
                    case 'events':
                        if (id) {
                            fetchedData = await apiService.getEventById(id);
                        } else {
                            fetchedData = await apiService.getEventBySlug(slug);
                        }
                        break;
                    case 'internships':
                        if (id) {
                            fetchedData = await apiService.getHubContentById(id);
                        } else {
                            fetchedData = await apiService.getHubContentBySlug(slug);
                        }
                        break;
                    default:
                        return;
                }

                if (fetchedData) {
                    setData(fetchedData);
                    
                    const currentSlug = slug;
                    const title = fetchedData.title;
                    const organization = fetchedData.company || fetchedData.companyName || fetchedData.organization || fetchedData.organizer;
                    const correctSlug = createSEOSlug(title, organization);
                    
                    if (id && currentSlug !== correctSlug) {
                        navigate(`/modern-detail/${type}/${correctSlug}`, { replace: true });
                        return;
                    }
                }
            } catch (error) {
                console.error(`Error fetching ${type}:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type, id, slug, navigate]);

    // Check application status
    useEffect(() => {
        const checkApplicationStatus = async () => {
            if (!data?.id || !isAuthenticated || !user) {
                setHasApplied(false);
                return;
            }

            // Only candidates can apply
            if (user.role === 'recruiter' || user.role === 'admin') {
                setHasApplied(false);
                return;
            }

            try {
                let hasAppliedStatus = false;
                
                switch (type) {
                    case 'jobs':
                        const jobStatus = await apiService.checkJobApplicationStatus(data.id);
                        hasAppliedStatus = jobStatus?.hasApplied || false;
                        break;
                    case 'events':
                        const eventStatus = await apiService.checkEventRegistrationStatus(data.id);
                        hasAppliedStatus = eventStatus?.hasRegistered || eventStatus?.hasApplied || false;
                        break;
                    case 'internships':
                        const hubStatus = await apiService.checkHubContentApplicationStatus(data.id);
                        hasAppliedStatus = hubStatus?.hasApplied || false;
                        break;
                    default:
                        hasAppliedStatus = false;
                }
                
                setHasApplied(hasAppliedStatus);
            } catch (error) {
                console.error('Error checking application status:', error);
                setHasApplied(false);
            }
        };

        checkApplicationStatus();
    }, [data?.id, isAuthenticated, user, type]);

    // Set default active tab based on type
    useEffect(() => {
        if (type === 'jobs') {
            setActiveTab('description');
        } else if (type === 'events') {
            setActiveTab('stages');
        } else if (type === 'internships') {
            setActiveTab('description');
        }
    }, [type]);

    // Handle scroll to make header sticky and update active tab (scroll spy)
    useEffect(() => {
        const handleScroll = () => {
            // Find the page-content-wrapper element
            const pageWrapper = document.querySelector('.page-content-wrapper');
            if (!pageWrapper) return;
            
            const scrollTop = pageWrapper.scrollTop;
            const heroHeight = 350; // Hero section height
            
            // Make header sticky when hero image is scrolled past
            const shouldBeSticky = scrollTop > heroHeight - 50;
            setIsHeaderSticky(shouldBeSticky);
            
            // Scroll spy - find which section is currently in view
            const config = typeConfig[type];
            if (config && config.tabs) {
                const sections = config.tabs.map(tab => ({
                    id: tab.id,
                    element: document.getElementById(tab.id)
                })).filter(s => s.element);
                
                // Find the section that's currently most visible
                let currentSection = activeTab;
                const viewportTop = pageWrapper.scrollTop + 150; // Offset for header
                
                for (let i = sections.length - 1; i >= 0; i--) {
                    const section = sections[i];
                    if (section.element.offsetTop <= viewportTop) {
                        currentSection = section.id;
                        break;
                    }
                }
                
                if (currentSection !== activeTab) {
                    setActiveTab(currentSection);
                }
            }
            
            // Dispatch custom event to parent (UnifiedDetailsPage) to show/hide main header
            window.dispatchEvent(new CustomEvent('modernDetailsScroll', { 
                detail: { 
                    isHeaderSticky: shouldBeSticky,
                    activeTab: activeTab 
                } 
            }));
        };

        // Attach scroll listener to page-content-wrapper
        const pageWrapper = document.querySelector('.page-content-wrapper');
        if (pageWrapper) {
            pageWrapper.addEventListener('scroll', handleScroll);
            // Initial check
            handleScroll();
            return () => pageWrapper.removeEventListener('scroll', handleScroll);
        }
    }, [activeTab, type]);

    // Scroll to section
    const scrollToSection = (sectionId) => {
        console.log('Scrolling to section:', sectionId); // Debug log
        
        // Update active tab immediately for better UX
        setActiveTab(sectionId);
        
        const section = document.getElementById(sectionId);
        const pageWrapper = document.querySelector('.page-content-wrapper');
        
        if (!section) {
            console.error('Section not found:', sectionId);
            return;
        }
        
        if (pageWrapper) {
            // Calculate the absolute position of the section
            const pageWrapperRect = pageWrapper.getBoundingClientRect();
            const sectionRect = section.getBoundingClientRect();
            const currentScroll = pageWrapper.scrollTop;
            
            // Calculate target scroll position
            const targetScroll = currentScroll + sectionRect.top - pageWrapperRect.top - 100;
            
            console.log('Current scroll:', currentScroll, 'Target scroll:', targetScroll); // Debug log
            
            pageWrapper.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        } else {
            console.error('Page wrapper not found');
        }
    };

    // Make scrollToSection available globally for UnifiedDetailsPage
    useEffect(() => {
        window.modernDetailsScrollToSection = scrollToSection;
        return () => {
            delete window.modernDetailsScrollToSection;
        };
    }, []);

    // Tab configuration
    const typeConfig = {
        jobs: {
            tabs: [
                { id: 'description', label: 'Job Description' },
                { id: 'dates', label: 'Dates & Deadlines' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'faqs', label: 'FAQs & Discussions' }
            ]
        },
        events: {
            tabs: [
                { id: 'stages', label: 'Stages & Timeline' },
                { id: 'details', label: 'Details' },
                { id: 'dates', label: 'Dates & Deadlines' },
                { id: 'prizes', label: 'Prizes' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'faqs', label: 'FAQs & Discussions' }
            ]
        },
        internships: {
            tabs: [
                { id: 'description', label: 'Internship Details' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'faqs', label: 'FAQs & Discussions' }
            ]
        }
    };

    const getOrganizationName = () => {
        const name = data?.company || data?.companyName || data?.organization || data?.organizer;
        // Ensure we return a string, not an object
        if (typeof name === 'string') return name;
        if (typeof name === 'object' && name !== null) return JSON.stringify(name);
        return 'Organization';
    };

    const handleApply = async () => {
        if (!isAuthenticated) {
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            navigate('/login');
            return;
        }

        if (user?.role === 'recruiter' || user?.role === 'admin') {
            alert('Recruiters and admins cannot apply. Only candidates can apply.');
            return;
        }

        if (hasApplied) {
            return;
        }

        try {
            let result = null;

            switch (type) {
                case 'jobs':
                    result = await apiService.applyToJob(data.id, {
                        resumeLink: '',
                        coverLetter: ''
                    });
                    break;
                case 'events':
                    result = await apiService.registerForEvent(data.id);
                    break;
                case 'internships':
                    result = await apiService.applyToHubContent(data.id);
                    break;
                default:
                    throw new Error('Unknown application type');
            }

            if (result) {
                setHasApplied(true);
                alert(`Successfully applied for ${data.title}!`);
            }
        } catch (error) {
            const errorMessage = error.message || 'Please try again later.';
            console.error('Application error:', error);
            
            if (errorMessage.includes('Already applied')) {
                alert('You have already applied to this position.');
                setHasApplied(true);
            } else if (errorMessage.includes('not found')) {
                alert('This position is no longer available.');
            } else {
                alert(`Failed to apply: ${errorMessage}`);
            }
        }
    };

    const getDeadlineDisplay = () => {
        if (data?.deadline && typeof data.deadline === 'number') {
            return data.deadline;
        }
        if (data?.applicationDeadline) {
            const deadline = new Date(data.applicationDeadline);
            const now = new Date();
            const diffTime = deadline - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return Math.max(0, diffDays);
        }
        return 30;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'TBD';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    if (loading) {
        return (
            <div className="modern-loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!data) {
        return <div className="modern-error">Content not found</div>;
    }

    const config = typeConfig[type] || typeConfig.jobs;

    return (
        <div className="modern-details-page">
            {/* Scrollable Content Wrapper */}
            <div ref={contentRef} className="modern-scroll-wrapper">
                {/* Main Content */}
                <div className="modern-container">
                    <div className="modern-content">
                        {/* Top Section - Split into 2 columns */}
                        <div className="top-section-grid">
                            {/* Left Column - Logo, Title, Date, Location, Share */}
                            <div className="top-left-column">
                                {/* Company Logo */}
                                <div className="company-logo">
                                    <img 
                                        src={data.companyLogo || data.logo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(getOrganizationName()) + '&size=120&background=FFD600&color=1a1a1a&bold=true'} 
                                        alt={getOrganizationName()}
                                        onError={(e) => {
                                            e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(getOrganizationName()) + '&size=120&background=FFD600&color=1a1a1a&bold=true';
                                        }}
                                    />
                                </div>
                                
                                <h1 className="event-title">{data.title}</h1>
                                
                                <div className="company-info">
                                    {/* Company Name with Link */}
                                    <div className="info-row">
                                        <Building className="info-icon" size={20} />
                                        {data.companyWebsite || data.website ? (
                                            <a 
                                                href={data.companyWebsite || data.website} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="info-link"
                                            >
                                                {getOrganizationName()}
                                            </a>
                                        ) : (
                                            <span className="info-text">{getOrganizationName() || 'Organization'}</span>
                                        )}
                                    </div>

                                    {/* Location */}
                                    <div className="info-row">
                                        <MapPin className="info-icon" size={20} />
                                        <span className="info-text">{data.location || data.companyLocation || 'Location not specified'}</span>
                                    </div>

                                    {/* Updated On - Today's Date */}
                                    <div className="info-row">
                                        <Calendar className="info-icon" size={20} />
                                        <span className="info-text">
                                            Updated On: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                {/* Social Links - Show only if company has provided links */}
                                {data.sociallinks && typeof data.sociallinks === 'object' && Object.keys(data.sociallinks).length > 0 && (
                                    <div className="share-section">
                                        <span className="share-label">Follow Us</span>
                                        <div className="share-buttons">
                                            {data.sociallinks.facebook && (
                                                <a 
                                                    href={data.sociallinks.facebook}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="share-btn"
                                                    title="Facebook"
                                                >
                                                    <Facebook size={18} />
                                                </a>
                                            )}
                                            {data.sociallinks.twitter && (
                                                <a 
                                                    href={data.sociallinks.twitter}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="share-btn"
                                                    title="Twitter"
                                                >
                                                    <Twitter size={18} />
                                                </a>
                                            )}
                                            {data.sociallinks.linkedin && (
                                                <a 
                                                    href={data.sociallinks.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="share-btn"
                                                    title="LinkedIn"
                                                >
                                                    <Linkedin size={18} />
                                                </a>
                                            )}
                                            {data.sociallinks.instagram && (
                                                <a 
                                                    href={data.sociallinks.instagram}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="share-btn"
                                                    title="Instagram"
                                                >
                                                    <Instagram size={18} />
                                                </a>
                                            )}
                                            {data.sociallinks.website && (
                                                <a 
                                                    href={data.sociallinks.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="share-btn"
                                                    title="Website"
                                                >
                                                    <LinkIcon size={18} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Subscribe Card */}
                            <div className="top-right-column">
                                <div className="subscribe-card">
                                    <div className="qr-code-container">
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.href)}`}
                                            alt="QR Code"
                                            className="qr-code-image"
                                        />
                                    </div>
                                    <p className="qr-text">Scan the QR code to invite others.</p>
                                    <span className="or-text">or</span>
                                    {hasApplied ? (
                                        <button 
                                            className="subscribe-btn whatsapp"
                                            onClick={() => window.open('https://whatsapp.com/channel/0029VajVGJP4hdQFX6j3Eo1I', '_blank')}
                                        >
                                            Join WhatsApp Channel
                                        </button>
                                    ) : (
                                        <button 
                                            className="subscribe-btn"
                                            onClick={handleApply}
                                        >
                                            Apply Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs - Below top section, full width */}
                        {!isHeaderSticky && (
                            <div className="modern-tabs-wrapper">
                                <div className="modern-tabs">
                                    {config.tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            className={`modern-tab ${activeTab === tab.id ? 'active' : ''}`}
                                            onClick={() => scrollToSection(tab.id)}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                    {/* Details Section - Job/Internship */}
                    {(type === 'jobs' || type === 'internships') && (
                        <div id="description" className="details-section">
                            <h2 className="section-title">
                                {type === 'jobs' ? 'Job Details' : 'Internship Details'}
                            </h2>
                            <div className="details-content">
                                {/* Description */}
                                <div className="details-subsection">
                                    <h3 className="subsection-title">Description:</h3>
                                    {data.description && typeof data.description === 'string' && data.description.trim() ? (
                                        <div className="details-text">
                                            {data.description.split('\n').map((line, index) => (
                                                line.trim() && <p key={index}>{line.trim()}</p>
                                            ))}
                                        </div>
                                    ) : data.description && typeof data.description === 'object' ? (
                                        <div className="details-text">
                                            <p>{JSON.stringify(data.description)}</p>
                                        </div>
                                    ) : (
                                        <p className="no-details-message">No data</p>
                                    )}
                                </div>

                                {/* Responsibilities - Array or String */}
                                <div className="details-subsection">
                                    <h3 className="subsection-title">Responsibilities of the {type === 'jobs' ? 'Job' : 'Intern'}:</h3>
                                    {data.responsibilities && (
                                        Array.isArray(data.responsibilities) && data.responsibilities.length > 0 ? (
                                            <ul className="details-list">
                                                {data.responsibilities.map((item, index) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        ) : typeof data.responsibilities === 'string' && data.responsibilities.trim() ? (
                                            <ul className="details-list">
                                                {data.responsibilities.split('\n').map((line, index) => (
                                                    line.trim() && <li key={index}>{line.trim()}</li>
                                                ))}
                                            </ul>
                                        ) : typeof data.responsibilities === 'object' && data.responsibilities !== null ? (
                                            <div className="details-text">
                                                <p>{JSON.stringify(data.responsibilities)}</p>
                                            </div>
                                        ) : (
                                            <p className="no-details-message">No data</p>
                                        )
                                    )}
                                    {!data.responsibilities && (
                                        <p className="no-details-message">No data</p>
                                    )}
                                </div>

                                {/* Requirements - Array or String */}
                                <div className="details-subsection">
                                    <h3 className="subsection-title">Requirements:</h3>
                                    {data.requirements && (
                                        Array.isArray(data.requirements) && data.requirements.length > 0 ? (
                                            <ul className="details-list">
                                                {data.requirements.map((item, index) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        ) : typeof data.requirements === 'string' && data.requirements.trim() ? (
                                            <ul className="details-list">
                                                {data.requirements.split('\n').map((line, index) => (
                                                    line.trim() && <li key={index}>{line.trim()}</li>
                                                ))}
                                            </ul>
                                        ) : typeof data.requirements === 'object' && data.requirements !== null ? (
                                            <div className="details-text">
                                                <p>{JSON.stringify(data.requirements)}</p>
                                            </div>
                                        ) : (
                                            <p className="no-details-message">No data</p>
                                        )
                                    )}
                                    {!data.requirements && (
                                        <p className="no-details-message">No data</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Event Stages Section */}
                    {type === 'events' && (
                        <div id="stages" className="details-section">
                            <h2 className="section-title">Stages and Timeline</h2>
                            <div className="details-content">
                                {data.stages && Array.isArray(data.stages) && data.stages.length > 0 && (
                                    <div className="details-subsection">
                                        {data.stages.map((stage, index) => (
                                            <div key={index} className="timeline-item">
                                                <div className="timeline-date">
                                                    {typeof stage.date === 'string' ? stage.date : 
                                                     typeof stage.date === 'object' ? JSON.stringify(stage.date) : 
                                                     stage.date || 'TBD'}
                                                </div>
                                                <div className="timeline-content">
                                                    <h4>
                                                        {typeof stage.title === 'string' ? stage.title : 
                                                         typeof stage.title === 'object' ? JSON.stringify(stage.title) : 
                                                         stage.title || 'Stage'}
                                                    </h4>
                                                    <p>
                                                        {typeof stage.description === 'string' ? stage.description : 
                                                         typeof stage.description === 'object' ? JSON.stringify(stage.description) : 
                                                         stage.description || 'No description'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Event Details Section - Only for Events */}
                    {type === 'events' && (
                        <div id="details" className="details-section">
                            <h2 className="section-title">Event Details</h2>
                            
                            <div className="details-content">
                                {data.guidelines && Array.isArray(data.guidelines) && data.guidelines.length > 0 && (
                                    <div className="details-subsection">
                                        <h3 className="subsection-title">Guidelines</h3>
                                        <ul className="details-list">
                                            {data.guidelines.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Important Dates & Deadlines Section */}
                    {/* <div id="dates" className="details-section">
                        <h2 className="section-title">Important dates & deadlines</h2>
                        <div className="deadline-list">
                            <div className="deadline-item">
                                <Calendar className="deadline-icon" size={24} />
                                <div className="deadline-info">
                                    <span className="deadline-label">Application Deadline</span>
                                    <span className="deadline-date">
                                        {data.applicationDeadline 
                                            ? new Date(data.applicationDeadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST'
                                            : `${getDeadlineDisplay()} days left`
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div> */}



                    {/* Prizes Section (Events only) */}
                    {type === 'events' && data.prizes && (
                        <div id="prizes" className="details-section">
                            <h2 className="section-title">Rewards and Prizes</h2>
                            <div className="details-content">
                                <p className="details-description">{data.prizes.winner || 'No data'}</p>
                            </div>
                        </div>
                    )}

                    {/* Photos and Videos Section */}
                    {(type === 'events' || type === 'internships') && (
                        <div className="media-section">
                            <h2 className="section-title">
                                {type === 'events' ? 'Event Photos And Videos' : 'Media Gallery'}
                            </h2>
                            {data.media && Array.isArray(data.media) && data.media.length > 0 ? (
                                <div className="media-grid">
                                    {data.media.map((item, index) => (
                                        <div 
                                            key={index} 
                                            className="media-item"
                                            onClick={() => setSelectedMedia(item)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {item.type === 'video' ? (
                                                <div className="video-wrapper">
                                                    <img src={item.thumbnail} alt="Video thumbnail" />
                                                    <div className="play-button">▶</div>
                                                </div>
                                            ) : (
                                                <img src={item.url} alt="Media" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-details-message">No data</p>
                            )}
                        </div>
                    )}

                    {/* Reviews Section */}
                    <div id="reviews" className="details-section">
                        <h2 className="section-title">Reviews</h2>
                        <div className="details-content">
                            <div className="reviews-container">
                                {/* Reviews will be loaded from backend when available */}
                                <div className="reviews-list">
                                    <p className="no-details-message">No reviews yet. Be the first to review!</p>
                                </div>

                                {/* Add Review Form - Only show if user is authenticated */}
                                {isAuthenticated && (
                                    <div className="feedback-form">
                                        <h3 className="subsection-title">Write a Review</h3>
                                        <textarea 
                                            className="feedback-textarea"
                                            placeholder="Share your experience..."
                                            rows="4"
                                        ></textarea>
                                        <div className="feedback-actions">
                                            <div className="rating-stars">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button key={star} className="star-btn">
                                                        ⭐
                                                    </button>
                                                ))}
                                            </div>
                                            <button className="feedback-submit-btn">Submit Review</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* FAQs Section */}
                    <div id="faqs" className="details-section">
                        <h2 className="section-title">FAQs & Discussions</h2>
                        <div className="details-content">
                            <p className="no-details-message">No data</p>
                        </div>
                    </div>



                    {/* Media Modal */}
                    {selectedMedia && (
                        <div className="media-modal" onClick={() => setSelectedMedia(null)}>
                            <div className="media-modal-content" onClick={(e) => e.stopPropagation()}>
                                <button className="media-modal-close" onClick={() => setSelectedMedia(null)}>
                                    ✕
                                </button>
                                {selectedMedia.type === 'video' ? (
                                    <div className="video-container">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={selectedMedia.url.replace('watch?v=', 'embed/')}
                                            title="Video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                ) : (
                                    <img src={selectedMedia.url} alt="Full size" className="modal-image" />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Host/Company Info */}
                    {/* <div className="host-card">
                        <div className="host-avatar">
                            {getOrganizationName().charAt(0)}
                        </div>
                        <div className="host-info">
                            <span className="host-label">
                                {type === 'events' ? 'Event Organizer' : type === 'jobs' ? 'Company' : 'Organization'}
                            </span>
                            <h3 className="host-name">{getOrganizationName()}</h3>
                            {data.phone && (
                                <div className="host-contact">
                                    <span className="contact-label">Phone Number</span>
                                    <a href={`tel:${data.phone}`} className="contact-value">{data.phone}</a>
                                </div>
                            )}
                            {data.email && (
                                <div className="host-contact">
                                    <span className="contact-label">Email</span>
                                    <a href={`mailto:${data.email}`} className="contact-value">{data.email}</a>
                                </div>
                            )}
                            {data.website && (
                                <div className="host-contact">
                                    <span className="contact-label">Website</span>
                                    <a href={data.website} target="_blank" rel="noopener noreferrer" className="contact-value">
                                        {data.website}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div> */}
                    </div>
                </div>
            </div>
            {/* End Scrollable Wrapper */}
        </div>
    );
};

export default ModernDetailsPage;
