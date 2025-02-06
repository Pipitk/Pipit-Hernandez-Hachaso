const BASE_URL = 'http://127.0.0.1:5000'; // Flask backend

// Login API call
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const role = document.getElementById('role').value;
    const passcode = document.getElementById('passcode').value;

    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, role, passcode })
        });
        const result = await response.json();

        if (response.ok) {
            alert(`Welcome, ${result.username}!`);
            currentUser = result; // Save user details
            renderSectionsBasedOnRole(result.role);
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Error logging in:', error);
    }
});

// Fetch all courses
async function fetchCourses() {
    try {
        const response = await fetch(`${BASE_URL}/courses`);
        const courses = await response.json();
        renderCourses(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
    }
}
