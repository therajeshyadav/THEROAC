'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('ProfileViews', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            profileUserId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                comment: 'The user whose profile was viewed'
            },
            viewerUserId: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
                comment: 'The user who viewed the profile (null for anonymous views)'
            },
            viewedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            ipAddress: {
                type: Sequelize.STRING,
                allowNull: true
            },
            userAgent: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            }
        });

        // Add indexes for better query performance
        await queryInterface.addIndex('ProfileViews', ['profileUserId'], {
            name: 'profile_views_profile_user_id_idx'
        });

        await queryInterface.addIndex('ProfileViews', ['viewerUserId'], {
            name: 'profile_views_viewer_user_id_idx'
        });

        await queryInterface.addIndex('ProfileViews', ['viewedAt'], {
            name: 'profile_views_viewed_at_idx'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('ProfileViews');
    }
};
