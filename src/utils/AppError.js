// An expected error whose message is safe to show to the user
export class AppError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const sendError = (res, error, label) => {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
            success: false,
            message: `${error.errors?.[0]?.path || "Value"} already exists`
        });
    }

    console.error(`${label} error:`, error);
    return res.status(500).json({
        success: false,
        message: "Something went wrong, please try again"
    });
};

export default AppError;
