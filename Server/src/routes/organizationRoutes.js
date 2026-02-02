const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { authenticate } = require('../middleware/auth');
const { 
  checkOrganizationPermission, 
  checkOrganizationOwner, 
  checkOrganizationMember 
} = require('../middleware/organizationMiddleware');

// Organization CRUD
router.post('/', authenticate, organizationController.createOrganization);
router.get('/my-organizations', authenticate, organizationController.getUserOrganizations);
router.get('/:id', authenticate, checkOrganizationMember, organizationController.getOrganization);
router.put('/:id', authenticate, checkOrganizationPermission('canManageTeam'), organizationController.updateOrganization);
router.post('/:id/switch', authenticate, organizationController.switchOrganization);

// Team management
router.post('/:id/members/invite', authenticate, checkOrganizationPermission('canManageTeam'), organizationController.inviteMember);
router.post('/:id/members/:memberId/accept', authenticate, organizationController.acceptInvitation);
router.put('/:id/members/:memberId/permissions', authenticate, checkOrganizationPermission('canManageTeam'), organizationController.updateMemberPermissions);
router.delete('/:id/members/:memberId', authenticate, checkOrganizationPermission('canManageTeam'), organizationController.removeMember);
router.get('/:id/members', authenticate, checkOrganizationMember, organizationController.getMembers);

// Activity logs
router.get('/:id/activity-logs', authenticate, checkOrganizationMember, organizationController.getActivityLogs);

module.exports = router;
