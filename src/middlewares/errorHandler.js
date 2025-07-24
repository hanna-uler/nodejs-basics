// Імпортуємо клас HttpError для обробки помилок HTTP з відповідними статус-кодами
import { HttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {
// Перевірка, чи отримали ми помилку від createHttpError
    if (err instanceof HttpError) {
        // console.log(`at errorHandler => err.name: ${err.name}`);

        res.status(err.status).json({
            status: err.status,
            message: err.name,
            data: err,
        });
        return;
    }
    // console.log(`at errorHandler => err is NOT instanceof HttpError`);
    res.status(500).json({
        message: 'Something went wrong',
        error: err.message,
    });
};
