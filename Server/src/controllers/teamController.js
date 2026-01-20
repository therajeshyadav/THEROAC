const { Event, User, EventRegistration, EventTeam, EventTeamMember } = require('../models');
const { Op } = require('sequelize');

// Get team status for any team-based event
exports.getTeamStatus = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if user is registered for the event
    const registration = await EventRegistration.findOne({
      where: { userId, eventId }
    });
    if (!registration) {
      return res.status(403).json({ error: 'You must be registered for this event' });
    }

    // Get event details for team size validation
    const event = await Event.findByPk(eventId, {
      attributes: ['id', 'minTeamSize', 'maxTeamSize', 'title', 'registrationDeadline']
    });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if registration deadline has passed
    const now = new Date();
    const registrationDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : null;
    const isRegistrationDeadlinePassed = registrationDeadline && now > registrationDeadline;

    // Check if user has a team for this event
    const teamMember = await EventTeamMember.findOne({
      where: { userId, eventId },
      include: [{
        model: EventTeam,
        as: 'team',
        attributes: ['id', 'name', 'teamCode', 'leaderId', 'maxMembers']
      }]
    });

    if (teamMember) {
      // User has a team
      const team = teamMember.team;
      const isLeader = team.leaderId === userId;
      
      // Get all team members
      const allMembers = await EventTeamMember.findAll({
        where: { teamId: team.id },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email']
        }]
      });

      const currentMemberCount = allMembers.length;
      
      // Check team eligibility for submissions
      const isEligibleForSubmission = checkTeamEligibility(currentMemberCount, event.minTeamSize, event.maxTeamSize);
      const eligibilityMessage = getEligibilityMessage(currentMemberCount, event.minTeamSize, event.maxTeamSize, isRegistrationDeadlinePassed);

      res.json({
        hasTeam: true,
        teamId: team.id,
        teamName: team.name,
        teamCode: team.teamCode,
        isLeader,
        memberCount: currentMemberCount,
        maxMembers: team.maxMembers,
        minRequiredMembers: event.minTeamSize,
        isEligibleForSubmission: isEligibleForSubmission && !isRegistrationDeadlinePassed,
        eligibilityMessage,
        registrationDeadline: event.registrationDeadline,
        isRegistrationDeadlinePassed,
        evaluations: team.submissionData?.evaluations || [], // Include evaluation data
        members: allMembers.map(member => ({
          id: member.user.id,
          name: member.user.fullName,
          email: member.user.email,
          joinedAt: member.createdAt,
          isLeader: member.user.id === team.leaderId
        }))
      });
    } else {
      // User doesn't have a team
      res.json({
        hasTeam: false,
        teamId: null,
        minRequiredMembers: event.minTeamSize,
        maxAllowedMembers: event.maxTeamSize,
        registrationDeadline: event.registrationDeadline,
        isRegistrationDeadlinePassed
      });
    }

  } catch (err) {
    console.error('Error in getTeamStatus:', err);
    return res.status(500).json({
      error: 'Failed to get team status. Please try again.'
    });
  }
};

// Helper function to check team eligibility
const checkTeamEligibility = (currentMembers, minTeamSize, maxTeamSize) => {
  // If no minimum team size is set, team is always eligible
  if (!minTeamSize) return true;
  
  // Check if current members meet minimum requirement
  if (currentMembers < minTeamSize) return false;
  
  // Check if current members don't exceed maximum (if set)
  if (maxTeamSize && currentMembers > maxTeamSize) return false;
  
  return true;
};

