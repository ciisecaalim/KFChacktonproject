// main.js - handles forms and localStorage for assignments

document.addEventListener('DOMContentLoaded', () => {
    const authStatusEl = document.getElementById('authStatus');
    updateAuthStatus(authStatusEl);
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
                alert('Password must be at least 6 characters.');
                return;
            }
            if (password !== confirm) {
                alert('Passwords do not match.');
                return;
            }

            // Check if user already exists
            const users = getUsers();
            if (users.some(u => u.email === email)) {
                alert('An account with that email already exists.');
                return;
            }

            // Save user
            const registeredAt = new Date().toISOString();
            users.push({ fullName, email, password, registeredAt });
            saveUsers(users);
            setCurrentUser({ fullName, email, registeredAt });
            updateAuthStatus(authStatusEl);

            alert('Registration successful!');
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
                alert('Password must be at least 6 characters.');
                return;
            }

            // For demo purposes, check if user exists (assuming registered users are stored)
            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);
            if (!user) {
                alert('Email or password is incorrect.');
                return;
            }
            setCurrentUser(user);
            updateAuthStatus(authStatusEl);

            alert('Login successful!');
            loginForm.reset();
        });
    }

    const assignmentForm = document.getElementById('assignmentForm');
    const assignmentsList = document.getElementById('assignmentsList');
    if (assignmentForm && assignmentsList) {
        loadAssignments(true);
        assignmentForm.addEventListener('submit', addAssignment);
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Message received! We will be in touch soon.');
            contactForm.reset();
        });
    }

    const toggleButtons = document.querySelectorAll('.toggle-btn');
    if (toggleButtons.length) {
        toggleButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.target;
                if (!targetId) return;
                setActiveSection(targetId);
            });
        });
        setActiveSection('addAssignmentSection');
    }
});

function getAssignments() {
    const data = localStorage.getItem('assignments');
    return data ? JSON.parse(data) : [];
}

function saveAssignments(arr) {
    localStorage.setItem('assignments', JSON.stringify(arr));
}

function loadAssignments(showCountAlert = false) {
    const assignments = getAssignments();
    renderAssignments(assignments);
    if (showCountAlert) {
        notifyAssignmentCount(assignments.length);
    }
}

function addAssignment(e) {
    e.preventDefault();
    const form = e.target;
    const subject = form.subject.value.trim();
    const title = form.title.value.trim();
    const description = form.description.value.trim();
    const deadlineInput = form.deadline.value;
    const priority = form.priority.value || 'Low';

    if (!subject) {
        alert('Please enter a subject name.');
        return;
    }
    if (!title) {
        alert('Please enter a title for the assignment.');
        return;
    }
    if (!deadlineInput) {
        alert('Please pick a deadline date.');
        return;
    }
    const parsedDeadline = new Date(deadlineInput);
    if (Number.isNaN(parsedDeadline.getTime())) {
        alert('Please enter a valid deadline date.');
        return;
    }

    const assignments = getAssignments();
    const duplicate = assignments.some(
        (a) => a.subject.toLowerCase() === subject.toLowerCase() && a.title.toLowerCase() === title.toLowerCase()
    );
    if (duplicate) {
        alert('An assignment with the same subject and title already exists.');
        return;
    }

    const assignment = {
        subject,
        title,
        description,
        deadline: parsedDeadline.toISOString().split('T')[0],
        priority,
        completed: false,
        createdAt: new Date().toISOString(),
    };

    assignments.push(assignment);
    saveAssignments(assignments);
    renderAssignments(assignments);
    setActiveSection('addAssignmentSection');
    alert('Assignment added successfully!');
    form.reset();
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
        <button class="btn-small">${a.completed ? 'Completed' : 'Mark complete'}</button>
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

function notifyAssignmentCount(count) {
    alert(`You have ${count} assignment${count === 1 ? '' : 's'} stored.`);
}

function getUsers() {
    const data = localStorage.getItem('users');
    return data ? JSON.parse(data) : [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function getCurrentUser() {
    const data = localStorage.getItem('currentUser');
    return data ? JSON.parse(data) : null;
}

function updateAuthStatus(element = document.getElementById('authStatus')) {
    if (!element) return;
    const user = getCurrentUser();
    if (user) {
        element.textContent = `Signed in as ${user.fullName} (${user.email})`;
    } else {
        element.textContent = 'Not signed in yet. Register or login to get started.';
    }
}

function isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
}

function setActiveSection(targetId) {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const toggleSections = document.querySelectorAll('.toggle-section');
    if (!targetId) return;
    toggleButtons.forEach((btn) => {
        if (btn.dataset.target === targetId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    toggleSections.forEach((section) => {
        if (section.id === targetId) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });
}
