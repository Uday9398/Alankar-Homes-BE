import {
    listAddresses,
    createAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress
} from "../services/addressService.js";
import { sendError } from "../utils/AppError.js";
import { parseId } from "../utils/parseId.js";

const getAddresses = async (req, res) => {
    try {
        const addresses = await listAddresses(req.user.id);
        return res.status(200).json({ success: true, data: addresses });
    } catch (error) {
        return sendError(res, error, "Get addresses");
    }
};

const addAddress = async (req, res) => {
    try {
        const address = await createAddress(req.user.id, req.body);
        return res.status(201).json({
            success: true,
            message: "Address saved",
            data: address
        });
    } catch (error) {
        return sendError(res, error, "Create address");
    }
};

const editAddress = async (req, res) => {
    try {
        const address = await updateAddress(parseId(req.params.id, "Address"), req.user.id, req.body);
        return res.status(200).json({
            success: true,
            message: "Address updated",
            data: address
        });
    } catch (error) {
        return sendError(res, error, "Update address");
    }
};

const makeDefaultAddress = async (req, res) => {
    try {
        const address = await setDefaultAddress(parseId(req.params.id, "Address"), req.user.id);
        return res.status(200).json({
            success: true,
            message: `${address.label} is now your default address`,
            data: address
        });
    } catch (error) {
        return sendError(res, error, "Set default address");
    }
};

const removeAddress = async (req, res) => {
    try {
        await deleteAddress(parseId(req.params.id, "Address"), req.user.id);
        return res.status(200).json({
            success: true,
            message: "Address deleted"
        });
    } catch (error) {
        return sendError(res, error, "Delete address");
    }
};

export { getAddresses, addAddress, editAddress, makeDefaultAddress, removeAddress };
