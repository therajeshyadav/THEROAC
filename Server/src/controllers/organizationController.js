const { Organization, OrganizationMember, User, Job, Event, ActivityLog } = require('../models');
const { Op } = require('sequelize');

// Helper function to log activity
const logActivity = async (organizationId, userId, action, entityType, entityId, changes, req) => {
  try {
    await ActivityLog.create({
      organizationId,
      userId,
      action,
      entityType,
      entityId,
      changes,
      ipAddress: req.ip || req.connection.remoteAddress
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Helper function to check permissions
const checkPermission = async (userId, organizationId, permission) => {
  const member = await OrganizationMember.findOne({
    where: { userId, organizationId, status: 'active' }
  });

  if (!member) return false;
  if (member.role === 'owner' || member.role === 'admin') return true;
  
  return member.permissions[permission] === true;
};

// Create organization
exports.createOrganization = async (req, res) => {
  try {
    const { name, description, logo, website, email, phone, address, industry, companySize, foundedYear, socialLinks } = req.body;
    const userId = req.user.id;

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check if slug exists
    const existingOrg = await Organization.findOne({ where: { slug } });
    if (existingOrg) {
      return res.status(400).json({ error: 'Organization with this name already exists' });
    }

    // Create organization
    const organization = await Organization.create({
      name,
      slug,
      description,
      logo,
      website,
      email,
      phone,
      address,
      industry,
      companySize,
      foundedYear,
      socialLinks,
      ownerId: userId
    });

    // Add owner as member
    await OrganizationMember.create({
      organizationId: organization.id,
      userId,
      role: 'owner',
      status: 'active',
      joinedAt: new Date(),
      permissions: {
        canManageJobs: true,
        canManageEvents: true,
        canManageTeam: true,
        canViewAnalytics: true,
        canManageApplications: true,
        canPostJobs: true,
        canPostEvents: true,
        canEditJobs: true,
        canEditEvents: true,
        canDeleteJobs: true,
        canDeleteEvents: true,
        canRespondToApplications: true
      }
    });

    // Update user's current organization
    await User.update(
      { currentOrganizationId: organization.id },
      { where: { id: userId } }
    );

    await logActivity(organization.id, userId, 'created', 'organization', organization.id, { name }, req);

    res.status(201).json({ organization });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
};

// Get organization details
exports.getOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const organization = await Organization.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'fullName', 'email', 'profilePicture']
        },
        {
          model: OrganizationMember,
          as: 'organizationMembers',
          where: { status: 'active' },
          required: false,
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'email', 'profilePicture']
          }]
        }
      ]
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if user is a member
    const isMember = await OrganizationMember.findOne({
      where: { organizationId: id, userId, status: 'active' }
    });

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ organization });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
};

// Update organization
exports.updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const organization = await Organization.findByPk(id);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check permission
    const canManage = await checkPermission(userId, id, 'canManageTeam');
    if (!canManage && organization.ownerId !== userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const oldData = { ...organization.toJSON() };
    await organization.update(updates);

    await logActivity(id, userId, 'updated', 'organization', id, { old: oldData, new: updates }, req);

    res.json({ organization });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
};

// Invite team member
exports.inviteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, permissions } = req.body;
    const userId = req.user.id;

    // Check permission
    const canManage = await checkPermission(userId, id, 'canManageTeam');
    if (!canManage) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Find user by email
    const invitedUser = await User.findOne({ where: { email } });
    if (!invitedUser) {
      return res.status(404).json({ 
        error: 'User not found. The user must register as a recruiter first before they can be invited to your organization.' 
      });
    }

    // Check if user is a recruiter
    if (invitedUser.role !== 'recruiter' && invitedUser.role !== 'organizer' && invitedUser.role !== 'admin') {
      return res.status(400).json({ 
        error: 'Only users with recruiter role can be added to organizations. This user is registered as a candidate.' 
      });
    }

    // Check if already a member (active or pending)
    const existingMember = await OrganizationMember.findOne({
      where: { 
        organizationId: id, 
        userId: invitedUser.id,
        status: { [Op.in]: ['active', 'pending'] }
      }
    });

    if (existingMember) {
      if (existingMember.status === 'pending') {
        return res.status(400).json({ error: 'User already has a pending invitation' });
      }
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Create member
    const member = await OrganizationMember.create({
      organizationId: id,
      userId: invitedUser.id,
      role: role || 'member',
      permissions: permissions || {},
      invitedBy: userId,
      invitedAt: new Date(),
      status: 'pending'
    });

    // Send notification to invited user
    try {
      const { Notification } = require('../models');
      const organization = await Organization.findByPk(id);
      const inviter = await User.findByPk(userId);
      
      // Create notification directly in database
      const notification = await Notification.create({
        userId: invitedUser.id,
        type: 'organization_invite',
        title: 'Organization Invitation',
        message: `${inviter.fullName || inviter.name || 'Someone'} invited you to join "${organization.name}"`,
        data: { 
          organizationId: organization.id, 
          organizationName: organization.name, 
          inviterName: inviter.fullName || inviter.name || 'Someone',
          memberId: member.id 
        },
        actionUrl: '/notifications',
        read: false
      });
      
      // Try to send real-time notification via Socket.IO if available
      try {
        const { getNotificationService } = require('../socket');
        const notificationService = getNotificationService();
        const io = notificationService.io;
        if (io) {
          io.to(`user_${invitedUser.id}`).emit('new_notification', notification);
        }
      } catch (socketError) {
        console.log('Socket.IO not available, notification saved to database');
      }
    } catch (notifError) {
      console.error('Failed to send invitation notification:', notifError);
      // Don't fail the invitation if notification fails
    }

    await logActivity(id, userId, 'invited', 'member', member.id, { email, role }, req);

    res.status(201).json({ member });
  } catch (error) {
    console.error('Error inviting member:', error);
    res.status(500).json({ error: 'Failed to invite member' });
  }
};

