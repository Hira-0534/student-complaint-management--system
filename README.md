# Student Complaint Management System (SCMS)

## 📖 Project Overview
The **Student Complaint Management System (SCMS)** is a full-stack web application designed to provide students with a platform to submit, track, and manage complaints related to academic or administrative issues.  

The system allows students to register, submit complaints, and monitor their status, while administrators can review and update complaint statuses efficiently.

This project demonstrates a complete **full-stack web development workflow** using frontend technologies, backend server logic, and a relational database.

---

## 🎯 Project Objectives
- Develop a full-stack web application
- Implement frontend using **HTML, CSS, and JavaScript**
- Build backend using **Node.js and Express.js**
- Integrate a **MySQL relational database**
- Implement **CRUD operations**
- Use **Git and GitHub** for version control

---

## 🛠 Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MySQL

### Version Control
- Git
- GitHub

---

## ⚙ Features

### Student Features
- Student Registration
- Secure Login
- Submit Complaint
- Edit Complaint (if status is pending)
- Delete Complaint
- View Complaint Status
- change Password

### Admin Features
- Role-based Login
- View All Complaints
- Update Complaint Status
- Dashboard Statistics
- Change Password

---
## 🗂 Project Folder Structure


student-complaint-management-system
│
├── db
│ └── db.js
│
├── public
│ ├── css
│ ├── js
│ ├── index.html
│ ├── admin-dashboard.html
│ └── student-dashboard.html
│
├── server.js
├── package.json
└── README.md


---

## 🗄 Database Design

### Users Table
| Field | Description |
|------|-------------|
| UserID | Primary Key |
| Username | User login name |
| Password | User password |
| Role | Admin or Student |
| Session | Student session |

### Complaints Table
| Field | Description |
|------|-------------|
| ComplaintID | Primary Key |
| Title | Complaint title |
| Description | Complaint details |
| Category | Complaint category |
| Status | Pending / Resolved |
| SubmittedBy | Foreign Key (UserID) |
| CreatedAt | Timestamp |

---

## 🔄 CRUD Operations

| Operation | Description |
|----------|-------------|
| Create | Submit complaint |
| Read | View complaints |
| Update | Edit complaint / update status |
| Delete | Delete complaint |

---

## 🔗 System Workflow

1. Student registers and logs into the system.
2. Student submits a complaint.
3. The complaint is stored in the database with **Pending** status.
4. Admin logs in and views all complaints.
5. Admin updates complaint status (Resolved / In Progress).
6. Student can view updated complaint status.

---

## 🚀 How to Run the Project

### 1️⃣ Install Node.js

Download and install Node.js.

### 2️⃣ Install Dependencies

Open terminal inside project folder and run:

### 3️⃣ Setup Database

Create a MySQL database and tables for:

- Users
- Complaints

Update database credentials in:

### 4️⃣ Start the Server

Run the following command:
*node server.js*
Server will start on:
http://localhost:3000

---

## 📷 Project Screenshots

##- **Login Page**
- <img width="1916" height="895" alt="image" src="https://github.com/user-attachments/assets/af19693c-5f23-4a62-882b-2b5bc9c84523" />
<img width="1919" height="899" alt="image" src="https://github.com/user-attachments/assets/76ca5987-1d21-4b5a-8171-7c85720b8f46" />
<img width="1919" height="880" alt="image" src="https://github.com/user-attachments/assets/88d847be-c6f5-4325-863e-1db5015134e7" />
<img width="1919" height="865" alt="image" src="https://github.com/user-attachments/assets/96fac6db-cd8a-4787-9fbc-ffe3016d4ca9" />

##-** Student Dashboard**
<img width="1919" height="875" alt="image" src="https://github.com/user-attachments/assets/2bbcd5a9-eb1e-4a0a-ae1b-5cb538db49e7" />

##-**Admin Dashboard**
<img width="1919" height="886" alt="image" src="https://github.com/user-attachments/assets/51267457-9fb9-41ad-be2b-44a7bf522af8" />
##- **Complaint Form**
<img width="1919" height="880" alt="image" src="https://github.com/user-attachments/assets/badc4326-79d9-472c-b854-9b070c1d372b" />

##- **Database Tables**
<img width="929" height="252" alt="image" src="https://github.com/user-attachments/assets/d8d40c2f-a859-4837-8421-915be97b66d2" />
<img width="959" height="245" alt="image" src="https://github.com/user-attachments/assets/0087ab6c-2b8f-4600-893d-5d7c30081283" />

---

## 📌 GitHub Repository

Project Repository Link:
https://github.com/Hira-0534/student-complaint-management--system

---

## 🔮 Future Enhancements

- Password hashing
- Email notifications
- File attachment support
- Advanced reporting
- JWT authentication

---

## 👩‍💻 Author

**Hira Shahid**  
B.Sc. Software Engineering  
Web Engineering Lab Project