// Helper function to get eligibility message
const getEligibilityMessage = (currentMembers, minTeamSize, maxTeamSize, isRegistrationDeadlinePassed) => {
  // If registration deadline has passed and team is incomplete
  if (isRegistrationDeadlinePassed && minTeamSize && currentMembers < minTeamSize) {
    return 'Registration deadline has passed. Team cannot participate as minimum members requirement was not met.';
  }
  
  if (!minTeamSize) {
    return 'Team is eligible for submissions';
  }
  
  if (currentMembers < minTeamSize) {
    const needed = minTeamSize - currentMembers;
    return `Need ${needed} more member${needed > 1 ? 's' : ''} to be eligible for submissions (minimum ${minTeamSize} required)`;
  }
  
  if (maxTeamSize && currentMembers > maxTeamSize) {
    const excess = currentMembers - maxTeamSize;
    return `Team has ${excess} member${excess > 1 ? 's' : ''} more than allowed (maximum ${maxTeamSize} allowed)`;
  }
  
  return 'Team is eligible for submissions';
};

// Get problem statements for any event (optional feature)
exports.getProblemStatements = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if user is registered for the event
    const registration = await EventRegistration.findOne({
      where: { userId, eventId }
    });
    if (!registration) {
      return res.status(403).json({ error: 'You must be registered for this event' });
    }

    // Get the event to check problem statements
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if problem statements are configured and released
    const problemStatements = event.problemStatements || {};
    const now = new Date();
    const releaseDate = problemStatements.releaseDate ? new Date(problemStatements.releaseDate) : null;
    const submissionStartDate = problemStatements.submissionStartDate ? new Date(problemStatements.submissionStartDate) : null;

    // If no problem statements configured, return not available
    if (!problemStatements.statements || problemStatements.statements.length === 0) {
      return res.json({
        released: false,
        available: false,
        message: 'No problem statements configured for this event'
      });
    }

    // Check if problem statements are released
    const released = !releaseDate || now >= releaseDate;

    if (!released) {
      return res.json({
        released: false,
        available: true,
        releaseDate: problemStatements.releaseDate,
        message: 'Problem statements will be released soon'
      });
    }

    res.json({
      released: true,
      available: true,
      releaseDate: problemStatements.releaseDate,
      submissionStartDate: problemStatements.submissionStartDate,
      statements: problemStatements.statements || [],
      guidelines: problemStatements.guidelines || '',
      resources: problemStatements.resources || []
    });

  } catch (err) {
    console.error('Error in getProblemStatements:', err);
    return res.status(500).json({
      error: 'Failed to get problem statements. Please try again.'
    });
  }
};

// Create a new team for any team-based event
exports.createTeam = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { teamName, maxMembers = 4 } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!teamName || teamName.trim().length < 3) {
      return res.status(400).json({ error: 'Team name must be at least 3 characters long' });
    }

    // Check if user is registered for the event
    const registration = await EventRegistration.findOne({
      where: { userId, eventId }
    });
    if (!registration) {
      return res.status(403).json({ error: 'You must be registered for this event' });
    }

    // Check if user already has a team for this event
    const existingTeamMember = await EventTeamMember.findOne({
      where: { userId, eventId }
    });
    if (existingTeamMember) {
      return res.status(400).json({ error: 'You are already part of a team for this event' });
    }

    // Generate unique team code
    let teamCode;
    let codeExists = true;
    while (codeExists) {
      teamCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingTeam = await EventTeam.findOne({
        where: { teamCode, eventId }
      });
      codeExists = !!existingTeam;
    }

    // Create the team
    const team = await EventTeam.create({
      eventId,
      name: teamName.trim(),
      teamCode,
      leaderId: userId,
      maxMembers: parseInt(maxMembers)
    });

    // Add the creator as the first team member
    await EventTeamMember.create({
      teamId: team.id,
      userId,
      eventId,
      role: 'leader'
    });

    res.status(201).json({
      message: 'Team created successfully',
      team: {
        id: team.id,
        name: team.name,
        teamCode: team.teamCode,
        maxMembers: team.maxMembers,
        memberCount: 1,
        isLeader: true
      }
    });

  } catch (err) {
    console.error('Error in createTeam:', err);
    return res.status(500).json({
      error: 'Failed to create team. Please try again.'
    });
  }
};

