import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building, MapPin, Calendar, Briefcase, Clock, Heart, Share2, Bookmark, Award, Wallet, Bell, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { extractIdFromSlug, createSEOSlug, parseSlugForLookup } from '../utils/urlUtils';
import ModernDetailsPage from './ModernDetailsPage';
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
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const headerRef = useRef(null);
    const leftContentRef = useRef(null);

    // Listen to scroll events from ModernDetailsPage
    useEffect(() => {
        const handleModernDetailsScroll = (event) => {
            setIsHeaderSticky(event.detail.isHeaderSticky);
            setActiveTab(event.detail.activeTab || activeTab);
        };

        window.addEventListener('modernDetailsScroll', handleModernDetailsScroll);
        return () => window.removeEventListener('modernDetailsScroll', handleModernDetailsScroll);
    }, [activeTab]);
    const [data, setData] = useState(null);
    const [isApplying, setIsApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [preloaderVisible, setPreloaderVisible] = useState(true);

    // Check application status from backend (user-specific)
    useEffect(() => {
        const checkApplicationStatus = async () => {
            if (!data?.id || !isAuthenticated || !user) {
                setHasApplied(false);
                setCheckingStatus(false);
                return;
            }

            // Only candidates can apply - recruiters/admins cannot
            if (user.role === 'recruiter' || user.role === 'admin') {
                setHasApplied(false);
                setCheckingStatus(false);
                return;
            }

            try {
                // Check application status based on type
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
                // If API fails, assume not applied
                setHasApplied(false);
            } finally {
                setCheckingStatus(false);
            }
        };

        checkApplicationStatus();
    }, [data?.id, isAuthenticated, user]);

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

    // MOCK DATA REMOVED - Using only database data
    /* const getJobData = (identifier) => {
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
                id: '22222222-2222-2222-2222-222222222222',
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
    }; */

    /* const mockData = {
        jobs: getJobData(id || slug),
        events: (() => {
            const events = [
                {
                    id: '33333333-3333-3333-3333-333333333333',
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
                    id: '44444444-4444-4444-4444-444444444444',
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
                    id: '55555555-5555-5555-5555-555555555555',
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
                    id: '66666666-6666-6666-6666-666666666666',
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
    }; */

    // Initialize data and active tab - USING ONLY DATABASE DATA
    useEffect(() => {
        const fetchData = async () => {
            if (!type || !slug) return;

            setPreloaderVisible(true); // Show preloader when fetching starts

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
                        setPreloaderVisible(false);
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
                    // No data found - show error
                    console.error(`${type} not found`);
                    setData(null);
                }
            } catch (error) {
                // Error fetching data
                console.error(`Error fetching ${type}:`, error);
                setData(null);
            } finally {
                // Hide preloader after data is loaded or error occurs
                setTimeout(() => setPreloaderVisible(false), 500); // Small delay for smooth transition
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

    // Check application status when data loads
    useEffect(() => {
        if (data && isAuthenticated) {
            checkApplicationStatus();
        } else {
            setCheckingStatus(false);
        }
    }, [data, isAuthenticated]);

    // Check bookmark and like status on load
    useEffect(() => {
        const checkStatus = async () => {
            if (data?.id && isAuthenticated) {
                try {
                    const [bookmarkStatus, likeStatus] = await Promise.all([
                        apiService.checkBookmarkStatus(data.id, type),
                        apiService.checkLikeStatus(data.id, type)
                    ]);
                    
                    setIsBookmarked(bookmarkStatus.bookmarked);
                    setIsLiked(likeStatus.liked);
                } catch (error) {
                    console.error('Error checking bookmark/like status:', error);
                    setIsBookmarked(false);
                    setIsLiked(false);
                }
            } else {
                setIsBookmarked(false);
                setIsLiked(false);
            }
        };

        checkStatus();
    }, [data?.id, type, isAuthenticated]);

    const scrollToSection = (sectionId) => {
        console.log('UnifiedDetailsPage - Scrolling to section:', sectionId); // Debug log
        
        // Try to use ModernDetailsPage's scroll function if available
        if (window.modernDetailsScrollToSection) {
            window.modernDetailsScrollToSection(sectionId);
            return;
        }
        
        // Fallback to direct scroll
        const section = document.getElementById(sectionId);
        const pageWrapper = document.querySelector('.page-content-wrapper');
        
        if (!section) {
            console.error('Section not found:', sectionId);
            return;
        }
        
        if (pageWrapper) {
            // Update active tab
            setActiveTab(sectionId);
            
            // Calculate the absolute position of the section
            const pageWrapperRect = pageWrapper.getBoundingClientRect();
            const sectionRect = section.getBoundingClientRect();
            const currentScroll = pageWrapper.scrollTop;
            
            // Calculate target scroll position
            const targetScroll = currentScroll + sectionRect.top - pageWrapperRect.top - 100;
            
            console.log('Scrolling to:', targetScroll); // Debug log
            
            pageWrapper.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        } else {
            console.error('Page wrapper not found');
        }
    };

    const checkApplicationStatus = async () => {
        if (!isAuthenticated || !data?.id) {
            setCheckingStatus(false);
            return;
        }

        // Check application status from backend
        try {
            let statusResult = null;

            switch (type) {
                case 'jobs':
                    statusResult = await apiService.checkJobApplicationStatus(data.id);
                    break;
                case 'events':
                    statusResult = await apiService.checkEventRegistrationStatus(data.id);
                    break;
                case 'internships':
                    statusResult = await apiService.checkHubContentApplicationStatus(data.id);
                    break;
                default:
                    break;
            }

            if (statusResult && statusResult.hasApplied) {
                setHasApplied(true);
            } else {
                setHasApplied(false);
            }
        } catch (error) {
            console.error('Error checking application status:', error);
            setHasApplied(false);
        } finally {
            setCheckingStatus(false);
        }
    };

    const handleApply = async () => {
        if (!isAuthenticated) {
            // Store the current page info before redirecting to login
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            navigate('/login');
            return;
        }

        // Only candidates can apply
        if (user?.role === 'recruiter' || user?.role === 'admin') {
            alert('Recruiters and admins cannot apply. Only candidates can apply.');
            return;
        }

        if (hasApplied) {
            return; // Already applied, do nothing
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
            
            // Show user-friendly error message
            if (errorMessage.includes('Already applied')) {
                alert('You have already applied to this position.');
                setHasApplied(true);
            } else if (errorMessage.includes('not found')) {
                alert('This position is no longer available.');
            } else {
                alert(`Failed to apply: ${errorMessage}`);
            }
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

    // Share functions
    const handleShare = (platform) => {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(data?.title || 'Check this out');
        
        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            copy: null
        };

        if (platform === 'copy') {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        } else {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    };

    // Bookmark function
    const handleBookmark = async () => {
        if (!isAuthenticated) {
            alert('Please login to bookmark');
            return;
        }

        try {
            const result = await apiService.toggleBookmark(data?.id, type);
            setIsBookmarked(result.bookmarked);
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            alert('Failed to update bookmark');
        }
    };

    // Like function
    const handleLike = async () => {
        if (!isAuthenticated) {
            alert('Please login to like');
            return;
        }

        try {
            const result = await apiService.toggleLike(data?.id, type);
            setIsLiked(result.liked);
        } catch (error) {
            console.error('Error toggling like:', error);
            alert('Failed to update like');
        }
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
        <>
            {preloaderVisible && (
                <div className="preloader">
                    <div className="loading-container">
                        <div className="loading"></div>
                        <div id="loading-icon">
                            <img src="/assets/img/logo/preloader.png" alt="" />
                        </div>
                    </div>
                </div>
            )}
            <div className="paginacontainer">
                <div className="progress-wrap warp2">
                    <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
                        <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
                    </svg>
                </div>
            </div>
            <div className="details-page unified-details-page">
                <div className={`top-nav visible ${isHeaderSticky ? 'sticky' : ''}`}>
                <div className="nav-container">
                    <div className="nav-left">
                        <div className="site-logo" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>
                            <img src="/assets/img/logo/logo5.png" alt="ROAC Logo" />
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
                        {isAuthenticated && user ? (
                            <div className="auth-buttons">
                                <button 
                                    className="dashboard-btn"
                                    onClick={() => {
                                        // Redirect to appropriate dashboard
                                        if (user.role === 'admin') {
                                            navigate('/admin-dashboard');
                                        } else if (user.role === 'recruiter') {
                                            navigate('/recruiter-dashboard');
                                        } else {
                                            navigate('/candidate-dashboard');
                                        }
                                    }}
                                >
                                    Dashboard
                                </button>
                                <button 
                                    className="logout-btn"
                                    onClick={() => {
                                        // Logout and redirect to home
                                        localStorage.removeItem('token');
                                        window.location.href = '/';
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="auth-buttons">
                                <button 
                                    className="login-btn"
                                    onClick={() => navigate('/login')}
                                >
                                    Login
                                </button>
                                <button 
                                    className="signup-btn"
                                    onClick={() => navigate('/register')}
                                >
                                    Join as Recruiter
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Page Content Wrapper - Scrollable */}
            <div className="page-content-wrapper">
                {/* Hero Image Section - Full Width, Above Grid */}
                {data && (
                    <div className="hero-section-wrapper">
                        <div className="hero-section" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <img 
                                src={data.image || data.coverImage || data.bannerImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop'} 
                                alt={data.title}
                                className="hero-section-image"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                            <div className="hero-section-overlay"></div>
                        </div>
                    </div>
                )}

                {/* Main Content Container */}
                <div className="main-container">
                {/* Left Content Area - NEW MODERN DESIGN */}
                <ModernDetailsPage />

                {/* Right Sidebar */}
                <div className="right-sidebar">
                    {/* Action Card */}
                    <div className="action-card">
                        <div className="action-header">
                            <Heart 
                                size={20} 
                                fill={isLiked ? '#ff4444' : 'none'}
                                color={isLiked ? '#ff4444' : 'currentColor'}
                                style={{ cursor: 'pointer' }}
                                onClick={handleLike}
                                title={isLiked ? 'Unlike' : 'Like'}
                            />
                            <Bookmark 
                                size={20}
                                fill={isBookmarked ? '#FFD600' : 'none'}
                                color={isBookmarked ? '#FFD600' : 'currentColor'}
                                style={{ cursor: 'pointer' }}
                                onClick={handleBookmark}
                                title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                            />
                            <Share2 
                                size={20}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setShowShareMenu(!showShareMenu)}
                                title="Share"
                            />
                            {showShareMenu && (
                                <div className="share-dropdown">
                                    <button onClick={() => { handleShare('facebook'); setShowShareMenu(false); }}>
                                        Facebook
                                    </button>
                                    <button onClick={() => { handleShare('twitter'); setShowShareMenu(false); }}>
                                        Twitter
                                    </button>
                                    <button onClick={() => { handleShare('linkedin'); setShowShareMenu(false); }}>
                                        LinkedIn
                                    </button>
                                    <button onClick={() => { handleShare('copy'); setShowShareMenu(false); }}>
                                        Copy Link
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="price-section">
                            <span className="price">{getPriceDisplay()}</span>
                        </div>

                        {/* Only show apply button for candidates (not recruiters or admins) */}
                        {(!user || user.role === 'candidate') && (
                            <button
                                className={`apply-button ${hasApplied ? 'applied' : ''}`}
                                onClick={handleApply}
                                disabled={isApplying || hasApplied || checkingStatus}
                                style={{
                                    opacity: (isApplying || checkingStatus) ? 0.8 : hasApplied ? 0.7 : 1,
                                    cursor: (isApplying || hasApplied || checkingStatus) ? 'not-allowed' : 'pointer',
                                    backgroundColor: hasApplied ? '#28a745' : '',
                                    borderColor: hasApplied ? '#28a745' : ''
                                }}
                            >
                                {checkingStatus ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <span style={{ 
                                            width: '16px', 
                                            height: '16px', 
                                            border: '2px solid #1A1719', 
                                            borderTop: '2px solid transparent', 
                                            borderRadius: '50%', 
                                            animation: 'spin 1s linear infinite' 
                                        }}></span>
                                        Checking...
                                    </span>
                                ) : isApplying ? (
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
                                ) : hasApplied ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <span style={{ color: 'white' }}>✓</span>
                                        Applied
                                    </span>
                                ) : 'Quick Apply'}
                            </button>
                        )}

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

                                    {/* <div className="stat-item-individual">
                                        <div className="stat-icon">
                                            <Share2 size={20} />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Impressions</span>
                                            <span className="stat-number">{data.impressions?.toLocaleString()}</span>
                                        </div>
                                    </div> */}

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
{/* 
                                    <div className="stat-item-individual">
                                        <div className="stat-icon">
                                            <Share2 size={20} />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Impressions</span>
                                            <span className="stat-number">{data.impressions?.toLocaleString()}</span>
                                        </div>
                                    </div> */}

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

                                    {/* <div className="stat-item-individual">
                                        <div className="stat-icon">
                                            <Share2 size={20} />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Impressions</span>
                                            <span className="stat-number">{data.impressions?.toLocaleString()}</span>
                                        </div>
                                    </div> */}

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
                    {/* <div className="info-card compact">
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
                    </div> */}

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
            {/* End Page Content Wrapper */}
            </div>
        </div>
        </>
    );
};

export default UnifiedDetailsPage;