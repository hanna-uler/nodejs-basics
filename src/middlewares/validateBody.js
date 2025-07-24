import createHttpError from "http-errors";

export const validateBody = (schema) => async (req, res, next) => {
    // console.log(`at validateBody => req.body: ${req.body}`);

    try {
        await schema.validateAsync(req.body, { abortEarly: false });
        next();
    } catch (err) {
        const error = createHttpError(400, "Bad Request", { errors: err.details });
        next(error);
    }
};

// * I have some more explanation in my node.js chat with AI
