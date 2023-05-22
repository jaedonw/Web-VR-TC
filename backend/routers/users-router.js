import { Router } from "express";
import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import twilio from "twilio";
import {
  isValidUsername,
  isValidPhone,
  isValidPassword,
} from "../middleware/validation.js";
import { Friendship } from "../models/friendship.js";
import { Op } from "sequelize";
import { isAuthenticated } from "../middleware/auth.js";
import { config } from "../config.js";

export const usersRouter = Router();

const client = twilio(config.twilioAccountSid, config.twilioAuthToken);

const saltRounds = 15;

const phoneFormatter = (phoneNumber) => {
  const formattedNumber =
    "+1" +
    phoneNumber
      .replace(/-/g, "")
      .replace(/\s/g, "")
      .replace(/\(/g, "")
      .replace(/\)/g, "");
  return formattedNumber;
};

usersRouter.post("/forgot-password", async (req, res) => {
  // Ensure body contains username and password
  if (req.body.username === undefined) {
    return res.status(422).json({ error: "Username is required." });
  }

  // Find user in database
  const user = await User.findOne({
    where: {
      username: req.body.username,
    },
  });

  // If user does not exist, return error
  if (user === null) {
    return res.status(404).json({ error: "User could not be found." });
  }

  const phoneNumber = phoneFormatter(user.phoneNumber);

  try {
    await client.verify.v2
      .services(config.twilioServiceId)
      .verifications.create({
        to: phoneNumber,
        channel: "sms",
      });
  } catch (error) {
    return res.status(422).json({
      error: "Could not contact phone number associated with the account",
    });
  }

  return res.json({ message: "Verification code sent." });
});

usersRouter.post("/verify-code", async (req, res) => {
  // Ensure body contains verification code
  if (req.body.code === undefined || req.body.username === undefined) {
    return res
      .status(422)
      .json({ error: "User and verification code is required." });
  }

  if (req.body.code.length !== 7) {
    return res.status(401).json({ error: "Verification code is invalid." });
  }

  const code = req.body.code;
  const username = req.body.username;

  // Find user in database
  const user = await User.findOne({
    where: {
      username: username,
    },
  });

  // If user does not exist, return error
  if (user === null) {
    return res.status(404).json({ error: "User could not be found." });
  }

  const phoneNumber = phoneFormatter(user.phoneNumber);

  await client.verify.v2
    .services(config.twilioServiceId)
    .verificationChecks.create({
      to: phoneNumber,
      code: code,
    })
    .then((verification_check) => {
      if (verification_check.status === "approved") {
        const salt = bcrypt.genSaltSync(saltRounds);
        user.code = bcrypt.hashSync(code, salt);
        // Save user to database
        try {
          user.save();
        } catch (error) {
          return res.status(422).json({ error: "Verification failed." });
        }
        return res.json({ message: "Verification code is valid." });
      } else {
        return res.status(401).json({ error: "Verification code is invalid." });
      }
    });
});

// Let a user sign up
usersRouter.post(
  "/signup",
  isValidUsername,
  isValidPassword,
  isValidPhone,
  async (req, res) => {
    const user = User.build({
      username: req.body.username,
      phoneNumber: req.body.phone,
    });

    // Check if username is already taken
    const existingUser = await User.findOne({
      where: {
        username: req.body.username,
      },
    });
    if (existingUser !== null) {
      return res.status(409).json({ error: "Username already taken." });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(saltRounds);
    user.password = bcrypt.hashSync(req.body.password, salt);

    // Save user to database
    try {
      await user.save();
    } catch (error) {
      return res.status(422).json({ error: "User creation failed." });
    }

    // Log user in
    req.session.userId = user.id;
    req.session.username = user.username;

    // Return user
    return res.json({
      username: user.username,
    });
  }
);

// Let a user log in
usersRouter.post("/login", async (req, res) => {
  // Ensure body contains username and password
  if (req.body.username === undefined || req.body.password === undefined) {
    return res.status(422).json({ error: "Username and password required." });
  }

  // Find user in database
  const user = await User.findOne({
    where: {
      username: req.body.username,
    },
  });

  // If user does not exist, return error
  if (user === null) {
    return res.status(401).json({ error: "Incorrect username or password." });
  }

  // If password is incorrect, return error
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(401).json({ error: "Incorrect username or password." });
  }

  // Log user in
  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.premiumEnabled = user.premiumEnabled;

  // Return user
  return res.json({
    username: user.username,
  });
});

