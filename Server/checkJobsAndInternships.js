require('dotenv').config();
const { Job, HubContent } = require('./src/models');

const checkDatabase = async () => {
  try {
    console.log('\n🔍 Checking Database...\n');
    
    // Check Jobs
    console.log('📋 JOBS:');
    console.log('=' .repeat(80));
    const jobs = await Job.findAll({
      attributes: ['id', 'title', 'companyName', 'slug', 'status'],
      order: [['createdAt', 'DESC']]
    });
    
    if (jobs.length === 0) {
      console.log('❌ No jobs found in database\n');
    } else {
      console.log(`✅ Total Jobs: ${jobs.length}\n`);
      jobs.forEach((job, index) => {
        const generatedSlug = `${job.title}-${job.companyName}`
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        console.log(`${index + 1}. ${job.title}`);
        console.log(`   Company: ${job.companyName}`);
        console.log(`   Status: ${job.status || 'N/A'}`);
        console.log(`   DB Slug: ${job.slug || 'NULL'}`);
        console.log(`   Generated Slug: ${generatedSlug}`);
        console.log(`   URL: http://localhost:3000/event-detail/jobs/${generatedSlug}`);
        console.log('');
      });
    }
    
    // Check Internships (Hub Content)
    console.log('\n📋 INTERNSHIPS (Hub Content):');
    console.log('=' .repeat(80));
    const internships = await HubContent.findAll({
      attributes: ['id', 'title', 'organizationId', 'slug', 'status'],
      order: [['createdAt', 'DESC']]
    });
    
    if (internships.length === 0) {
      console.log('❌ No internships found in database\n');
    } else {
      console.log(`✅ Total Internships: ${internships.length}\n`);
      internships.forEach((internship, index) => {
        const generatedSlug = `${internship.title}-${internship.organizationId || 'organization'}`
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        console.log(`${index + 1}. ${internship.title}`);
        console.log(`   Organization ID: ${internship.organizationId || 'N/A'}`);
        console.log(`   Status: ${internship.status || 'N/A'}`);
        console.log(`   DB Slug: ${internship.slug || 'NULL'}`);
        console.log(`   Generated Slug: ${generatedSlug}`);
        console.log(`   URL: http://localhost:3000/event-detail/internships/${generatedSlug}`);
        console.log('');
      });
    }
    
    console.log('\n✅ Database check complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
};

checkDatabase();
