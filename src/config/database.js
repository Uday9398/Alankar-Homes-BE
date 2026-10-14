import { Sequelize } from "sequelize";
import dotenv from "dotenv"
dotenv.config()

const sequelize = new Sequelize(
            process.env.DB_NAME,
            process.env.DB_USER,
            process.env.DB_PASSWORD,
            {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                dialect: "postgres",
                logging: false,
                // Neon (and most hosted Postgres) only accept SSL connections
                dialectOptions: process.env.DB_SSL === "true"
                    ? { ssl: { require: true, rejectUnauthorized: false } }
                    : {},
            }
)

 export const connectDB = async ()=>{
    try{
        await sequelize.authenticate();
        console.log("DataBase connected Successfully");
    }catch(error){
        console.log("DataBase Connection Failed",error);
        process.exit(1)
    }
 }

 export default sequelize;