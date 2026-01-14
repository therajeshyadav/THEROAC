const axios = require('axios');

const API_BASE_URL = 'http://localhost:4000/api';

// Test quiz API endpoints
async function testQuizAPI() {
    try {
        console.log('🧪 Testing Quiz API endpoints...\n');

        // First, let's get an event with quiz stages
        console.log('📋 1. Getting events...');
        const eventsResponse = await axios.get(`${API_BASE_URL}/events?perPage=50`);
        const events = eventsResponse.data;
        
        console.log(`Found ${events.length} events`);
        
        // Find an event with quiz stages
        let testEvent = null;
        for (const event of events) {
            if (event.stages && event.stages.length > 0) {
                for (const stage of event.stages) {
                    if (stage.hasQuiz && stage.quiz && stage.quiz.questions) {
                        testEvent = event;
                        console.log(`✅ Found event with quiz: "${event.title}" (ID: ${event.id})`);
                        break;
                    }
                }
                if (testEvent) break;
            }
        }

        if (!testEvent) {
            console.log('❌ No events with quiz stages found');
            return;
        }

        // Find a quiz stage
        let quizStageIndex = -1;
        let quizStage = null;
        for (let i = 0; i < testEvent.stages.length; i++) {
            const stage = testEvent.stages[i];
            if (stage.hasQuiz && stage.quiz && stage.quiz.questions) {
                quizStageIndex = i;
                quizStage = stage;
                console.log(`🧠 Found quiz stage at index ${i}: "${stage.title || `Stage ${i + 1}`}"`);
                console.log(`   Quiz: "${stage.quiz.title}" with ${stage.quiz.questions.length} questions`);
                break;
            }
        }

        if (quizStageIndex === -1) {
            console.log('❌ No quiz stages found in the event');
            return;
        }

        // Test without authentication (should fail)
        console.log('\n🔒 2. Testing quiz status without authentication...');
        try {
            await axios.get(`${API_BASE_URL}/events/${testEvent.id}/stages/${quizStageIndex}/quiz/status`);
            console.log('❌ Should have failed without auth');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Correctly rejected without authentication');
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }

        // For testing with auth, we'd need a valid token
        console.log('\n📝 3. Quiz stage details:');
        console.log(`   Event ID: ${testEvent.id}`);
        console.log(`   Stage Index: ${quizStageIndex}`);
        console.log(`   Stage Title: ${quizStage.title || `Stage ${quizStageIndex + 1}`}`);
        console.log(`   Quiz Title: ${quizStage.quiz.title}`);
        console.log(`   Questions: ${quizStage.quiz.questions.length}`);
        console.log(`   Time Limit: ${quizStage.quiz.timeLimit} minutes`);
        console.log(`   Start Date: ${quizStage.startDate}`);
        console.log(`   Deadline: ${quizStage.deadline}`);

        // Check if stage is currently active
        const now = new Date();
        const startDate = new Date(quizStage.startDate);
        const deadline = new Date(quizStage.deadline);
        
        console.log('\n⏰ 4. Stage timing:');
        console.log(`   Current time: ${now.toISOString()}`);
        console.log(`   Stage starts: ${startDate.toISOString()}`);
        console.log(`   Stage ends: ${deadline.toISOString()}`);
        
        if (now < startDate) {
            console.log('   Status: ⏳ Not yet started');
        } else if (now > deadline) {
            console.log('   Status: ⏰ Ended');
        } else {
            console.log('   Status: ✅ Currently active');
        }

        console.log('\n🎯 Test completed. To test with authentication:');
        console.log('1. Login to get a token');
        console.log('2. Register for the event');
        console.log('3. Test quiz status and submission endpoints');

    } catch (error) {
        console.error('❌ Error testing quiz API:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the test
testQuizAPI();