// Accept invitation
exports.acceptInvitation = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user.id;

    const member = await OrganizationMember.findOne({
      where: { id: memberId, organizationId: id, userId, status: 'pending' }
    });

    if (!member) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    await member.update({
      status: 'active',
      joinedAt: new Date()
    });

    await logActivity(id, userId, 'accepted_invitation', 'member', memberId, {}, req);

    res.json({ member });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
};

// Update member permissions
exports.updateMemberPermissions = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { role, permissions } = req.body;
    const userId = req.user.id;

    // Check permission
    const canManage = await checkPermission(userId, id, 'canManageTeam');
    if (!canManage) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const member = await OrganizationMember.findOne({
      where: { id: memberId, organizationId: id }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Cannot modify owner
    if (member.role === 'owner') {
      return res.status(400).json({ error: 'Cannot modify owner permissions' });
    }

    const oldData = { role: member.role, permissions: member.permissions };
    await member.update({ role, permissions });

    await logActivity(id, userId, 'updated_permissions', 'member', memberId, { old: oldData, new: { role, permissions } }, req);

    res.json({ member });
  } catch (error) {
    console.error('Error updating member permissions:', error);
    res.status(500).json({ error: 'Failed to update permissions' });
  }
};

// Remove member
exports.removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user.id;

    const member = await OrganizationMember.findOne({
      where: { id: memberId, organizationId: id }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // If member is pending, allow them to reject their own invitation
    // Or allow team managers to cancel pending invitations
    if (member.status === 'pending') {
      // User can reject their own invitation
      if (member.userId === userId) {
        await member.destroy({ force: true }); // Permanently delete
        await logActivity(id, userId, 'rejected_invitation', 'member', memberId, {}, req);
        return res.json({ message: 'Invitation rejected' });
      }
      
      // Team manager can cancel pending invitation
      const canManage = await checkPermission(userId, id, 'canManageTeam');
      if (canManage) {
        // Delete the invitation notification as well
        try {
          const { Notification } = require('../models');
          const { Op } = require('sequelize');
          
          // Find and delete notifications for this invitation
          const notifications = await Notification.findAll({
            where: {
              userId: member.userId,
              type: 'organization_invite'
            }
          });
          
          // Delete notifications that match this memberId
          for (const notif of notifications) {
            if (notif.data && notif.data.memberId === memberId) {
              await notif.destroy({ force: true });
              console.log('✅ Deleted invitation notification');
            }
          }
        } catch (notifError) {
          console.error('Failed to delete notification:', notifError);
        }
        
        await member.destroy({ force: true }); // Permanently delete
        await logActivity(id, userId, 'cancelled_invitation', 'member', memberId, {}, req);
        return res.json({ message: 'Invitation cancelled' });
      }
    }

    // For active members, check permission
    const canManage = await checkPermission(userId, id, 'canManageTeam');
    if (!canManage) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Cannot remove owner
    if (member.role === 'owner') {
      return res.status(400).json({ error: 'Cannot remove owner' });
    }

    // Soft delete active members
    await member.update({ status: 'removed' });

    await logActivity(id, userId, 'removed', 'member', memberId, {}, req);

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};

// Get organization members
exports.getMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is a member
    const isMember = await OrganizationMember.findOne({
      where: { organizationId: id, userId, status: 'active' }
    });

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const members = await OrganizationMember.findAll({
      where: { organizationId: id, status: { [Op.in]: ['active', 'pending'] } },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'email', 'profilePicture', 'headline']
      }, {
        model: User,
        as: 'inviter',
        attributes: ['id', 'fullName']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
};

// Get activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is a member
    const isMember = await OrganizationMember.findOne({
      where: { organizationId: id, userId, status: 'active' }
    });

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const offset = (page - 1) * limit;

    const { count, rows: logs } = await ActivityLog.findAndCountAll({
      where: { organizationId: id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'profilePicture']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      logs,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
};

// Switch organization
exports.switchOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is a member
    const isMember = await OrganizationMember.findOne({
      where: { organizationId: id, userId, status: 'active' }
    });

    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this organization' });
    }

    await User.update(
      { currentOrganizationId: id },
      { where: { id: userId } }
    );

    res.json({ message: 'Organization switched successfully' });
  } catch (error) {
    console.error('Error switching organization:', error);
    res.status(500).json({ error: 'Failed to switch organization' });
  }
};

// Get user organizations
exports.getUserOrganizations = async (req, res) => {
  try {
    const userId = req.user.id;

    const memberships = await OrganizationMember.findAll({
      where: { userId, status: 'active' },
      include: [{
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name', 'slug', 'logo', 'description']
      }]
    });

    const organizations = memberships.map(m => ({
      ...m.organization.toJSON(),
      role: m.role,
      permissions: m.permissions
    }));

    res.json({ organizations });
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
};

module.exports = exports;
