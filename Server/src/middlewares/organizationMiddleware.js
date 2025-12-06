const { OrganizationMember, Organization } = require('../models');

// Check if user has permission for an action
exports.checkOrganizationPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const organizationId = req.body.organizationId || req.params.organizationId || req.params.id;

      if (!organizationId) {
        return res.status(400).json({ error: 'Organization ID is required' });
      }

      const member = await OrganizationMember.findOne({
        where: { userId, organizationId, status: 'active' }
      });

      if (!member) {
        return res.status(403).json({ error: 'You are not a member of this organization' });
      }

      // Owner and admin have all permissions
      if (member.role === 'owner' || member.role === 'admin') {
        req.organizationMember = member;
        return next();
      }

      // Check specific permission
      if (!member.permissions[permission]) {
        return res.status(403).json({ error: 'You do not have permission to perform this action' });
      }

      req.organizationMember = member;
      next();
    } catch (error) {
      console.error('Error checking organization permission:', error);
      res.status(500).json({ error: 'Failed to verify permissions' });
    }
  };
};

// Check if user is organization owner
exports.checkOrganizationOwner = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const organizationId = req.params.id || req.params.organizationId;

    const organization = await Organization.findByPk(organizationId);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    if (organization.ownerId !== userId) {
      return res.status(403).json({ error: 'Only organization owner can perform this action' });
    }

    req.organization = organization;
    next();
  } catch (error) {
    console.error('Error checking organization owner:', error);
    res.status(500).json({ error: 'Failed to verify ownership' });
  }
};

// Check if user is member of organization
exports.checkOrganizationMember = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const organizationId = req.params.id || req.params.organizationId || req.body.organizationId;

    const member = await OrganizationMember.findOne({
      where: { userId, organizationId, status: 'active' }
    });

    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this organization' });
    }

    req.organizationMember = member;
    next();
  } catch (error) {
    console.error('Error checking organization membership:', error);
    res.status(500).json({ error: 'Failed to verify membership' });
  }
};

// Attach organization context to request
exports.attachOrganizationContext = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user's current organization
    const user = await require('../models').User.findByPk(userId, {
      attributes: ['currentOrganizationId']
    });

    if (user && user.currentOrganizationId) {
      const member = await OrganizationMember.findOne({
        where: { 
          userId, 
          organizationId: user.currentOrganizationId, 
          status: 'active' 
        },
        include: [{
          model: Organization,
          as: 'organization'
        }]
      });

      if (member) {
        req.currentOrganization = member.organization;
        req.organizationMember = member;
      }
    }

    next();
  } catch (error) {
    console.error('Error attaching organization context:', error);
    next(); // Continue even if there's an error
  }
};

module.exports = exports;
