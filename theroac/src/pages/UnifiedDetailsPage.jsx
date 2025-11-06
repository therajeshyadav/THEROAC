import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building, MapPin, Calendar, Briefcase, Clock, Heart, Share2, Bookmark, Award, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { extractIdFromSlug, createSEOSlug, parseSlugForLookup } from '../utils/urlUtils';
import './UnifiedDetailsPage.css';

const UnifiedDetailsPage = () => {
    const { type, slug } = useParams(); // type: 'jobs' | 'events' | 'internships', slug: 'title-company' or 'title-company-id'
    
    // Parse slug to get lookup information
    const slugInfo = parseSlugForLookup(slug);
    const id = slugInfo.id; // Will be null for new slug format, present for backward compatibility

    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [activeTab, setActiveTab] = useState('');
    const [isHeaderSticky, setIsHeaderSticky] = useState(false);
    const headerRef = useRef(null);
    const leftContentRef = useRef(null);
    const [data, setData] = useState(null);
    const [isApplying, setIsApplying] = useState(false);

    // Configuration for different types
    const typeConfig = {
        jobs: {
            defaultTab: 'description',
            tabs: [
                { id: 'description', label: 'Job Description' },
                { id: 'dates', label: 'Dates & Deadlines' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'faqs', label: 'FAQs & Discussions' }
            ],
            headerIcon: Briefcase,
            logoGradient: '#FFD600',
            priceLabel: 'Salary'
        },
        events: {
            defaultTab: 'stages',
            tabs: [
                { id: 'stages', label: 'Stages & Timeline' },
                { id: 'details', label: 'Details' },
                { id: 'dates', label: 'Dates & Deadlines' },
                { id: 'prizes', label: 'Prizes' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'faqs', label: 'FAQs & Discussions' }
            ],
            headerIcon: Award,
            logoGradient: '#FFD600',
            priceLabel: 'Entry Fee'
        },
        internships: {
            defaultTab: 'details',
            tabs: [
                { id: 'details', label: 'Internship Details' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'faqs', label: 'FAQs & Discussions' }
            ],
            headerIcon: Clock,
            logoGradient: '#FFD600',
            priceLabel: 'Stipend'
        }
    };

    // Mock data - replace with actual API calls
    const getJobData = (identifier) => {
        const jobs = [
            {
                id: '11111111-1111-1111-1111-111111111111',
                title: 'Frontend Developer Role - Dev Innovations Labs',
                company: 'Dev Innovations Labs',
                location: 'Bangalore, India',
                type: 'Full-time',
                experience: '2-4 years',
                salary: '₹8L - ₹15L',
                posted: 'Oct 27, 2025',
                deadline: 13,
                applied: 48,
                impressions: 655,
                description: 'We are looking for a skilled Frontend Developer to join our innovative team and build amazing user experiences with modern technologies.',
                responsibilities: [
                    'Develop responsive web applications using React.js and modern JavaScript',
                    'Collaborate with UI/UX designers to implement pixel-perfect designs',
                    'Optimize applications for maximum speed and scalability',
                    'Write clean, maintainable, and well-documented code'
                ],
                requirements: [
                    '2-4 years of experience in Frontend development',
                    'Strong proficiency in React.js, HTML5, CSS3, and JavaScript',
                    'Experience with state management libraries (Redux, Context API)',
                    'Knowledge of responsive design and cross-browser compatibility'
                ],
                eligibility: ['Engineering Students', 'Postgraduate', 'Undergraduate'],
                skills: ['React', 'JavaScript', 'HTML/CSS', 'Git', 'REST APIs']
            },
            {
                id: '2',
                title: 'UI/UX Designer Position at PixelStudio',
                company: 'PixelStudio',
                location: 'Pune, India',
                type: 'Full-time',
                experience: '1-3 years',
                salary: '₹6L - ₹12L',
                posted: 'Oct 26, 2025',
                deadline: 15,
                applied: 32,
                impressions: 420,
                description: 'Join our creative team to design beautiful and intuitive user experiences for web and mobile applications.',
                responsibilities: [
                    'Create wireframes, prototypes, and high-fidelity designs',
                    'Conduct user research and usability testing',
                    'Collaborate with development teams to ensure design implementation',
                    'Maintain design systems and style guides'
                ],
                requirements: [
                    '1-3 years of experience in UI/UX design',
                    'Proficiency in Figma, Adobe Creative Suite, or Sketch',
                    'Strong understanding of user-centered design principles',
                    'Portfolio showcasing web and mobile design projects'
                ],
                eligibility: ['Design Students', 'Postgraduate', 'Undergraduate'],
                skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Design Systems']
            }
        ];
        // Try to find by ID first, then by slug match
        if (identifier && /^\d+$/.test(identifier)) {
            return jobs[parseInt(identifier) - 1] || jobs[0];
        }
        
        // For slug-based lookup, find by matching title and company
        const job = jobs.find(j => {
            const jobSlug = createSEOSlug(j.title, j.company);
            return jobSlug === identifier;
        });
        
        return job || jobs[0];
    };

    const mockData = {
        jobs: getJobData(id || slug),
        events: (() => {
            const events = [
                {
                    id: '1',
                    title: 'Future of AI: Industry 5.0 Conference 2025',
                    organization: 'Silicon Valley Convention Center',
                    location: 'Silicon Valley Convention Center',
                    posted: 'Oct 27, 2025',
                    deadline: 45,
                    registered: 2500,
                    impressions: 125000,
                    teamSize: '1 - 5 Members',
                    type: 'Conference',
                    status: 'upcoming',
                    description: 'Join industry leaders and innovators to explore the future of AI and its impact on Industry 5.0.',
                    about: [
                        'A premier conference bringing together AI experts, researchers, and industry leaders',
                        'Explore cutting-edge AI technologies and their applications in Industry 5.0',
                        'Network with professionals and discover new opportunities in AI'
                    ],
                    stages: [
                        {
                            date: '18 Mar 25',
                            title: 'Conference Day',
                            description: 'Full day conference with keynotes, panels, and networking sessions.',
                            startDate: '18 Mar 25, 10:00 AM PST',
                            endDate: '18 Mar 25, 4:00 PM PST'
                        }
                    ],
                    guidelines: [
                        'Open to all professionals, students, and AI enthusiasts',
                        'Registration includes access to all sessions and networking events'
                    ],
                    prizes: {
                        winner: 'Networking Opportunities',
                        certificate: true
                    },
                    eligibility: ['Professionals', 'Students', 'Researchers', 'AI Enthusiasts'],
                    skills: ['AI/ML', 'Industry 4.0', 'Innovation', 'Networking']
                },
                {
                    id: '2',
                    title: 'Tech Leaders Meetup – Building the Future',
                    organization: 'Microsoft HQ',
                    location: 'Microsoft HQ, Seattle',
                    posted: 'Oct 25, 2025',
                    deadline: 60,
                    registered: 800,
                    impressions: 45000,
                    teamSize: 'Individual',
                    type: 'Meetup',
                    status: 'upcoming',
                    description: 'Connect with tech leaders and learn about building the future of technology.',
                    about: [
                        'Exclusive meetup with top tech leaders and innovators',
                        'Learn about emerging technologies and future trends',
                        'Build meaningful connections in the tech industry'
                    ],
                    stages: [
                        {
                            date: '10 Apr 25',
                            title: 'Meetup Event',
                            description: 'Interactive sessions with tech leaders and networking opportunities.',
                            startDate: '10 Apr 25, 2:00 PM PST',
                            endDate: '10 Apr 25, 6:00 PM PST'
                        }
                    ],
                    guidelines: [
                        'Open to tech professionals and enthusiasts',
                        'Limited seats available - register early'
                    ],
                    prizes: {
                        winner: 'Exclusive Networking',
                        certificate: false
                    },
                    eligibility: ['Tech Professionals', 'Entrepreneurs', 'Students'],
                    skills: ['Leadership', 'Technology', 'Innovation', 'Networking']
                }
            ];
            // Try to find by ID first, then by slug match
            const identifier = id || slug;
            if (identifier && /^\d+$/.test(identifier)) {
                return events[parseInt(identifier) - 1] || events[0];
            }
            
            // For slug-based lookup, find by matching title and organization
            const event = events.find(e => {
                const eventSlug = createSEOSlug(e.title, e.organization);
                return eventSlug === identifier;
            });
            
            return event || events[0];
        })(),
        internships: (() => {
            const programs = [
                {
                    id: '1',
                    title: 'Launch of ROAC Prime Talent Network',
                    company: 'ROAC Prime',
                    location: 'Virtual Launch Event',
                    duration: '3 months',
                    timing: 'Part Time',
                    stipend: { min: '₹5,000', max: '₹15,000' },
                    workDays: '3 Days',
                    posted: 'Oct 27, 2025',
                    deadline: 30,
                    applied: 150,
                    impressions: 5500,
                    description: 'Be part of the exclusive launch of ROAC Prime Talent Network and help build the future of talent acquisition.',
                    responsibilities: [
                        'Assist in launching and promoting the ROAC Prime Talent Network',
                        'Help onboard new talent and create engaging content',
                        'Support community building and engagement initiatives',
                        'Collaborate with the team on strategic talent acquisition projects'
                    ],
                    requirements: [
                        'Strong communication and interpersonal skills',
                        'Interest in talent acquisition and community building',
                        'Familiarity with social media platforms and digital marketing',
                        'Ability to work independently and as part of a team'
                    ],
                    eligibility: ['Engineering Students', 'Postgraduate', 'Undergraduate', 'Management'],
                    gender: ['Female', 'Male'],
                    skills: ['Community Building', 'Social Media', 'Communication', 'Talent Acquisition']
                },
                {
                    id: '2',
                    title: 'Talent Accelerator Workshop: AI & ML Careers',
                    company: 'ROAC Prime',
                    location: 'Dev Innovations Labs HQ, Mumbai',
                    duration: '2 months',
                    timing: 'Part Time',
                    stipend: { min: '₹8,000', max: '₹20,000' },
                    workDays: '4 Days',
                    posted: 'Oct 26, 2025',
                    deadline: 25,
                    applied: 89,
                    impressions: 3200,
                    description: 'Join our intensive workshop program focused on accelerating careers in AI and Machine Learning.',
                    responsibilities: [
                        'Participate in hands-on AI/ML workshops and training sessions',
                        'Work on real-world AI projects with industry mentors',
                        'Help create educational content for future workshops',
                        'Assist in organizing and coordinating workshop events'
                    ],
                    requirements: [
                        'Basic understanding of programming (Python preferred)',
                        'Interest in AI/ML technologies and career development',
                        'Strong analytical and problem-solving skills',
                        'Willingness to learn and adapt to new technologies'
                    ],
                    eligibility: ['Engineering Students', 'Computer Science', 'Data Science', 'AI/ML Enthusiasts'],
                    gender: ['Female', 'Male'],
                    skills: ['Python', 'Machine Learning', 'Data Analysis', 'Problem Solving']
                }
            ];
            // Try to find by ID first, then by slug match
            const identifier = id || slug;
            if (identifier && /^\d+$/.test(identifier)) {
                return programs[parseInt(identifier) - 1] || programs[0];
            }
            
            // For slug-based lookup, find by matching title and company
            const program = programs.find(p => {
                const programSlug = createSEOSlug(p.title, p.company);
                return programSlug === identifier;
            });
            
            return program || programs[0];
        })()
    };

    // Initialize data and active tab
    useEffect(() => {
        const fetchData = async () => {
            if (!type || !slug) return;

            try {
                let fetchedData = null;

                switch (type) {
                    case 'jobs':
                        if (id) {
                            // Backward compatibility - fetch by ID
                            fetchedData = await apiService.getJobById(id);
                        } else {
                            // New format - fetch by slug
                            fetchedData = await apiService.getJobBySlug(slug);
                        }
                        break;
                    case 'events':
                        if (id) {
                            // Backward compatibility - fetch by ID
                            fetchedData = await apiService.getEventById(id);
                        } else {
                            // New format - fetch by slug
                            fetchedData = await apiService.getEventBySlug(slug);
                        }
                        break;
                    case 'internships':
                        if (id) {
                            // Backward compatibility - fetch by ID
                            fetchedData = await apiService.getHubContentById(id);
                        } else {
                            // New format - fetch by slug
                            fetchedData = await apiService.getHubContentBySlug(slug);
                        }
                        break;
                    default:
                        return;
                }

                if (fetchedData) {
                    setData(fetchedData);
                    
                    // Check if URL needs to be updated to new SEO-friendly format (without ID)
                    const currentSlug = slug;
                    const title = fetchedData.title;
                    const organization = fetchedData.company || fetchedData.companyName || fetchedData.organization || fetchedData.organizer;
                    const correctSlug = createSEOSlug(title, organization);
                    
                    // If current slug contains ID (old format), redirect to new format
                    if (id && currentSlug !== correctSlug) {
                        navigate(`/event-detail/${type}/${correctSlug}`, { replace: true });
                        return;
                    }
                } else {
                    // Fallback to mock data if API fails
                    setData(mockData[type]);
                }
            } catch (error) {
                // Fallback to mock data on error
                setData(mockData[type]);
            }

            setActiveTab(typeConfig[type]?.defaultTab || '');
        };

        fetchData();
    }, [type, id, slug, navigate]);

    // Scroll handler for sticky header and scroll spy
    useEffect(() => {
        const handleScroll = () => {
            if (headerRef.current && leftContentRef.current && data) {
                const leftContentScrollTop = leftContentRef.current.scrollTop;

                // Make header sticky when the header card scrolls out of view
                const shouldBeSticky = leftContentScrollTop > 200; // Increased threshold
                setIsHeaderSticky(shouldBeSticky);

                // Scroll spy - determine which section is currently visible
                const sections = typeConfig[type]?.tabs.map(tab => tab.id) || [];
                const sectionElements = sections.map(id => document.getElementById(id)).filter(Boolean);

                let currentSection = typeConfig[type]?.defaultTab || '';

                for (let i = sectionElements.length - 1; i >= 0; i--) {
                    const section = sectionElements[i];
                    const rect = section.getBoundingClientRect();
                    const containerRect = leftContentRef.current.getBoundingClientRect();

                    if (rect.top <= containerRect.top + 200) {
                        currentSection = section.id;
                        break;
                    }
                }

                setActiveTab(currentSection);
            }
        };

        // Only add scroll listener after data is loaded
        if (leftContentRef.current && data) {
            leftContentRef.current.addEventListener('scroll', handleScroll);
            // Don't call handleScroll immediately to avoid initial sticky state
            
            // Set initial state after a small delay
            setTimeout(() => {
                if (leftContentRef.current) {
                    const initialScrollTop = leftContentRef.current.scrollTop;
                    setIsHeaderSticky(initialScrollTop > 200);
                }
            }, 100);
        }

        return () => {
            if (leftContentRef.current) {
                leftContentRef.current.removeEventListener('scroll', handleScroll);
            }
        };
    }, [type, data]);

    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section && leftContentRef.current) {
            const containerRect = leftContentRef.current.getBoundingClientRect();
            const sectionRect = section.getBoundingClientRect();
            const scrollTop = leftContentRef.current.scrollTop;
            const targetScrollTop = scrollTop + sectionRect.top - containerRect.top - 20;

            leftContentRef.current.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });
        }
    };

    const handleApply = async () => {
        if (!isAuthenticated) {
            // Store the current page info before redirecting to login
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            navigate('/login');
            return;
        }

        setIsApplying(true);
        try {
            let result = null;

            switch (type) {
                case 'jobs':
                    result = await apiService.applyToJob(data.id, {
                        resumeLink: '', // You might want to collect this from user
                        coverLetter: '' // You might want to collect this from user
                    });
                    break;
                case 'events':
                    result = await apiService.registerForEvent(data.id);
                    break;
                case 'internships':
                    // For hub content, you might want to create a different endpoint
                    // For now, we'll just show a success message
                    result = { success: true };
                    break;
                default:
                    throw new Error('Unknown application type');
            }

            if (result) {
                alert(`Successfully applied for ${data.title}!`);
            }

        } catch (error) {
            console.error('Application failed:', error);
            alert(error.message || 'Application failed. Please try again.');
        } finally {
            setIsApplying(false);
        }
    };

    if (!data || !typeConfig[type]) {
        return (
            <div className="preloader">
                <div className="loading-container">
                    <div className="loading"></div>
                    <div id="loading-icon">
                        <img src="assets/img/logo/preloader.png" alt="" />
                    </div>
                </div>
            </div>
        );
    }

    const config = typeConfig[type];
    const HeaderIcon = config.headerIcon;

    // Format currency values (5000 -> ₹5K, 800000 -> ₹8L)
    const formatCurrency = (value) => {
        if (!value || isNaN(value)) return value;
        
        const num = parseInt(value.toString().replace(/[^\d]/g, ''));
        
        if (num >= 10000000) { // 1 crore and above
            return `₹${(num / 10000000).toFixed(num % 10000000 === 0 ? 0 : 1)}Cr`;
        } else if (num >= 100000) { // 1 lakh and above
            return `₹${(num / 100000).toFixed(num % 100000 === 0 ? 0 : 1)}L`;
        } else if (num >= 1000) { // 1 thousand and above
            return `₹${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
        } else {
            return `₹${num}`;
        }
    };

    // Format salary range (e.g., "5000-7000" -> "₹5K - ₹7K")
    const formatSalaryRange = (salary) => {
        if (!salary) return 'Competitive';
        
        // If it's already formatted (contains ₹), return as is
        if (salary.includes('₹')) return salary;
        
        // Check if it's a range (contains - or to)
        const rangeMatch = salary.match(/(\d+)\s*[-to]\s*(\d+)/i);
        if (rangeMatch) {
            const min = rangeMatch[1];
            const max = rangeMatch[2];
            return `${formatCurrency(min)} - ${formatCurrency(max)}`;
        }
        
        // Single value
        const singleMatch = salary.match(/(\d+)/);
        if (singleMatch) {
            return formatCurrency(singleMatch[1]);
        }
        
        return salary;
    };

    // Get price/fee display
    const getPriceDisplay = () => {
        switch (type) {
            case 'jobs':
                return formatSalaryRange(data.salary) || 'Competitive';
            case 'events':
                const eventPrice = data.price || data.fee;
                if (!eventPrice || eventPrice === '0' || eventPrice === 0) return 'Free';
                return formatCurrency(eventPrice);
            case 'internships':
                if (data.stipend?.min && data.stipend?.max) {
                    return `${formatCurrency(data.stipend.min)} - ${formatCurrency(data.stipend.max)}`;
                } else if (data.stipend) {
                    return formatSalaryRange(data.stipend);
                }
                return 'Unpaid';
            default:
                return 'N/A';
        }
    };

    // Get company/organization name
    const getOrganizationName = () => {
        return data.company || data.companyName || data.organization || data.organizer || 'Organization';
    };

    // Get formatted deadline
    const getDeadlineDisplay = () => {
        if (data.deadline && typeof data.deadline === 'number') {
            return data.deadline;
        }
        if (data.applicationDeadline) {
            const deadline = new Date(data.applicationDeadline);
            const now = new Date();
            const diffTime = deadline - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return Math.max(0, diffDays);
        }
        if (data.endDate) {
            const endDate = new Date(data.endDate);
            const now = new Date();
            const diffTime = endDate - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return Math.max(0, diffDays);
        }
        return 30; // Default fallback
    };

    return (
        <div className="details-page unified-details-page">
            <div className={`top-nav ${isHeaderSticky ? 'sticky' : ''}`}>
                <div className="nav-container">
                    <div className="nav-left">
                        <div className="site-logo">
                            <a href="/">
                                <img src="/assets/img/logo/logo5.png" alt="ROAC Logo" />
                            </a>
                        </div>
                        {/* Show tabs in header only when sticky */}
                        {isHeaderSticky && (
                            <div className="nav-tabs">
                                {config.tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                                        onClick={() => scrollToSection(tab.id)}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}

                    </div>
                    <div className="nav-right">
                        <button className="nav-icon">🔔</button>
                        <div className="profile-avatar">
                            {isAuthenticated && user ? (
                                user.profilePicture || user.avatar ? (
                                    <img 
                                        src={user.profilePicture || user.avatar} 
                                        alt={user.name || user.firstName || 'User'} 
                                        className="profile-image"
                                    />
                                ) : (
                                    <span className="profile-initials">
                                        {(user.name || user.firstName || user.email || 'U').charAt(0).toUpperCase()}
                                    </span>
                                )
                            ) : (
                                <span className="profile-initials">U</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="main-container">
                {/* Left Content Area */}
                <div ref={leftContentRef} className="left-content">
                    {/* Header Card */}
                    <div ref={headerRef} className="header-card">
                        <div className="header-left">
                            <div className="logo" style={{ background: config.logoGradient }}>
                                <span>{getOrganizationName().charAt(0)}</span>
                            </div>
                            <div className="info">
                                <h1 className="title">{data.title}</h1>
                                <div className="meta">
                                    <div className="meta-row">
                                        <Building size={16} />
                                        <span>{getOrganizationName()}</span>
                                    </div>
                                    <div className="meta-row">
                                        <MapPin size={16} />
                                        <span>{data.location}</span>
                                    </div>
                                    {type === 'jobs' && (
                                        <div className="meta-row">
                                            <Briefcase size={16} />
                                            <span>{data.type}</span>
                                        </div>
                                    )}
                                    {type === 'internships' && (
                                        <div className="meta-row">
                                            <Clock size={16} />
                                            <span>{data.duration} • {data.timing}</span>
                                        </div>
                                    )}
                                    <div className="meta-row">
                                        <Calendar size={16} />
                                        <span>Updated On: {data.posted || (data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Recently')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="header-right">
                            <div className="days-left">
                                <span className="days-number">{getDeadlineDisplay()}</span>
                                <span className="days-text">Days Left</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs - Only show when header is not sticky */}
                    {!isHeaderSticky && (
                        <div className="content-tabs">
                            {config.tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`content-tab ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => scrollToSection(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="content-area">
                        {/* Render sections based on type */}
                        {type === 'events' && (
                            <>
                                {/* Stages Section */}
                                <div id="stages" className="content-section">
                                    <div className="section-header">
                                        <div className="section-indicator"></div>
                                        <h2 className="section-title">Stages and Timelines</h2>
                                    </div>

                                    {Array.isArray(data.stages) ? data.stages.map((stage, index) => (
                                        <div key={index} className="stage-item">
                                            <div className="stage-date">{stage.date}</div>
                                            <div className="stage-content">
                                                <h3 className="stage-title">{stage.title}</h3>
                                                <p className="stage-description">{stage.description}</p>
                                                <div className="stage-timing">
                                                    <span>Start: {stage.startDate}</span>
                                                    <span>End: {stage.endDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="stage-item">
                                            <div className="stage-content">
                                                <p>No stages information available</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="content-subsection">
                                        <div className="subsection-header">
                                            <span className="subsection-icon">📋</span>
                                            <h3 className="subsection-title">Everything you need to know</h3>
                                        </div>

                                        <div className="subsection-content">
                                            <ul className="content-list">
                                                {Array.isArray(data.about) ? data.about.map((item, index) => (
                                                    <li key={index}>{item}</li>
                                                )) : (
                                                    <li>{data.about || 'No additional information available'}</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Event Details Section */}
                                <div id="details" className="content-section">
                                    <div className="section-header">
                                        <div className="section-indicator"></div>
                                        <h2 className="section-title">Details</h2>
                                    </div>

                                    <div className="section-content">
                                        <h3 className="subsection-title">Guidelines & Rules:</h3>
                                        <ul className="content-list">
                                            {Array.isArray(data.guidelines) ? data.guidelines.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            )) : (
                                                <li>{data.guidelines || 'No guidelines available'}</li>
                                            )}
                                        </ul>

                                        <div className="warning-box">
                                            <span className="warning-icon">⚠️</span>
                                            <p>If an employer asks you to pay any kind of fee, please notify us immediately.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Prizes Section */}
                                <div id="prizes" className="content-section">
                                    <div className="section-header">
                                        <div className="section-indicator"></div>
                                        <h2 className="section-title">Rewards and Prizes</h2>
                                    </div>

                                    <div className="prizes-grid">
                                        <div className="prize-card winner">
                                            <Award size={48} />
                                            <h3>Winner</h3>
                                            <div className="prize-amount">{data.prizes?.winner}</div>
                                            <div className="prize-badge">📜 Certificate</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Job Description Section */}
                        {type === 'jobs' && (
                            <div id="description" className="content-section">
                                <div className="section-header">
                                    <div className="section-indicator"></div>
                                    <h2 className="section-title">Job Description</h2>
                                </div>

                                <div className="content-subsection">
                                    <div className="subsection-header">
                                        <span className="subsection-icon">📋</span>
                                        <h3 className="subsection-title">Details</h3>
                                    </div>
                                    <div className="subsection-content">
                                        <p>{data.description}</p>
                                    </div>
                                </div>

                                <div className="content-subsection">
                                    <div className="subsection-header">
                                        <span className="subsection-icon">💼</span>
                                        <h3 className="subsection-title">Responsibilities</h3>
                                    </div>
                                    <div className="subsection-content">
                                        <ul className="content-list">
                                            {Array.isArray(data.responsibilities) ? data.responsibilities.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            )) : (
                                                <li>{data.responsibilities || 'No responsibilities listed'}</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                <div className="content-subsection">
                                    <div className="subsection-header">
                                        <span className="subsection-icon">✅</span>
                                        <h3 className="subsection-title">Requirements</h3>
                                    </div>
                                    <div className="subsection-content">
                                        <ul className="content-list">
                                            {Array.isArray(data.requirements) ? data.requirements.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            )) : (
                                                <li>{data.requirements || 'No requirements listed'}</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                <div className="warning-box">
                                    <span className="warning-icon">⚠️</span>
                                    <p>If an employer asks you to pay any kind of fee, please notify us immediately.</p>
                                </div>
                            </div>
                        )}

                        {/* Internship Details Section */}
                        {type === 'internships' && (
                            <div id="details" className="content-section">
                                <div className="section-header">
                                    <div className="section-indicator"></div>
                                    <h2 className="section-title">Internship Details</h2>
                                </div>

                                <div className="content-subsection">
                                    <div className="subsection-header">
                                        <span className="subsection-icon">📋</span>
                                        <h3 className="subsection-title">Details</h3>
                                    </div>
                                    <div className="subsection-content">
                                        <p>{data.description}</p>
                                    </div>
                                </div>

                                <div className="content-subsection">
                                    <div className="subsection-header">
                                        <span className="subsection-icon">💼</span>
                                        <h3 className="subsection-title">Responsibilities</h3>
                                    </div>
                                    <div className="subsection-content">
                                        <ul className="content-list">
                                            {data.responsibilities?.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="content-subsection">
                                    <div className="subsection-header">
                                        <span className="subsection-icon">💰</span>
                                        <h3 className="subsection-title">Additional Information</h3>
                                    </div>

                                    <div className="prizes-grid">
                                        <div className="prize-card">
                                            <Clock size={48} />
                                            <h3>Duration</h3>
                                            <div className="prize-amount">{data.duration}</div>
                                        </div>

                                        <div className="prize-card">
                                            <Wallet size={48} />
                                            <h3>Stipend</h3>
                                            <div className="prize-amount">
                                                {data.stipend?.min && data.stipend?.max 
                                                    ? `${formatCurrency(data.stipend.min)} - ${formatCurrency(data.stipend.max)}`
                                                    : formatSalaryRange(data.stipend) || 'Unpaid'
                                                }
                                            </div>
                                            <div className="prize-badge">Per Month</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="warning-box">
                                    <span className="warning-icon">⚠️</span>
                                    <p>If an employer asks you to pay any kind of fee, please notify us immediately.</p>
                                </div>
                            </div>
                        )}

                        {/* Common Dates Section */}
                        {(type === 'jobs' || type === 'events') && (
                            <div id="dates" className="content-section">
                                <div className="section-header">
                                    <div className="section-indicator"></div>
                                    <h2 className="section-title">Important dates & deadlines</h2>
                                </div>

                                <div className="deadline-item">
                                    <Calendar size={20} />
                                    <div className="deadline-info">
                                        <span className="deadline-label">Application Deadline</span>
                                        <span className="deadline-date">{getDeadlineDisplay()} days left</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Common Reviews Section */}
                        <div id="reviews" className="content-section">
                            <div className="section-header">
                                <div className="section-indicator"></div>
                                <h2 className="section-title">Reviews</h2>
                            </div>
                            <p>No reviews yet. Be the first to review!</p>
                        </div>

                        {/* Common FAQs Section */}
                        <div id="faqs" className="content-section">
                            <div className="section-header">
                                <div className="section-indicator"></div>
                                <h2 className="section-title">FAQs & Discussions</h2>
                            </div>
                            <p>No discussions yet. Start a conversation!</p>
                        </div>

                        {/* Skills Section */}
                        {data.skills && (
                            <div className="content-subsection">
                                <div className="subsection-header">
                                    <span className="subsection-icon">🎯</span>
                                    <h3 className="subsection-title">Skills Required</h3>
                                </div>

                                <div className="tags-container">
                                    {Array.isArray(data.skills) ? data.skills.map((skill, index) => (
                                        <span key={index} className="tag">{skill}</span>
                                    )) : (
                                        <span className="tag">{data.skills}</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="right-sidebar">
                    {/* Action Card */}
                    <div className="action-card">
                        <div className="action-header">
                            <Heart size={20} />
                            <Bookmark size={20} />
                            <Share2 size={20} />
                        </div>

                        <div className="price-section">
                            <span className="price">{getPriceDisplay()}</span>
                        </div>

                        <button
                            className="apply-button"
                            onClick={handleApply}
                            disabled={isApplying}
                            style={{
                                opacity: isApplying ? 0.8 : 1,
                                cursor: isApplying ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isApplying ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <span style={{ 
                                        width: '16px', 
                                        height: '16px', 
                                        border: '2px solid #1A1719', 
                                        borderTop: '2px solid transparent', 
                                        borderRadius: '50%', 
                                        animation: 'spin 1s linear infinite' 
                                    }}></span>
                                    Applying...
                                </span>
                            ) : 'Quick Apply'}
                        </button>

                        <div className="stats-section individual">
                            {/* Show different stats based on type */}
                            {type === 'events' && (
                                <>
                                    <div className="stat-item-individual">
                                        <div className="stat-icon">
                                            <Heart size={20} />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Registered</span>
                                            <span className="stat-number">{data.registered || data.applied || 0}</span>
                                        </div>
                                    </div>

                                    <div className="stat-item-individual">
                                        <div className="stat-icon">
                                            <Award size={20} />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Team Size</span>
                                            <span className="stat-number">{data.teamSize}</span>
                                        </div>
                                    </div>

                                    <div className="stat-item-individual">
                                        <div className="stat-icon">
                                            <Share2 size={20} />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Impressions</span>
                                            <span className="stat-number">{data.impressions?.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="stat-item-individual">
                                        <div className="stat-icon">
                                            <Clock size={20} />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Registration Deadline</span>
                                            <span className="stat-number">{getDeadlineDisplay()} days left</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {type === 'jobs' && (
                                <>
                                    <div className="stat-item-individual">
                                        <div className="stat-icon">
                                            <Heart size={20} />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Applied</span>
                                            <span className="stat-number">{data.applied || 0}</span>
                                        </div>
                                    </div>

                                    <div className="stat-item-individual">
                                        <div className="stat-icon">
                                            <Briefcase size={20} />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Experience</span>
                                            <span className="stat-number">{data.experience}</span>
                                        </div>
                                    </div>

                                    <div className="stat-item-individual">
                                        <div className="stat-icon">
                                            <Share2 size={20} />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Impressions</span>
                                            <span className="stat-number">{data.impressions?.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="stat-item-individual">
                                        <div className="stat-icon">
                                            <Clock size={20} />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Application Deadline</span>
                                            <span className="stat-number">{getDeadlineDisplay()} days left</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {type === 'internships' && (
                                <>
                                    <div className="stat-item-individual">
                                        <div className="stat-icon">
                                            <Heart size={20} />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Applied</span>
                                            <span className="stat-number">{data.applied || 0}</span>
                                        </div>
                                    </div>

                                    <div className="stat-item-individual">
                                        <div className="stat-icon">
                                            <Clock size={20} />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Duration</span>
                                            <span className="stat-number">{data.duration}</span>
                                        </div>
                                    </div>

                                    <div className="stat-item-individual">
                                        <div className="stat-icon">
                                            <Share2 size={20} />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Impressions</span>
                                            <span className="stat-number">{data.impressions?.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="stat-item-individual">
                                        <div className="stat-icon">
                                            <Clock size={20} />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Application Deadline</span>
                                            <span className="stat-number">{getDeadlineDisplay()} days left</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="info-card compact">
                        <h3 className="card-title">
                            <Briefcase size={16} />
                            {type === 'jobs' ? 'Job Details' : type === 'internships' ? 'Internship Details' : 'Event Details'}
                        </h3>
                        <div className="info-list">
                            {type === 'jobs' && (
                                <>
                                    <div className="info-item">
                                        <span className="info-label">Experience</span>
                                        <span className="info-value">{data.experience}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Job Type</span>
                                        <span className="info-value">{data.type}</span>
                                    </div>
                                </>
                            )}
                            {type === 'internships' && (
                                <>
                                    <div className="info-item">
                                        <span className="info-label">Duration</span>
                                        <span className="info-value">{data.duration}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Work Days</span>
                                        <span className="info-value">{data.workDays}</span>
                                    </div>
                                </>
                            )}
                            {type === 'events' && (
                                <>
                                    <div className="info-item">
                                        <span className="info-label">Team Size</span>
                                        <span className="info-value">{data.teamSize}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Type</span>
                                        <span className="info-value">{data.type}</span>
                                    </div>
                                </>
                            )}

                            <div className="info-item">
                                <span className="info-label">Location</span>
                                <span className="info-value">{data.location}</span>
                            </div>
                        </div>
                    </div>

                    {/* Eligibility Card */}
                    <div className="info-card compact">
                        <h3 className="card-title">
                            <Award size={16} />
                            Eligibility
                        </h3>
                        <div className="eligibility-list compact">
                            {Array.isArray(data.eligibility) ? data.eligibility.map((item, index) => (
                                <span key={index} className="eligibility-item">{item}</span>
                            )) : (
                                <span className="eligibility-item">{data.eligibility || 'Not specified'}</span>
                            )}
                        </div>
                    </div>

                    {/* Gender Card (for internships) */}
                    {type === 'internships' && data.gender && (
                        <div className="info-card compact">
                            <h3 className="card-title">
                                <Heart size={16} />
                                Gender
                            </h3>
                            <div className="eligibility-list compact">
                                {Array.isArray(data.gender) ? data.gender.map((item, index) => (
                                    <span key={index} className="eligibility-item">{item}</span>
                                )) : (
                                    <span className="eligibility-item">{data.gender || 'Not specified'}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Refer & Win Card */}
                    <div className="info-card compact">
                        <h3 className="card-title">
                            <Share2 size={16} />
                            Refer & Win
                        </h3>
                        <p className="card-description">MacBook, iPhone, Apple Watch, Cash and more!</p>
                        <div className="refer-buttons">
                            <button className="refer-btn">Refer now</button>
                            <button className="refer-btn">Know more</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedDetailsPage;