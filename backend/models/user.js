import { sequelize } from "../datasource/datasource.js";
import { DataTypes } from "sequelize";
import { Friendship } from "./friendship.js";
import { MeetingInvitation } from "./meetingInvitation.js";

export const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  premiumEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

// A user can have many friends
User.belongsToMany(User, {
  as: "userFriends",
  foreignKey: "userId",
  through: Friendship,
});

// A user can be a friend of many users
User.belongsToMany(User, {
  as: "friendsOfUser",
  foreignKey: "friendId",
  through: Friendship,
});

// inviterId is a foreign key to User id column
MeetingInvitation.belongsTo(User, {
  as: "inviter",
  foreignKey: "inviterId",
});

// inviteeId is a foreign key to User id column
MeetingInvitation.belongsTo(User, {
  as: "invitee",
  foreignKey: "inviteeId",
});
