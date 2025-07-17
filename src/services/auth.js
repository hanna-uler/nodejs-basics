import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersCollection } from '../db/models/user.js';
import { SessionCollection } from '../db/models/session.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/index.js';

export const registerUser = async (payload) => {
    const user = await UsersCollection.findOne({ email: payload.email });
    if (user) throw createHttpError(409, "This email is in use.");
    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    return await UsersCollection.create({...payload, password: encryptedPassword});
};

export const loginUser = async (payload) => {
    const user = await UsersCollection.findOne({ email: payload.email });
    if (!user) {
        throw createHttpError(401, "User is not found");
    }
    const isEqual = await bcrypt.compare(payload.password, user.password);
    if (!isEqual) {
        throw createHttpError(401, "Unauthorized");
    }
    await SessionCollection.deleteOne({ userId: user._id });
    const accessToken = randomBytes(30).toString("base64");
    const refreshToken = randomBytes(30).toString("base64");

    return await SessionCollection.create({
        userId: user._id,
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
        refreshTokenValidUntil: new Date(Date.now() + ONE_DAY)
    });
};
