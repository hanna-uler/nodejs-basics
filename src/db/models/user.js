import { model, Schema } from "mongoose";
import { ROLES } from "../../constants/index.js";

const usersSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: [ROLES.TEACHER, ROLES.PARENT],
            default: ROLES.PARENT,
        }
    },
    {timestamps: true, versionKey: false}
);

export const UsersCollection = model("users", usersSchema);
