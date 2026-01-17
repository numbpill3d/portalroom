// Portal Room - MVP Application
class PortalRoom {
    constructor() {
        this.currentUser = null;
        this.filters = {
            search: '',
            tag: 'all',
            sort: 'newest',
            feed: 'all'
        };
        this.shownCount = 20;
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
        this.loadTheme();
        this.addThemeToggle();
        this.populateWidgets();
        this.startTicker();
    }

    // Setup page
    setupDungeonAmbiance() {
        // Placeholder for future effects
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
                        this.showNotification('returning home...', 'info');
                    }
                    break;
                case 'd':
                case 'D':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        window.location.href = 'dashboard.html';
                        this.showNotification('loading dashboard...', 'info');
                    }
                    break;
                case 's':
                case 'S':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        window.location.href = 'submit.html';
                        this.showNotification('opening submit form...', 'info');
                    }
                    break;
                case 'p':
                case 'P':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        window.location.href = 'profile.html';
                        this.showNotification('loading profile...', 'info');
                    }
                    break;
            }
        });
    }

    // Secure hash function using SHA-256 with salt
    async hashPassword(password, salt) {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password + Array.from(salt).join('')),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );
        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt']
        );
        const exportedKey = await crypto.subtle.exportKey('raw', key);
        return Array.from(new Uint8Array(exportedKey)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Sanitize HTML to prevent XSS
    sanitizeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text ?? '';
        return div.innerHTML;
    }

    // Simple markdown parser
    simpleMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
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
        notification.textContent = message;
        
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
            this.showNotification('already logged in, redirecting...', 'info');
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

        // Sort
        const sortFilter = document.getElementById('sort-filter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => this.handleSort(e));
        }

        // Feed filter
        const feedFilter = document.getElementById('feed-filter');
        if (feedFilter) {
            feedFilter.addEventListener('change', (e) => this.handleFeedFilter(e));
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

        // GitHub Gists
        const exportGistBtn = document.getElementById('export-gist');
        if (exportGistBtn) {
            exportGistBtn.addEventListener('click', () => this.exportToGist());
        }

        const importGistBtn = document.getElementById('import-gist');
        if (importGistBtn) {
            importGistBtn.addEventListener('click', () => this.importFromGist());
        }

        // Fetch meta from URL
        const fetchMetaBtn = document.getElementById('fetch-meta');
        if (fetchMetaBtn) {
            fetchMetaBtn.addEventListener('click', () => this.fetchMetaFromUrl());
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        try {
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            if (!username || !password) {
                this.showNotification('Please enter both username and password', 'error');
                return;
            }

            // Check rate limiting
            const failedAttempts = JSON.parse(localStorage.getItem('failedAttempts') || '{}');
            const userAttempts = failedAttempts[username] || { count: 0, lockUntil: 0 };
            const now = Date.now();
            if (userAttempts.lockUntil > now) {
                const remaining = Math.ceil((userAttempts.lockUntil - now) / 60000);
                this.showNotification(`Account locked. Try again in ${remaining} minutes.`, 'error');
                return;
            }

            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const user = users[username];
            if (!user) {
                this.incrementFailedAttempts(username, failedAttempts);
                this.showNotification('Invalid credentials', 'error');
                return;
            }

            let isValid = false;
            if (typeof user.password === 'string') {
                // Old hash, migrate
                const oldHashed = this.hashPasswordOld(password);
                if (user.password === oldHashed) {
                    // Migrate to new hash
                    const salt = crypto.getRandomValues(new Uint8Array(16));
                    const newHashed = await this.hashPassword(password, salt);
                    user.password = newHashed;
                    user.salt = Array.from(salt);
                    localStorage.setItem('users', JSON.stringify(users));
                    isValid = true;
                }
            } else {
                // New hash
                const hashedPassword = await this.hashPassword(password, new Uint8Array(user.salt));
                if (user.password === hashedPassword) {
                    isValid = true;
                }
            }

            if (isValid) {
                // Reset failed attempts on success
                delete failedAttempts[username];
                localStorage.setItem('failedAttempts', JSON.stringify(failedAttempts));
                this.currentUser = username;
                localStorage.setItem('currentUser', username);
                this.showNotification('Login successful!', 'success');
                setTimeout(() => window.location.href = 'dashboard.html', 500);
            } else {
                this.incrementFailedAttempts(username, failedAttempts);
                this.showNotification('Invalid credentials', 'error');
            }
        } catch (error) {
            this.showNotification('Login failed. Please try again.', 'error');
        }
    }

    incrementFailedAttempts(username, failedAttempts) {
        const userAttempts = failedAttempts[username] || { count: 0, lockUntil: 0 };
        userAttempts.count++;
        if (userAttempts.count >= 5) {
            userAttempts.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
        }
        failedAttempts[username] = userAttempts;
        localStorage.setItem('failedAttempts', JSON.stringify(failedAttempts));
    }

    // Old hash function for migration
    hashPasswordOld(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    async handleRegister(e) {
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

            const salt = crypto.getRandomValues(new Uint8Array(16));
            const hashedPassword = await this.hashPassword(password, salt);

            users[username] = {
                password: hashedPassword,
                salt: Array.from(salt),
                links: [],
                lists: [],
                favorites: [],
                follows: [],
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
            const category = document.getElementById('link-category').value;
            const button = document.getElementById('link-button').value.trim();
            const tags = document.getElementById('link-tags').value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag);
            
            // Get thumbnail from preview or empty string
            const thumbnailImg = document.getElementById('thumbnail-img');
            const thumbnail = thumbnailImg && thumbnailImg.src && thumbnailImg.src.startsWith('http') ? thumbnailImg.src : '';

            if (!url || !title) {
                this.showNotification('URL and title are required', 'error');
                return;
            }

            if (!category) {
                this.showNotification('Please select a category', 'error');
                return;
            }

            if (!this.validateUrl(url)) {
                this.showNotification('Please enter a valid URL (http/https)', 'error');
                return;
            }

            if (button && !this.validateUrl(button)) {
                this.showNotification('Please enter a valid button URL', 'error');
                return;
            }

            const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
            if (allLinks.some(link => link.url === url)) {
                this.showNotification('This URL has already been submitted', 'error');
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
                category: this.sanitizeHTML(category),
                tags: normalizedTags.map(tag => this.sanitizeHTML(tag)).slice(0, 8),
                thumbnail: thumbnail,
                button: button ? this.sanitizeHTML(button) : '',
                author: this.currentUser,
                timestamp: new Date().toISOString(),
                comments: [],
                upvotes: 0,
                downvotes: 0
            };

            const users = JSON.parse(localStorage.getItem('users') || '{}');
            users[this.currentUser].links.push(link);
            localStorage.setItem('users', JSON.stringify(users));

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

    handleSort(e) {
        this.filters.sort = e.target.value;
        this.applyFilters();
    }

    handleFeedFilter(e) {
        this.filters.feed = e.target.value;
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
        const sortBy = options.sort ?? this.filters.sort ?? 'newest';
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

        // Feed filter
        const feedBy = options.feed ?? this.filters.feed ?? 'all';
        if (feedBy === 'feed' && this.currentUser) {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const followed = users[this.currentUser]?.follows || [];
            allLinks = allLinks.filter(link => followed.includes(link.author));
        }

        // Sort
        if (sortBy === 'oldest') {
            allLinks.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        } else if (sortBy === 'most-upvoted') {
            allLinks.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
        } else if (sortBy === 'least-upvoted') {
            allLinks.sort((a, b) => (a.upvotes || 0) - (b.upvotes || 0));
        } else {
            allLinks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }

        const recentLinks = allLinks.slice(0, this.shownCount);
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

        if (allLinks.length > this.shownCount) {
            const loadMore = document.createElement('button');
            loadMore.textContent = 'Load More';
            loadMore.className = 'btn-primary';
            loadMore.style.cssText = 'margin: 1rem auto; display: block;';
            loadMore.addEventListener('click', () => {
                this.loadMoreLinks();
            });
            container.appendChild(loadMore);
        }
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

    voteLink(linkId, type) {
        if (!this.currentUser) {
            this.showNotification('Please log in to vote', 'error');
            return;
        }

        try {
            const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
            const link = allLinks.find(l => l.id === linkId);

            if (!link) return;

            if (!link.votes) link.votes = {};
            if (!link.upvotes) link.upvotes = 0;
            if (!link.downvotes) link.downvotes = 0;

            const previousVote = link.votes[this.currentUser];

            if (previousVote === type) {
                // Remove vote
                delete link.votes[this.currentUser];
                link[type + 'votes']--;
            } else {
                if (previousVote) {
                    link[previousVote + 'votes']--;
                }
                link.votes[this.currentUser] = type;
                link[type + 'votes']++;
            }

            localStorage.setItem('allLinks', JSON.stringify(allLinks));
            this.showNotification(`Vote ${type}voted!`, 'success');
            this.renderPage();
        } catch (error) {
            this.showNotification('Failed to vote', 'error');
        }
    }

    isFavorite(linkId) {
        if (!this.currentUser) return false;
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        return (users[this.currentUser]?.favorites || []).includes(linkId);
    }

    toggleFavorite(linkId) {
        if (!this.currentUser) {
            this.showNotification('Please log in to favorite', 'error');
            return;
        }

        try {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            if (!users[this.currentUser].favorites) users[this.currentUser].favorites = [];
            const index = users[this.currentUser].favorites.indexOf(linkId);
            if (index > -1) {
                users[this.currentUser].favorites.splice(index, 1);
                this.showNotification('Removed from favorites', 'info');
            } else {
                users[this.currentUser].favorites.push(linkId);
                this.showNotification('Added to favorites!', 'success');
            }
            localStorage.setItem('users', JSON.stringify(users));
            this.renderPage();
        } catch (error) {
            this.showNotification('Failed to toggle favorite', 'error');
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

    exportToGist() {
        const token = document.getElementById('github-token').value;
        if (!token) {
            this.showNotification('Enter GitHub token', 'error');
            return;
        }
        const data = {
            users: localStorage.getItem('users'),
            allLinks: localStorage.getItem('allLinks'),
            currentUser: localStorage.getItem('currentUser')
        };
        fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: 'Portal Room Data Backup',
                public: false,
                files: {
                    'portalroom-data.json': { content: JSON.stringify(data) }
                }
            })
        }).then(res => res.json()).then(gist => {
            localStorage.setItem('gistId', gist.id);
            this.showNotification('Exported to Gist!', 'success');
        }).catch(err => {
            console.error(err);
            this.showNotification('Export failed (check token/CORS)', 'error');
        });
    }

    importFromGist() {
        const token = document.getElementById('github-token').value;
        const id = document.getElementById('gist-id').value;
        if (!token || !id) {
            this.showNotification('Enter token and Gist ID', 'error');
            return;
        }
        fetch(`https://api.github.com/gists/${id}`, {
            headers: { 'Authorization': `token ${token}` }
        }).then(res => res.json()).then(gist => {
            const content = JSON.parse(gist.files['portalroom-data.json'].content);
            if (confirm('Overwrite local data?')) {
                if (content.users) localStorage.setItem('users', content.users);
                if (content.allLinks) localStorage.setItem('allLinks', content.allLinks);
                if (content.currentUser) localStorage.setItem('currentUser', content.currentUser);
                location.reload();
            }
        }).catch(err => {
            console.error(err);
            this.showNotification('Import failed (check token/ID/CORS)', 'error');
        });
    }

    fetchMetaFromUrl() {
        const urlInput = document.getElementById('link-url');
        const titleInput = document.getElementById('link-title');
        const descInput = document.getElementById('link-description');
        const fetchBtn = document.getElementById('fetch-meta');
        const thumbnailPreview = document.getElementById('thumbnail-preview');
        const thumbnailImg = document.getElementById('thumbnail-img');
        const url = urlInput.value.trim();

        if (!url) {
            this.showNotification('Please enter a URL first', 'error');
            return;
        }

        if (!this.validateUrl(url)) {
            this.showNotification('Please enter a valid URL', 'error');
            return;
        }

        this.showNotification('Fetching metadata...', 'info');
        if (fetchBtn) fetchBtn.disabled = true;

        // Note: CORS may prevent fetching from many sites. This is a demo implementation.
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch');
                return response.text();
            })
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const title = doc.querySelector('title')?.textContent || '';
                const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                                   doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
                
                // Try to get thumbnail from various meta tags
                let thumbnail = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                               doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
                               doc.querySelector('link[rel="icon"]')?.getAttribute('href') ||
                               doc.querySelector('link[rel="shortcut icon"]')?.getAttribute('href') ||
                               '';
                
                // If thumbnail is relative, make it absolute
                if (thumbnail && !thumbnail.startsWith('http')) {
                    try {
                        const baseUrl = new URL(url);
                        thumbnail = new URL(thumbnail, baseUrl.origin).href;
                    } catch (e) {
                        thumbnail = '';
                    }
                }

                if (title && !titleInput.value) {
                    titleInput.value = title.trim();
                }
                if (description && !descInput.value) {
                    descInput.value = description.trim();
                }
                
                // Display thumbnail preview
                if (thumbnail && thumbnailImg && thumbnailPreview) {
                    thumbnailImg.src = thumbnail;
                    thumbnailImg.onerror = () => {
                        thumbnailPreview.style.display = 'none';
                        thumbnailImg.src = '';
                    };
                    thumbnailImg.onload = () => {
                        thumbnailPreview.style.display = 'block';
                    };
                }

                this.showNotification('Metadata fetched!', 'success');
            })
            .catch(error => {
                console.error(error);
                this.showNotification('Could not fetch metadata (CORS or network issue)', 'error');
            })
            .finally(() => {
                if (fetchBtn) fetchBtn.disabled = false;
            });
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
            case 'view-list.html':
                this.renderViewList();
                break;
            case 'top-links.html':
                this.renderTopLinks();
                break;
            case 'tags.html':
                this.renderTags();
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
                    <p>No links have been submitted yet.</p>
                    <p><a href="register.html">Register</a> to submit the first link to the archive.</p>
                </div>
            `;
            return;
        }

        recentLinks.forEach(link => {
            const linkElement = this.createLinkElement(link);
            container.appendChild(linkElement);
        });
    }

    renderTopLinks() {
        const container = document.getElementById('links-list');
        if (!container) return;

        let allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        allLinks = allLinks.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
        const topLinks = allLinks.slice(0, 50);

        container.innerHTML = '';

        const statsContainer = document.getElementById('stats-grid');
        if (statsContainer) {
            this.renderStats(statsContainer, allLinks);
        }

        if (topLinks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No top links yet. Start voting on links!</p>
                </div>
            `;
            return;
        }

        topLinks.forEach(link => {
            const linkElement = this.createLinkElement(link);
            container.appendChild(linkElement);
        });
    }

    renderTags() {
        const container = document.getElementById('tags-list');
        if (!container) return;

        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const tagCounts = {};
        allLinks.forEach(link => {
            (link.tags || []).forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

        container.innerHTML = '';

        if (sortedTags.length === 0) {
            container.innerHTML = '<p class="empty-state">No tags yet. Start adding tags to links!</p>';
            return;
        }

        const tagCloud = document.createElement('div');
        tagCloud.className = 'tag-cloud';
        tagCloud.innerHTML = sortedTags.map(([tag, count]) => `
            <a href="dashboard.html?tag=${encodeURIComponent(tag)}" class="tag-link">${tag} (${count})</a>
        `).join('');
        container.appendChild(tagCloud);
    }

    renderDashboard() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('tag')) {
            this.filters.tag = urlParams.get('tag');
        }
        this.populateTagFilter();
        // Add feed filter if logged in
        if (this.currentUser) {
            const searchFilter = document.querySelector('.search-filter');
            if (searchFilter) {
                const existing = document.getElementById('feed-filter');
                if (!existing) {
                    const feedSelect = document.createElement('select');
                    feedSelect.id = 'feed-filter';
                    feedSelect.innerHTML = '<option value="all">All Links</option><option value="feed">My Feed</option>';
                    feedSelect.value = this.filters.feed;
                    searchFilter.appendChild(feedSelect);
                }
            }
        }
        this.applyFilters();
    }

    renderProfile() {
        const usernameElement = document.getElementById('profile-username');
        const userLinksList = document.getElementById('user-links-list');
        const listsContainer = document.getElementById('lists-container');
        const metricsContainer = document.getElementById('profile-metrics');
        const avatar = document.getElementById('profile-avatar');
        const taglineElement = document.getElementById('profile-tagline');
        const bioContent = document.getElementById('bio-content');
        const bioTextarea = document.getElementById('profile-bio');
        const memberSince = document.getElementById('member-since');

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const userData = users[this.currentUser] || { links: [], lists: [], bio: '', customCSS: '', bgImage: '', bgStyle: 'tiled' };
        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');

        if (usernameElement) {
            usernameElement.textContent = `${this.currentUser}`;
        }

        if (taglineElement && userData.bio) {
            taglineElement.textContent = userData.bio.substring(0, 100);
        }

        if (bioContent) {
            bioContent.textContent = userData.bio || 'No bio set yet.';
        }

        if (bioTextarea) {
            bioTextarea.value = userData.bio || '';
        }

        if (memberSince && userData.joinedAt) {
            const joined = new Date(userData.joinedAt);
            memberSince.textContent = joined.toLocaleDateString();
        }

        // Load custom background
        const profileHero = document.getElementById('profile-hero-container');
        if (profileHero && userData.bgImage) {
            if (userData.bgStyle === 'tiled') {
                profileHero.style.backgroundImage = `url(${userData.bgImage})`;
                profileHero.style.backgroundSize = 'auto';
                profileHero.style.backgroundRepeat = 'repeat';
            } else {
                profileHero.style.backgroundImage = `url(${userData.bgImage})`;
                profileHero.style.backgroundSize = 'cover';
                profileHero.style.backgroundPosition = 'center';
            }
        }

        // Load custom CSS
        const customCSSElement = document.getElementById('user-custom-css');
        const cssEditor = document.getElementById('custom-css-editor');
        if (customCSSElement && userData.customCSS) {
            customCSSElement.textContent = userData.customCSS;
        }
        if (cssEditor) {
            cssEditor.value = userData.customCSS || '';
        }

        // Load background preview
        const bgPreview = document.getElementById('bg-preview');
        const bgUrlInput = document.getElementById('profile-bg-url');
        if (bgPreview && bgUrlInput) {
            bgUrlInput.value = userData.bgImage || '';
            if (userData.bgImage) {
                bgPreview.style.backgroundImage = `url(${userData.bgImage})`;
                bgPreview.style.backgroundSize = userData.bgStyle === 'tiled' ? 'auto' : 'cover';
            }
        }

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
                { label: 'Favorites', value: userData.favorites?.length || 0 }
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
                userLinksList.innerHTML = '<p class="empty-state">No links submitted yet.</p>';
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
                listsContainer.innerHTML = '<p class="empty-state">No lists created yet.</p>';
            } else {
                userLists.slice().reverse().forEach(list => {
                    const listElement = this.createListElement(list);
                    listsContainer.appendChild(listElement);
                });
            }
        }

        const favoritesContainer = document.getElementById('favorites-container');
        if (favoritesContainer) {
            const userFavorites = userData.favorites || [];

            favoritesContainer.innerHTML = '';

            if (userFavorites.length === 0) {
                favoritesContainer.innerHTML = '<p class="empty-state">No favorites yet.</p>';
            } else {
                userFavorites.forEach(linkId => {
                    const link = allLinks.find(l => l.id === linkId);
                    if (link) {
                        const linkElement = this.createLinkElement(link);
                        favoritesContainer.appendChild(linkElement);
                    }
                });
            }
        }

        // Add GitHub sync if not present
        const dataManagement = document.querySelector('.data-management');
        if (dataManagement) {
            const existing = dataManagement.querySelector('#github-token');
            if (!existing) {
                dataManagement.innerHTML += `
                    <h4>GitHub Gists Sync</h4>
                    <input type="password" id="github-token" placeholder="GitHub Personal Access Token">
                    <button id="export-gist" class="btn-export">export to gist</button>
                    <input type="text" id="gist-id" placeholder="Gist ID to Import">
                    <button id="import-gist" class="btn-import">import from gist</button>
                `;
            }
        }

        // Populate profile widgets
        this.populateProfileWidgets();
    }

    renderViewList() {
        const urlParams = new URLSearchParams(window.location.search);
        const listId = parseInt(urlParams.get('id'));

        if (!listId) {
            document.getElementById('list-view-container').innerHTML = '<p class="empty-state">Invalid list ID</p>';
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        let foundList = null;
        let listAuthor = null;

        for (const username in users) {
            const userLists = users[username].lists || [];
            const list = userLists.find(l => l.id === listId);
            if (list) {
                foundList = list;
                listAuthor = username;
                break;
            }
        }

        if (!foundList) {
            document.getElementById('list-view-container').innerHTML = '<p class="empty-state">List not found</p>';
            return;
        }

        const listDetails = document.getElementById('list-details');
        const listLinks = document.getElementById('list-links');

        listDetails.innerHTML = `
            <h2>${foundList.name}</h2>
            <p>${foundList.description}</p>
            <small>Created by ${listAuthor} | ${new Date(foundList.timestamp).toLocaleDateString()}</small>
        `;

        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const links = (foundList.links || []).map(linkId => allLinks.find(l => l.id === linkId)).filter(Boolean);

        listLinks.innerHTML = '';

        if (links.length === 0) {
            listLinks.innerHTML = '<p class="empty-state">No links in this list yet</p>';
        } else {
            links.forEach(link => {
                const linkElement = this.createLinkElement(link);
                listLinks.appendChild(linkElement);
            });
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
                <h3><a href="view-list.html?id=${list.id}" style="color: var(--accent); text-decoration: none;">${list.name}</a></h3>
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
        const category = link.category || '';
        const button = link.button || '';
        
        const actionButtons = isAuthor ? `
            <div class="link-actions">
                <button class="btn-edit" onclick="app.editLink(${link.id})">Edit</button>
                <button class="btn-delete" onclick="app.deleteLink(${link.id})">Delete</button>
            </div>
        ` : '';

        const listSelector = this.currentUser ? this.createListSelector(link.id) : '';
        const upvotes = link.upvotes || 0;
        const downvotes = link.downvotes || 0;
        
        const categoryBadge = category ? `<span class="tag" style="background: var(--accent); color: var(--bg); font-weight: bold;">[${category}]</span>` : '';
        const buttonDisplay = button ? `<div style="margin: 0.5rem 0;"><img src="${button}" alt="site button" style="max-width: 88px; height: auto; border: 1px solid var(--edge); image-rendering: pixelated;" onerror="this.style.display='none'"></div>` : '';

        element.innerHTML = `
            <div class="link-header">
                <h3><a href="${link.url}" target="_blank">${link.title}</a></h3>
                ${actionButtons}
            </div>
            ${link.thumbnail ? `<img src="${link.thumbnail}" alt="Thumbnail" class="link-thumbnail" onerror="this.style.display='none'">` : ''}
            ${buttonDisplay}
            <p>${this.simpleMarkdown(description)}</p>
            <small>by ${this.sanitizeHTML(link.author)} | ${new Date(link.timestamp).toLocaleDateString()}</small>
            <div class="tags">${categoryBadge} ${tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div>
            ${listSelector}
            <div class="voting">
                <button onclick="app.voteLink(${link.id}, 'up')" class="vote-btn up">👍 ${upvotes}</button>
                <button onclick="app.voteLink(${link.id}, 'down')" class="vote-btn down">👎 ${downvotes}</button>
                ${this.currentUser ? `<button onclick="app.toggleFavorite(${link.id})" class="favorite-btn">${this.isFavorite(link.id) ? '⭐' : '☆'} Favorite</button>` : ''}
            </div>
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
                        <strong>${this.sanitizeHTML(comment.author)}:</strong> ${this.simpleMarkdown(this.sanitizeHTML(comment.text))}
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

    loadTheme() {
        const theme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', theme);
    }

    loadMoreLinks() {
        this.shownCount += 20;
        this.filterLinks();
    }

    followUser(username) {
        if (!username || username === this.currentUser) return;
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (!users[username]) {
            this.showNotification('User not found', 'error');
            return;
        }
        if (!users[this.currentUser].follows) users[this.currentUser].follows = [];
        if (!users[this.currentUser].follows.includes(username)) {
            users[this.currentUser].follows.push(username);
            localStorage.setItem('users', JSON.stringify(users));
            this.showNotification(`Following ${username}`, 'success');
            this.renderPage();
        }
    }

    unfollowUser(username) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[this.currentUser].follows) {
            users[this.currentUser].follows = users[this.currentUser].follows.filter(u => u !== username);
            localStorage.setItem('users', JSON.stringify(users));
            this.showNotification(`Unfollowed ${username}`, 'info');
            this.renderPage();
        }
    }

    toggleTheme() {
        const current = document.body.getAttribute('data-theme') || 'dark';
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.showNotification(`Switched to ${newTheme} mode`, 'info');
    }

    addThemeToggle() {
        const nav = document.querySelector('nav');
        if (!nav) return;

        const button = document.createElement('a');
        button.href = '#';
        button.textContent = '🌙';
        button.style.cssText = 'font-size: 1.5rem; padding: 0.5rem; cursor: pointer;';
        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleTheme();
        });
        nav.appendChild(button);

        // Add RSS link
        const rssLink = document.createElement('a');
        rssLink.href = '#';
        rssLink.textContent = 'RSS';
        rssLink.style.cssText = 'padding: 0.65rem 1.2rem;';
        rssLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.generateRSS();
        });
        nav.appendChild(rssLink);
    }

    generateRSS() {
        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const rssItems = allLinks.map(link => `
<item>
<title><![CDATA[${link.title}]]></title>
<link>${link.url}</link>
<description><![CDATA[${link.description}]]></description>
<pubDate>${new Date(link.timestamp).toUTCString()}</pubDate>
</item>`).join('');

        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Portal Room Links</title>
<description>Latest links from Portal Room</description>
<link>${window.location.origin}</link>
${rssItems}
</channel>
</rss>`;

        const blob = new Blob([rss], { type: 'application/rss+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portalroom-feed.xml';
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('RSS feed downloaded!', 'success');
    }

    // Populate sidebar widgets
    populateWidgets() {
        this.populateStatsWidget();
        this.populateTagsWidget();
        this.populateUsersWidget();
        this.populateRecentWidget();
        this.populateTopWidget();
        this.populateUserLinksWidget();
    }

    populateStatsWidget() {
        const container = document.getElementById('widget-stats');
        if (!container) return;

        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const totalLinks = allLinks.length;
        const totalUsers = Object.keys(users).length;
        const totalComments = allLinks.reduce((sum, link) => sum + (link.comments?.length || 0), 0);

        container.innerHTML = `
            <div class="widget-stat">
                <span class="widget-stat-label">Total Links</span>
                <span class="widget-stat-value">${totalLinks}</span>
            </div>
            <div class="widget-stat">
                <span class="widget-stat-label">Users</span>
                <span class="widget-stat-value">${totalUsers}</span>
            </div>
            <div class="widget-stat">
                <span class="widget-stat-label">Comments</span>
                <span class="widget-stat-value">${totalComments}</span>
            </div>
        `;
    }

    populateTagsWidget() {
        const container = document.getElementById('widget-tags');
        if (!container) return;

        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const tagCounts = {};
        allLinks.forEach(link => {
            (link.tags || []).forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        if (sortedTags.length === 0) {
            container.innerHTML = '<p style="color: var(--muted); font-size: 0.85rem;">No tags yet</p>';
            return;
        }

        container.innerHTML = sortedTags.map(([tag, count]) => `
            <a href="dashboard.html?tag=${encodeURIComponent(tag)}" class="tag-widget-item">${tag} (${count})</a>
        `).join('');
    }

    populateUsersWidget() {
        const container = document.getElementById('widget-users');
        if (!container) return;

        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const userCounts = {};
        allLinks.forEach(link => {
            userCounts[link.author] = (userCounts[link.author] || 0) + 1;
        });

        const topUsers = Object.entries(userCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (topUsers.length === 0) {
            container.innerHTML = '<p style="color: var(--muted); font-size: 0.85rem;">No users yet</p>';
            return;
        }

        container.innerHTML = topUsers.map(([user, count]) => `
            <div class="widget-item">
                <span style="color: var(--text);">${this.sanitizeHTML(user)}</span>
                <span style="color: var(--accent); font-weight: bold; font-size: 0.8rem;">${count}</span>
            </div>
        `).join('');
    }

    populateRecentWidget() {
        const container = document.getElementById('widget-recent');
        if (!container) return;

        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const recentLinks = allLinks.slice(-5).reverse();

        if (recentLinks.length === 0) {
            container.innerHTML = '<p style="color: var(--muted); font-size: 0.85rem;">No links yet</p>';
            return;
        }

        container.innerHTML = recentLinks.map(link => `
            <div class="widget-item">
                <a href="${link.url}" target="_blank" title="${this.sanitizeHTML(link.title)}">${this.sanitizeHTML(link.title)}</a>
            </div>
        `).join('');
    }

    populateTopWidget() {
        const container = document.getElementById('widget-top');
        if (!container) return;

        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const topLinks = allLinks
            .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
            .slice(0, 5);

        if (topLinks.length === 0) {
            container.innerHTML = '<p style="color: var(--muted); font-size: 0.85rem;">No links yet</p>';
            return;
        }

        container.innerHTML = topLinks.map(link => `
            <div class="widget-item">
                <a href="${link.url}" target="_blank" title="${this.sanitizeHTML(link.title)}">${this.sanitizeHTML(link.title)}</a>
                <span style="color: var(--accent); font-weight: bold; font-size: 0.8rem; margin-left: 0.3rem;">↑${link.upvotes || 0}</span>
            </div>
        `).join('');
    }

    populateUserLinksWidget() {
        const container = document.getElementById('widget-user-links');
        if (!container || !this.currentUser) return;

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const userLinks = users[this.currentUser]?.links || [];
        const recentLinks = userLinks.slice(-5).reverse();

        if (recentLinks.length === 0) {
            container.innerHTML = '<p style="color: var(--muted); font-size: 0.85rem;">No links submitted yet</p>';
            return;
        }

        container.innerHTML = recentLinks.map(link => `
            <div class="widget-item">
                <a href="${link.url}" target="_blank" title="${this.sanitizeHTML(link.title)}">${this.sanitizeHTML(link.title)}</a>
            </div>
        `).join('');
    }

    // Start ticker animation
    startTicker() {
        const ticker = document.getElementById('ticker');
        if (!ticker) return;

        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const recentLinks = allLinks.slice(-20).reverse();

        if (recentLinks.length === 0) {
            ticker.innerHTML = '<span class="ticker-item">No recent links</span>';
            return;
        }

        // Duplicate items for seamless loop
        const items = [...recentLinks, ...recentLinks];
        
        ticker.innerHTML = items.map(link => `
            <span class="ticker-item">
                <a href="${link.url}" target="_blank">${this.sanitizeHTML(link.title)}</a>
                <span style="color: var(--muted);">by ${this.sanitizeHTML(link.author)}</span>
            </span>
        `).join('');
    }

    // Profile customization functions
    saveBio() {
        if (!this.currentUser) return;
        
        const bioTextarea = document.getElementById('profile-bio');
        const bio = bioTextarea.value.trim();
        
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (!users[this.currentUser]) return;
        
        users[this.currentUser].bio = bio;
        localStorage.setItem('users', JSON.stringify(users));
        
        this.showNotification('Bio saved!', 'success');
        this.renderPage();
    }

    setBackground(style) {
        if (!this.currentUser) return;
        
        const bgUrlInput = document.getElementById('profile-bg-url');
        const bgUrl = bgUrlInput.value.trim();
        
        if (!bgUrl) {
            this.showNotification('Enter a background image URL first', 'error');
            return;
        }
        
        if (!this.validateUrl(bgUrl)) {
            this.showNotification('Enter a valid image URL', 'error');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (!users[this.currentUser]) return;
        
        users[this.currentUser].bgImage = bgUrl;
        users[this.currentUser].bgStyle = style;
        localStorage.setItem('users', JSON.stringify(users));
        
        this.showNotification(`Background set as ${style}!`, 'success');
        this.renderPage();
    }

    clearBackground() {
        if (!this.currentUser) return;
        
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (!users[this.currentUser]) return;
        
        users[this.currentUser].bgImage = '';
        users[this.currentUser].bgStyle = 'tiled';
        localStorage.setItem('users', JSON.stringify(users));
        
        this.showNotification('Background cleared!', 'success');
        this.renderPage();
    }

    saveCustomCSS() {
        if (!this.currentUser) return;
        
        const cssEditor = document.getElementById('custom-css-editor');
        const customCSS = cssEditor.value.trim();
        
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (!users[this.currentUser]) return;
        
        users[this.currentUser].customCSS = customCSS;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Apply CSS immediately
        const styleElement = document.getElementById('user-custom-css');
        if (styleElement) {
            styleElement.textContent = customCSS;
        }
        
        this.showNotification('Custom CSS applied!', 'success');
    }

    clearCustomCSS() {
        if (!this.currentUser) return;
        
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (!users[this.currentUser]) return;
        
        users[this.currentUser].customCSS = '';
        localStorage.setItem('users', JSON.stringify(users));
        
        const styleElement = document.getElementById('user-custom-css');
        if (styleElement) {
            styleElement.textContent = '';
        }
        
        const cssEditor = document.getElementById('custom-css-editor');
        if (cssEditor) {
            cssEditor.value = '';
        }
        
        this.showNotification('Custom CSS cleared!', 'success');
    }

    populateProfileWidgets() {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const userData = users[this.currentUser] || {};
        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        
        // Profile stats widget
        const profileStatsWidget = document.getElementById('profile-widget-stats');
        if (profileStatsWidget) {
            const totalUpvotes = (userData.links || []).reduce((sum, link) => sum + (link.upvotes || 0), 0);
            const totalComments = allLinks.reduce((sum, link) => {
                const comments = link.comments || [];
                return sum + comments.filter(c => c.author === this.currentUser).length;
            }, 0);
            
            profileStatsWidget.innerHTML = `
                <div class="widget-stat">
                    <span class="widget-stat-label">Total Upvotes</span>
                    <span class="widget-stat-value">${totalUpvotes}</span>
                </div>
                <div class="widget-stat">
                    <span class="widget-stat-label">Comments Made</span>
                    <span class="widget-stat-value">${totalComments}</span>
                </div>
                <div class="widget-stat">
                    <span class="widget-stat-label">Following</span>
                    <span class="widget-stat-value">${userData.follows?.length || 0}</span>
                </div>
            `;
        }
        
        // Following widget
        const followingWidget = document.getElementById('widget-following');
        if (followingWidget) {
            const userFollows = userData.follows || [];
            
            if (userFollows.length === 0) {
                followingWidget.innerHTML = '<p style="color: var(--muted); font-size: 0.85rem;">Not following anyone</p>';
            } else {
                followingWidget.innerHTML = userFollows.map(user => `
                    <div class="widget-item">
                        <span style="color: var(--text);">${this.sanitizeHTML(user)}</span>
                    </div>
                `).join('');
            }
        }
        
        // User activity widget
        const activityWidget = document.getElementById('widget-user-activity');
        if (activityWidget) {
            const recentUserLinks = (userData.links || []).slice(-3).reverse();
            
            if (recentUserLinks.length === 0) {
                activityWidget.innerHTML = '<p style="color: var(--muted); font-size: 0.85rem;">No recent activity</p>';
            } else {
                activityWidget.innerHTML = recentUserLinks.map(link => `
                    <div class="widget-item">
                        <a href="${link.url}" target="_blank" title="${this.sanitizeHTML(link.title)}">${this.sanitizeHTML(link.title)}</a>
                    </div>
                `).join('');
            }
        }
    }
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PortalRoom();
});