usersRouter.post("/reset-password", isValidPassword, async (req, res) => {
  // Ensure body contains username, password and code
  if (
    req.body.username === undefined ||
    req.body.password === undefined ||
    req.body.code === undefined
  ) {
    return res
      .status(422)
      .json({ error: "Username, password and code required." });
  }

  // Find user in database
  const user = await User.findOne({
    where: {
      username: req.body.username,
    },
  });

  // If user does not exist, return error
  if (user === null) {
    return res.status(404).json({ error: "User could not be found." });
  }

  // If code is incorrect, return error
  if (!bcrypt.compareSync(req.body.code, user.code)) {
    return res
      .status(401)
      .json({ error: "Invalid attempt to reset password." });
  }

  // Hash password and reset code
  const salt = bcrypt.genSaltSync(saltRounds);
  user.password = bcrypt.hashSync(req.body.password, salt);
  user.code = null;

  // Save user to database
  try {
    await user.save();
  } catch (error) {
    return res.status(422).json({ error: "Password change failed." });
  }

  // Return user
  return res.json({
    username: user.username,
  });
});

// Let a user log out
usersRouter.get("/logout", isAuthenticated, (req, res) => {
  req.session.destroy();
  return res.json({ message: "Signed out." });
});

// Get the current user
usersRouter.get("/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not Authenticated. Please login" });
  }

  if (!req.session.premiumEnabled) {
    const user = await User.findByPk(req.session.userId);
    req.session.premiumEnabled = user.premiumEnabled;
  }

  return res.json({
    id: req.session.userId,
    username: req.session.username,
    premiumEnabled: req.session.premiumEnabled,
  });
});

// Get all friends of a user
usersRouter.get("/:userId/friends", isAuthenticated, async (req, res) => {
  // Only a user can get their own friends
  if (parseInt(req.params.userId) !== parseInt(req.session.userId))
    return res.status(401).json({ error: "Not authorized." });

  // Verify that the user exists
  const user = await User.findOne({
    where: {
      id: req.params.userId,
    },
    include: [
      {
        model: User,
        as: "userFriends",
        attributes: ["id", "username"],
      },
      {
        model: User,
        as: "friendsOfUser",
        attributes: ["id", "username"],
      },
    ],
  });

  if (!user) return res.status(404).json({ error: "User does not exist." });

  return res.json({
    friends: user.userFriends
      .concat(user.friendsOfUser)
      .filter((friend) => friend.Friendship.pending === false),
  });
});

