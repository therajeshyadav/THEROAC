const { Event, User } = require('./src/models');

const dummyEvents = [
  {
    title: 'React Workshop for Beginners',
    description: 'Learn the fundamentals of React.js in this hands-on workshop. Perfect for developers who want to get started with modern frontend development.',
    eventType: 'workshop',
    startDate: new Date('2024-12-25T10:00:00'),
    endDate: new Date('2024-12-25T16:00:00'),
    locationType: 'online',
    location: 'Zoom Meeting',
    registrationDeadline: new Date('2024-12-23T23:59:59'),
    maxParticipants: 50,
    registrationFee: { amount: '0', currency: 'USD', type: 'free' },
    tags: ['react', 'javascript', 'frontend', 'beginner'],
    categories: ['workshop', 'technology'],
    requirements: 'Basic knowledge of HTML, CSS, and JavaScript',
    whatToBring: ['Laptop', 'Code editor installed', 'Node.js installed'],
    bannerImage: '/assets/react-workshop-banner.jpg',
    thumbnailImage: '/assets/react-workshop-thumb.jpg',
    contactInfo: { email: 'events@techcorp.com', phone: '+1-555-0123', website: 'https://techcorp.com' },
    socials: { facebook: 'https://facebook.com/techcorp', twitter: 'https://twitter.com/techcorp' },
    agenda: [
      { time: '10:00 AM', title: 'Registration & Welcome', description: 'Check-in and welcome coffee' },
      { time: '10:30 AM', title: 'Introduction to React', description: 'Understanding React fundamentals and concepts' },
      { time: '12:00 PM', title: 'Hands-on Coding', description: 'Building your first React component' },
      { time: '1:00 PM', title: 'Lunch Break', description: 'Networking and refreshments' },
      { time: '2:00 PM', title: 'Advanced Topics', description: 'State management and hooks' },
      { time: '4:00 PM', title: 'Project Showcase', description: 'Present your React projects' }
    ],
    speakers: [
      { name: 'John Doe', title: 'Senior React Developer', bio: 'Expert in React with 5+ years experience', image: '/assets/speaker-john.jpg' },
      { name: 'Jane Smith', title: 'Frontend Architect', bio: 'Passionate about modern web development', image: '/assets/speaker-jane.jpg' }
    ],
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800', thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800', thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=Ke90Tje7VS0', thumbnail: 'https://img.youtube.com/vi/Ke90Tje7VS0/maxresdefault.jpg' }
    ],
    faqs: [
      { question: 'Do I need prior React experience?', answer: 'No, this workshop is designed for beginners. Basic knowledge of HTML, CSS, and JavaScript is sufficient.' },
      { question: 'What should I bring to the workshop?', answer: 'Please bring your laptop with a code editor (VS Code recommended) and Node.js installed.' },
      { question: 'Will there be recordings available?', answer: 'Yes, all participants will receive access to workshop recordings within 24 hours.' },
      { question: 'Is there a certificate provided?', answer: 'Yes, you will receive a certificate of completion after finishing the workshop.' }
    ],
    featured: true,
    status: 'upcoming',
    approvalStatus: 'approved'
  },
  {
    title: 'AI & Machine Learning Conference 2024',
    description: 'Join industry experts and researchers for a comprehensive conference on the latest trends in AI and Machine Learning.',
    eventType: 'conference',
    startDate: new Date('2024-12-28T09:00:00'),
    endDate: new Date('2024-12-29T18:00:00'),
    locationType: 'hybrid',
    location: 'Zoom + Tech Convention Center',
    venue: 'Tech Convention Center',
    city: 'San Francisco',
    state: 'California',
    country: 'USA',
    venueAddress: '123 Tech Street, San Francisco, CA 94105',
    registrationDeadline: new Date('2024-12-26T23:59:59'),
    maxParticipants: 500,
    registrationFee: { amount: '299', currency: 'USD', type: 'paid' },
    tags: ['ai', 'machine-learning', 'conference', 'networking'],
    categories: ['conference', 'artificial-intelligence'],
    requirements: 'Background in computer science or related field recommended',
    whatToBring: ['Business cards', 'Notebook', 'Laptop'],
    bannerImage: '/assets/ai-conference-banner.jpg',
    thumbnailImage: '/assets/ai-conference-thumb.jpg',
    contactInfo: { email: 'info@aiconf.com', phone: '+1-555-0456', website: 'https://aiconf2024.com' },
    socials: { linkedin: 'https://linkedin.com/company/aiconf', twitter: 'https://twitter.com/aiconf2024' },
    agenda: [
      { time: '9:00 AM', title: 'Registration & Breakfast', description: 'Welcome and networking breakfast' },
      { time: '10:00 AM', title: 'Keynote: Future of AI', description: 'Opening keynote on AI trends', speaker: 'Dr. Sarah Johnson' },
      { time: '11:30 AM', title: 'Machine Learning in Practice', description: 'Real-world ML applications', speaker: 'Prof. Michael Chen' },
      { time: '1:00 PM', title: 'Lunch & Networking', description: 'Networking lunch with industry leaders' },
      { time: '2:30 PM', title: 'Panel: Ethics in AI', description: 'Discussion on AI ethics and responsibility' },
      { time: '4:00 PM', title: 'Workshops', description: 'Hands-on AI/ML workshops' },
      { time: '6:00 PM', title: 'Closing & Awards', description: 'Conference wrap-up and recognition' }
    ],
    speakers: [
      { name: 'Dr. Sarah Johnson', title: 'AI Research Director', bio: 'Leading AI researcher with 15+ years experience', image: '/assets/speaker-sarah.jpg' },
      { name: 'Prof. Michael Chen', title: 'ML Professor', bio: 'Stanford professor specializing in deep learning', image: '/assets/speaker-michael.jpg' },
      { name: 'Lisa Rodriguez', title: 'AI Ethics Expert', bio: 'Expert in responsible AI development', image: '/assets/speaker-lisa.jpg' }
    ],
    sponsors: [
      { name: 'TechCorp', logo: '/assets/sponsor-techcorp.png', tier: 'Gold', website: 'https://techcorp.com' },
      { name: 'AI Solutions', logo: '/assets/sponsor-ai.png', tier: 'Silver', website: 'https://aisolutions.com' }
    ],
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800', thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=aircAruvnKk', thumbnail: 'https://img.youtube.com/vi/aircAruvnKk/maxresdefault.jpg' }
    ],
    faqs: [
      { question: 'What is the dress code for the conference?', answer: 'Business casual attire is recommended for networking opportunities.' },
      { question: 'Are meals included in the registration fee?', answer: 'Yes, breakfast, lunch, and networking dinner are included for both days.' },
      { question: 'Can I attend virtually?', answer: 'Yes, this is a hybrid event. Virtual attendees will have access to all sessions and Q&A.' },
      { question: 'Will presentations be available after the event?', answer: 'Yes, all presentation slides will be shared with attendees within one week.' }
    ],
    featured: true,
    status: 'upcoming',
    approvalStatus: 'approved'
  },
  {
    title: 'Startup Pitch Competition',
    description: 'Present your startup idea to a panel of investors and win up to $50,000 in funding plus mentorship opportunities.',
    eventType: 'competition',
    startDate: new Date('2024-12-30T14:00:00'),
    endDate: new Date('2024-12-30T20:00:00'),
    locationType: 'offline',
    venue: 'Innovation Hub',
    city: 'Austin',
    state: 'Texas',
    country: 'USA',
    venueAddress: '456 Innovation Drive, Austin, TX 78701',
    registrationDeadline: new Date('2024-12-27T23:59:59'),
    maxParticipants: 20,
    registrationFee: { amount: '50', currency: 'USD', type: 'paid' },
    tags: ['startup', 'pitch', 'competition', 'funding'],
    categories: ['competition', 'entrepreneurship'],
    requirements: 'Must have a viable startup idea or early-stage company',
    whatToBring: ['Pitch deck', 'Business plan', 'Demo materials'],
    prizes: [
      { position: '1st Place', prize: '$50,000 + 6 months mentorship' },
      { position: '2nd Place', prize: '$25,000 + 3 months mentorship' },
      { position: '3rd Place', prize: '$10,000 + 1 month mentorship' }
    ],
    bannerImage: '/assets/pitch-competition-banner.jpg',
    thumbnailImage: '/assets/pitch-competition-thumb.jpg',
    contactInfo: { email: 'competition@innovationhub.com', phone: '+1-555-0789' },
    socials: { linkedin: 'https://linkedin.com/company/innovationhub' },
    featured: false,
    status: 'upcoming',
    approvalStatus: 'approved'
  },
  {
    title: 'Web Development Bootcamp',
    description: 'Intensive 3-day bootcamp covering HTML, CSS, JavaScript, and modern frameworks. Build real projects and get job-ready skills.',
    eventType: 'training',
    startDate: new Date('2025-01-05T09:00:00'),
    endDate: new Date('2025-01-07T17:00:00'),
    locationType: 'offline',
    venue: 'Code Academy',
    city: 'New York',
    state: 'New York',
    country: 'USA',
    venueAddress: '789 Learning Ave, New York, NY 10001',
    registrationDeadline: new Date('2025-01-02T23:59:59'),
    maxParticipants: 30,
    registrationFee: { amount: '599', currency: 'USD', type: 'paid' },
    tags: ['web-development', 'bootcamp', 'javascript', 'career'],
    categories: ['training', 'web-development'],
    requirements: 'No prior experience required, just enthusiasm to learn',
    whatToBring: ['Laptop', 'Charger', 'Notebook'],
    bannerImage: '/assets/bootcamp-banner.jpg',
    thumbnailImage: '/assets/bootcamp-thumb.jpg',
    contactInfo: { email: 'bootcamp@codeacademy.com', phone: '+1-555-0321' },
    socials: { instagram: 'https://instagram.com/codeacademy', facebook: 'https://facebook.com/codeacademy' },
    featured: true,
    status: 'upcoming',
    approvalStatus: 'approved'
  },
  {
    title: 'Tech Networking Meetup',
    description: 'Monthly networking event for tech professionals. Connect with like-minded individuals, share experiences, and build your professional network.',
    eventType: 'networking',
    startDate: new Date('2025-01-15T18:00:00'),
    endDate: new Date('2025-01-15T21:00:00'),
    locationType: 'offline',
    venue: 'Tech Lounge',
    city: 'Seattle',
    state: 'Washington',
    country: 'USA',
    venueAddress: '321 Network Street, Seattle, WA 98101',
    registrationDeadline: new Date('2025-01-13T23:59:59'),
    maxParticipants: 100,
    registrationFee: { amount: '0', currency: 'USD', type: 'free' },
    tags: ['networking', 'tech', 'professionals', 'meetup'],
    categories: ['networking', 'professional-development'],
    requirements: 'Open to all tech professionals and enthusiasts',
    whatToBring: ['Business cards', 'Positive attitude'],
    bannerImage: '/assets/networking-banner.jpg',
    thumbnailImage: '/assets/networking-thumb.jpg',
    contactInfo: { email: 'meetup@techlounge.com', phone: '+1-555-0654' },
    socials: { linkedin: 'https://linkedin.com/groups/tech-networking-seattle' },
    featured: false,
    status: 'upcoming',
    approvalStatus: 'approved'
  },
  {
    title: 'Cybersecurity Webinar Series',
    description: 'Learn about the latest cybersecurity threats and how to protect your organization. Part of our monthly webinar series.',
    eventType: 'webinar',
    startDate: new Date('2025-01-20T15:00:00'),
    endDate: new Date('2025-01-20T16:30:00'),
    locationType: 'online',
    location: 'Microsoft Teams',
    registrationDeadline: new Date('2025-01-18T23:59:59'),
    maxParticipants: 200,
    registrationFee: { amount: '0', currency: 'USD', type: 'free' },
    tags: ['cybersecurity', 'webinar', 'security', 'online'],
    categories: ['webinar', 'cybersecurity'],
    requirements: 'Basic understanding of IT concepts helpful but not required',
    whatToBring: ['Stable internet connection', 'Headphones recommended'],
    bannerImage: '/assets/cybersecurity-banner.jpg',
    thumbnailImage: '/assets/cybersecurity-thumb.jpg',
    contactInfo: { email: 'security@cyberexperts.com', website: 'https://cyberexperts.com' },
    socials: { twitter: 'https://twitter.com/cyberexperts', linkedin: 'https://linkedin.com/company/cyberexperts' },
    featured: false,
    status: 'upcoming',
    approvalStatus: 'approved'
  }
];

async function createDummyEvents() {
  try {
    console.log('Creating dummy events...');
    
    // Find a recruiter user to assign as creator
    const recruiter = await User.findOne({ where: { role: 'recruiter' } });
    
    if (!recruiter) {
      console.log('No recruiter found. Please create a recruiter user first.');
      return;
    }

    console.log(`Using recruiter: ${recruiter.email} (ID: ${recruiter.id})`);

    for (const eventData of dummyEvents) {
      // Generate slug from title
      let baseSlug = eventData.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

      if (!baseSlug) baseSlug = 'event';

      // Ensure slug is unique
      let slug = baseSlug;
      let counter = 1;
      while (await Event.findOne({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const event = await Event.create({
        ...eventData,
        slug,
        createdBy: recruiter.id,
        views: Math.floor(Math.random() * 100) + 10, // Random views between 10-110
        registrations: Math.floor(Math.random() * 20) + 5 // Random registrations between 5-25
      });

      console.log(`Created event: ${event.title} (${event.eventType})`);
    }

    console.log('All dummy events created successfully!');
  } catch (error) {
    console.error('Error creating dummy events:', error);
  }
}

// Run the script
createDummyEvents().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});