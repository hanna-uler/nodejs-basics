import { getAllStudents, getStudentById } from "../services/students.js";

export const getStudentsController = async (req, res) => {
    const students = await getAllStudents();
    res.json({
        status: 200,
        message: 'Successfully found students!',
        data: students,
    });
};

export const getStudentByIdController = async (req, res, next) => {
    const { studentId } = req.params;
    const student = await getStudentById(studentId);

    // prev code:
    // if (!student) {
    //     res.status(404).json({
    //         message: 'Student not found'
    //     });
    //     return;
    // }

    if (!student) {
        next(new Error("Student is not found"));
        return;
    }
    res.json({
        status: 200,
        message: `Successfully found student with id ${studentId}!`,
        data: student,
    });
};
