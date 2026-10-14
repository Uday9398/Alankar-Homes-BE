import { listUsers, updateUserRole, getProfile, updateProfile, changePassword } from "../services/userService.js";
import { sendError } from "../utils/AppError.js";
import { parseId } from "../utils/parseId.js";

const getUsers = async (req, res) => {
    try {
        const { search, role, page, limit } = req.query;
        const result = await listUsers({
            search: typeof search === "string" ? search.trim() : undefined,
            role,
            page,
            limit
        });
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        return sendError(res, error, "Get users");
    }
};

const setUserRole = async (req, res) => {
    try {
        const user = await updateUserRole(parseId(req.params.id, "User"), req.body.role, req.user);
        return res.status(200).json({
            success: true,
            message: user.role === "admin"
                ? `${user.name} is now an admin`
                : `${user.name} is no longer an admin`,
            data: user
        });
    } catch (error) {
        return sendError(res, error, "Update user role");
    }
};

const getMyProfile = async (req, res) => {
    try {
        const profile = await getProfile(req.user.id);
        return res.status(200).json({ success: true, data: profile });
    } catch (error) {
        return sendError(res, error, "Get profile");
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const user = await updateProfile(req.user.id, req.body);
        return res.status(200).json({
            success: true,
            message: "Your details have been updated",
            data: user
        });
    } catch (error) {
        return sendError(res, error, "Update profile");
    }
};

const changeMyPassword = async (req, res) => {
    try {
        await changePassword(req.user.id, req.body);
        return res.status(200).json({
            success: true,
            message: "Your password has been changed"
        });
    } catch (error) {
        return sendError(res, error, "Change password");
    }
};

export { getUsers, setUserRole, getMyProfile, updateMyProfile, changeMyPassword };
