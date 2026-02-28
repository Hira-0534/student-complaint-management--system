const mysql = require("mysql2");

// Database configuration
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Engineer@0534", 
    database: "scms"
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error("❌ Database Connection Failed: " + err.message);
        return;
    }
    console.log("✅ Connected to 'scms' Database Successfully!");
});

module.exports = db;