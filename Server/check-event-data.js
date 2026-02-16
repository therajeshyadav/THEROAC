const { Event } = require('./src/models');

async function checkEventData() {
  try {
    // Get latest event
    const event = await Event.findOne({
      order: [['updatedAt', 'DESC']]
    });

    if (!event) {
      console.log('❌ No events found in database');
      process.exit(0);
    }

    console.log('\n📊 Latest Event Data:');
    console.log('='.repeat(50));
    console.log('ID:', event.id);
    console.log('Title:', event.title);
    console.log('Company Name:', event.companyName);
    console.log('\n🎯 Opportunity Fields:');
    console.log('  opportunityType:', event.opportunityType);
    console.log('  opportunitySubType:', event.opportunitySubType);
    console.log('  participationType:', event.participationType);
    console.log('  minTeamSize:', event.minTeamSize);
    console.log('  maxTeamSize:', event.maxTeamSize);
    console.log('  mode:', event.mode);
    
    console.log('\n📋 Other Fields:');
    console.log('  categories:', event.categories);
    console.log('  eligibility:', event.eligibility ? 'Set' : 'Not set');
    console.log('  registrationSettings:', event.registrationSettings ? 'Set' : 'Not set');
    console.log('  stages:', event.stages ? `${event.stages.length} stages` : 'No stages');
    console.log('  prizesList:', event.prizesList ? `${event.prizesList.length} prizes` : 'No prizes');
    console.log('  importantDates:', event.importantDates ? `${event.importantDates.length} dates` : 'No dates');
    console.log('  contactInfo:', event.contactInfo ? 'Set' : 'Not set');
    console.log('  socialLinks:', event.socialLinks ? 'Set' : 'Not set');
    console.log('  faqs:', event.faqs ? `${event.faqs.length} FAQs` : 'No FAQs');
    console.log('  bannerImage:', event.bannerImage ? 'Set' : 'Not set');
    console.log('  mobileBanner:', event.mobileBanner ? 'Set' : 'Not set');
    console.log('  themeColor:', event.themeColor);
    console.log('  terms:', event.terms ? 'Set' : 'Not set');
    console.log('  additionalNotes:', event.additionalNotes ? 'Set' : 'Not set');
    console.log('  featured:', event.featured);
    
    console.log('\n📅 Timestamps:');
    console.log('  Created:', event.createdAt);
    console.log('  Updated:', event.updatedAt);
    console.log('='.repeat(50));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkEventData();
