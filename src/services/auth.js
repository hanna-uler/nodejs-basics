import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import { randomBytes } from 'crypto';
import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';
import { FIFTEEN_MINUTES, ONE_DAY, SMTP, TEMPLATES_DIR } from '../constants/index.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendEmail } from '../utils/sendMail.js';

export const registerUser = async (payload) => {
    // console.log("At registerUser: Is working");
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
    await SessionsCollection.deleteOne({ userId: user._id });
    const accessToken = randomBytes(30).toString("base64");
    const refreshToken = randomBytes(30).toString("base64");

    return await SessionsCollection.create({
        userId: user._id,
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
        refreshTokenValidUntil: new Date(Date.now() + ONE_DAY)
    });
};

export const logoutUser = async (sessionId) => {
    await SessionsCollection.deleteOne({ _id: sessionId });
};

const createSession = () => {
    const accessToken = randomBytes(30).toString("base64");
    const refreshToken = randomBytes(30).toString("base64");

    return {
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
        refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
    };
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
    const session = await SessionsCollection.findOne({
        _id: sessionId,
        refreshToken,
    });
    if (!session) {
        throw createHttpError(401, "Session hasn't been found");
    }

    const isSessionTokenExpired = new Date > new Date(session.refreshTokenValidUntil);
    if (isSessionTokenExpired) {
        throw createHttpError(401, "Session token is expired");
    }

    const newSession = createSession();
    await SessionsCollection.deleteOne({
        _id: sessionId,
        refreshToken,
    });
    return await SessionsCollection.create({
        userId: session.userId,
        ...newSession
    });
};

export const requestResetToken = async (email) => {
    // console.log(`at requestResetToken => email: ${email}`);

    const user = await UsersCollection.findOne({ email });
    // console.log(`at requestResetToken => user: ${user}`);

    if (!user) {
        throw createHttpError(404, "User is not found.");
    }
    const resetToken = jwt.sign(
        {
            sub: user._id,
            email,
        },
        getEnvVar("JWT_SECRET"),
        {
            expiresIn: "15m",
        }
    );

    // console.log(`at requestResetToken => resetToken: ${resetToken}`);
    const resetPasswordTemplatePath = path.join(TEMPLATES_DIR, "reset-password-email.html");
    // console.log(`at requestResetToken => resetPasswordTemplatePath: ${resetPasswordTemplatePath}`);

    const templateSource = ((await fs.readFile(resetPasswordTemplatePath)).toString());
    // console.log(`at requestResetToken => typeof templateSource: ${typeof templateSource}`);

    const template = handlebars.compile(templateSource);
    const html = template({
        name: user.name,
        link: `${getEnvVar("APP_DOMAIN")}/reset-password?token=${resetToken}`
    });

    await sendEmail({
        from: getEnvVar(SMTP.SMTP_FROM),
        to: email,
        subject: "Reset your password.",
        html,
    });
};


export const resetPassword = async (payload) => {
    let entries;

    try {
        entries = jwt.verify(payload.token, getEnvVar("JWT_SECRET"));
    } catch (error) {
        if (error instanceof Error) throw createHttpError(401, error.message);
        throw error;
    }

    const user = await UsersCollection.findOne({
        email: entries.email,
        _id: entries.sub,
    });
    if (!user) {
        throw createHttpError(404, "User is not found");
    }

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    await UsersCollection.updateOne(
        { _id: user._id },
        { password: encryptedPassword }
    );
};