// Send a friend request as user with id userId
usersRouter.post("/:userId/friends", isAuthenticated, async (req, res) => {
  const userId = req.params.userId;
  const friendUsername = req.body.username;

  // Users cannot send friend requests on behalf of other users
  if (parseInt(userId) !== parseInt(req.session.userId))
    return res.status(401).json({ error: "Not authorized." });

  // Check if the username belongs to the current user
  if (friendUsername === req.session.username)
    return res.status(422).json({ error: "Cannot add yourself as a friend." });

  // Verify that the user exists
  const user = await User.findOne({
    where: {
      id: userId,
    },
  });
  if (!user)
    return res
      .status(404)
      .json({ error: `User with id ${userId} does not exist.` });

  // Verify that the recipient exists
  const friend = await User.findOne({
    where: {
      username: friendUsername,
    },
  });
  if (!friend)
    return res
      .status(404)
      .json({ error: `User with username ${friendUsername} does not exist.` });

  // Verify that a friend request does not already exist or that the users are already friends
  const friendship = await Friendship.findOne({
    where: {
      [Op.or]: [
        { userId: user.id, friendId: friend.id },
        { userId: friend.id, friendId: user.id },
      ],
    },
  });

  if (friendship) {
    if (friendship.pending) {
      return res
        .status(422)
        .json({ error: "Pending friend request exists already." });
    } else {
      return res
        .status(422)
        .json({ error: "You are already friends with this user" });
    }
  }

  user.addUserFriend(friend, { through: { pending: true } });
  const phoneNumber = phoneFormatter(friend.phoneNumber);
  try {
    await client.messages.create({
      body: `WEB VR-TC: You have a new friend request from ${user.username}! - login to accept!`,
      from: "+13433415237",
      to: phoneNumber,
    });
  } catch (error) {}

  return res.json(friend);
});

// Get all incoming friend requests of user with id userId
usersRouter.get(
  "/:userId/friend-requests",
  isAuthenticated,
  async (req, res) => {
    // A user can only get THEIR OWN friend requests
    if (parseInt(req.params.userId) !== parseInt(req.session.userId))
      return res.status(401).json({ error: "Not authorized." });

    // Verify that the user exists
    const user = await User.findOne({
      where: {
        id: req.params.userId,
      },
      include: [
        {
          model: User,
          as: "friendsOfUser",
          attributes: ["id", "username"],
        },
      ],
    });

    if (!user) return res.status(404).json({ error: "User does not exist." });

    return res.json({
      senders: user.friendsOfUser.filter(
        (friend) => friend.Friendship.pending === true
      ),
    });
  }
);

// Accept a friend request
usersRouter.patch(
  "/:userId/friends/:friendId",
  isAuthenticated,
  async (req, res) => {
    const userId = req.params.userId;
    const senderId = req.params.friendId;

    // Users cannot accept friend requests on behalf of other users
    if (parseInt(userId) !== parseInt(req.session.userId))
      return res.status(401).json({ error: "Not authorized." });

    // Verify the friend request sender exists
    const sender = await User.findOne({
      where: {
        id: senderId,
      },
    });
    if (!sender)
      return res
        .status(404)
        .json({ error: `User with id ${senderId} does not exist.` });

    // Verify that the current user exists
    const user = await User.findByPk(userId);
    if (!user)
      return res
        .status(404)
        .json({ error: `User with id ${userId} does not exist.` });

    // Verify that the friend request exists
    const friendship = await Friendship.findOne({
      where: {
        userId: sender.id,
        friendId: user.id,
        pending: true,
      },
    });

    if (friendship === null)
      return res.status(409).json({ error: "Friendship does not exist." });

    friendship.pending = false;
    await friendship.save();

    return res.json(sender);
  }
);

// Delete a friend
usersRouter.delete(
  "/:userId/friends/:friendId",
  isAuthenticated,
  async (req, res) => {
    const userId = req.params.userId;
    const friendId = req.params.friendId;

    // Users cannot delete friends on behalf of other users
    if (parseInt(userId) !== parseInt(req.session.userId))
      return res.status(401).json({ error: "Not authorized." });

    // Verify the friend exists
    const friend = await User.findOne({
      where: {
        id: friendId,
      },
    });
    if (!friend)
      return res
        .status(404)
        .json({ error: `User with id ${friendId} does not exist.` });

    // Verify that the current user exists
    const user = await User.findByPk(userId);
    if (!user)
      return res
        .status(404)
        .json({ error: `User with id ${userId} does not exist.` });

    // Verify that the friendship exists
    const friendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { userId: userId, friendId: friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    if (!friendship)
      return res.status(409).json({ error: "Friendship does not exist." });

    await friendship.destroy();

    return res.json(friend);
  }
);
