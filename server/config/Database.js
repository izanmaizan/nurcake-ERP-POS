import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// const pool = mysql.createPool({
//   host: '193.203.162.80',
//   // host: 'localhost',
//   user:  'admin',
//   password: 'cpsp2024@SIG',
//   database: 'cpsp',
//   port: 3306,
// });

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'checkpoint-sig.site',
//   user: process.env.DB_USER || 'u232856820_cpsp',
//   password: process.env.DB_PASSWORD || '3&xN+g/f',
//   database: process.env.DB_NAME || 'u232856820_checkpoint',
//   port: process.env.DB_PORT || 3306,
// });

// export default pool;

// ini untuk yang pakai server local
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "nurgroup-erp",
});

export default pool;
