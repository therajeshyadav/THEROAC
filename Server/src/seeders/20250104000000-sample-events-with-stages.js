'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, let's get a user ID to use as the creator
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'recruiter' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    let createdBy = users.length > 0 ? users[0].id : uuidv4();

    // If no recruiter found, create a sample recruiter
    if (users.length === 0) {
      await queryInterface.bulkInsert('users', [{
        id: createdBy,
        email: 'sample.recruiter@example.com',
        fullName: 'Sample Recruiter',
        role: 'recruiter',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    }

    const events = [
      // 1. HACKATHON - With Submission Stages
      {
        id: uuidv4(),
        title: 'Tech Innovation Hackathon 2024',
        slug: 'tech-innovation-hackathon-2024',
        description: 'A 48-hour hackathon focused on innovative tech solutions for real-world problems. Build amazing projects, learn new skills, and compete for exciting prizes!',
        startDate: new Date('2024-03-15T09:00:00Z'),
        endDate: new Date('2024-03-17T18:00:00Z'),
        registrationDeadline: new Date('2024-03-10T23:59:59Z'),
        status: 'upcoming',
        approvalStatus: 'approved',
        locationType: 'hybrid',
        location: 'Tech Hub Mumbai + Online',
        venue: 'Tech Innovation Center',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        categories: ['hackathon'],
        tags: ['coding', 'innovation', 'tech', 'startup'],
        maxParticipants: 200,
        registrationFee: { type: 'free' },
        prizes: [
          { position: '1st Place', prize: '₹1,00,000 + Internship', description: 'Winner gets cash prize and guaranteed internship' },
          { position: '2nd Place', prize: '₹50,000', description: 'Runner-up prize' },
          { position: '3rd Place', prize: '₹25,000', description: 'Third place prize' }
        ],
        // SUBMISSION STAGES for Hackathon
        stages: [
          {
            title: 'Registration & Team Formation',
            description: 'Register for the hackathon and form your team. Submit your initial project idea.',
            startDate: '2024-02-01T00:00:00Z',
            deadline: '2024-03-10T23:59:59Z',
            submissions: [
              {
                type: 'document',
                label: 'Team Information',
                description: 'Provide team member details and roles (PDF format)',
                required: true
              },
              {
                type: 'document',
                label: 'Project Idea',
                description: 'Brief description of your project concept (max 2 pages)',
                required: true
              }
            ]
          },
          {
            title: 'Round 1: Prototype Development',
            description: 'Develop a working prototype and submit demo video with source code.',
            startDate: '2024-03-15T09:00:00Z',
            deadline: '2024-03-16T18:00:00Z',
            submissions: [
              {
                type: 'github-link',
                label: 'GitHub Repository',
                description: 'Complete source code repository with README',
                required: true
              },
              {
                type: 'demo-video',
                label: 'Demo Video',
                description: '5-minute demo video showcasing your prototype',
                required: true
              },
              {
                type: 'link',
                label: 'Live Demo Link',
                description: 'Deployed application URL (if applicable)',
                required: false
              }
            ]
          },
          {
            title: 'Final Round: Presentation',
            description: 'Present your final solution to the judging panel.',
            startDate: '2024-03-17T09:00:00Z',
            deadline: '2024-03-17T15:00:00Z',
            submissions: [
              {
                type: 'ppt',
                label: 'Final Presentation',
                description: 'Final presentation slides for judging panel (PPT/PDF)',
                required: true
              }
            ]
          }
        ],
        // Basic agenda for schedule
        agenda: [
          { time: 'Day 1 - 9:00 AM', title: 'Opening Ceremony', description: 'Welcome and hackathon kickoff' },
          { time: 'Day 1 - 10:00 AM', title: 'Team Formation', description: 'Form teams and start brainstorming' },
          { time: 'Day 2 - 6:00 PM', title: 'Prototype Submission', description: 'Submit your working prototype' },
          { time: 'Day 3 - 3:00 PM', title: 'Final Presentations', description: 'Present to judges' },
          { time: 'Day 3 - 6:00 PM', title: 'Awards Ceremony', description: 'Winner announcement' }
        ],
        speakers: [
          { name: 'Rahul Sharma', title: 'CTO, TechCorp', bio: 'Expert in AI and Machine Learning' },
          { name: 'Priya Patel', title: 'Startup Founder', bio: 'Serial entrepreneur and mentor' }
        ],
        sponsors: [
          { name: 'TechCorp', tier: 'Title', website: 'https://techcorp.com' },
          { name: 'InnovateLabs', tier: 'Gold', website: 'https://innovatelabs.com' }
        ],
        faqs: [
          { question: 'Can I participate alone?', answer: 'Teams of 2-4 members are recommended, but solo participation is allowed.' },
          { question: 'What technologies can I use?', answer: 'Any technology stack is allowed. Choose what works best for your idea.' }
        ],
        contactInfo: { email: 'hackathon@techcorp.com', phone: '+91-9876543210' },
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 2. COMPETITION - With Submission Stages
      {
        id: uuidv4(),
        title: 'National Coding Championship 2024',
        slug: 'national-coding-championship-2024',
        description: 'Test your programming skills in this multi-round coding competition. Compete with the best coders across the country.',
        startDate: new Date('2024-04-20T10:00:00Z'),
        endDate: new Date('2024-04-20T18:00:00Z'),
        registrationDeadline: new Date('2024-04-15T23:59:59Z'),
        status: 'upcoming',
        approvalStatus: 'approved',
        locationType: 'online',
        location: 'Online Platform',
        categories: ['competition'],
        tags: ['coding', 'programming', 'algorithms', 'competitive'],
        maxParticipants: 500,
        registrationFee: { type: 'paid', amount: 500, currency: 'INR' },
        prizes: [
          { position: 'Winner', prize: '₹2,00,000', description: 'Champion prize' },
          { position: 'Runner-up', prize: '₹1,00,000', description: 'Second place' }
        ],
        // SUBMISSION STAGES for Competition
        stages: [
          {
            title: 'Qualification Round',
            description: 'Solve coding problems to qualify for the main competition.',
            startDate: '2024-04-20T10:00:00Z',
            deadline: '2024-04-20T12:00:00Z',
            submissions: [
              {
                type: 'quiz',
                label: 'Coding Assessment',
                description: 'Complete the online coding assessment (2 hours)',
                required: true
              }
            ]
          },
          {
            title: 'Final Round',
            description: 'Advanced coding challenges for qualified participants.',
            startDate: '2024-04-20T14:00:00Z',
            deadline: '2024-04-20T17:00:00Z',
            submissions: [
              {
                type: 'code',
                label: 'Solution Code',
                description: 'Submit your optimized solutions',
                required: true
              }
            ]
          }
        ],
        agenda: [
          { time: '10:00 AM', title: 'Registration & Check-in', description: 'Platform setup and instructions' },
          { time: '10:30 AM', title: 'Qualification Round', description: '2-hour coding assessment' },
          { time: '2:00 PM', title: 'Final Round', description: 'Advanced challenges for qualified participants' },
          { time: '5:30 PM', title: 'Results & Awards', description: 'Winner announcement' }
        ],
        contactInfo: { email: 'competition@codingclub.com' },
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 3. CAREER FAIR - With Application Stages
      {
        id: uuidv4(),
        title: 'Tech Career Fair 2024',
        slug: 'tech-career-fair-2024',
        description: 'Connect with top tech companies and explore exciting career opportunities. Multiple rounds of interviews and networking sessions.',
        startDate: new Date('2024-05-10T09:00:00Z'),
        endDate: new Date('2024-05-10T17:00:00Z'),
        registrationDeadline: new Date('2024-05-05T23:59:59Z'),
        status: 'upcoming',
        approvalStatus: 'approved',
        locationType: 'offline',
        location: 'Convention Center, Bangalore',
        venue: 'Bangalore International Exhibition Centre',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        categories: ['career-fair'],
        tags: ['jobs', 'career', 'networking', 'interviews'],
        maxParticipants: 1000,
        registrationFee: { type: 'free' },
        // APPLICATION STAGES for Career Fair
        stages: [
          {
            title: 'Pre-Registration',
            description: 'Submit your profile and resume for company review.',
            startDate: '2024-04-01T00:00:00Z',
            deadline: '2024-05-05T23:59:59Z',
            submissions: [
              {
                type: 'document',
                label: 'Resume/CV',
                description: 'Upload your latest resume (PDF format)',
                required: true
              },
              {
                type: 'document',
                label: 'Cover Letter',
                description: 'Brief cover letter highlighting your skills',
                required: false
              }
            ]
          },
          {
            title: 'Company Shortlisting',
            description: 'Companies will review applications and shortlist candidates.',
            startDate: '2024-05-06T00:00:00Z',
            deadline: '2024-05-09T23:59:59Z',
            submissions: [
              {
                type: 'quiz',
                label: 'Aptitude Test',
                description: 'Complete aptitude and technical assessment',
                required: true
              }
            ]
          },
          {
            title: 'Interview Day',
            description: 'Face-to-face interviews with shortlisted companies.',
            startDate: '2024-05-10T09:00:00Z',
            deadline: '2024-05-10T17:00:00Z',
            submissions: [
              {
                type: 'document',
                label: 'Interview Feedback',
                description: 'Post-interview feedback form',
                required: false
              }
            ]
          }
        ],
        agenda: [
          { time: '9:00 AM', title: 'Registration & Welcome', description: 'Check-in and welcome session' },
          { time: '10:00 AM', title: 'Company Presentations', description: 'Learn about participating companies' },
          { time: '11:00 AM', title: 'Interview Sessions', description: 'One-on-one interviews' },
          { time: '4:00 PM', title: 'Networking Session', description: 'Informal networking with recruiters' }
        ],
        sponsors: [
          { name: 'Google', tier: 'Platinum', website: 'https://google.com' },
          { name: 'Microsoft', tier: 'Gold', website: 'https://microsoft.com' },
          { name: 'Amazon', tier: 'Gold', website: 'https://amazon.com' }
        ],
        contactInfo: { email: 'careers@techfair.com', phone: '+91-9876543210' },
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 4. WORKSHOP - Simple Timeline Only
      {
        id: uuidv4(),
        title: 'React.js Masterclass Workshop',
        slug: 'reactjs-masterclass-workshop',
        description: 'Learn advanced React.js concepts in this hands-on workshop. Perfect for developers looking to enhance their frontend skills.',
        startDate: new Date('2024-06-15T10:00:00Z'),
        endDate: new Date('2024-06-15T16:00:00Z'),
        registrationDeadline: new Date('2024-06-10T23:59:59Z'),
        status: 'upcoming',
        approvalStatus: 'approved',
        locationType: 'online',
        location: 'Zoom Meeting',
        categories: ['workshop'],
        tags: ['react', 'javascript', 'frontend', 'web-development'],
        maxParticipants: 100,
        registrationFee: { type: 'paid', amount: 1500, currency: 'INR' },
        // NO STAGES - Only basic agenda
        agenda: [
          { time: '10:00 AM', title: 'Introduction to Advanced React', description: 'Overview of advanced concepts', speaker: 'John Doe' },
          { time: '11:00 AM', title: 'React Hooks Deep Dive', description: 'Custom hooks and advanced patterns', speaker: 'John Doe' },
          { time: '12:00 PM', title: 'Break', description: '15-minute break' },
          { time: '12:15 PM', title: 'State Management', description: 'Redux, Context API, and Zustand', speaker: 'Jane Smith' },
          { time: '2:00 PM', title: 'Performance Optimization', description: 'React.memo, useMemo, useCallback', speaker: 'Jane Smith' },
          { time: '3:00 PM', title: 'Hands-on Project', description: 'Build a real-world application' },
          { time: '4:00 PM', title: 'Q&A and Wrap-up', description: 'Questions and next steps' }
        ],
        speakers: [
          { name: 'John Doe', title: 'Senior React Developer', bio: '5+ years experience with React and modern frontend' },
          { name: 'Jane Smith', title: 'Frontend Architect', bio: 'Expert in React performance and state management' }
        ],
        requirements: 'Basic knowledge of React.js and JavaScript. Node.js installed on your machine.',
        whatToBring: ['Laptop with Node.js', 'Code editor (VS Code recommended)', 'Stable internet connection'],
        contactInfo: { email: 'workshop@reactacademy.com' },
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 5. CONFERENCE - Simple Timeline Only
      {
        id: uuidv4(),
        title: 'Future of AI Conference 2024',
        slug: 'future-of-ai-conference-2024',
        description: 'Join industry leaders and AI experts to explore the future of artificial intelligence. Two days of inspiring talks, panels, and networking.',
        startDate: new Date('2024-07-20T09:00:00Z'),
        endDate: new Date('2024-07-21T17:00:00Z'),
        registrationDeadline: new Date('2024-07-15T23:59:59Z'),
        status: 'upcoming',
        approvalStatus: 'approved',
        locationType: 'hybrid',
        location: 'Delhi Convention Center + Online',
        venue: 'India Expo Centre',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        categories: ['conference'],
        tags: ['AI', 'machine-learning', 'technology', 'future'],
        maxParticipants: 2000,
        registrationFee: { type: 'paid', amount: 5000, currency: 'INR' },
        // NO STAGES - Only detailed agenda
        agenda: [
          { time: 'Day 1 - 9:00 AM', title: 'Opening Keynote', description: 'The Future of AI', speaker: 'Dr. Sundar Pichai' },
          { time: 'Day 1 - 10:30 AM', title: 'AI in Healthcare', description: 'Transforming medical diagnosis', speaker: 'Dr. Priya Sharma' },
          { time: 'Day 1 - 12:00 PM', title: 'Lunch & Networking', description: 'Connect with fellow attendees' },
          { time: 'Day 1 - 2:00 PM', title: 'Machine Learning Panel', description: 'Industry experts discuss ML trends' },
          { time: 'Day 1 - 4:00 PM', title: 'AI Ethics Discussion', description: 'Responsible AI development' },
          { time: 'Day 2 - 9:00 AM', title: 'AI Startups Showcase', description: 'Innovative AI companies present' },
          { time: 'Day 2 - 11:00 AM', title: 'Technical Deep Dive', description: 'Advanced AI architectures', speaker: 'Prof. Andrew Ng' },
          { time: 'Day 2 - 3:00 PM', title: 'Future Predictions', description: 'Where AI is heading next' },
          { time: 'Day 2 - 5:00 PM', title: 'Closing Ceremony', description: 'Thank you and next steps' }
        ],
        speakers: [
          { name: 'Dr. Sundar Pichai', title: 'CEO, Google', bio: 'Leading voice in AI and technology' },
          { name: 'Prof. Andrew Ng', title: 'AI Researcher', bio: 'Pioneer in machine learning education' },
          { name: 'Dr. Priya Sharma', title: 'AI Healthcare Expert', bio: 'Specialist in medical AI applications' }
        ],
        sponsors: [
          { name: 'Google AI', tier: 'Title', website: 'https://ai.google' },
          { name: 'OpenAI', tier: 'Platinum', website: 'https://openai.com' },
          { name: 'NVIDIA', tier: 'Gold', website: 'https://nvidia.com' }
        ],
        contactInfo: { email: 'info@aiconference.com', phone: '+91-9876543210' },
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 6. WEBINAR - Simple Timeline Only
      {
        id: uuidv4(),
        title: 'Digital Marketing Trends 2024',
        slug: 'digital-marketing-trends-2024',
        description: 'Stay ahead of the curve with the latest digital marketing trends and strategies for 2024.',
        startDate: new Date('2024-08-10T15:00:00Z'),
        endDate: new Date('2024-08-10T16:30:00Z'),
        registrationDeadline: new Date('2024-08-09T23:59:59Z'),
        status: 'upcoming',
        approvalStatus: 'approved',
        locationType: 'online',
        location: 'Zoom Webinar',
        categories: ['webinar'],
        tags: ['marketing', 'digital', 'trends', 'strategy'],
        maxParticipants: 500,
        registrationFee: { type: 'free' },
        // NO STAGES - Simple agenda
        agenda: [
          { time: '3:00 PM', title: 'Welcome & Introduction', description: 'Meet your host and agenda overview' },
          { time: '3:10 PM', title: 'Top 10 Marketing Trends', description: 'Key trends shaping 2024', speaker: 'Sarah Johnson' },
          { time: '3:40 PM', title: 'Case Studies', description: 'Real-world success stories' },
          { time: '4:10 PM', title: 'Q&A Session', description: 'Your questions answered' },
          { time: '4:30 PM', title: 'Closing & Resources', description: 'Thank you and additional resources' }
        ],
        speakers: [
          { name: 'Sarah Johnson', title: 'Digital Marketing Expert', bio: '10+ years in digital marketing strategy' }
        ],
        contactInfo: { email: 'webinar@marketingpro.com' },
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('events', events);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('events', {
      slug: {
        [Sequelize.Op.in]: [
          'tech-innovation-hackathon-2024',
          'national-coding-championship-2024',
          'tech-career-fair-2024',
          'reactjs-masterclass-workshop',
          'future-of-ai-conference-2024',
          'digital-marketing-trends-2024'
        ]
      }
    });
  }
};