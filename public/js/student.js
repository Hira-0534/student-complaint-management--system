// --- 1. SESSION & AUTH CHECK ---
let userData = JSON.parse(localStorage.getItem("user"));

// Professional Check: If no user data, kick to login
if (!userData) {
    window.location.href = "login.html";
}

window.onload = () => {
    if (userData) {
        console.log("Logged in user data:", userData); // Debugging line
        
        // Update Sidebar Welcome Text
        const displayDiv = document.getElementById("userDisplaySidebar");
        if(displayDiv) displayDiv.innerText = "Welcome, " + (userData.Username || "Student");

        // Update Profile Section
        if(document.getElementById("prof-name")) document.getElementById("prof-name").innerText = userData.Username;
        if(document.getElementById("prof-session")) document.getElementById("prof-session").innerText = userData.Session || "FA23";

        // Fetch initial data
        loadComplaints();
    }
};
async function logoutAndDestroy() {
    if(confirm("DANGEROUS: This will permanently delete your account and complaints. Proceed?")) {
        const uID = userData.UserID || userData.id;
        
        // Backend ko bolo account hamesha ke liye khatam kar de
        const res = await fetch(`/delete-account/${uID}`, { method: "DELETE" });
        
        if(res.ok) {
            localStorage.clear();
            alert("Account Deleted Successfully.");
            window.location.href = "index.html";
        }
    }
}

// --- 2. THE CORE FETCH FUNCTION (FIXED) ---
async function loadComplaints() {
    const identifier = userData.UserID || userData.id;
    
    if(!identifier) {
        console.error("Session Error: User identifier not found.");
        return;
    }

    try {
        console.log("Fetching complaints for UserID:", identifier);
        const res = await fetch(`/student-complaints/${identifier}`);
        const data = await res.json();
        
        console.log("Data received from server:", data);

        const totalElem = document.getElementById("dash-total");
        const resolvedElem = document.getElementById("dash-resolved");
        
        if(totalElem) totalElem.innerText = data.length;
        if(resolvedElem) resolvedElem.innerText = data.filter(c => c.Status === 'Resolved').length;
        
        const listDiv = document.getElementById("complaintsList");
        if(!listDiv) return;

        if(data.length === 0) {
            listDiv.innerHTML = `<p style="text-align:center; color:#64748b; padding:20px;">No complaints submitted yet.</p>`;
            return;
        }

        listDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: 80px 1fr 120px 100px; font-weight: bold; padding: 15px 10px; background-color: #f3e8ff; color: #1e293b; border-bottom: 3px solid #7922bc; border-radius: 8px 8px 0 0; font-size: 14px; letter-spacing: 0.5px;">
                <div>ID</div>
                <div>DETAILS</div>
                <div>CATEGORY</div>
                <div>STATUS</div>
            </div>
            ${data.map(c => `
                <div style="display: grid; grid-template-columns: 80px 1fr 120px 100px; align-items: center; padding: 15px 10px; border-bottom: 1px solid #f1f5f9; font-size: 14px; background: white;">
                    <div style="font-weight: bold; color: #4f46e5;">#${c.ComplaintID || c.id}</div>
                    <div style="padding-right: 10px;">
                        <div style="font-weight: 600; color: #1e293b;">${c.Title}</div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${c.Description}</div>
                    </div>
                    <div style="color: #64748b; font-size: 13px;">${c.Category}</div>
                    <div>
                        <span class="status-badge ${(c.Status || 'pending').toLowerCase().replace(/\s+/g, '-')}">
                            ${c.Status || 'Pending'}
                        </span>
                    </div>
                </div>
            `).join("")}
        `;
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

// --- 3. SUBMIT COMPLAINT (FIXED) ---
async function submitOfficialComplaint() {
    const title = document.getElementById("titleInput").value.trim();
    const description = document.getElementById("descInput").value.trim();
    const category = document.getElementById("catInput").value;
    
    // Check if user is logged in
    if (!userData) {
        return alert("Session Error: Please login again.");
    }

    const identifier = userData.UserID || userData.id;

    // 1. Pehle Validation karein
    if (!title || !description || !category) {
        return alert("Validation Error: Please fill in all required fields.");
    }

    if (!identifier) {
        console.error("Error: User ID missing in LocalStorage!");
        return alert("Session expired, please login again.");
    }

    try {
        console.log("Submitting complaint for ID:", identifier);

        // 2. Sirf AIK dafa fetch call karein
        const res = await fetch("/complaint", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                title, 
                description, 
                category, 
                submittedBy: identifier 
            })
        });

        if (res.ok) {
            alert("Success: Your complaint has been recorded successfully.");
            
            // UI Reset
            document.getElementById("titleInput").value = "";
            document.getElementById("descInput").value = "";
            document.getElementById("catInput").selectedIndex = 0;
            
            // Refresh data immediately
            await loadComplaints(); 
            showSection('dashSection', document.querySelector('.nav-item')); 
        } else {
            const errorData = await res.json();
            alert("Submission Error: " + (errorData.message || "Unable to save."));
        }
    } catch (err) {
        console.error("Network Error:", err);
        alert("Network Error: Failed to connect to the server.");
    }
}
async function editComplaint(id, oldTitle, oldDesc, oldCat) {
    const newTitle = prompt("Update Title:", oldTitle);
    const newDesc = prompt("Update Description:", oldDesc);
    const newCat = prompt("Update Category (Academic/Hostel/Facility):", oldCat);

    if (!newTitle || !newDesc) return;

    try {
        const res = await fetch(`/edit-complaint/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle, description: newDesc, category: newCat })
        });

        const result = await res.json();
        if (res.ok) {
            alert("Success: Complaint updated successfully.");
            loadComplaints();
        } else {
            alert("Update Failed: " + result.message);
        }
    } catch (err) {
        alert("System Error: Could not connect to the server.");
    }
}

