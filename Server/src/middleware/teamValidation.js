const { Event, EventTeamMember, EventTeam } = require('../models');

// Middleware to validate team eligibility before submissions
const validateTeamEligibility = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Get event details
    const event = await Event.findByPk(eventId, {
      attributes: ['id', 'title', 'minTeamSize', 'maxTeamSize', 'categories', 'registrationDeadline']
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if registration deadline has passed
    const now = new Date();
    const registrationDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : null;
    const isRegistrationDeadlinePassed = registrationDeadline && now > registrationDeadline;

    // Check if this is a team-based event
    const isTeamBasedEvent = event.categories && 
      event.categories.some(cat => ['hackathon', 'competition', 'contest', 'challenge'].includes(cat.toLowerCase()));

    // If not team-based, skip validation
    if (!isTeamBasedEvent) {
      return next();
    }

    // Check if user has a team
    const teamMember = await EventTeamMember.findOne({
      where: { userId, eventId },
      include: [{
        model: EventTeam,
        as: 'team',
        attributes: ['id', 'name']
      }]
    });

    if (!teamMember) {
      return res.status(400).json({
        error: 'You must create or join a team before making submissions',
        code: 'NO_TEAM'
      });
    }

    // Get team member count
    const memberCount = await EventTeamMember.count({
      where: { teamId: teamMember.team.id }
    });

    // Check minimum team size requirement
    if (event.minTeamSize && memberCount < event.minTeamSize) {
      const needed = event.minTeamSize - memberCount;
      
      // If registration deadline has passed, completely block access
      if (isRegistrationDeadlinePassed) {
        return res.status(403).json({
          error: 'Registration deadline has passed. Your team cannot participate as minimum members requirement was not met.',
          code: 'REGISTRATION_DEADLINE_PASSED',
          currentMembers: memberCount,
          minRequired: event.minTeamSize,
          registrationDeadline: event.registrationDeadline
        });
      }
      
      return res.status(400).json({
        error: `Your team needs ${needed} more member${needed > 1 ? 's' : ''} to be eligible for submissions (minimum ${event.minTeamSize} required)`,
        code: 'TEAM_INCOMPLETE',
        currentMembers: memberCount,
        minRequired: event.minTeamSize,
        membersNeeded: needed
      });
    }

    // Check maximum team size (if exceeded)
    if (event.maxTeamSize && memberCount > event.maxTeamSize) {
      const excess = memberCount - event.maxTeamSize;
      return res.status(400).json({
        error: `Your team has ${excess} member${excess > 1 ? 's' : ''} more than allowed (maximum ${event.maxTeamSize} allowed)`,
        code: 'TEAM_OVERSIZED',
        currentMembers: memberCount,
        maxAllowed: event.maxTeamSize
      });
    }

    // Add team info to request for use in submission handlers
    req.teamInfo = {
      teamId: teamMember.team.id,
      teamName: teamMember.team.name,
      memberCount,
      isEligible: true
    };

    next();

  } catch (err) {
    console.error('Error in team validation middleware:', err);
    return res.status(500).json({
      error: 'Failed to validate team eligibility. Please try again.'
    });
  }
};

module.exports = { validateTeamEligibility };