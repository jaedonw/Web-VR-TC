import { sequelize } from "../datasource/datasource.js";
import { DataTypes } from "sequelize";

export const MeetingInvitation = sequelize.define("MeetingInvitation", {
  inviterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  inviteeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  meetingCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
