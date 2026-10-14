const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const formattedErrors = error.details.map((err) => ({
                field: err.path.join("."),
                message: err.message,
            }));

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: formattedErrors,
            });
        }

        // Replace req.body with the sanitized/validated value (applying trims and lowercase overrides)
        req.body = value;
        next();
    };
};

export default validate;
