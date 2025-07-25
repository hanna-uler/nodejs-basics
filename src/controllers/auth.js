import { registerUser, loginUser, logoutUser, refreshUsersSession, requestResetToken, resetPassword } from "../services/auth.js";
import { ONE_DAY } from "../constants/index.js";

export const registerUserController = async (req, res) => {
    const user = await registerUser(req.body);
    res.status(201).json({
        status: 201,
        message: "Successfully registered a new user!",
        data: user,
      });
};


export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);
  res.cookie("refreshToken", session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.json({
    status: 200,
    message: "The user has been successfully logged in",
    data: {
      accessToken: session.accessToken,
    }
  });
};

export const logoutUserController = async (req, res) => {
  console.log("at logoutUserController => req.cookies.sessionId: ", req.cookies.sessionId);
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }
  res.clearCookie("sessionId");
  res.clearCookie("refreshToken");
  res.status(204).send();
};

const setupSession = (res, session) => {
  res.cookie("refreshToken", session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY)
  });
  res.cookie("sessionId", session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY)
  });
};

export const refreshUserSessionController = async (req, res) => {
  const session = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });
  setupSession(res, session);
  res.json({
    status: 200,
    message: "Successfully refreshed a session!",
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const requestResetEmailController = async (req, res) => {
  // console.log(`at requestResetEmailController => req.body.email: ${req.body.email}`);
  await requestResetToken(req.body.email);
  res.json({
      status: 200,
      message: "Reset password email was successfully sent!",
      data: {}
  });
};

export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);
  res.json({
    status: 200,
    message: "Password has been successfully reset!",
    data: {}
  });
};
