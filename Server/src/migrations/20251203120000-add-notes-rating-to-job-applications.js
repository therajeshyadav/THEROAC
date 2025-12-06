'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('job_applications');
    
    // Add notes column if it doesn't exist
    if (!tableInfo.notes) {
      await queryInterface.addColumn('job_applications', 'notes', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    // Update status enum to include new statuses
    try {
      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pending' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_job_applications_status')) THEN
            ALTER TYPE "enum_job_applications_status" ADD VALUE 'pending';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'reviewing' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_job_applications_status')) THEN
            ALTER TYPE "enum_job_applications_status" ADD VALUE 'reviewing';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'accepted' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_job_applications_status')) THEN
            ALTER TYPE "enum_job_applications_status" ADD VALUE 'accepted';
          END IF;
        END $$;
      `);
    } catch (error) {
      console.log('Status enum values may already exist:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('job_applications', 'notes');
  }
};
