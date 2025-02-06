const loginForm = document.getElementById('login-form');
const addCourseForm = document.getElementById('add-course-form');
const teacherPasscodeGroup = document.getElementById('teacher-passcode-group');
const roleSelect = document.getElementById('role');
const loginLink = document.getElementById('login-link');
const logoutLink = document.getElementById('logout-link');
const addCourseSection = document.getElementById('add-course');
const viewCoursesSection = document.getElementById('view-courses');
const coursesList = document.getElementById('courses-list');

let currentUser = null;

// Load data from localStorage
const courses = JSON.parse(localStorage.getItem('courses')) || [];
const students = JSON.parse(localStorage.getItem('students')) || [];

// Show passcode input for teacher
roleSelect.addEventListener('change', (e) => {
    teacherPasscodeGroup.style.display = e.target.value === 'teacher' ? 'block' : 'none';
});

// Login form submit
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const role = document.getElementById('role').value;
    const passcode = document.getElementById('passcode').value;

    if (role === 'teacher' && passcode !== 'schooladmin') {
        alert('Invalid passcode for teacher!');
        return;
    }

    currentUser = { username, role };

    if (role === 'student') {
        addCourseSection.style.display = 'none';
        viewCoursesSection.style.display = 'block';
        renderStudentCourses();
    } else if (role === 'teacher') {
        addCourseSection.style.display = 'block';
        viewCoursesSection.style.display = 'block';
        renderCoursesForTeacher();
    }

    loginLink.style.display = 'none';
    logoutLink.style.display = 'block';
    loginForm.reset();
    alert(`Welcome, ${username}!`);
});

// Add course form submit (for teachers)
addCourseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (currentUser.role !== 'teacher') return;

    const courseName = document.getElementById('course-name').value;
    const courseDescription = document.getElementById('course-description').value;

    // Check if course already exists
    if (courses.find((course) => course.courseName === courseName)) {
        alert('Course already exists!');
        return;
    }

    courses.push({
        courseName,
        courseDescription,
        students: [],
        schedule: '', // New field for schedule/time
        assignments: [], // New field for assignments
        activities: [] // New field for activities
    });

    localStorage.setItem('courses', JSON.stringify(courses));
    addCourseForm.reset();
    alert('Course added successfully!');
    renderCoursesForTeacher();
});

// Render courses for teacher with editing and student management options
function renderCoursesForTeacher() {
    coursesList.innerHTML = '';
    courses.forEach((course) => {
        const courseItem = document.createElement('div');
        courseItem.classList.add('course-item');
        courseItem.innerHTML = `
            <h3>${course.courseName}</h3>
            <p>${course.courseDescription}</p>
            <p><strong>Time:</strong> ${course.schedule || 'Not Set'}</p>
            <p><strong>Assignments:</strong> ${course.assignments.join(', ') || 'None'}</p>
            <p><strong>Activities:</strong> ${course.activities.join(', ') || 'None'}</p>
            <h4>Enrolled Students:</h4>
            <ul>
                ${course.students.map((student) => `<li>${student}</li>`).join('')}
            </ul>
            <button class="btn" onclick="editCourse('${course.courseName}')">Edit</button>
            <button class="btn" onclick="removeStudentFromCourse('${course.courseName}')">Remove Student</button>
        `;
        coursesList.appendChild(courseItem);
    });
}

// Remove a student from a course (for teachers)
function removeStudentFromCourse(courseName) {
    const course = courses.find((c) => c.courseName === courseName);

    if (!course) {
        alert('Course not found!');
        return;
    }

    if (course.students.length === 0) {
        alert('No students are currently enrolled in this course.');
        return;
    }

    // Display a list of students for the teacher to choose from
    const studentToRemove = prompt(
        `Enter the name of the student to remove:\n${course.students.join(', ')}`
    );

    if (!studentToRemove) {
        alert('No student selected!');
        return;
    }

    // Check if the student exists in the course
    const studentIndex = course.students.indexOf(studentToRemove);
    if (studentIndex === -1) {
        alert(`Student ${studentToRemove} is not enrolled in this course.`);
        return;
    }

    // Remove the student from the course
    course.students.splice(studentIndex, 1);

    // Update the student's courses list
    const student = students.find((s) => s.username === studentToRemove);
    if (student) {
        const courseIndex = student.courses.indexOf(courseName);
        if (courseIndex !== -1) {
            student.courses.splice(courseIndex, 1);
        }
    }

    // Save the updated data to localStorage
    localStorage.setItem('courses', JSON.stringify(courses));
    localStorage.setItem('students', JSON.stringify(students));

    alert(`Student ${studentToRemove} has been removed from the course: ${courseName}`);
    renderCoursesForTeacher();
}


// Edit a course (for teachers)
function editCourse(courseName) {
    const course = courses.find((c) => c.courseName === courseName);

    if (!course) {
        alert('Course not found!');
        return;
    }

    const newSchedule = prompt('Enter new time for the course:', course.schedule || '');
    const newAssignments = prompt('Enter assignments:', course.assignments.join(', ') || '');
    const newActivities = prompt('Enter activities:', course.activities.join(', ') || '');

    if (newSchedule !== null) course.schedule = newSchedule;
    if (newAssignments !== null) course.assignments = newAssignments.split(',').map((item) => item.trim());
    if (newActivities !== null) course.activities = newActivities.split(',').map((item) => item.trim());

    localStorage.setItem('courses', JSON.stringify(courses));
    alert('Course updated successfully!');
    renderCoursesForTeacher();
    
}

