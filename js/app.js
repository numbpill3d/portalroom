// Simulate data storage using localStorage
class PortalRoom {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadCurrentUser();
        this.setupEventListeners();
        this.renderPage();
    }

    loadCurrentUser() {
        this.currentUser = localStorage.getItem('currentUser');
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Link submission
        const linkForm = document.getElementById('link-form');
        if (linkForm) {
            linkForm.addEventListener('submit', (e) => this.handleLinkSubmit(e));
        }

        // List creation
        const listForm = document.getElementById('list-form');
        if (listForm) {
            listForm.addEventListener('submit', (e) => this.handleListSubmit(e));
        }

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[username] && users[username].password === password) {
            this.currentUser = username;
            localStorage.setItem('currentUser', username);
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid credentials');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[username]) {
            alert('Username already exists');
            return;
        }
        
        users[username] = { password: password, links: [], lists: [] };
        localStorage.setItem('users', JSON.stringify(users));
        
        this.currentUser = username;
        localStorage.setItem('currentUser', username);
        window.location.href = 'dashboard.html';
    }

    handleLinkSubmit(e) {
        e.preventDefault();
        if (!this.currentUser) return;

        const url = document.getElementById('link-url').value;
        const title = document.getElementById('link-title').value;
        const description = document.getElementById('link-description').value;
        const tags = document.getElementById('link-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);

        const link = {
            id: Date.now(),
            url: url,
            title: title,
            description: description,
            tags: tags,
            author: this.currentUser,
            timestamp: new Date().toISOString(),
            comments: []
        };

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        users[this.currentUser].links.push(link);
        localStorage.setItem('users', JSON.stringify(users));

        // Also add to global links
        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        allLinks.push(link);
        localStorage.setItem('allLinks', JSON.stringify(allLinks));

        window.location.href = 'dashboard.html';
    }

    handleListSubmit(e) {
        e.preventDefault();
        if (!this.currentUser) return;

        const name = document.getElementById('list-name').value;
        const description = document.getElementById('list-description').value;

        const list = {
            id: Date.now(),
            name: name,
            description: description,
            links: [],
            author: this.currentUser,
            timestamp: new Date().toISOString()
        };

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        users[this.currentUser].lists.push(list);
        localStorage.setItem('users', JSON.stringify(users));

        window.location.href = 'profile.html';
    }

    handleLogout(e) {
        e.preventDefault();
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    renderPage() {
        const path = window.location.pathname.split('/').pop();
        
        switch(path) {
            case 'index.html':
            case '':
                this.renderHome();
                break;
            case 'dashboard.html':
                this.renderDashboard();
                break;
            case 'profile.html':
                this.renderProfile();
                break;
        }
    }

    renderHome() {
        const container = document.getElementById('links-list');
        if (!container) return;

        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const recentLinks = allLinks.slice(-20).reverse(); // Last 20, newest first

        container.innerHTML = '';
        recentLinks.forEach(link => {
            const linkElement = this.createLinkElement(link);
            container.appendChild(linkElement);
        });
    }

    renderDashboard() {
        const container = document.getElementById('links-list');
        if (!container) return;

        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const recentLinks = allLinks.slice(-20).reverse();

        container.innerHTML = '';
        recentLinks.forEach(link => {
            const linkElement = this.createLinkElement(link);
            container.appendChild(linkElement);
        });
    }

    renderProfile() {
        const usernameElement = document.getElementById('profile-username');
        const userLinksList = document.getElementById('user-links-list');
        const listsContainer = document.getElementById('lists-container');

        if (usernameElement) {
            usernameElement.textContent = `${this.currentUser}'s Profile`;
        }

        if (userLinksList) {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const userLinks = users[this.currentUser]?.links || [];
            
            userLinksList.innerHTML = '';
            userLinks.forEach(link => {
                const linkElement = this.createLinkElement(link);
                userLinksList.appendChild(linkElement);
            });
        }

        if (listsContainer) {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const userLists = users[this.currentUser]?.lists || [];
            
            listsContainer.innerHTML = '';
            userLists.forEach(list => {
                const listElement = document.createElement('div');
                listElement.className = 'list-item';
                listElement.innerHTML = `
                    <h3>${list.name}</h3>
                    <p>${list.description}</p>
                    <div class="list-links">
                        ${list.links.map(linkId => {
                            const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
                            const link = allLinks.find(l => l.id === linkId);
                            return link ? `<a href="${link.url}" class="list-link">${link.title}</a>` : '';
                        }).join('')}
                    </div>
                `;
                listsContainer.appendChild(listElement);
            });
        }
    }

    createLinkElement(link) {
        const element = document.createElement('div');
        element.className = 'link-item';
        
        element.innerHTML = `
            <h3><a href="${link.url}" target="_blank">${link.title}</a></h3>
            <p>${link.description}</p>
            <small>by ${link.author} | ${new Date(link.timestamp).toLocaleDateString()}</small>
            <div class="tags">${link.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div>
            <div class="comments">
                <h4>Comments</h4>
                <div class="comments-list" id="comments-${link.id}"></div>
                <form class="comment-form" data-link-id="${link.id}">
                    <input type="text" placeholder="Add a comment..." required>
                    <button type="submit">Comment</button>
                </form>
            </div>
        `;

        // Add comment event listener
        const commentForm = element.querySelector('.comment-form');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => this.handleCommentSubmit(e, link.id));
        }

        // Load comments
        this.renderComments(link.id, element);

        return element;
    }

    renderComments(linkId, element) {
        const commentsContainer = element.querySelector(`#comments-${linkId}`);
        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const link = allLinks.find(l => l.id === linkId);
        
        if (link && link.comments) {
            commentsContainer.innerHTML = '';
            link.comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.innerHTML = `<strong>${comment.author}:</strong> ${comment.text}`;
                commentsContainer.appendChild(commentElement);
            });
        }
    }

    handleCommentSubmit(e, linkId) {
        e.preventDefault();
        if (!this.currentUser) return;

        const form = e.target;
        const commentText = form.querySelector('input').value;
        
        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const link = allLinks.find(l => l.id === linkId);
        
        if (link) {
            link.comments.push({
                id: Date.now(),
                author: this.currentUser,
                text: commentText,
                timestamp: new Date().toISOString()
            });
            
            localStorage.setItem('allLinks', JSON.stringify(allLinks));
            form.reset();
            this.renderPage(); // Refresh to show new comment
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortalRoom();
});
