'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add 'cancelled' status to job_applications if not exists
      await queryInterface.sequelize.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'cancelled' 
            AND enumtypid = (
              SELECT oid FROM pg_type 
              WHERE typname = 'enum_job_applications_status'
            )
          ) THEN
            ALTER TYPE "enum_job_applications_status" ADD VALUE 'cancelled';
          END IF;
        END $$;
      `);

      // Add 'cancelled' status to hub_content_applications if not exists
      await queryInterface.sequelize.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'cancelled' 
            AND enumtypid = (
              SELECT oid FROM pg_type 
              WHERE typname = 'enum_hub_content_applications_status'
            )
          ) THEN
            ALTER TYPE "enum_hub_content_applications_status" ADD VALUE 'cancelled';
          END IF;
        END $$;
      `);

      // Add notes field to hub_content_applications if not exists
      const hubContentApplicationsTable = await queryInterface.describeTable('hub_content_applications');
      if (!hubContentApplicationsTable.notes) {
        await queryInterface.addColumn('hub_content_applications', 'notes', {
          type: Sequelize.TEXT,
          allowNull: true
        });
      }

      // Add notes field to event_registrations if not exists
      const eventRegistrationsTable = await queryInterface.describeTable('event_registrations');
      if (!eventRegistrationsTable.notes) {
        await queryInterface.addColumn('event_registrations', 'notes', {
          type: Sequelize.TEXT,
          allowNull: true
        });
      }

      // Add new notification types if not exists
      await queryInterface.sequelize.query(`
        DO $$ 
        BEGIN
          -- Add job_cancelled
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'job_cancelled' 
            AND enumtypid = (
              SELECT oid FROM pg_type 
              WHERE typname = 'enum_notifications_type'
            )
          ) THEN
            ALTER TYPE "enum_notifications_type" ADD VALUE 'job_cancelled';
          END IF;

          -- Add event_cancelled
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'event_cancelled' 
            AND enumtypid = (
              SELECT oid FROM pg_type 
              WHERE typname = 'enum_notifications_type'
            )
          ) THEN
            ALTER TYPE "enum_notifications_type" ADD VALUE 'event_cancelled';
          END IF;

          -- Add internship_cancelled
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'internship_cancelled' 
            AND enumtypid = (
              SELECT oid FROM pg_type 
              WHERE typname = 'enum_notifications_type'
            )
          ) THEN
            ALTER TYPE "enum_notifications_type" ADD VALUE 'internship_cancelled';
          END IF;

          -- Add resubmission_allowed
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'resubmission_allowed' 
            AND enumtypid = (
              SELECT oid FROM pg_type 
              WHERE typname = 'enum_notifications_type'
            )
          ) THEN
            ALTER TYPE "enum_notifications_type" ADD VALUE 'resubmission_allowed';
          END IF;
        END $$;
      `);

      console.log('✅ Rejection improvements migration completed successfully');
    } catch (error) {
      console.error('❌ Error in rejection improvements migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove notes field from hub_content_applications
      const hubContentApplicationsTable = await queryInterface.describeTable('hub_content_applications');
      if (hubContentApplicationsTable.notes) {
        await queryInterface.removeColumn('hub_content_applications', 'notes');
      }

      // Remove notes field from event_registrations
      const eventRegistrationsTable = await queryInterface.describeTable('event_registrations');
      if (eventRegistrationsTable.notes) {
        await queryInterface.removeColumn('event_registrations', 'notes');
      }

      // Note: We cannot easily remove enum values in PostgreSQL without recreating the type
      // This would require dropping and recreating the enum type, which could cause data loss
      // So we'll leave the enum values in place for safety

      console.log('✅ Rejection improvements migration rollback completed');
    } catch (error) {
      console.error('❌ Error in rejection improvements migration rollback:', error);
      throw error;
    }
  }
};