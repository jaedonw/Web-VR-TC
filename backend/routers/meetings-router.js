import { Router } from "express";
import { MeetingInvitation } from "../models/meetingInvitation.js";
import { User } from "../models/user.js";
import { isAuthenticated } from "../middleware/auth.js";

export const meetingsRouter = Router();

// Create a meeting invitation
meetingsRouter.post("/invitations", isAuthenticated, async (req, res) => {
  const inviterId = req.body.inviterId;
  const inviteeId = req.body.inviteeId;
  const meetingCode = req.body.meetingCode;

  if (!inviterId || !inviteeId || !meetingCode)
    return res.status(400).send("Missing required fields.");

  // Authenticated user must match the inviterId
  if (parseInt(req.session.userId) !== parseInt(inviterId))
    return res.status(401).send("Not authorized.");

  const inviter = await User.findByPk(inviterId);
  if (!inviter) return res.status(400).send("Inviter does not exist.");
  const invitee = await User.findByPk(inviteeId);
  if (!invitee) return res.status(400).send("Invitee does not exist.");

  const invitation = await MeetingInvitation.create({
    inviterId,
    inviteeId,
    meetingCode,
  });

  if (!invitation)
    return res.status(500).send("Unable to create meeting invitation.");

  return res.status(200).json(invitation);
});

// Get all meeting invites for user with id userId -> /invitations?invitee=userId
meetingsRouter.get("/invitations", isAuthenticated, async (req, res) => {
  const invitee = parseInt(req.query.invitee) || null;

  if (!invitee) return res.status(400).send("Missing required fields.");

  // User can only get their own invitiations
  if (invitee !== parseInt(req.session.userId))
    return res.status(401).send("Not authorized.");

  const invitations = await MeetingInvitation.findAll({
    where: { inviteeId: invitee },
    include: [
      {
        model: User,
        as: "inviter",
        attributes: ["username"],
      },
    ],
  });

  if (!invitations)
    return res.status(500).send("Unable to get meeting invitations.");

  return res.status(200).json({ invitations: invitations });
});

// Delete a meeting invitation by id
meetingsRouter.delete("/invitations/:id", isAuthenticated, async (req, res) => {
  const invitationId = req.params.id;

  if (!invitationId) return res.status(400).send("Missing required fields.");

  const invitation = await MeetingInvitation.findByPk(invitationId);

  if (!invitation) return res.status(400).send("Invitation does not exist.");

  // Only the meeting host can delete the invitation
  if (parseInt(invitation.inviterId) !== parseInt(req.session.userId))
    return res.status(401).send("Not authorized.");

  await invitation.destroy();
  return res.status(200).json(invitation);
});
