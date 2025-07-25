import createHttpError from "http-errors";
import { StudentsCollection } from "../db/models/student.js";
import { ROLES } from "../constants/index.js";

export const checkRoles = (...roles) => async (req, res, next) => {
    const { user } = req;
    if (!user) {
        next(createHttpError(401));
        return;
    }
    const { role } = user;
    // console.log(`At checkRoles => role: ${role}`);

    if (roles.includes(ROLES.TEACHER) && role === ROLES.TEACHER) {
        next();
        return;
    }
    // console.log(`At checkRoles => roles.includes(ROLES.PARENT): ${roles.includes(ROLES.PARENT)}`);
    // console.log(`At checkRoles => role === ROLES.PARENT: ${role === ROLES.PARENT}`);
    // console.log(`At checkRoles => roles: ${roles}`);
    // console.log(`At checkRoles => ROLES: ${ROLES}`);

    if (roles.includes(ROLES.PARENT) && role === ROLES.PARENT) {
        const { studentId } = req.params;
        // console.log(`At checkRoles => studentId: ${studentId}`);


        if (!studentId) {
            next(createHttpError(403, "You don't have permission to get this data."));
            return;
        }

        const student = await StudentsCollection.findOne({
            _id: studentId,
            parentId: user._id,
        });

        if (student) {
            next();
            return;
        }
    }
    next(createHttpError(403, "You don't have permission to get this data."));
};
