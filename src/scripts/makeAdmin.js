// Gives a registered account access to the admin panel.
// Usage: npm run make-admin -- someone@example.com
import sequelize from "../config/database.js";
import User from "../models/User.js";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
    console.log("Usage: npm run make-admin -- <email>");
    process.exit(1);
}

const user = await User.findOne({ where: { email } });

if (!user) {
    console.log(`No account found for ${email}. Register on the website first, then run this again.`);
    await sequelize.close();
    process.exit(1);
}

await user.update({ role: "admin" });
console.log(`${user.name} (${email}) is now an admin. Sign out and sign in again to see the admin panel.`);
await sequelize.close();
