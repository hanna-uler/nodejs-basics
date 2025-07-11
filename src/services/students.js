import { StudentsCollection } from '../db/models/student.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';

// Mongoose sorting syntax:
// Model.find().sort({ field1: direction1, field2: direction2, ... });

export const getAllStudents = async ({ page = 1, perPage = 10, sortBy = "_id", sortOrder = SORT_ORDER.ASC, }) => {
  // console.log(`At getAllStudents page: ${page}, perPage: ${perPage}`);
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const studentsQuery = StudentsCollection.find();
  // deeper understanding about Query Object (studentsQuery) is in the chat with AI
  const studentsCount = await StudentsCollection.find()
    .merge(studentsQuery)
    .countDocuments();
  const students = await studentsQuery
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder })
    .exec();
  const paginationData = calculatePaginationData(studentsCount, page, perPage);

  return {
    data: students,
    ...paginationData,
  };
};

// Practicing with AI:
// const findStudents = async (filters) => {
//   const { age, course, name, sortBy, limit, page } = filters;
//   const skip = (page - 1) * limit;

//   let studentsQuery = StudentsCollection.find();
//   if (age) {
//     studentsQuery = studentsQuery.where("age").gte(age);
//   }
//   if (course) {
//     studentsQuery = studentsQuery.where("course").equals(course);
//   }
//   if (name) {
//     studentsQuery = studentsQuery.where("name",new RegExp(name, 'i'));
//   }
//   if (sortBy) {
//     studentsQuery = studentsQuery.sort(sortBy);
//   }
//   const students = await studentsQuery.skip(skip).limit(limit).exec();
//   return students;
// };

export const getStudentById = async (studentId) => {
  const student = await StudentsCollection.findById(studentId);
  return student;
};

export const createStudent = async (payload) => {
  const student = await StudentsCollection.create(payload);
  return student;
};

export const deleteStudent = async (studentId) => {
  const student = await StudentsCollection.findOneAndDelete({
    _id: studentId,
  });
  return student;
};

export const updateStudent = async (studentId, payload, options = {}) => {
  const rawResult = await StudentsCollection.findOneAndUpdate(
    { _id: studentId },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );
  if (!rawResult || !rawResult.value) return null;
  return {
    student: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upserted),
  };
};


