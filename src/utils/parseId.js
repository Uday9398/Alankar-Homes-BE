import AppError from "./AppError.js";

// Turns a URL id into a number, answering 404 for things like /products/abc
export const parseId = (value, label = "Item") => {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw new AppError(`${label} not found`, 404);
    }
    return id;
};

export default parseId;