// --- 4. NAVIGATION & OTHERS ---
function showSection(id, el) {
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    const target = document.getElementById(id);
    if(target) target.style.display = 'block';

    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if(el) el.classList.add('active');

    if(id === 'viewSection' || id === 'dashSection') loadComplaints();
}

function logout() {
    if(confirm("Confirm Logout: Are you sure you want to exit the portal?")) {
        localStorage.clear();
        window.location.href = "login.html";
    }
}

function toggleAccountMenu() {
    const menu = document.getElementById("account-submenu");
    if(menu) menu.style.display = (menu.style.display === "none") ? "block" : "none";
}

async function checkStatus() {
    const id = document.getElementById("idSearch").value.trim();
    const resultDiv = document.getElementById("statusResult");
    
    if(!id) return alert("Search Error: Please enter a valid Complaint ID.");

    try {
        const res = await fetch(`/student-complaints/${userData.UserID || userData.id}`);
        const data = await res.json();
        const found = data.find(c => (c.ComplaintID || c.id) == id);

        if(found) {
            resultDiv.innerHTML = `
                <div style="margin-top:20px; padding:20px; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                        <span style="background:#4f46e5; color:white; padding:4px 12px; border-radius:6px; font-size:12px; font-weight:bold;">Ref: #${found.ComplaintID || found.id}</span>
                        <span class="status-badge ${(found.Status || 'pending').toLowerCase()}">${found.Status}</span>
                    </div>
                    <h3 style="margin:0 0 10px 0; color:#1e293b;">${found.Title}</h3>
                    <p style="margin:0; color:#64748b; font-size:14px; line-height:1.6;">${found.Description}</p>
                </div>`;
        } else {
            resultDiv.innerHTML = `<div style="margin-top:20px; color:#ef4444; font-weight:bold;">Record Not Found: No complaint matches ID #${id}</div>`;
        }
    } catch (err) {
        alert("System Error: Search operation failed.");
    }
}

