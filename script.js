function openForm() {
    document.getElementById("studentForm").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

function closeForm() {
    document.getElementById("studentForm").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

function openReadForm() {
    document.getElementById("readForm").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

function closeReadForm() {
    document.getElementById("readForm").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

function openUpdateForm() {
    document.getElementById("updateForm").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

function closeUpdateForm() {
    document.getElementById("updateForm").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

let selectedId = null;
let selectedName = null;
let selectedStudent = null;

// ✅ LOAD STUDENTS
function loadStudents() {
    fetch("api.php?action=read")
    .then(response => response.json())
    .then(res => {
        const tbody = document.querySelector("#studentTable tbody");
        tbody.innerHTML = "";

        if (res.status !== "success" || res.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No students found.</td></tr>';
            return;
        }

        res.data.forEach(student => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.lName}, ${student.fName} ${student.mName}</td>
                <td>${student.course}</td>
                <td>${student.age}</td>
            `;

            row.addEventListener("click", function() {
                document.querySelectorAll("#studentTable tbody tr").forEach(r => r.classList.remove("selected"));
                row.classList.add("selected");
                selectedId = student.id;
                selectedName = `${student.fName} ${student.lName}`;
                selectedStudent = student;
            });

            tbody.appendChild(row);
        });
    })
    .catch(error => console.error("Error loading students:", error));
}

// ✅ READ button
document.getElementById("readBtn").addEventListener("click", function() {
    if (!selectedStudent) {
        alert("⚠️ Please select a student first by clicking a row.");
        return;
    }

    document.getElementById("readId").textContent     = selectedStudent.id;
    document.getElementById("readLName").textContent  = selectedStudent.lName;
    document.getElementById("readFName").textContent  = selectedStudent.fName;
    document.getElementById("readMName").textContent  = selectedStudent.mName || "N/A";
    document.getElementById("readCourse").textContent = selectedStudent.course;
    document.getElementById("readAge").textContent    = selectedStudent.age;

    openReadForm();
});

// ✅ UPDATE button
document.getElementById("updateBtn").addEventListener("click", function() {
    if (!selectedStudent) {
        alert("⚠️ Please select a student first by clicking a row.");
        return;
    }

    document.getElementById("updateId").value     = selectedStudent.id;
    document.getElementById("updateLName").value  = selectedStudent.lName;
    document.getElementById("updateFName").value  = selectedStudent.fName;
    document.getElementById("updateMName").value  = selectedStudent.mName;
    document.getElementById("updateCourse").value = selectedStudent.course;
    document.getElementById("updateAge").value    = selectedStudent.age;

    openUpdateForm();
});

// ✅ UPDATE form submit
document.getElementById("updateFormElement").addEventListener("submit", function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    formData.append("action", "update"); // ✅ tell api.php what to do

    fetch("api.php", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(res => {
        if (res.status === "success") {
            alert("✅ Student updated successfully!");
            closeUpdateForm();
            selectedStudent = null;
            selectedId = null;
            selectedName = null;
            loadStudents();
        } else {
            alert("❌ Failed: " + res.message);
        }
    })
    .catch(error => alert("❌ Network error: " + error.message));
});

// ✅ DELETE button
document.getElementById("deleteBtn").addEventListener("click", function() {
    if (!selectedId) {
        alert("⚠️ Please select a student first by clicking a row.");
        return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedName}?`)) return;

    const formData = new FormData();
    formData.append("action", "delete"); // ✅ tell api.php what to do
    formData.append("id", selectedId);

    fetch("api.php", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(res => {
        if (res.status === "success") {
            alert("✅ Student deleted successfully!");
            selectedId = null;
            selectedName = null;
            selectedStudent = null;
            loadStudents();
        } else {
            alert("❌ Failed: " + res.message);
        }
    })
    .catch(error => alert("❌ Network error: " + error.message));
});

// ✅ CREATE form submit
document.getElementById("studentFormElement").addEventListener("submit", function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    formData.append("action", "create"); // ✅ tell api.php what to do

    fetch("api.php", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(res => {
        if (res.status === "success") {
            alert("✅ Student added successfully!");
            this.reset();
            closeForm();
            loadStudents();
        } else {
            alert("❌ Failed: " + res.message);
        }
    })
    .catch(error => alert("❌ Network error: " + error.message));
});

// ✅ SEARCH — triggers on every keystroke
document.getElementById("searchInput").addEventListener("input", function() {
    const keyword = this.value.trim();

    if (keyword === "") {
        loadStudents(); // show all if empty
        return;
    }

    const formData = new FormData();
    formData.append("action", "search");
    formData.append("keyword", keyword);

    fetch("api.php", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(res => {
        const tbody = document.querySelector("#studentTable tbody");
        tbody.innerHTML = "";

        if (res.status !== "success" || res.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No students found.</td></tr>';
            return;
        }

        res.data.forEach(student => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.lName}, ${student.fName} ${student.mName}</td>
                <td>${student.course}</td>
                <td>${student.age}</td>
            `;

            row.addEventListener("click", function() {
                document.querySelectorAll("#studentTable tbody tr").forEach(r => r.classList.remove("selected"));
                row.classList.add("selected");
                selectedId = student.id;
                selectedName = `${student.fName} ${student.lName}`;
                selectedStudent = student;
            });

            tbody.appendChild(row);
        });
    })
    .catch(error => console.error("Search error:", error));
});

// ✅ CLEAR button
document.getElementById("clearBtn").addEventListener("click", function() {
    document.getElementById("searchInput").value = "";
    loadStudents();
});

loadStudents();