'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check and add currentStage to job_applications
    const jobAppsTableDescription = await queryInterface.describeTable('job_applications');
    if (!jobAppsTableDescription.currentStage) {
      await queryInterface.addColumn('job_applications', 'currentStage', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'Current recruitment stage index'
      });
      console.log('✅ Added currentStage to job_applications');
    } else {
      console.log('ℹ️ currentStage already exists in job_applications');
    }

    // Check and add stageSubmissions to job_applications
    if (!jobAppsTableDescription.stageSubmissions) {
      await queryInterface.addColumn('job_applications', 'stageSubmissions', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
        comment: 'Stage-wise submissions - [{stageIndex, submittedAt, submissionLink, submissionFile}]'
      });
      console.log('✅ Added stageSubmissions to job_applications');
    } else {
      console.log('ℹ️ stageSubmissions already exists in job_applications');
    }

    // Check and add currentStage to hub_content_applications
    const hubAppsTableDescription = await queryInterface.describeTable('hub_content_applications');
    if (!hubAppsTableDescription.currentStage) {
      await queryInterface.addColumn('hub_content_applications', 'currentStage', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'Current recruitment stage index'
      });
      console.log('✅ Added currentStage to hub_content_applications');
    } else {
      console.log('ℹ️ currentStage already exists in hub_content_applications');
    }

    // Check and add stageSubmissions to hub_content_applications
    if (!hubAppsTableDescription.stageSubmissions) {
      await queryInterface.addColumn('hub_content_applications', 'stageSubmissions', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
        comment: 'Stage-wise submissions - [{stageIndex, submittedAt, submissionLink, submissionFile}]'
      });
      console.log('✅ Added stageSubmissions to hub_content_applications');
    } else {
      console.log('ℹ️ stageSubmissions already exists in hub_content_applications');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Check and remove from job_applications
    const jobAppsTableDescription = await queryInterface.describeTable('job_applications');
    if (jobAppsTableDescription.currentStage) {
      await queryInterface.removeColumn('job_applications', 'currentStage');
    }
    if (jobAppsTableDescription.stageSubmissions) {
      await queryInterface.removeColumn('job_applications', 'stageSubmissions');
    }

    // Check and remove from hub_content_applications
    const hubAppsTableDescription = await queryInterface.describeTable('hub_content_applications');
    if (hubAppsTableDescription.currentStage) {
      await queryInterface.removeColumn('hub_content_applications', 'currentStage');
    }
    if (hubAppsTableDescription.stageSubmissions) {
      await queryInterface.removeColumn('hub_content_applications', 'stageSubmissions');
    }

    console.log('✅ Removed stage tracking columns from applications tables');
  }
};
