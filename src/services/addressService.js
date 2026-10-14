import sequelize from "../config/database.js";
import { Address } from "../models/index.js";
import AppError from "../utils/AppError.js";

const MAX_ADDRESSES = 10;

const listAddresses = async (userId) => {
    return Address.findAll({
        where: { userId },
        order: [["isDefault", "DESC"], ["updatedAt", "DESC"]]
    });
};

const findOwnAddress = async (id, userId, transaction) => {
    const address = await Address.findByPk(id, { transaction });
    if (!address || address.userId !== userId) {
        throw new AppError("Address not found", 404);
    }
    return address;
};

const clearDefault = (userId, transaction) =>
    Address.update({ isDefault: false }, { where: { userId, isDefault: true }, transaction });

const createAddress = async (userId, { isDefault, ...data }) => {
    return sequelize.transaction(async (transaction) => {
        const count = await Address.count({ where: { userId }, transaction });
        if (count >= MAX_ADDRESSES) {
            throw new AppError(`You can save up to ${MAX_ADDRESSES} addresses. Please delete one first.`);
        }
        // The first address is always the default
        const makeDefault = count === 0 || Boolean(isDefault);
        if (makeDefault) {
            await clearDefault(userId, transaction);
        }
        return Address.create({ ...data, userId, isDefault: makeDefault }, { transaction });
    });
};

const updateAddress = async (id, userId, { isDefault, ...data }) => {
    return sequelize.transaction(async (transaction) => {
        const address = await findOwnAddress(id, userId, transaction);
        // Un-ticking default is ignored: use another address's "set default" instead
        if (isDefault && !address.isDefault) {
            await clearDefault(userId, transaction);
            data.isDefault = true;
        }
        return address.update(data, { transaction });
    });
};

const setDefaultAddress = (id, userId) => updateAddress(id, userId, { isDefault: true });

const deleteAddress = async (id, userId) => {
    await sequelize.transaction(async (transaction) => {
        const address = await findOwnAddress(id, userId, transaction);
        await address.destroy({ transaction });

        // Hand the default over to the most recently used remaining address
        if (address.isDefault) {
            const next = await Address.findOne({
                where: { userId },
                order: [["updatedAt", "DESC"]],
                transaction
            });
            if (next) {
                await next.update({ isDefault: true }, { transaction });
            }
        }
    });
};

export { listAddresses, createAddress, updateAddress, setDefaultAddress, deleteAddress };
