const { Hackathon, HackathonTeam, TeamMember, Submission } = require('../models');

exports.createHackathon = async (req, res, next) => {
  try {
    const payload = req.body; payload.createdBy = req.user.id;
    const hack = await Hackathon.create(payload);
    res.status(201).json(hack);
  } catch (err) { next(err); }
};

exports.createTeam = async (req, res, next) => {
  try {
    const { hackathonId } = req.params;
    const { name, memberIds = [] } = req.body;
    const leaderId = req.user.id;
    const team = await HackathonTeam.create({ hackathonId, name, leaderId });
    const inserts = memberIds.map(uid => ({ teamId: team.id, userId: uid }));
    inserts.push({ teamId: team.id, userId: leaderId });
    await TeamMember.bulkCreate(inserts);
    await Hackathon.increment('registrations', { where: { id: hackathonId }});
    res.status(201).json(team);
  } catch (err) { next(err); }
};

exports.submitProject = async (req, res, next) => {
  try {
    const { hackathonId } = req.params;
    const { teamId, title, description, submissionLink } = req.body;
    const submission = await Submission.create({ hackathonId, teamId, title, description, submissionLink });
    res.status(201).json(submission);
  } catch (err) { next(err); }
};
