const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db/db.js");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// --- 1. LOGIN (Role-Based Check
app.post("/login", (req, res) => {
    const { username, password, role } = req.body; // Frontend se role mangwa rahe hain
    const userIP = req.ip || "127.0.0.1";

    // Query mein Role bhi check hoga taake student admin portal na khol sakay
    db.query("SELECT * FROM Users WHERE Username=? AND Password=? AND Role=?", [username, password, role], (err, rows) => {
        if (err) return res.status(500).json({ message: "DB Error" });
        
        if (rows.length > 0) {
            res.json({ 
                user: rows[0], 
                ip: userIP, 
                loginTime: new Date().toLocaleTimeString(),
                loginDate: new Date().toLocaleDateString()
            });
        } else {
            // Agar credentials sahi hain par role galat hai, tab bhi login nahi hoga
            res.status(401).json({ message: "Invalid Credentials or Unauthorized Role!" });
        }
    });
});

// --- 2. SIGNUP (Pehle iska naam /register tha, ab /signup hai taake error khatam ho) ---
app.post("/signup", (req, res) => {
    const { username, password, session } = req.body;
    // SQL query mein 'Session' column add kiya hai jo aapke form mein hai
    const sql = "INSERT INTO Users (Username, Password, Role, Session) VALUES (?, ?, 'Student', ?)";
    db.query(sql, [username, password, session], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Registration failed or User exists" });
        }
        res.json({ success: true, message: "Registration Successful! Please login." });
    });
});

app.post('/complaint', (req, res) => {
    const { title, description, category, submittedBy } = req.body;

    // INSERT query mein 'SubmittedBy' column lazmi shamil karein
    const sql = "INSERT INTO complaints (Title, Description, Category, Status, SubmittedBy) VALUES (?, ?, ?, 'Pending', ?)";
    
    db.query(sql, [title, description, category, submittedBy], (err, result) => {
        if (err) {
            console.log("Database Error:", err);
            return res.status(500).send(err);
        }
        res.status(200).send({ message: "Complaint Registered", id: result.insertId });
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
// --- 10. EDIT COMPLAINT ---
app.put("/edit-complaint/:id", (req, res) => {
    const { title, description, category } = req.body;
    const { id } = req.params;
    
    // Sirf wahi complaint edit ho sakti hai jo abhi 'Pending' ho
    const sql = "UPDATE Complaints SET Title = ?, Description = ?, Category = ? WHERE ComplaintID = ? AND Status = 'Pending'";
    
    db.query(sql, [title, description, category, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Update failed" });
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "Cannot edit. Complaint might be processed or not found." });
        }
        res.json({ success: true, message: "Complaint updated successfully!" });
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

// --- FORGOT PASSWORD RESET ---
app.post("/reset-password", (req, res) => {
    const { username, newPassword } = req.body;
    db.query("SELECT * FROM Users WHERE Username = ?", [username], (err, rows) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        if (rows.length > 0) {
            db.query("UPDATE Users SET Password = ? WHERE Username = ?", [newPassword, username], (err) => {
                if (err) return res.status(500).json({ message: "Update failed" });
                res.json({ success: true, message: "Password updated successfully!" });
            });
        } else {
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
// --- ADMIN: GET ALL COMPLAINTS ---
app.get("/admin-complaints", (req, res) => {
    const sql = `
        SELECT c.*, u.Username 
        FROM Complaints c 
        JOIN Users u ON c.SubmittedBy = u.UserID 
        ORDER BY c.CreatedAt DESC`;
    
    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ message: "Fetch failed" });
        res.json(rows);
    });
});
app.listen(3000, () => console.log("🚀 Server is live on port 3000"));