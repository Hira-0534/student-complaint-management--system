const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// --- 1. LOGIN ---
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const userIP = req.ip || "127.0.0.1";
    db.query("SELECT * FROM Users WHERE Username=? AND Password=?", [username, password], (err, rows) => {
        if (err) return res.status(500).json({ message: "DB Error" });
        if (rows.length > 0) {
            res.json({ 
                user: rows[0], 
                ip: userIP, 
                loginTime: new Date().toLocaleTimeString(),
                loginDate: new Date().toLocaleDateString()
            });
        } else {
            res.status(401).json({ message: "Invalid Credentials" });
        }
    });
});

// --- 2. REGISTER (Fixes Registration Error) ---
app.post("/register", (req, res) => {
    const { username, password } = req.body;
    const sql = "INSERT INTO Users (Username, Password, Role) VALUES (?, ?, 'Student')";
    db.query(sql, [username, password], (err) => {
        if (err) return res.status(500).json({ message: "Registration failed or User exists" });
        res.json({ success: true, message: "Registration Successful! Please login." });
    });
});

// --- 3. ADMIN: GET ALL COMPLAINTS ---
app.get("/complaints", (req, res) => {
    db.query("SELECT * FROM Complaints ORDER BY CreatedAt DESC", (err, rows) => {
        if (err) return res.status(500).json({ message: "Fetch failed" });
        res.json(rows);
    });
});

// --- 4. ADMIN: UPDATE STATUS ---
app.put("/status/:id", (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    db.query("UPDATE Complaints SET Status = ? WHERE ComplaintID = ?", [status, id], (err) => {
        if (err) return res.status(500).json({ message: "Update failed" });
        res.json({ success: true, message: "Status updated!" });
    });
});

// --- 5. SUBMIT COMPLAINT ---
app.post("/complaint", (req, res) => {
    const { title, description, category, submittedBy } = req.body;
    const sql = "INSERT INTO Complaints (Title, Description, Category, SubmittedBy, Status) VALUES (?, ?, ?, ?, 'Pending')";
    db.query(sql, [title, description, category, submittedBy], (err) => {
        if (err) return res.status(500).json({ message: "Submission failed" });
        res.json({ success: true });
    });
});

// --- 6. GET STUDENT COMPLAINTS ---
app.get("/student-complaints/:userId", (req, res) => {
    db.query("SELECT * FROM Complaints WHERE SubmittedBy = ? ORDER BY CreatedAt DESC", [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ message: "Fetch failed" });
        res.json(rows);
    });
});

// --- 7. DELETE COMPLAINT ---
app.delete("/delete-complaint/:id/:userId", (req, res) => {
    const cID = req.params.id;
    const uID = req.params.userId;
    db.query("DELETE FROM Complaints WHERE ComplaintID = ? AND SubmittedBy = ?", [cID, uID], (err, result) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        if (result.affectedRows > 0) res.json({ success: true });
        else res.status(404).json({ message: "Not found or unauthorized" });
    });
});

// --- 8. PASSWORD UPDATE ---
app.put("/update-password", (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    db.query("SELECT * FROM Users WHERE UserID = ? AND Password = ?", [userId, oldPassword], (err, rows) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        if (rows.length > 0) {
            db.query("UPDATE Users SET Password = ? WHERE UserID = ?", [newPassword, userId], (err) => {
                if (err) return res.status(500).json({ message: "Update failed" });
                res.json({ success: true, message: "Password updated successfully!" });
            });
        } else {
            res.status(401).json({ message: "Purana password galat hai!" });
        }
    });
});
// --- FORGOT PASSWORD RESET (Sirf Username/RollNo aur Naya Password chahiye) ---
app.post("/reset-password", (req, res) => {
    const { username, newPassword } = req.body;

    // 1. Pehle check karo user exist karta hai ya nahi
    db.query("SELECT * FROM Users WHERE Username = ?", [username], (err, rows) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        
        if (rows.length > 0) {
            // 2. Agar user mil gaya, toh password update kar do
            db.query("UPDATE Users SET Password = ? WHERE Username = ?", [newPassword, username], (err) => {
                if (err) return res.status(500).json({ message: "Update failed" });
                res.json({ success: true, message: "Password updated successfully!" });
            });
        } else {
            // 3. Agar Roll No/Username galat hai
            res.status(404).json({ message: "User not found! Please check your Roll Number." });
        }
    });
});
// --- 9. PERMANENT ACCOUNT DELETE ---
app.delete("/delete-account/:userId", (req, res) => {
    const uID = req.params.userId;
    db.query("DELETE FROM Complaints WHERE SubmittedBy = ?", [uID], (err) => {
        if (err) return res.status(500).json({ message: "Error clearing data" });
        db.query("DELETE FROM Users WHERE UserID = ?", [uID], (err, result) => {
            if (err) return res.status(500).json({ message: "Database Error" });
            res.json({ success: true });
        });
    });
});

app.listen(3000, () => console.log("🚀 Server is live on port 3000"));