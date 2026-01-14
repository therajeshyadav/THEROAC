// Sample Event Data with Stages Structure
// This shows how recruiters should structure their event stages data

export const sampleEventWithStages = {
    id: 1,
    title: "Tech Innovation Hackathon 2024",
    description: "A 48-hour hackathon focused on innovative tech solutions",
    company: "TechCorp",
    location: "Mumbai, India",
    
    // Enhanced stages structure for events
    stages: [
        {
            title: "Registration & Team Formation",
            description: "Register for the hackathon and form your team. Submit your initial project idea.",
            startDate: "2024-02-01T00:00:00Z",
            deadline: "2024-02-15T23:59:59Z",
            submissions: [
                {
                    type: "team-details",
                    label: "Team Information",
                    description: "Provide team member details and roles",
                    required: true
                },
                {
                    type: "project-idea",
                    label: "Project Idea",
                    description: "Brief description of your project concept (max 500 words)",
                    required: true
                }
            ]
        },
        {
            title: "Round 1: Idea Submission",
            description: "Submit your detailed project proposal with technical specifications.",
            startDate: "2024-02-16T00:00:00Z",
            deadline: "2024-02-28T23:59:59Z",
            submissions: [
                {
                    type: "ppt",
                    label: "Project Presentation",
                    description: "Upload your project presentation (PPT/PDF format)",
                    required: true
                },
                {
                    type: "github-link",
                    label: "GitHub Repository",
                    description: "Link to your project repository (if started)",
                    required: false
                },
                {
                    type: "document",
                    label: "Technical Specification",
                    description: "Detailed technical document explaining your approach",
                    required: true
                }
            ]
        },
        {
            title: "Round 2: Prototype Development",
            description: "Develop a working prototype and submit demo video.",
            startDate: "2024-03-01T00:00:00Z",
            deadline: "2024-03-15T23:59:59Z",
            submissions: [
                {
                    type: "github-link",
                    label: "GitHub Repository",
                    description: "Complete source code repository",
                    required: true
                },
                {
                    type: "demo-video",
                    label: "Demo Video",
                    description: "5-minute demo video showcasing your prototype",
                    required: true
                },
                {
                    type: "link",
                    label: "Live Demo Link",
                    description: "Deployed application URL (if applicable)",
                    required: false
                }
            ]
        },
        {
            title: "Round 3: Technical Quiz",
            description: "Complete a technical assessment to test your programming skills.",
            startDate: "2024-03-16T00:00:00Z",
            deadline: "2024-03-20T23:59:59Z",
            submissions: [
                {
                    type: "quiz",
                    label: "Technical Assessment",
                    description: "Complete the online technical quiz (60 minutes)",
                    required: true
                }
            ]
        },
        {
            title: "Final Round: Presentation",
            description: "Present your final solution to the judging panel.",
            startDate: "2024-03-25T09:00:00Z",
            deadline: "2024-03-25T18:00:00Z",
            submissions: [
                {
                    type: "ppt",
                    label: "Final Presentation",
                    description: "Final presentation slides for judging panel",
                    required: true
                },
                {
                    type: "code",
                    label: "Code Walkthrough",
                    description: "Key code snippets or architecture explanation",
                    required: false
                }
            ]
        }
    ],
    
    // Fallback to old agenda format for backward compatibility
    agenda: [
        {
            time: "Day 1 - 9:00 AM",
            title: "Opening Ceremony",
            description: "Welcome and hackathon kickoff",
            speaker: "Tech Lead"
        },
        {
            time: "Day 1 - 10:00 AM",
            title: "Team Formation",
            description: "Form teams and start brainstorming"
        }
    ]
};

// Sample Event without stages (uses old agenda format)
export const sampleEventWithoutStages = {
    id: 2,
    title: "Web Development Workshop",
    description: "Learn modern web development techniques",
    company: "WebAcademy",
    location: "Online",
    
    // No stages property, will fallback to agenda
    agenda: [
        {
            time: "10:00 AM",
            title: "Introduction to React",
            description: "Getting started with React framework",
            speaker: "John Doe"
        },
        {
            time: "11:30 AM",
            title: "State Management",
            description: "Understanding React state and props",
            speaker: "Jane Smith"
        },
        {
            time: "2:00 PM",
            title: "Building Your First App",
            description: "Hands-on project development"
        }
    ]
};

// Different submission types that recruiters can use
export const availableSubmissionTypes = {
    'ppt': {
        icon: '📊',
        label: 'Presentation',
        description: 'Upload PowerPoint or PDF presentation',
        acceptedFormats: ['.ppt', '.pptx', '.pdf']
    },
    'github-link': {
        icon: '💻',
        label: 'GitHub Repository',
        description: 'Link to your GitHub repository',
        inputType: 'url'
    },
    'demo-video': {
        icon: '🎥',
        label: 'Demo Video',
        description: 'YouTube, Vimeo, or Google Drive video link',
        inputType: 'url'
    },
    'quiz': {
        icon: '📝',
        label: 'Technical Quiz',
        description: 'Complete online assessment',
        inputType: 'quiz'
    },
    'document': {
        icon: '📄',
        label: 'Document',
        description: 'Upload PDF or Word document',
        acceptedFormats: ['.pdf', '.doc', '.docx']
    },
    'code': {
        icon: '💻',
        label: 'Code Submission',
        description: 'Paste code or provide repository link',
        inputType: 'textarea'
    },
    'link': {
        icon: '🔗',
        label: 'Website Link',
        description: 'Link to deployed application or website',
        inputType: 'url'
    },
    'design': {
        icon: '🎨',
        label: 'Design File',
        description: 'Upload design mockups or wireframes',
        acceptedFormats: ['.fig', '.sketch', '.pdf', '.png', '.jpg']
    }
};

// How recruiters should structure their event data when creating events
export const eventCreationGuide = {
    // Basic event info
    title: "Event Title",
    description: "Event description",
    company: "Company Name",
    location: "Event Location",
    
    // Stages configuration (new enhanced format)
    stages: [
        {
            title: "Stage/Round Name",
            description: "What participants need to do in this stage",
            startDate: "2024-02-01T00:00:00Z", // When stage becomes active
            deadline: "2024-02-15T23:59:59Z",   // Submission deadline
            submissions: [
                {
                    type: "ppt|github-link|demo-video|quiz|document|code|link|design",
                    label: "Display name for this submission",
                    description: "Help text for participants",
                    required: true // or false
                }
                // Add more submission requirements as needed
            ]
        }
        // Add more stages as needed
    ]
};