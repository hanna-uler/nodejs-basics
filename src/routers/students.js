import { Router } from 'express';
import { getAllStudents, getStudentById } from '../services/students';

const router = Router();
router.get('/students', async (req, res) => {
    const students = await getAllStudents();

    res.status(200).json({
      data: students,
    });
});

router.get('/students/:studentId', async (req, res, next) => {
    const { studentId } = req.params;
    const student = await getStudentById(studentId);

    if (!student) {
      res.status(404).json({
        message: 'Student not found'
      });
      return;
    }

    res.status(200).json({
      data: student,
    });
});

export default router;
