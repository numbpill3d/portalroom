// Portal Room - MVP Application
class PortalRoom {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadCurrentUser();
        this.checkAuth();
        this.setupEventListeners();
        this.setupDungeonAmbiance();
        this.renderPage();
        this.setupKeyboardShortcuts();
    }

    // Setup dungeon ambiance effects
    setupDungeonAmbiance() {
        // Add random torch flickers
        this.createTorchEffects();
        
        // Add occasional ambient notifications
        if (Math.random() < 0.1) { // 10% chance
            setTimeout(() => {
                this.showNotification('👻 The ancient spirits whisper of great treasures...', 'info');
            }, Math.random() * 3000);
        }
    }

    // Create torch flame effects
    createTorchEffects() {
        const header = document.querySelector('header');
        if (!header) return;

        // Add floating torch particles
        for (let i = 0; i < 5; i++) {
            const torch = document.createElement('div');
            torch.className = 'torch-effect';
            torch.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, #FF6B35, #D4AF37);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: torchFlicker ${2 + Math.random() * 2}s infinite alternate;
                opacity: 0.6;
                pointer-events: none;
                z-index: 1;
            `;
            header.appendChild(torch);
        }
    }

    // Setup keyboard shortcuts for power users
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only work if no input is focused
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
                return;
            }

            switch(e.key) {
                case 'h':
                case 'H':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        window.location.href = 'index.html';
                        this.showNotification('🏰 Returning to the Grand Hall...', 'info');
                    }
                    break;
                case 'd':
                case 'D':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        window.location.href = 'dashboard.html';
                        this.showNotification('🏰 Entering the Guild Chamber...', 'info');
                    }
                    break;
                case 's':
                case 'S':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        window.location.href = 'submit.html';
                        this.showNotification('📮 Preparing to contribute treasure...', 'info');
                    }
                    break;
                case 'p':
                case 'P':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        window.location.href = 'profile.html';
                        this.showNotification('⚜️ Entering your noble chamber...', 'info');
                    }
                    break;
            }
        });
    }

    // Simple hash function for password security
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    // Sanitize HTML to prevent XSS
    sanitizeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Show notification messages
    showNotification(message, type = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Dungeon-themed message variations
        const dungeonMessages = {
            'success': [
                '✨ Treasure successfully claimed!',
                '⚔️ Quest completed with honor!',
                '🏆 Glory has been bestowed upon you!',
                '🔮 Magic flows through your veins!'
            ],
            'error': [
                '💀 The portal has rejected your offering!',
                '⚠️ Dark forces block your path!',
                '🔥 The ancient curse strikes again!',
                '🌪️ Chaos interrupts your ritual!'
            ],
            'info': [
                '📜 The ancient scrolls whisper...',
                '🔍 Seekers gather wisdom...',
                '🏰 The guild takes notice...',
                '⚡ Mystical energies swirl...'
            ]
        };

        // Add some randomness to messages
        const messages = dungeonMessages[type] || [message];
        const selectedMessage = messages[Math.floor(Math.random() * messages.length)];
        notification.textContent = selectedMessage;
        
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 4000);
    }

    // Check authentication for protected pages
    checkAuth() {
        const protectedPages = ['dashboard.html', 'submit.html', 'profile.html', 'list.html'];
        const currentPage = window.location.pathname.split('/').pop();

        if (protectedPages.includes(currentPage) && !this.currentUser) {
            this.showNotification('Please log in to access this page', 'error');
            setTimeout(() => window.location.href = 'login.html', 1000);
        }
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

        // Search
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }

        // Filter by tag
        const tagFilter = document.getElementById('tag-filter');
        if (tagFilter) {
            tagFilter.addEventListener('change', (e) => this.handleFilter(e));
        }

        // Export/Import buttons
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        const importBtn = document.getElementById('import-data');
        if (importBtn) {
            importBtn.addEventListener('click', () => document.getElementById('import-file').click());
        }

        const importFile = document.getElementById('import-file');
        if (importFile) {
            importFile.addEventListener('change', (e) => this.importData(e));
        }
    }

    handleLogin(e) {
        e.preventDefault();
        try {
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            if (!username || !password) {
                this.showNotification('Please enter both username and password', 'error');
                return;
            }

            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const hashedPassword = this.hashPassword(password);

            if (users[username] && users[username].password === hashedPassword) {
                this.currentUser = username;
                localStorage.setItem('currentUser', username);
                this.showNotification('Login successful!', 'success');
                setTimeout(() => window.location.href = 'dashboard.html', 500);
            } else {
                this.showNotification('Invalid credentials', 'error');
            }
        } catch (error) {
            this.showNotification('Login failed. Please try again.', 'error');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        try {
            const username = document.getElementById('reg-username').value.trim();
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password')?.value;

            // Validation
            if (!username || !password) {
                this.showNotification('Please fill in all fields', 'error');
                return;
            }

            if (username.length < 3) {
                this.showNotification('Username must be at least 3 characters', 'error');
                return;
            }

            if (password.length < 6) {
                this.showNotification('Password must be at least 6 characters', 'error');
                return;
            }

            if (confirmPassword && password !== confirmPassword) {
                this.showNotification('Passwords do not match', 'error');
                return;
            }

            const users = JSON.parse(localStorage.getItem('users') || '{}');
            if (users[username]) {
                this.showNotification('Username already exists', 'error');
                return;
            }

            users[username] = {
                password: this.hashPassword(password),
                links: [],
                lists: [],
                joinedAt: new Date().toISOString()
            };
            localStorage.setItem('users', JSON.stringify(users));

            this.currentUser = username;
            localStorage.setItem('currentUser', username);
            this.showNotification('Registration successful!', 'success');
            setTimeout(() => window.location.href = 'dashboard.html', 500);
        } catch (error) {
            this.showNotification('Registration failed. Please try again.', 'error');
        }
    }

    handleLinkSubmit(e) {
        e.preventDefault();
        if (!this.currentUser) {
            this.showNotification('Please log in first', 'error');
            return;
        }

        try {
            const url = document.getElementById('link-url').value.trim();
            const title = document.getElementById('link-title').value.trim();
            const description = document.getElementById('link-description').value.trim();
            const tags = document.getElementById('link-tags').value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag);

            if (!url || !title) {
                this.showNotification('URL and title are required', 'error');
                return;
            }

            const link = {
                id: Date.now(),
                url: this.sanitizeHTML(url),
                title: this.sanitizeHTML(title),
                description: this.sanitizeHTML(description),
                tags: tags.map(tag => this.sanitizeHTML(tag)),
                author: this.currentUser,
                timestamp: new Date().toISOString(),
                comments: []
            };

            const users = JSON.parse(localStorage.getItem('users') || '{}');
            users[this.currentUser].links.push(link);
            localStorage.setItem('users', JSON.stringify(users));

            const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
            allLinks.push(link);
            localStorage.setItem('allLinks', JSON.stringify(allLinks));

            this.showNotification('Link submitted successfully!', 'success');
            setTimeout(() => window.location.href = 'dashboard.html', 500);
        } catch (error) {
            this.showNotification('Failed to submit link. Please try again.', 'error');
        }
    }

    handleListSubmit(e) {
        e.preventDefault();
        if (!this.currentUser) {
            this.showNotification('Please log in first', 'error');
            return;
        }

        try {
            const name = document.getElementById('list-name').value.trim();
            const description = document.getElementById('list-description').value.trim();

            if (!name) {
                this.showNotification('List name is required', 'error');
                return;
            }

            const list = {
                id: Date.now(),
                name: this.sanitizeHTML(name),
                description: this.sanitizeHTML(description),
                links: [],
                author: this.currentUser,
                timestamp: new Date().toISOString()
            };

            const users = JSON.parse(localStorage.getItem('users') || '{}');
            users[this.currentUser].lists.push(list);
            localStorage.setItem('users', JSON.stringify(users));

            this.showNotification('List created successfully!', 'success');
            setTimeout(() => window.location.href = 'profile.html', 500);
        } catch (error) {
            this.showNotification('Failed to create list. Please try again.', 'error');
        }
    }

    handleLogout(e) {
        e.preventDefault();
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showNotification('Logged out successfully', 'success');
        setTimeout(() => window.location.href = 'index.html', 500);
    }

    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        this.filterLinks({ search: query });
    }

    handleFilter(e) {
        const tag = e.target.value;
        this.filterLinks({ tag: tag });
    }

    filterLinks(options = {}) {
        const container = document.getElementById('links-list');
        if (!container) return;

        let allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');

        if (options.search) {
            allLinks = allLinks.filter(link =>
                link.title.toLowerCase().includes(options.search) ||
                link.description.toLowerCase().includes(options.search) ||
                link.tags.some(tag => tag.toLowerCase().includes(options.search))
            );
        }

        if (options.tag && options.tag !== 'all') {
            allLinks = allLinks.filter(link => link.tags.includes(options.tag));
        }

        const recentLinks = allLinks.slice(-50).reverse();
        container.innerHTML = '';

        if (recentLinks.length === 0) {
            container.innerHTML = '<p class="empty-state">No links found</p>';
            return;
        }

        recentLinks.forEach(link => {
            const linkElement = this.createLinkElement(link);
            container.appendChild(linkElement);
        });
    }

    deleteLink(linkId) {
        if (!confirm('Are you sure you want to delete this link?')) return;

        try {
            const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
            const linkIndex = allLinks.findIndex(l => l.id === linkId);

            if (linkIndex > -1) {
                const link = allLinks[linkIndex];

                if (link.author !== this.currentUser) {
                    this.showNotification('You can only delete your own links', 'error');
                    return;
                }

                allLinks.splice(linkIndex, 1);
                localStorage.setItem('allLinks', JSON.stringify(allLinks));

                const users = JSON.parse(localStorage.getItem('users') || '{}');
                if (users[this.currentUser]) {
                    users[this.currentUser].links = users[this.currentUser].links.filter(l => l.id !== linkId);
                    localStorage.setItem('users', JSON.stringify(users));
                }

                this.showNotification('Link deleted successfully', 'success');
                this.renderPage();
            }
        } catch (error) {
            this.showNotification('Failed to delete link', 'error');
        }
    }

    editLink(linkId) {
        const link = this.getLinkById(linkId);
        if (!link) return;

        if (link.author !== this.currentUser) {
            this.showNotification('You can only edit your own links', 'error');
            return;
        }

        const newTitle = prompt('Edit title:', link.title);
        if (newTitle === null) return;

        const newDescription = prompt('Edit description:', link.description);
        if (newDescription === null) return;

        try {
            link.title = this.sanitizeHTML(newTitle.trim());
            link.description = this.sanitizeHTML(newDescription.trim());

            const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
            const linkIndex = allLinks.findIndex(l => l.id === linkId);
            if (linkIndex > -1) {
                allLinks[linkIndex] = link;
                localStorage.setItem('allLinks', JSON.stringify(allLinks));
            }

            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const userLinkIndex = users[this.currentUser].links.findIndex(l => l.id === linkId);
            if (userLinkIndex > -1) {
                users[this.currentUser].links[userLinkIndex] = link;
                localStorage.setItem('users', JSON.stringify(users));
            }

            this.showNotification('Link updated successfully', 'success');
            this.renderPage();
        } catch (error) {
            this.showNotification('Failed to update link', 'error');
        }
    }

    getLinkById(linkId) {
        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        return allLinks.find(l => l.id === linkId);
    }

    addLinkToList(linkId, listId) {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const list = users[this.currentUser]?.lists.find(l => l.id === parseInt(listId));

            if (list) {
                if (!list.links.includes(linkId)) {
                    list.links.push(linkId);
                    localStorage.setItem('users', JSON.stringify(users));
                    this.showNotification('Link added to list!', 'success');
                    this.renderPage();
                } else {
                    this.showNotification('Link already in this list', 'info');
                }
            }
        } catch (error) {
            this.showNotification('Failed to add link to list', 'error');
        }
    }

    removeLinkFromList(linkId, listId) {
        if (!confirm('Remove this link from the list?')) return;

        try {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const list = users[this.currentUser]?.lists.find(l => l.id === listId);

            if (list) {
                list.links = list.links.filter(id => id !== linkId);
                localStorage.setItem('users', JSON.stringify(users));
                this.showNotification('Link removed from list', 'success');
                this.renderPage();
            }
        } catch (error) {
            this.showNotification('Failed to remove link from list', 'error');
        }
    }

    deleteList(listId) {
        if (!confirm('Are you sure you want to delete this list?')) return;

        try {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            users[this.currentUser].lists = users[this.currentUser].lists.filter(l => l.id !== listId);
            localStorage.setItem('users', JSON.stringify(users));
            this.showNotification('List deleted successfully', 'success');
            this.renderPage();
        } catch (error) {
            this.showNotification('Failed to delete list', 'error');
        }
    }

    deleteComment(linkId, commentId) {
        if (!confirm('Delete this comment?')) return;

        try {
            const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
            const link = allLinks.find(l => l.id === linkId);

            if (link) {
                const comment = link.comments.find(c => c.id === commentId);

                if (comment && comment.author !== this.currentUser) {
                    this.showNotification('You can only delete your own comments', 'error');
                    return;
                }

                link.comments = link.comments.filter(c => c.id !== commentId);
                localStorage.setItem('allLinks', JSON.stringify(allLinks));
                this.showNotification('Comment deleted', 'success');
                this.renderPage();
            }
        } catch (error) {
            this.showNotification('Failed to delete comment', 'error');
        }
    }

    exportData() {
        try {
            const data = {
                users: localStorage.getItem('users'),
                allLinks: localStorage.getItem('allLinks'),
                currentUser: localStorage.getItem('currentUser'),
                exportDate: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `portalroom-backup-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);

            this.showNotification('Data exported successfully!', 'success');
        } catch (error) {
            this.showNotification('Failed to export data', 'error');
        }
    }

    importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);

                if (confirm('This will overwrite your current data. Continue?')) {
                    if (data.users) localStorage.setItem('users', data.users);
                    if (data.allLinks) localStorage.setItem('allLinks', data.allLinks);

                    this.showNotification('Data imported successfully!', 'success');
                    setTimeout(() => window.location.reload(), 1000);
                }
            } catch (error) {
                this.showNotification('Invalid backup file', 'error');
            }
        };
        reader.readAsText(file);
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
        const recentLinks = allLinks.slice(-50).reverse();

        container.innerHTML = '';

        if (recentLinks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>🔮 The ancient scrolls remain silent... No treasures have been discovered yet.</p>
                    <p>Be the first brave adventurer to <a href="register.html">join the guild</a> and contribute a legendary discovery!</p>
                </div>
            `;
            return;
        }

        recentLinks.forEach(link => {
            const linkElement = this.createLinkElement(link);
            container.appendChild(linkElement);
        });
    }

    renderDashboard() {
        const container = document.getElementById('links-list');
        if (!container) return;

        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const recentLinks = allLinks.slice(-50).reverse();

        container.innerHTML = '';

        if (recentLinks.length === 0) {
            container.innerHTML = '<p class="empty-state">No links yet. <a href="submit.html">Submit one!</a></p>';
            return;
        }

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

            if (userLinks.length === 0) {
                userLinksList.innerHTML = '<p class="empty-state">You haven\'t submitted any links yet. <a href="submit.html">Submit one!</a></p>';
            } else {
                userLinks.slice().reverse().forEach(link => {
                    const linkElement = this.createLinkElement(link);
                    userLinksList.appendChild(linkElement);
                });
            }
        }

        if (listsContainer) {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const userLists = users[this.currentUser]?.lists || [];

            listsContainer.innerHTML = '';

            if (userLists.length === 0) {
                listsContainer.innerHTML = '<p class="empty-state">You haven\'t created any lists yet. <a href="list.html">Create one!</a></p>';
            } else {
                userLists.slice().reverse().forEach(list => {
                    const listElement = this.createListElement(list);
                    listsContainer.appendChild(listElement);
                });
            }
        }
    }

    createListElement(list) {
        const element = document.createElement('div');
        element.className = 'list-item';

        const linksHTML = list.links.map(linkId => {
            const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
            const link = allLinks.find(l => l.id === linkId);
            return link ? `
                <div class="list-link-item">
                    <a href="${link.url}" target="_blank" class="list-link">${link.title}</a>
                    <button class="btn-remove-link" onclick="app.removeLinkFromList(${linkId}, ${list.id})">×</button>
                </div>
            ` : '';
        }).join('');

        element.innerHTML = `
            <div class="list-header">
                <h3>${list.name}</h3>
                <button class="btn-delete" onclick="app.deleteList(${list.id})">Delete List</button>
            </div>
            <p>${list.description}</p>
            <div class="list-links">
                ${linksHTML || '<p class="empty-state">No links in this list yet</p>'}
            </div>
        `;

        return element;
    }

    createLinkElement(link) {
        const element = document.createElement('div');
        element.className = 'link-item';

        const isAuthor = this.currentUser === link.author;
        const actionButtons = isAuthor ? `
            <div class="link-actions">
                <button class="btn-edit" onclick="app.editLink(${link.id})">Edit</button>
                <button class="btn-delete" onclick="app.deleteLink(${link.id})">Delete</button>
            </div>
        ` : '';

        const listSelector = this.currentUser ? this.createListSelector(link.id) : '';

        element.innerHTML = `
            <div class="link-header">
                <h3><a href="${link.url}" target="_blank">${link.title}</a></h3>
                ${actionButtons}
            </div>
            <p>${link.description}</p>
            <small>by ${link.author} | ${new Date(link.timestamp).toLocaleDateString()}</small>
            <div class="tags">${link.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div>
            ${listSelector}
            <div class="comments">
                <h4>Comments (${link.comments?.length || 0})</h4>
                <div class="comments-list" id="comments-${link.id}"></div>
                ${this.currentUser ? `
                    <form class="comment-form" data-link-id="${link.id}">
                        <input type="text" placeholder="Add a comment..." required>
                        <button type="submit">Comment</button>
                    </form>
                ` : '<p class="empty-state">Log in to comment</p>'}
            </div>
        `;

        const commentForm = element.querySelector('.comment-form');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => this.handleCommentSubmit(e, link.id));
        }

        this.renderComments(link.id, element);

        return element;
    }

    createListSelector(linkId) {
        if (!this.currentUser) return '';

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const userLists = users[this.currentUser]?.lists || [];

        if (userLists.length === 0) return '';

        return `
            <div class="add-to-list">
                <select id="list-selector-${linkId}">
                    <option value="">Add to list...</option>
                    ${userLists.map(list => `<option value="${list.id}">${list.name}</option>`).join('')}
                </select>
                <button onclick="app.addLinkToList(${linkId}, document.getElementById('list-selector-${linkId}').value)">Add</button>
            </div>
        `;
    }

    renderComments(linkId, element) {
        const commentsContainer = element.querySelector(`#comments-${linkId}`);
        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const link = allLinks.find(l => l.id === linkId);

        if (link && link.comments && link.comments.length > 0) {
            commentsContainer.innerHTML = '';
            link.comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';

                const isCommentAuthor = this.currentUser === comment.author;
                const deleteBtn = isCommentAuthor ?
                    `<button class="btn-delete-comment" onclick="app.deleteComment(${linkId}, ${comment.id})">×</button>` : '';

                commentElement.innerHTML = `
                    <div class="comment-content">
                        <strong>${comment.author}:</strong> ${comment.text}
                        ${deleteBtn}
                    </div>
                `;
                commentsContainer.appendChild(commentElement);
            });
        } else {
            commentsContainer.innerHTML = '<p class="empty-state">No comments yet</p>';
        }
    }

    handleCommentSubmit(e, linkId) {
        e.preventDefault();
        if (!this.currentUser) {
            this.showNotification('Please log in to comment', 'error');
            return;
        }

        const form = e.target;
        const commentText = form.querySelector('input').value.trim();

        if (!commentText) return;

        try {
            const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
            const link = allLinks.find(l => l.id === linkId);

            if (link) {
                link.comments.push({
                    id: Date.now(),
                    author: this.currentUser,
                    text: this.sanitizeHTML(commentText),
                    timestamp: new Date().toISOString()
                });

                localStorage.setItem('allLinks', JSON.stringify(allLinks));
                form.reset();
                this.showNotification('Comment added!', 'success');
                this.renderPage();
            }
        } catch (error) {
            this.showNotification('Failed to add comment', 'error');
        }
    }
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PortalRoom();
});
