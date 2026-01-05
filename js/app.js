// Portal Room - MVP Application
class PortalRoom {
    constructor() {
        this.currentUser = null;
        this.filters = {
            search: '',
            tag: 'all'
        };
        this.init();
    }

    init() {
        this.loadCurrentUser();
        this.redirectAuthenticatedFromAuthPages();
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
        div.textContent = text ?? '';
        return div.innerHTML;
    }

    validateUrl(url) {
        try {
            const parsed = new URL(url);
            return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
            return false;
        }
    }

    // Show notification messages
    showNotification(message, type = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Message variations
        const messages = {
            'success': [
                'Success!',
                'Link submitted!',
                'List created!',
                'Data exported!'
            ],
            'error': [
                'Error!',
                'Invalid input!',
                'Failed to submit!',
                'Please try again!'
            ],
            'info': [
                'Info',
                'Loading...',
                'Redirecting...',
                'Processing...'
            ]
        };

        // Add some randomness to messages
        const msgArray = messages[type] || [message];
        const selectedMessage = msgArray[Math.floor(Math.random() * msgArray.length)];
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

    redirectAuthenticatedFromAuthPages() {
        if (!this.currentUser) return;

        const authPages = ['login.html', 'register.html'];
        const currentPage = window.location.pathname.split('/').pop();

        if (authPages.includes(currentPage)) {
            this.showNotification('Already inside the guild. Taking you to the chamber...', 'info');
            setTimeout(() => window.location.href = 'dashboard.html', 600);
        }
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

            if (!this.validateUrl(url)) {
                this.showNotification('Please enter a valid URL (http/https)', 'error');
                return;
            }

            const normalizedTags = Array.from(new Set(
                tags.map(tag => tag.toLowerCase())
            ));

            const link = {
                id: Date.now(),
                url: this.sanitizeHTML(url),
                title: this.sanitizeHTML(title),
                description: this.sanitizeHTML(description),
                tags: normalizedTags.map(tag => this.sanitizeHTML(tag)).slice(0, 8),
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
        this.filters.search = e.target.value.trim().toLowerCase();
        this.applyFilters();
    }

    handleFilter(e) {
        this.filters.tag = e.target.value;
        this.applyFilters();
    }

    applyFilters() {
        this.filterLinks({
            search: this.filters.search,
            tag: this.filters.tag
        });
    }

    filterLinks(options = {}) {
        const container = document.getElementById('links-list');
        if (!container) return;

        const searchTerm = (options.search ?? this.filters.search ?? '').toLowerCase();
        const tagFilter = options.tag ?? this.filters.tag ?? 'all';
        let allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');

        if (searchTerm) {
            allLinks = allLinks.filter(link =>
                (link.title || '').toLowerCase().includes(searchTerm) ||
                (link.description || '').toLowerCase().includes(searchTerm) ||
                (link.tags || []).some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        if (tagFilter && tagFilter !== 'all') {
            allLinks = allLinks.filter(link => 
                (link.tags || []).some(tag => tag.toLowerCase() === tagFilter.toLowerCase())
            );
        }

        const recentLinks = allLinks.slice(-50).reverse();
        container.innerHTML = '';

        if (recentLinks.length === 0) {
            const emptyMessage = (searchTerm || tagFilter !== 'all') 
                ? 'No links match your search or filter'
                : 'No links yet. <a href="submit.html">Submit one!</a>';
            container.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
            return;
        }

        recentLinks.forEach(link => {
            const linkElement = this.createLinkElement(link);
            container.appendChild(linkElement);
        });
    }

    populateTagFilter() {
        const tagFilter = document.getElementById('tag-filter');
        if (!tagFilter) return;

        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const uniqueTags = Array.from(new Set(
            allLinks.flatMap(link => link.tags || [])
        )).filter(Boolean).sort((a, b) => a.localeCompare(b));

        const previousValue = tagFilter.value || this.filters.tag || 'all';
        tagFilter.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = 'all';
        defaultOption.textContent = 'All tags';
        tagFilter.appendChild(defaultOption);

        uniqueTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagFilter.appendChild(option);
        });

        tagFilter.value = uniqueTags.includes(previousValue) ? previousValue : 'all';
        this.filters.tag = tagFilter.value;
    }

    renderStats(container, allLinks) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const totalLinks = allLinks.length;
        const totalUsers = Object.keys(users).length;
        const totalComments = allLinks.reduce((sum, link) => sum + (link.comments?.length || 0), 0);
        const uniqueTags = new Set(allLinks.flatMap(link => link.tags || [])).size;

        const stats = [
            { label: 'Links Shared', value: totalLinks },
            { label: 'Users', value: totalUsers },
            { label: 'Comments', value: totalComments },
            { label: 'Tags', value: uniqueTags }
        ];

        container.innerHTML = stats.map(stat => `
            <div class="stat-card">
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');
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

        const statsContainer = document.getElementById('stats-grid');
        if (statsContainer) {
            this.renderStats(statsContainer, allLinks);
        }

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
        this.populateTagFilter();
        this.applyFilters();
    }

    renderProfile() {
        const usernameElement = document.getElementById('profile-username');
        const userLinksList = document.getElementById('user-links-list');
        const listsContainer = document.getElementById('lists-container');
        const metricsContainer = document.getElementById('profile-metrics');
        const avatar = document.getElementById('profile-avatar');

        if (usernameElement) {
            usernameElement.textContent = `${this.currentUser}'s Profile`;
        }

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const userData = users[this.currentUser] || { links: [], lists: [] };
        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const authoredComments = allLinks.reduce((sum, link) => {
            const comments = link.comments || [];
            return sum + comments.filter(c => c.author === this.currentUser).length;
        }, 0);
        const linksInLists = userData.lists?.reduce((sum, list) => sum + (list.links?.length || 0), 0) || 0;

        if (avatar) {
            avatar.textContent = (this.currentUser || 'PR').slice(0, 2).toUpperCase();
        }

        if (metricsContainer) {
            const stats = [
                { label: 'Links Posted', value: userData.links?.length || 0 },
                { label: 'Collections', value: userData.lists?.length || 0 },
                { label: 'Comments', value: authoredComments },
                { label: 'Links In Lists', value: linksInLists }
            ];

            metricsContainer.innerHTML = stats.map(stat => `
                <div class="profile-metric">
                    <div class="value">${stat.value}</div>
                    <div class="label">${stat.label}</div>
                </div>
            `).join('');
        }

        if (userLinksList) {
            const userLinks = userData.links || [];

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
            const userLists = userData.lists || [];

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
        const tags = Array.isArray(link.tags) ? link.tags : [];
        const description = link.description || '';
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
            <p>${description}</p>
            <small>by ${this.sanitizeHTML(link.author)} | ${new Date(link.timestamp).toLocaleDateString()}</small>
            <div class="tags">${tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div>
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
                        <strong>${this.sanitizeHTML(comment.author)}:</strong> ${comment.text}
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