// Render courses for students to view
function renderStudentCourses() {
    const student = students.find((s) => s.username === currentUser.username);

    if (student && student.courses.length > 0) {
        coursesList.innerHTML = '<h3>Your Enrolled Courses</h3>';
        student.courses.forEach((courseName) => {
            const course = courses.find((c) => c.courseName === courseName);
            const courseItem = document.createElement('div');
            courseItem.classList.add('course-item');
            courseItem.innerHTML = `
                <h3>${course.courseName}</h3>
                <p>${course.courseDescription}</p>
                <p><strong>Time:</strong> ${course.schedule || 'Not Set'}</p>
                <p><strong>Assignments:</strong> ${course.assignments.join(', ') || 'None'}</p>
                <p><strong>Activities:</strong> ${course.activities.join(', ') || 'None'}</p>
            `;
            coursesList.appendChild(courseItem);
        });
    } else {
        coursesList.innerHTML = '<p>You are not enrolled in any courses.</p>';
    }

    renderAvailableCoursesForEnrollment();
}

// Render courses for students to view
function renderStudentCourses() {
    const student = students.find((s) => s.username === currentUser.username);

    // Check if the student is already enrolled in any courses
    if (student && student.courses.length > 0) {
        coursesList.innerHTML = '<h3>Your Enrolled Courses</h3>';
        student.courses.forEach((courseName) => {
            const course = courses.find((c) => c.courseName === courseName);
            const courseItem = document.createElement('div');
            courseItem.classList.add('course-item');
            courseItem.innerHTML = `
                <h3>${course.courseName}</h3>
                <p>${course.courseDescription}</p>
                <p><strong>Time:</strong> ${course.schedule || 'Not Set'}</p>
                <p><strong>Assignments:</strong> ${course.assignments.join(', ') || 'None'}</p>
                <p><strong>Activities:</strong> ${course.activities.join(', ') || 'None'}</p>
            `;
            coursesList.appendChild(courseItem);
        });
    } else {
        // If no enrolled courses, show a message
        coursesList.innerHTML = '<h3>You are not enrolled in any courses.</h3>';
    }

    // Render available courses for enrollment
    renderAvailableCoursesForEnrollment();
}

// Render available courses for students to enroll in
function renderAvailableCoursesForEnrollment() {
    coursesList.innerHTML += '<h3>Available Courses for Enrollment</h3>'; // Add a section header
    courses.forEach((course) => {
        const courseItem = document.createElement('div');
        courseItem.classList.add('course-item');
        courseItem.innerHTML = `
            <h3>${course.courseName}</h3>
            <p>${course.courseDescription}</p>
            <button class="btn" onclick="selectCourse('${course.courseName}')">Select Course</button>
        `;
        coursesList.appendChild(courseItem);
    });
}
function selectCourse(courseName) {
    const course = courses.find((c) => c.courseName === courseName);
    if (!course) {
        alert('Course not found!');
        return;
    }

    // Check if the student is already enrolled
    if (!course.students.includes(currentUser.username)) {
        course.students.push(currentUser.username);

        let student = students.find((s) => s.username === currentUser.username);
        if (student) {
            student.courses.push(courseName);
        } else {
            students.push({ username: currentUser.username, courses: [courseName] });
        }

        // Save updates to localStorage
        localStorage.setItem('courses', JSON.stringify(courses));
        localStorage.setItem('students', JSON.stringify(students));
        alert(`You have successfully selected the course: ${courseName}`);
        renderStudentCourses();
    } else {
        alert('You have already selected this course!');
    }
}
// Initialize data if not present in localStorage
if (!localStorage.getItem('students')) {
    localStorage.setItem('students', JSON.stringify([]));
}

if (!localStorage.getItem('courses')) {
    localStorage.setItem('courses', JSON.stringify([]));
}


// Enroll student in a course
function enrollInCourse(courseName) {
    const course = courses.find((c) => c.courseName === courseName);
    if (!course) {
        alert('Course not found!');
        return;
    }

    if (!course.students.includes(currentUser.username)) {
        course.students.push(currentUser.username);

        const student = students.find((s) => s.username === currentUser.username);
        if (student) {
            student.courses.push(courseName);
        } else {
            students.push({ username: currentUser.username, courses: [courseName] });
        }

        localStorage.setItem('courses', JSON.stringify(courses));
        localStorage.setItem('students', JSON.stringify(students));
        alert('Enrolled successfully!');
        renderStudentCourses();
    } else {
        alert('You are already enrolled in this course!');
    }
    
}

// Logout
function logout() {
    currentUser = null;
    addCourseSection.style.display = 'none';
    viewCoursesSection.style.display = 'none';
    loginLink.style.display = 'block';
    logoutLink.style.display = 'none';
    alert('You have been logged out!');
}