// Join an existing team using team code
exports.joinTeam = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { teamCode } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!teamCode || teamCode.trim().length !== 6) {
      return res.status(400).json({ error: 'Invalid team code' });
    }

    // Check if user is registered for the event
    const registration = await EventRegistration.findOne({
      where: { userId, eventId }
    });
    if (!registration) {
      return res.status(403).json({ error: 'You must be registered for this event' });
    }

    // Check if user already has a team for this event
    const existingTeamMember = await EventTeamMember.findOne({
      where: { userId, eventId }
    });
    if (existingTeamMember) {
      return res.status(400).json({ error: 'You are already part of a team for this event' });
    }

    // Find the team
    const team = await EventTeam.findOne({
      where: { teamCode: teamCode.trim().toUpperCase(), eventId }
    });
    if (!team) {
      return res.status(404).json({ error: 'Team not found with this code' });
    }

    // Check if team is full
    const currentMemberCount = await EventTeamMember.count({
      where: { teamId: team.id }
    });
    if (currentMemberCount >= team.maxMembers) {
      return res.status(400).json({ error: 'Team is already full' });
    }

    // Add user to the team
    await EventTeamMember.create({
      teamId: team.id,
      userId,
      eventId,
      role: 'member'
    });

    res.status(201).json({
      message: 'Successfully joined the team',
      team: {
        id: team.id,
        name: team.name,
        teamCode: team.teamCode,
        maxMembers: team.maxMembers,
        memberCount: currentMemberCount + 1,
        isLeader: false
      }
    });

  } catch (err) {
    console.error('Error in joinTeam:', err);
    return res.status(500).json({
      error: 'Failed to join team. Please try again.'
    });
  }
};

// Validate team eligibility for submissions
exports.validateTeamForSubmission = async (req, res, next) => {
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

    if (!isTeamBasedEvent) {
      return res.json({ 
        eligible: true, 
        message: 'Individual event - no team validation required' 
      });
    }

    // Check if user has a team
    const teamMember = await EventTeamMember.findOne({
      where: { userId, eventId },
      include: [{
        model: EventTeam,
        as: 'team',
        attributes: ['id', 'name', 'leaderId']
      }]
    });

    if (!teamMember) {
      return res.status(400).json({
        eligible: false,
        error: 'You must create or join a team before making submissions'
      });
    }

    // Get team member count
    const memberCount = await EventTeamMember.count({
      where: { teamId: teamMember.team.id }
    });

    // Validate team size
    const isEligible = checkTeamEligibility(memberCount, event.minTeamSize, event.maxTeamSize);
    const message = getEligibilityMessage(memberCount, event.minTeamSize, event.maxTeamSize, isRegistrationDeadlinePassed);

    // If registration deadline passed and team incomplete, block completely
    if (isRegistrationDeadlinePassed && event.minTeamSize && memberCount < event.minTeamSize) {
      return res.status(403).json({
        eligible: false,
        error: 'Registration deadline has passed. Your team cannot participate as minimum members requirement was not met.',
        currentMembers: memberCount,
        minRequired: event.minTeamSize,
        registrationDeadline: event.registrationDeadline,
        deadlinePassed: true
      });
    }

    if (!isEligible) {
      return res.status(400).json({
        eligible: false,
        error: message,
        currentMembers: memberCount,
        minRequired: event.minTeamSize,
        maxAllowed: event.maxTeamSize
      });
    }

    res.json({
      eligible: true,
      message: 'Team is eligible for submissions',
      teamId: teamMember.team.id,
      teamName: teamMember.team.name,
      currentMembers: memberCount,
      isLeader: teamMember.team.leaderId === userId,
      registrationDeadline: event.registrationDeadline,
      deadlinePassed: isRegistrationDeadlinePassed
    });

  } catch (err) {
    console.error('Error in validateTeamForSubmission:', err);
    return res.status(500).json({
      error: 'Failed to validate team eligibility. Please try again.'
    });
  }
};