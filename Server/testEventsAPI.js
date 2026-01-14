const express = require('express');
const { Event } = require('./src/models');

async function testEventsAPI() {
  try {
    console.log('🔍 Testing Events API endpoint...\n');
    
    // Simulate the exact query from the frontend
    const where = { approvalStatus: 'approved' };
    const events = await Event.findAll({
      where,
      offset: 0,
      limit: 20,
      order: [['startDate', 'ASC']]
    });
    
    console.log(`📊 API Query Result: Found ${events.length} approved events\n`);
    
    if (events.length === 0) {
      console.log('❌ No events returned by API query!');
      console.log('🔍 This explains why landing page is empty.');
    } else {
      console.log('✅ Events found! Here are the first 5:');
      events.slice(0, 5).forEach((event, index) => {
        console.log(`${index + 1}. ${event.title}`);
        console.log(`   Status: ${event.status} | Approval: ${event.approvalStatus}`);
        console.log(`   Start: ${event.startDate}`);
        console.log('');
      });
      
      console.log('🎯 These events should be visible on the landing page.');
      console.log('🔍 If they\'re not showing, check:');
      console.log('   1. Frontend API call URL');
      console.log('   2. Network connectivity');
      console.log('   3. CORS settings');
      console.log('   4. Browser console for errors');
    }
    
    // Test the actual API response format
    console.log('\n📋 Sample API Response Format:');
    if (events.length > 0) {
      const sampleEvent = {
        id: events[0].id,
        title: events[0].title,
        approvalStatus: events[0].approvalStatus,
        status: events[0].status,
        startDate: events[0].startDate,
        bannerImage: events[0].bannerImage,
        location: events[0].location
      };
      console.log(JSON.stringify(sampleEvent, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error testing events API:', error);
  } finally {
    process.exit(0);
  }
}

testEventsAPI();