async function deleteComplaintById() {
    const idInput = document.getElementById("idDelete");
    const id = idInput.value.trim();
    const identifier = userData.UserID || userData.id;
    
    if(!id) return alert("Input Error: Please provide a valid Complaint ID.");
    if(!confirm("Warning: Are you sure you want to permanently delete this record?")) return;

    try {
        const res = await fetch(`/delete-complaint/${id}/${identifier}`, { method: "DELETE" });
        if (res.ok) {
            alert("Success: The record has been successfully removed.");
            idInput.value = "";
            await loadComplaints(); 
            showSection('dashSection');
        } else {
            alert("Delete Error: Unable to process deletion. Check if the ID is correct.");
        }
    } catch (err) {
        alert("Network Error: Server connection failed.");
    }
}

async function updatePassword() {
    const oldPassInput = document.getElementById("oldPassInput");
    const newPassInput = document.getElementById("newPassInput");
    const oldPass = oldPassInput.value;
    const newPass = newPassInput.value;

    if(!oldPass || !newPass) {
        return alert("Validation Error: Current and new passwords are required.");
    }

    try {
        const res = await fetch("/update-password", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                userId: userData.UserID || userData.id, 
                oldPassword: oldPass, 
                newPassword: newPass  
            })
        });

        const result = await res.json();
        if (res.ok) {
            alert("Success: Your password has been updated successfully.");
            oldPassInput.value = "";
            newPassInput.value = "";
        } else {
            alert("Authentication Error: " + (result.message || "Failed to update password."));
        }
    } catch (err) {
        alert("Network Error: Could not connect to the server.");
    }
}

// --- EDIT FEATURE: STEP 1 - LOAD DATA ---
async function loadComplaintForEdit() {
    const id = document.getElementById("editSearchId").value.trim();
    const editFields = document.getElementById("editFields");
    
    if(!id) return alert("Required: Please enter a Complaint ID.");

    try {
        const res = await fetch(`/student-complaints/${userData.UserID || userData.id}`);
        const data = await res.json();
        const complaint = data.find(c => (c.ComplaintID || c.id) == id);

        if(!complaint) {
            return alert("Access Error: Complaint not found or access denied.");
        }

        if(complaint.Status !== 'Pending') {
            return alert("Modification Restricted: Only 'Pending' complaints can be edited.");
        }

        editFields.style.display = "block";
        document.getElementById("editTitleInput").value = complaint.Title;
        document.getElementById("editDescInput").value = complaint.Description;
        document.getElementById("editCatInput").value = complaint.Category;
    } catch (err) {
        alert("System Error: Failed to retrieve data from the server.");
    }
}

// --- EDIT FEATURE: STEP 2 - SUBMIT UPDATES ---
async function submitEditComplaint() {
    const id = document.getElementById("editSearchId").value;
    const title = document.getElementById("editTitleInput").value.trim();
    const description = document.getElementById("editDescInput").value.trim();
    const category = document.getElementById("editCatInput").value;

    if(!title || !description) return alert("Validation Error: Title and Description are required.");

    try {
        const res = await fetch(`/edit-complaint/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description, category })
        });

        const result = await res.json();
        if(res.ok) {
            alert("Success: Complaint details updated successfully.");
            document.getElementById("editFields").style.display = "none";
            document.getElementById("editSearchId").value = "";
            loadComplaints(); 
            showSection('viewSection');
        } else {
            alert("Update Failed: " + (result.message || "Unable to save changes."));
        }
    } catch (err) {
        alert("Network Error: Server unreachable.");
    }
}
// Student Login Function (Example)
async function handleStudentLogin() {
    const user = document.getElementById("stuUser").value;
    const pass = document.getElementById("stuPass").value;

    const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            username: user, 
            password: pass, 
            role: "Student" 
        })
    });
    
    if(res.ok) {
        const data = await res.json();
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "student_dashboard.html";
    } else {
        alert("Invalid Student Credentials!");
    }
}