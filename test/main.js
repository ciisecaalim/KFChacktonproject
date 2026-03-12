// main.js - handles forms and localStorage for assignments

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirm = document.getElementById('confirmPassword').value;

            // Validation
            if (!fullName) {
                alert('Please enter your full name.');
                return;
            }
            if (!email) {
                alert('Please enter your email address.');
                return;
            }
            if (!isValidEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            if (!password) {
                alert('Please enter a password.');
                return;
            }
            if (password.length < 6) {
                alert('Password must be at least 6 characters long.');
                return;
            }
            if (password !== confirm) {
                alert('Passwords do not match.');
                return;
            }

            // Check if user already exists
            const users = getUsers();
            if (users.some(u => u.email === email)) {
                alert('An account with this email already exists.');
                return;
            }

            // Save user
            users.push({ fullName, email, password });
            saveUsers(users);

            alert('Registered successfully!');
            registerForm.reset();
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            // Validation
            if (!email) {
                alert('Please enter your email address.');
                return;
            }
            if (!isValidEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            if (!password) {
                alert('Please enter your password.');
                return;
            }
            if (password.length < 6) {
                alert('Password must be at least 6 characters long.');
                return;
            }

            // For demo purposes, check if user exists (assuming registered users are stored)
            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);
            if (!user) {
                alert('Invalid email or password.');
                return;
            }

            alert('Logged in successfully!');
            loginForm.reset();
        });
    }

    const assignmentForm = document.getElementById('assignmentForm');
    const assignmentsList = document.getElementById('assignmentsList');
    if (assignmentForm && assignmentsList) {
        loadAssignments();
        assignmentForm.addEventListener('submit', addAssignment);
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Message received! We will be in touch.');
            contactForm.reset();
        });
    }

    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const toggleSections = document.querySelectorAll('.toggle-section');
    if (toggleButtons.length && toggleSections.length) {
        toggleButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.target;
                if (!targetId) return;
                toggleButtons.forEach((btn) => btn.classList.remove('active'));
                button.classList.add('active');
                toggleSections.forEach((section) => {
                    if (section.id === targetId) {
                        section.classList.remove('hidden');
                    } else {
                        section.classList.add('hidden');
                    }
                });
            });
        });
    }
});

function getAssignments() {
    const data = localStorage.getItem('assignments');
    return data ? JSON.parse(data) : [];
}

function saveAssignments(arr) {
    localStorage.setItem('assignments', JSON.stringify(arr));
}

function loadAssignments() {
    const assignments = getAssignments();
    renderAssignments(assignments);
}

function addAssignment(e) {
    e.preventDefault();
    const subject = document.getElementById('subject').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const deadline = document.getElementById('deadline').value;
    const priority = document.getElementById('priority').value;
    const assignments = getAssignments();
    assignments.push({ subject, title, description, deadline, priority, completed: false });
    saveAssignments(assignments);
    renderAssignments(assignments);
    assignmentForm.reset();
}

function renderAssignments(assignments) {
    const container = document.getElementById('assignmentsList');
    if (!container) return;
    container.innerHTML = '';
    assignments.forEach((a, idx) => {
        const card = document.createElement('div');
        card.className = 'card';
        if (a.completed) {
            card.classList.add('completed');
        }
        card.innerHTML = `
      <h4>${a.title}</h4>
      <p style="color: var(--gray-600);">${a.subject}</p>
      <p>Deadline: ${a.deadline}</p>
      <p>Priority: ${a.priority}</p>
      <div style="margin-top: 0.5rem;">
        <button class="btn-small">${a.completed ? 'Completed' : 'Mark as Complete'}</button>
        <button class="btn-small delete">Delete</button>
      </div>
    `;
        container.appendChild(card);

        const buttons = card.querySelectorAll('.btn-small');
        buttons[0].addEventListener('click', () => {
            toggleComplete(idx);
        });
        buttons[1].addEventListener('click', () => {
            deleteAssignment(idx);
        });
    });
}

function toggleComplete(index) {
    const assignments = getAssignments();
    if (assignments[index]) {
        assignments[index].completed = !assignments[index].completed;
        saveAssignments(assignments);
        renderAssignments(assignments);
    }
}

function deleteAssignment(index) {
    let assignments = getAssignments();
    assignments = assignments.filter((_, i) => i !== index);
    saveAssignments(assignments);
    renderAssignments(assignments);
}
