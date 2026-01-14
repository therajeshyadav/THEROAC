'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

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

    const events = [
      // 1. WORKSHOP - Learning & Development
      {
        id: uuidv4(),
        title: 'Full-Stack Web Development Workshop',
        slug: 'full-stack-web-development-workshop',
        description: 'Master modern web development with React, Node.js, and MongoDB. Build real projects and get hands-on experience with industry-standard tools.',
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
        tags: ['web-development', 'react', 'nodejs', 'mongodb', 'fullstack'],
        maxParticipants: 50,
        registrationFee: JSON.stringify({ type: 'paid', amount: 2500, currency: 'INR' }),
        agenda: JSON.stringify([
          { time: '10:00 AM', title: 'Introduction to Full-Stack', description: 'Overview of modern web development' },
          { time: '11:30 AM', title: 'React Fundamentals', description: 'Building interactive UIs' },
          { time: '1:00 PM', title: 'Lunch Break', description: 'Networking and refreshments' },
          { time: '2:00 PM', title: 'Backend with Node.js', description: 'Server-side development' },
          { time: '3:30 PM', title: 'Database Integration', description: 'Working with MongoDB' },
          { time: '5:00 PM', title: 'Project Showcase', description: 'Present your mini-project' }
        ]),
        speakers: JSON.stringify([
          { name: 'Arjun Sharma', title: 'Senior Full-Stack Developer', bio: '8+ years in web development' },
          { name: 'Priya Gupta', title: 'React Specialist', bio: 'Expert in modern frontend frameworks' }
        ]),
        requirements: 'Basic knowledge of HTML, CSS, and JavaScript',
        whatToBring: ['Laptop', 'Code editor installed', 'Node.js pre-installed'],
        contactInfo: JSON.stringify({ email: 'workshop@techcampus.com', phone: '+91-9876543210' }),
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 2. SEMINAR - Learning & Development
      {
        id: uuidv4(),
        title: 'AI Ethics and Future of Technology Seminar',
        slug: 'ai-ethics-future-technology-seminar',
        description: 'Explore the ethical implications of AI and discuss the future of technology in society. Join leading experts for thought-provoking discussions.',
        startDate: new Date('2024-02-20T14:00:00Z'),
        endDate: new Date('2024-02-20T16:30:00Z'),
        registrationDeadline: new Date('2024-02-18T23:59:59Z'),
        status: 'upcoming',
        approvalStatus: 'approved',
        locationType: 'online',
        location: 'Zoom Webinar',
        categories: ['seminar'],
        tags: ['AI', 'ethics', 'technology', 'future', 'discussion'],
        maxParticipants: 200,
        registrationFee: { type: 'free' },
        agenda: [
          { time: '2:00 PM', title: 'Welcome & Introduction', description: 'Setting the context' },
          { time: '2:15 PM', title: 'AI Ethics Panel', description: 'Expert panel discussion', speaker: 'Dr. Rajesh Kumar' },
          { time: '3:15 PM', title: 'Future Technology Trends', description: 'What lies ahead', speaker: 'Sarah Johnson' },
          { time: '4:00 PM', title: 'Q&A Session', description: 'Audience questions and discussion' }
        ],
        speakers: [
          { name: 'Dr. Rajesh Kumar', title: 'AI Ethics Researcher', bio: 'Leading researcher in AI ethics and policy' },
          { name: 'Sarah Johnson', title: 'Tech Futurist', bio: 'Technology trend analyst and consultant' }
        ],
        contactInfo: { email: 'seminar@aiethics.org' },
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 3. CONFERENCE - Learning & Development
      {
        id: uuidv4(),
        title: 'DevOps & Cloud Computing Conference 2024',
        slug: 'devops-cloud-computing-conference-2024',
        description: 'Two-day conference covering the latest in DevOps practices, cloud technologies, and infrastructure automation. Network with industry leaders.',
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
        tags: ['devops', 'cloud', 'aws', 'kubernetes', 'automation'],
        maxParticipants: 500,
        registrationFee: { type: 'paid', amount: 8500, currency: 'INR' },
        agenda: [
          { time: 'Day 1 - 9:00 AM', title: 'Keynote: Future of DevOps', description: 'Opening keynote', speaker: 'John Mitchell' },
          { time: 'Day 1 - 10:30 AM', title: 'Kubernetes Deep Dive', description: 'Container orchestration', speaker: 'Lisa Chen' },
          { time: 'Day 1 - 2:00 PM', title: 'AWS Best Practices', description: 'Cloud architecture patterns' },
          { time: 'Day 2 - 9:00 AM', title: 'CI/CD Pipelines', description: 'Automation strategies' },
          { time: 'Day 2 - 3:00 PM', title: 'Panel: DevOps Culture', description: 'Building DevOps teams' }
        ],
        speakers: [
          { name: 'John Mitchell', title: 'DevOps Architect', bio: 'Former AWS Solutions Architect' },
          { name: 'Lisa Chen', title: 'Kubernetes Expert', bio: 'CNCF Ambassador and consultant' }
        ],
        sponsors: [
          { name: 'AWS', tier: 'Platinum', website: 'https://aws.amazon.com' },
          { name: 'Docker', tier: 'Gold', website: 'https://docker.com' }
        ],
        contactInfo: { email: 'conference@devopscloud.com', phone: '+91-9876543211' },
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 4. HACKATHON - Competitive Events (with stages)
      {
        id: uuidv4(),
        title: 'FinTech Innovation Hackathon 2024',
        slug: 'fintech-innovation-hackathon-2024',
        description: '48-hour hackathon to build innovative financial technology solutions. Compete for prizes and potential investment opportunities.',
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
        tags: ['fintech', 'blockchain', 'payments', 'innovation', 'startup'],
        maxParticipants: 150,
        registrationFee: { type: 'paid', amount: 1000, currency: 'INR' },
        prizes: [
          { position: '1st Place', prize: '₹2,00,000 + Incubation', description: 'Winner gets cash prize and startup incubation' },
          { position: '2nd Place', prize: '₹1,00,000', description: 'Runner-up prize' },
          { position: '3rd Place', prize: '₹50,000', description: 'Third place prize' }
        ],
        stages: [
          {
            title: 'Team Registration & Idea Submission',
            description: 'Form teams and submit your FinTech innovation idea.',
            startDate: '2024-02-15T00:00:00Z',
            deadline: '2024-03-10T23:59:59Z',
            submissions: [
              {
                type: 'document',
                label: 'Team Details',
                description: 'Team member information and roles (PDF)',
                required: true
              },
              {
                type: 'document',
                label: 'Idea Pitch',
                description: 'Your FinTech solution concept (max 3 pages)',
                required: true
              }
            ]
          },
          {
            title: 'Development Phase',
            description: 'Build your FinTech solution prototype.',
            startDate: '2024-03-15T18:00:00Z',
            deadline: '2024-03-17T12:00:00Z',
            submissions: [
              {
                type: 'github-link',
                label: 'Source Code',
                description: 'Complete GitHub repository with documentation',
                required: true
              },
              {
                type: 'demo-video',
                label: 'Product Demo',
                description: '5-minute demo video of your solution',
                required: true
              },
              {
                type: 'link',
                label: 'Live Application',
                description: 'Deployed application URL',
                required: false
              }
            ]
          },
          {
            title: 'Final Pitch',
            description: 'Present your solution to judges and investors.',
            startDate: '2024-03-17T14:00:00Z',
            deadline: '2024-03-17T17:00:00Z',
            submissions: [
              {
                type: 'ppt',
                label: 'Pitch Presentation',
                description: 'Final pitch deck for judges (PPT/PDF)',
                required: true
              }
            ]
          }
        ],
        sponsors: [
          { name: 'Razorpay', tier: 'Title', website: 'https://razorpay.com' },
          { name: 'Paytm', tier: 'Gold', website: 'https://paytm.com' }
        ],
        contactInfo: { email: 'hackathon@fintechhub.com', phone: '+91-9876543212' },
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 5. COMPETITION - Competitive Events (with stages)
      {
        id: uuidv4(),
        title: 'Data Science Challenge 2024',
        slug: 'data-science-challenge-2024',
        description: 'Multi-round data science competition. Solve real-world problems using machine learning and analytics.',
        startDate: new Date('2024-04-01T10:00:00Z'),
        endDate: new Date('2024-04-01T18:00:00Z'),
        registrationDeadline: new Date('2024-03-25T23:59:59Z'),
        status: 'upcoming',
        approvalStatus: 'approved',
        locationType: 'online',
        location: 'Online Platform',
        categories: ['competition'],
        tags: ['data-science', 'machine-learning', 'analytics', 'python', 'competition'],
        maxParticipants: 300,
        registrationFee: { type: 'paid', amount: 750, currency: 'INR' },
        prizes: [
          { position: 'Winner', prize: '₹1,50,000', description: 'Champion prize and certificate' },
          { position: 'Runner-up', prize: '₹75,000', description: 'Second place prize' },
          { position: 'Third Place', prize: '₹35,000', description: 'Third place prize' }
        ],
        stages: [
          {
            title: 'Qualification Round',
            description: 'Solve basic data science problems to qualify.',
            startDate: '2024-04-01T10:00:00Z',
            deadline: '2024-04-01T13:00:00Z',
            submissions: [
              {
                type: 'code',
                label: 'Solution Code',
                description: 'Python/R code with analysis (Jupyter notebook)',
                required: true
              }
            ]
          },
          {
            title: 'Advanced Challenge',
            description: 'Complex real-world data science problem.',
            startDate: '2024-04-01T14:00:00Z',
            deadline: '2024-04-01T17:00:00Z',
            submissions: [
              {
                type: 'code',
                label: 'ML Model',
                description: 'Complete machine learning solution',
                required: true
              },
              {
                type: 'document',
                label: 'Technical Report',
                description: 'Methodology and findings report',
                required: true
              }
            ]
          }
        ],
        contactInfo: { email: 'competition@datascience.org' },
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 6. CAREER-FAIR - Competitive Events (with stages)
      {
        id: uuidv4(),
        title: 'Tech Talent Connect 2024',
        slug: 'tech-talent-connect-2024',
        description: 'Premier tech career fair connecting talented developers with top companies. Multiple interview rounds and networking opportunities.',
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
        tags: ['jobs', 'career', 'tech', 'interviews', 'networking'],
        maxParticipants: 800,
        registrationFee: { type: 'free' },
        stages: [
          {
            title: 'Profile Submission',
            description: 'Submit your professional profile for company review.',
            startDate: '2024-03-15T00:00:00Z',
            deadline: '2024-04-10T23:59:59Z',
            submissions: [
              {
                type: 'document',
                label: 'Resume',
                description: 'Updated resume highlighting your skills (PDF)',
                required: true
              },
              {
                type: 'document',
                label: 'Portfolio',
                description: 'Work portfolio or project showcase',
                required: false
              }
            ]
          },
          {
            title: 'Pre-screening',
            description: 'Companies review profiles and shortlist candidates.',
            startDate: '2024-04-11T00:00:00Z',
            deadline: '2024-04-14T23:59:59Z',
            submissions: [
              {
                type: 'quiz',
                label: 'Technical Assessment',
                description: 'Online technical and aptitude test',
                required: true
              }
            ]
          },
          {
            title: 'Interview Day',
            description: 'Face-to-face interviews with participating companies.',
            startDate: '2024-04-15T09:00:00Z',
            deadline: '2024-04-15T17:00:00Z',
            submissions: [
              {
                type: 'document',
                label: 'Interview Feedback',
                description: 'Post-interview evaluation form',
                required: false
              }
            ]
          }
        ],
        sponsors: [
          { name: 'TCS', tier: 'Platinum', website: 'https://tcs.com' },
          { name: 'Infosys', tier: 'Gold', website: 'https://infosys.com' },
          { name: 'Wipro', tier: 'Gold', website: 'https://wipro.com' }
        ],
        contactInfo: { email: 'careers@techtalent.com', phone: '+91-9876543213' },
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 7. WEBINAR - Learning & Development
      {
        id: uuidv4(),
        title: 'Cybersecurity Best Practices Webinar',
        slug: 'cybersecurity-best-practices-webinar',
        description: 'Learn essential cybersecurity practices to protect your organization. Expert insights on latest threats and defense strategies.',
        startDate: new Date('2024-04-25T15:00:00Z'),
        endDate: new Date('2024-04-25T16:30:00Z'),
        registrationDeadline: new Date('2024-04-24T23:59:59Z'),
        status: 'upcoming',
        approvalStatus: 'approved',
        locationType: 'online',
        location: 'Zoom Webinar',
        categories: ['webinar'],
        tags: ['cybersecurity', 'security', 'best-practices', 'threats'],
        maxParticipants: 1000,
        registrationFee: { type: 'free' },
        agenda: [
          { time: '3:00 PM', title: 'Current Threat Landscape', description: 'Overview of cybersecurity threats', speaker: 'Alex Rodriguez' },
          { time: '3:20 PM', title: 'Defense Strategies', description: 'Implementing security measures' },
          { time: '3:50 PM', title: 'Case Studies', description: 'Real-world security incidents' },
          { time: '4:10 PM', title: 'Q&A Session', description: 'Audience questions' }
        ],
        speakers: [
          { name: 'Alex Rodriguez', title: 'Cybersecurity Expert', bio: '15+ years in information security' }
        ],
        contactInfo: { email: 'webinar@cybersec.org' },
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 8. TRAINING - Learning & Development
      {
        id: uuidv4(),
        title: 'Advanced Python Programming Bootcamp',
        slug: 'advanced-python-programming-bootcamp',
        description: 'Intensive 5-day Python bootcamp covering advanced concepts, frameworks, and real-world applications. Get job-ready skills.',
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
        tags: ['python', 'programming', 'bootcamp', 'advanced', 'career'],
        maxParticipants: 30,
        registrationFee: { type: 'paid', amount: 15000, currency: 'INR' },
        agenda: [
          { time: 'Day 1', title: 'Advanced Python Concepts', description: 'Decorators, generators, context managers' },
          { time: 'Day 2', title: 'Web Development with Django', description: 'Building web applications' },
          { time: 'Day 3', title: 'Data Science Libraries', description: 'NumPy, Pandas, Matplotlib' },
          { time: 'Day 4', title: 'API Development', description: 'REST APIs with FastAPI' },
          { time: 'Day 5', title: 'Final Project', description: 'Build and present your project' }
        ],
        speakers: [
          { name: 'Vikram Patel', title: 'Senior Python Developer', bio: 'Python expert with 10+ years experience' }
        ],
        requirements: 'Basic Python knowledge required. Laptop with Python 3.8+ installed.',
        whatToBring: ['Laptop', 'Python IDE', 'Notebook for notes'],
        contactInfo: { email: 'training@pythonacademy.com', phone: '+91-9876543214' },
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 9. NETWORKING - Social & Networking
      {
        id: uuidv4(),
        title: 'Tech Leaders Networking Mixer',
        slug: 'tech-leaders-networking-mixer',
        description: 'Exclusive networking event for tech professionals, entrepreneurs, and industry leaders. Build valuable connections over cocktails.',
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
        tags: ['networking', 'tech-leaders', 'entrepreneurs', 'business'],
        maxParticipants: 100,
        registrationFee: { type: 'paid', amount: 2000, currency: 'INR' },
        agenda: [
          { time: '6:00 PM', title: 'Welcome Reception', description: 'Registration and welcome drinks' },
          { time: '6:30 PM', title: 'Networking Session 1', description: 'Structured networking activities' },
          { time: '7:30 PM', title: 'Panel Discussion', description: 'Tech industry insights' },
          { time: '8:30 PM', title: 'Open Networking', description: 'Free-form networking and dinner' }
        ],
        contactInfo: { email: 'networking@techleaders.com', phone: '+91-9876543215' },
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 10. MEETUP - Social & Networking
      {
        id: uuidv4(),
        title: 'React Developers Meetup',
        slug: 'react-developers-meetup',
        description: 'Monthly meetup for React developers. Share knowledge, discuss latest trends, and connect with fellow developers.',
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
        tags: ['react', 'javascript', 'frontend', 'developers', 'community'],
        maxParticipants: 60,
        registrationFee: { type: 'free' },
        agenda: [
          { time: '2:00 PM', title: 'Welcome & Introductions', description: 'Meet fellow developers' },
          { time: '2:30 PM', title: 'React 18 Features', description: 'Latest React updates', speaker: 'Amit Singh' },
          { time: '3:30 PM', title: 'Performance Optimization', description: 'Tips and tricks' },
          { time: '4:30 PM', title: 'Open Discussion', description: 'Q&A and networking' }
        ],
        speakers: [
          { name: 'Amit Singh', title: 'React Developer', bio: 'Frontend specialist with React expertise' }
        ],
        contactInfo: { email: 'meetup@reactdev.com' },
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 11. EXPO - Business & Industry
      {
        id: uuidv4(),
        title: 'Tech Innovation Expo 2024',
        slug: 'tech-innovation-expo-2024',
        description: 'Showcase of cutting-edge technology innovations. Explore latest products, meet vendors, and discover emerging technologies.',
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
        tags: ['innovation', 'technology', 'exhibition', 'products', 'vendors'],
        maxParticipants: 2000,
        registrationFee: { type: 'paid', amount: 1500, currency: 'INR' },
        agenda: [
          { time: 'Day 1', title: 'Expo Opening', description: 'Grand opening ceremony' },
          { time: 'Day 2', title: 'Product Demos', description: 'Live technology demonstrations' },
          { time: 'Day 3', title: 'Innovation Awards', description: 'Recognition ceremony' }
        ],
        sponsors: [
          { name: 'Tech Corp', tier: 'Title', website: 'https://techcorp.com' },
          { name: 'Innovation Labs', tier: 'Platinum', website: 'https://innovationlabs.com' }
        ],
        contactInfo: { email: 'expo@techinnovation.com', phone: '+91-9876543216' },
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 12. SUMMIT - Business & Industry
      {
        id: uuidv4(),
        title: 'Digital Transformation Summit',
        slug: 'digital-transformation-summit',
        description: 'High-level summit on digital transformation strategies. C-level executives and industry leaders share insights.',
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
        tags: ['digital-transformation', 'business', 'strategy', 'leadership'],
        maxParticipants: 300,
        registrationFee: { type: 'paid', amount: 25000, currency: 'INR' },
        agenda: [
          { time: 'Day 1 - 9:00 AM', title: 'Keynote: Digital Future', description: 'Vision for digital transformation' },
          { time: 'Day 1 - 11:00 AM', title: 'Strategy Panel', description: 'C-level executive panel' },
          { time: 'Day 2 - 9:00 AM', title: 'Implementation Case Studies', description: 'Real transformation stories' },
          { time: 'Day 2 - 3:00 PM', title: 'Technology Roadmap', description: 'Future technology trends' }
        ],
        speakers: [
          { name: 'Rajesh Khanna', title: 'Chief Digital Officer', bio: 'Digital transformation expert' },
          { name: 'Meera Sharma', title: 'Technology Consultant', bio: 'Enterprise technology strategist' }
        ],
        contactInfo: { email: 'summit@digitaltransform.com', phone: '+91-9876543217' },
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert events into database
    await queryInterface.bulkInsert('events', events);

    console.log(`✅ Successfully created ${events.length} comprehensive events!`);
    console.log('\nEvent Categories Created:');
    const categories = [...new Set(events.flatMap(e => e.categories))];
    categories.forEach(cat => console.log(`  - ${cat}`));
    
    console.log('\nLocation Types:');
    const locationTypes = [...new Set(events.map(e => e.locationType))];
    locationTypes.forEach(type => console.log(`  - ${type}`));
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('events', {
      slug: {
        [Sequelize.Op.in]: [
          'full-stack-web-development-workshop',
          'ai-ethics-future-technology-seminar',
          'devops-cloud-computing-conference-2024',
          'fintech-innovation-hackathon-2024',
          'data-science-challenge-2024',
          'tech-talent-connect-2024',
          'cybersecurity-best-practices-webinar',
          'advanced-python-programming-bootcamp',
          'tech-leaders-networking-mixer',
          'react-developers-meetup',
          'tech-innovation-expo-2024',
          'digital-transformation-summit'
        ]
      }
    });
  }
};