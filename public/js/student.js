let userData = JSON.parse(localStorage.getItem("user"));

// Redirect if not logged in
if (!userData && !window.location.pathname.includes("signup.html")) {
    window.location.href = "login.html";
}

window.onload = () => {
    if (userData) {
        if(document.getElementById("userDisplay")) document.getElementById("userDisplay").innerText = userData.Username;
        if(document.getElementById("prof-name")) document.getElementById("prof-name").innerText = userData.Username;
        if(document.getElementById("prof-session")) document.getElementById("prof-session").innerText = userData.Session || "FA23";
        if(document.getElementById("welcome-msg")) document.getElementById("welcome-msg").innerText = "Welcome, " + userData.Username + "!";
        loadComplaints();
    }
};

// --- NAVIGATION LOGIC ---
function showSection(id, el) {
    const sections = ['dashSection', 'viewSection', 'addSection', 'statusSection', 'profileSection', 'passwordSection', 'deleteSection'];
    
    // Sab ko hide karo
    sections.forEach(s => {
        const target = document.getElementById(s);
        if(target) target.style.display = 'none';
    });
    
    // Sirf selected section dikhao
    const activeSection = document.getElementById(id);
    if(activeSection) {
        activeSection.style.display = 'block';
    }
    
    // Sidebar highlight update
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if(el) el.classList.add('active');

    if(id === 'viewSection') loadComplaints();
}


// --- DELETE COMPLAINT ---
async function deleteComplaintById() {
    const idInput = document.getElementById("idDelete");
    const id = idInput.value.trim();
    
    if(!id) return alert("Please enter ID to delete");

    if(!confirm("Are you sure you want to delete this complaint?")) return;

    try {
        const res = await fetch(`/delete-complaint/${id}/${userData.UserID}`, { method: "DELETE" });
        if (res.ok) {
            alert("🗑️ Complaint Deleted!");
            idInput.value = "";
            loadComplaints(); 
        } else {
            const errorData = await res.json();
            alert("❌ Error: " + errorData.message);
        }
    } catch (err) {
        alert("Server error");
    }
}

// --- OTHER FUNCTIONS ---
async function submitOfficialComplaint() {
    const title = document.getElementById("titleInput").value.trim();
    const description = document.getElementById("descInput").value.trim();
    const category = document.getElementById("catInput").value;

    if (!title || !description || !category) return alert("Fill all fields");

    const res = await fetch("/complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category, submittedBy: userData.UserID })
    });

    if (res.ok) {
        alert("✅ Submitted!");
        showSection('viewSection');
    }
}

// --- COMPLAINTS LIST KO PROFESSIONAL BANANA ---
async function loadComplaints() {
    const res = await fetch(`/student-complaints/${userData.UserID}`);
    const data = await res.json();
    
    // Stats update
    if(document.getElementById("dash-total")) document.getElementById("dash-total").innerText = data.length;
    if(document.getElementById("dash-resolved")) document.getElementById("dash-resolved").innerText = data.filter(c => c.Status === 'Resolved').length;
    
    const listDiv = document.getElementById("complaintsList");
    if(!listDiv) return;

    if(data.length === 0) {
        listDiv.innerHTML = `<p style="text-align:center; color:#64748b; padding:20px;">No complaints found.</p>`;
        return;
    }

    // Modern Table-like structure
    listDiv.innerHTML = `
        <div style="display:grid; grid-template-columns: 80px 1fr 120px 100px; font-weight:bold; padding:10px; border-bottom:2px solid #eee; color:#1e293b; font-size:14px;">
            <div>ID</div>
            <div>COMPLAINT DETAILS</div>
            <div>CATEGORY</div>
            <div>STATUS</div>
        </div>
        ${data.map(c => `
            <div style="display:grid; grid-template-columns: 80px 1fr 120px 100px; align-items:center; padding:15px 10px; border-bottom:1px solid #f1f5f9; font-size:14px;">
                <div style="font-weight:bold; color:#4f46e5;">#${c.ComplaintID}</div>
                <div>
                    <div style="font-weight:600; color:#1e293b;">${c.Title}</div>
                    <div style="font-size:12px; color:#64748b; margin-top:4px;">${c.Description}</div>
                </div>
                <div style="color:#64748b; font-size:13px;">${c.Category}</div>
                <div>
                    <span class="status-badge ${c.Status.toLowerCase().replace(' ', '-')}">
                        ${c.Status}
                    </span>
                </div>
            </div>
        `).join("")}
    `;
}

// --- SEARCH RESULT KO SAHI SE DIKHANA ---
async function checkStatus() {
    const id = document.getElementById("idSearch").value.trim();
    const resultDiv = document.getElementById("statusResult");
    if(!id) return alert("Please enter ID");

    const res = await fetch(`/student-complaints/${userData.UserID}`);
    const data = await res.json();
    const found = data.find(c => c.ComplaintID == id);

    if(found) {
        resultDiv.innerHTML = `
            <div style="margin-top:20px; padding:20px; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0;">
                <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                    <span style="background:#4f46e5; color:white; padding:4px 12px; border-radius:6px; font-size:12px; font-weight:bold;">ID: #${found.ComplaintID}</span>
                    <span class="status-badge ${found.Status.toLowerCase().replace(' ', '-')}">${found.Status}</span>
                </div>
                <h3 style="margin:0 0 10px 0; color:#1e293b;">${found.Title}</h3>
                <p style="margin:0; color:#64748b; font-size:14px; line-height:1.6;">${found.Description}</p>
                <div style="margin-top:15px; padding-top:15px; border-top:1px solid #e2e8f0; font-size:12px; color:#94a3b8;">
                    Category: <b>${found.Category}</b>
                </div>
            </div>`;
    } else {
        resultDiv.innerHTML = `<div style="margin-top:20px; color:#ef4444; font-weight:bold;">❌ No record found for ID #${id}</div>`;
    }
}

function toggleAccountMenu() {
    const menu = document.getElementById("account-submenu");
    menu.style.display = (menu.style.display === "none") ? "block" : "none";
}

async function logout() {
    if(confirm("Logout from system?")) {
        localStorage.clear();
        window.location.href = "login.html";
    }
}