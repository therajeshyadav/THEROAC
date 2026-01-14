const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// Quick comprehensive events seeder with proper JSON formatting
const events = [
  {
    id: uuidv4(),
    title: 'Full-Stack Web Development Workshop',
    slug: 'full-stack-web-development-workshop',
    description: 'Master modern web development with React, Node.js, and MongoDB. Build real projects and get hands-on experience.',
    startDate: new Date('2024-02-15T10:00:00Z'),
    endDate: new Date('2024-02-15T17:00:00Z'),
    registrationDeadline: new Date('2024-02-10T23:59:59Z'),
    status: 'upcoming',
    approvalStatus: 'approved',
    locationType: 'hybrid',
    location: 'Tech Campus Mumbai + Online',
    venue: 'Innovation Center',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    categories: ['workshop'],
    tags: ['web-development', 'react', 'nodejs', 'mongodb'],
    maxParticipants: 50,
    registrationFee: { type: 'paid', amount: 2500, currency: 'INR' },
    agenda: [
      { time: '10:00 AM', title: 'Introduction to Full-Stack', description: 'Overview of modern web development' },
      { time: '2:00 PM', title: 'Backend with Node.js', description: 'Server-side development' }
    ],
    speakers: [{ name: 'Arjun Sharma', title: 'Senior Developer', bio: '8+ years experience' }],
    requirements: 'Basic knowledge of HTML, CSS, and JavaScript',
    whatToBring: ['Laptop', 'Code editor installed'],
    contactInfo: { email: 'workshop@techcampus.com', phone: '+91-9876543210' }
  },
  {
    id: uuidv4(),
    title: 'AI Ethics Seminar',
    slug: 'ai-ethics-seminar',
    description: 'Explore the ethical implications of AI and discuss the future of technology.',
    startDate: new Date('2024-02-20T14:00:00Z'),
    endDate: new Date('2024-02-20T16:30:00Z'),
    registrationDeadline: new Date('2024-02-18T23:59:59Z'),
    status: 'upcoming',
    approvalStatus: 'approved',
    locationType: 'online',
    location: 'Zoom Webinar',
    categories: ['seminar'],
    tags: ['AI', 'ethics', 'technology'],
    maxParticipants: 200,
    registrationFee: { type: 'free' },
    agenda: [
      { time: '2:00 PM', title: 'AI Ethics Panel', description: 'Expert panel discussion' },
      { time: '4:00 PM', title: 'Q&A Session', description: 'Audience questions' }
    ],
    speakers: [{ name: 'Dr. Rajesh Kumar', title: 'AI Ethics Researcher', bio: 'Leading researcher in AI ethics' }],
    contactInfo: { email: 'seminar@aiethics.org' }
  },
  {
    id: uuidv4(),
    title: 'DevOps Conference 2024',
    slug: 'devops-conference-2024',
    description: 'Two-day conference covering the latest in DevOps practices and cloud technologies.',
    startDate: new Date('2024-03-05T09:00:00Z'),
    endDate: new Date('2024-03-06T17:00:00Z'),
    registrationDeadline: new Date('2024-03-01T23:59:59Z'),
    status: 'upcoming',
    approvalStatus: 'approved',
    locationType: 'offline',
    location: 'Bangalore Convention Center',
    venue: 'International Convention Centre',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    categories: ['conference'],
    tags: ['devops', 'cloud', 'aws', 'kubernetes'],
    maxParticipants: 500,
    registrationFee: { type: 'paid', amount: 8500, currency: 'INR' },
    agenda: [
      { time: 'Day 1 - 9:00 AM', title: 'Keynote: Future of DevOps', description: 'Opening keynote' },
      { time: 'Day 2 - 9:00 AM', title: 'CI/CD Pipelines', description: 'Automation strategies' }
    ],
    speakers: [{ name: 'John Mitchell', title: 'DevOps Architect', bio: 'Former AWS Solutions Architect' }],
    sponsors: [{ name: 'AWS', tier: 'Platinum', website: 'https://aws.amazon.com' }],
    contactInfo: { email: 'conference@devopscloud.com', phone: '+91-9876543211' }
  },
  {
    id: uuidv4(),
    title: 'FinTech Hackathon 2024',
    slug: 'fintech-hackathon-2024',
    description: '48-hour hackathon to build innovative financial technology solutions.',
    startDate: new Date('2024-03-15T18:00:00Z'),
    endDate: new Date('2024-03-17T18:00:00Z'),
    registrationDeadline: new Date('2024-03-10T23:59:59Z'),
    status: 'upcoming',
    approvalStatus: 'approved',
    locationType: 'hybrid',
    location: 'FinTech Hub Delhi + Online',
    venue: 'Innovation District',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    categories: ['hackathon'],
    tags: ['fintech', 'blockchain', 'payments', 'innovation'],
    maxParticipants: 150,
    registrationFee: { type: 'paid', amount: 1000, currency: 'INR' },
    prizes: [
      { position: '1st Place', prize: '₹2,00,000 + Incubation', description: 'Winner gets cash prize and startup incubation' },
      { position: '2nd Place', prize: '₹1,00,000', description: 'Runner-up prize' }
    ],
    stages: [
      {
        title: 'Team Registration',
        description: 'Form teams and submit your FinTech innovation idea.',
        startDate: '2024-02-15T00:00:00Z',
        deadline: '2024-03-10T23:59:59Z',
        submissions: [
          { type: 'document', label: 'Team Details', description: 'Team member information (PDF)', required: true },
          { type: 'document', label: 'Idea Pitch', description: 'Your FinTech solution concept', required: true }
        ]
      },
      {
        title: 'Development Phase',
        description: 'Build your FinTech solution prototype.',
        startDate: '2024-03-15T18:00:00Z',
        deadline: '2024-03-17T12:00:00Z',
        submissions: [
          { type: 'github-link', label: 'Source Code', description: 'Complete GitHub repository', required: true },
          { type: 'demo-video', label: 'Product Demo', description: '5-minute demo video', required: true }
        ]
      }
    ],
    sponsors: [{ name: 'Razorpay', tier: 'Title', website: 'https://razorpay.com' }],
    contactInfo: { email: 'hackathon@fintechhub.com', phone: '+91-9876543212' }
  },
  {
    id: uuidv4(),
    title: 'Data Science Competition',
    slug: 'data-science-competition',
    description: 'Multi-round data science competition. Solve real-world problems using machine learning.',
    startDate: new Date('2024-04-01T10:00:00Z'),
    endDate: new Date('2024-04-01T18:00:00Z'),
    registrationDeadline: new Date('2024-03-25T23:59:59Z'),
    status: 'upcoming',
    approvalStatus: 'approved',
    locationType: 'online',
    location: 'Online Platform',
    categories: ['competition'],
    tags: ['data-science', 'machine-learning', 'python'],
    maxParticipants: 300,
    registrationFee: { type: 'paid', amount: 750, currency: 'INR' },
    prizes: [
      { position: 'Winner', prize: '₹1,50,000', description: 'Champion prize and certificate' },
      { position: 'Runner-up', prize: '₹75,000', description: 'Second place prize' }
    ],
    stages: [
      {
        title: 'Qualification Round',
        description: 'Solve basic data science problems to qualify.',
        startDate: '2024-04-01T10:00:00Z',
        deadline: '2024-04-01T13:00:00Z',
        submissions: [
          { type: 'code', label: 'Solution Code', description: 'Python/R code with analysis', required: true }
        ]
      }
    ],
    contactInfo: { email: 'competition@datascience.org' }
  },
  {
    id: uuidv4(),
    title: 'Tech Career Fair 2024',
    slug: 'tech-career-fair-2024',
    description: 'Premier tech career fair connecting talented developers with top companies.',
    startDate: new Date('2024-04-15T09:00:00Z'),
    endDate: new Date('2024-04-15T17:00:00Z'),
    registrationDeadline: new Date('2024-04-10T23:59:59Z'),
    status: 'upcoming',
    approvalStatus: 'approved',
    locationType: 'offline',
    location: 'Hyderabad Tech Park',
    venue: 'HITEC City Convention Center',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    categories: ['career-fair'],
    tags: ['jobs', 'career', 'tech', 'interviews'],
    maxParticipants: 800,
    registrationFee: { type: 'free' },
    stages: [
      {
        title: 'Profile Submission',
        description: 'Submit your professional profile for company review.',
        startDate: '2024-03-15T00:00:00Z',
        deadline: '2024-04-10T23:59:59Z',
        submissions: [
          { type: 'document', label: 'Resume', description: 'Updated resume (PDF)', required: true }
        ]
      }
    ],
    sponsors: [{ name: 'TCS', tier: 'Platinum', website: 'https://tcs.com' }],
    contactInfo: { email: 'careers@techtalent.com', phone: '+91-9876543213' }
  },
  {
    id: uuidv4(),
    title: 'Cybersecurity Webinar',
    slug: 'cybersecurity-webinar',
    description: 'Learn essential cybersecurity practices to protect your organization.',
    startDate: new Date('2024-04-25T15:00:00Z'),
    endDate: new Date('2024-04-25T16:30:00Z'),
    registrationDeadline: new Date('2024-04-24T23:59:59Z'),
    status: 'upcoming',
    approvalStatus: 'approved',
    locationType: 'online',
    location: 'Zoom Webinar',
    categories: ['webinar'],
    tags: ['cybersecurity', 'security', 'best-practices'],
    maxParticipants: 1000,
    registrationFee: { type: 'free' },
    agenda: [
      { time: '3:00 PM', title: 'Current Threat Landscape', description: 'Overview of cybersecurity threats' },
      { time: '4:10 PM', title: 'Q&A Session', description: 'Audience questions' }
    ],
    speakers: [{ name: 'Alex Rodriguez', title: 'Cybersecurity Expert', bio: '15+ years in information security' }],
    contactInfo: { email: 'webinar@cybersec.org' }
  },
  {
    id: uuidv4(),
    title: 'Python Bootcamp',
    slug: 'python-bootcamp',
    description: 'Intensive 5-day Python bootcamp covering advanced concepts and real-world applications.',
    startDate: new Date('2024-05-06T09:00:00Z'),
    endDate: new Date('2024-05-10T17:00:00Z'),
    registrationDeadline: new Date('2024-05-01T23:59:59Z'),
    status: 'upcoming',
    approvalStatus: 'approved',
    locationType: 'hybrid',
    location: 'Python Academy Chennai + Online',
    venue: 'Tech Training Center',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    categories: ['training'],
    tags: ['python', 'programming', 'bootcamp', 'advanced'],
    maxParticipants: 30,
    registrationFee: { type: 'paid', amount: 15000, currency: 'INR' },
    agenda: [
      { time: 'Day 1', title: 'Advanced Python Concepts', description: 'Decorators, generators, context managers' },
      { time: 'Day 5', title: 'Final Project', description: 'Build and present your project' }
    ],
    speakers: [{ name: 'Vikram Patel', title: 'Senior Python Developer', bio: 'Python expert with 10+ years experience' }],
    requirements: 'Basic Python knowledge required. Laptop with Python 3.8+ installed.',
    whatToBring: ['Laptop', 'Python IDE', 'Notebook for notes'],
    contactInfo: { email: 'training@pythonacademy.com', phone: '+91-9876543214' }
  },
  {
    id: uuidv4(),
    title: 'Tech Leaders Networking',
    slug: 'tech-leaders-networking',
    description: 'Exclusive networking event for tech professionals and industry leaders.',
    startDate: new Date('2024-05-20T18:00:00Z'),
    endDate: new Date('2024-05-20T21:00:00Z'),
    registrationDeadline: new Date('2024-05-18T23:59:59Z'),
    status: 'upcoming',
    approvalStatus: 'approved',
    locationType: 'offline',
    location: 'Sky Lounge, Pune',
    venue: 'Premium Business Hotel',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    categories: ['networking'],
    tags: ['networking', 'tech-leaders', 'entrepreneurs'],
    maxParticipants: 100,
    registrationFee: { type: 'paid', amount: 2000, currency: 'INR' },
    agenda: [
      { time: '6:00 PM', title: 'Welcome Reception', description: 'Registration and welcome drinks' },
      { time: '8:30 PM', title: 'Open Networking', description: 'Free-form networking and dinner' }
    ],
    contactInfo: { email: 'networking@techleaders.com', phone: '+91-9876543215' }
  },
  {
    id: uuidv4(),
    title: 'React Developers Meetup',
    slug: 'react-developers-meetup',
    description: 'Monthly meetup for React developers. Share knowledge and connect with fellow developers.',
    startDate: new Date('2024-05-25T14:00:00Z'),
    endDate: new Date('2024-05-25T17:00:00Z'),
    registrationDeadline: new Date('2024-05-24T23:59:59Z'),
    status: 'upcoming',
    approvalStatus: 'approved',
    locationType: 'offline',
    location: 'Co-working Space, Gurgaon',
    venue: 'Innovation Hub',
    city: 'Gurgaon',
    state: 'Haryana',
    country: 'India',
    categories: ['meetup'],
    tags: ['react', 'javascript', 'frontend', 'developers'],
    maxParticipants: 60,
    registrationFee: { type: 'free' },
    agenda: [
      { time: '2:00 PM', title: 'Welcome & Introductions', description: 'Meet fellow developers' },
      { time: '4:30 PM', title: 'Open Discussion', description: 'Q&A and networking' }
    ],
    speakers: [{ name: 'Amit Singh', title: 'React Developer', bio: 'Frontend specialist with React expertise' }],
    contactInfo: { email: 'meetup@reactdev.com' }
  },
  {
    id: uuidv4(),
    title: 'Tech Innovation Expo',
    slug: 'tech-innovation-expo',
    description: 'Showcase of cutting-edge technology innovations. Explore latest products and emerging technologies.',
    startDate: new Date('2024-06-10T10:00:00Z'),
    endDate: new Date('2024-06-12T18:00:00Z'),
    registrationDeadline: new Date('2024-06-05T23:59:59Z'),
    status: 'upcoming',
    approvalStatus: 'approved',
    locationType: 'offline',
    location: 'Exhibition Center, Mumbai',
    venue: 'Bombay Exhibition Centre',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    categories: ['expo'],
    tags: ['innovation', 'technology', 'exhibition', 'products'],
    maxParticipants: 2000,
    registrationFee: { type: 'paid', amount: 1500, currency: 'INR' },
    agenda: [
      { time: 'Day 1', title: 'Expo Opening', description: 'Grand opening ceremony' },
      { time: 'Day 3', title: 'Innovation Awards', description: 'Recognition ceremony' }
    ],
    sponsors: [{ name: 'Tech Corp', tier: 'Title', website: 'https://techcorp.com' }],
    contactInfo: { email: 'expo@techinnovation.com', phone: '+91-9876543216' }
  },
  {
    id: uuidv4(),
    title: 'Digital Transformation Summit',
    slug: 'digital-transformation-summit',
    description: 'High-level summit on digital transformation strategies for business leaders.',
    startDate: new Date('2024-06-20T09:00:00Z'),
    endDate: new Date('2024-06-21T17:00:00Z'),
    registrationDeadline: new Date('2024-06-15T23:59:59Z'),
    status: 'upcoming',
    approvalStatus: 'approved',
    locationType: 'hybrid',
    location: 'Business District, Bangalore + Online',
    venue: 'Executive Conference Center',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    categories: ['summit'],
    tags: ['digital-transformation', 'business', 'strategy'],
    maxParticipants: 300,
    registrationFee: { type: 'paid', amount: 25000, currency: 'INR' },
    agenda: [
      { time: 'Day 1 - 9:00 AM', title: 'Keynote: Digital Future', description: 'Vision for digital transformation' },
      { time: 'Day 2 - 3:00 PM', title: 'Technology Roadmap', description: 'Future technology trends' }
    ],
    speakers: [{ name: 'Rajesh Khanna', title: 'Chief Digital Officer', bio: 'Digital transformation expert' }],
    contactInfo: { email: 'summit@digitaltransform.com', phone: '+91-9876543217' }
  }
];

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get or create a sample recruiter user
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'recruiter' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    let createdBy = users.length > 0 ? users[0].id : uuidv4();

    // If no recruiter found, create a sample recruiter
    if (users.length === 0) {
      await queryInterface.bulkInsert('users', [{
        id: createdBy,
        email: 'comprehensive.recruiter@example.com',
        fullName: 'Comprehensive Event Recruiter',
        role: 'recruiter',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        username: 'comprehensive_recruiter',
        passwordHash: await bcrypt.hash('User@123', 10),
        status: 'active'
      }]);
    }

    // Format events for database insertion
    const formattedEvents = events.map(event => ({
      ...event,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Convert JSON fields to strings
      registrationFee: JSON.stringify(event.registrationFee),
      agenda: JSON.stringify(event.agenda || []),
      speakers: JSON.stringify(event.speakers || []),
      sponsors: JSON.stringify(event.sponsors || []),
      contactInfo: JSON.stringify(event.contactInfo || {}),
      prizes: event.prizes ? JSON.stringify(event.prizes) : null,
      stages: event.stages ? JSON.stringify(event.stages) : null
    }));

    // Insert events into database
    await queryInterface.bulkInsert('events', formattedEvents);

    console.log(`✅ Successfully created ${events.length} comprehensive events!`);
    console.log('\nEvent Categories Created:');
    const categories = [...new Set(events.flatMap(e => e.categories))];
    categories.forEach(cat => console.log(`  - ${cat}`));
    
    console.log('\nLocation Types:');
    const locationTypes = [...new Set(events.map(e => e.locationType))];
    locationTypes.forEach(type => console.log(`  - ${type}`));
  },

  async down(queryInterface, Sequelize) {
    const slugs = events.map(e => e.slug);
    await queryInterface.bulkDelete('events', {
      slug: {
        [Sequelize.Op.in]: slugs
      }
    });
  }
};