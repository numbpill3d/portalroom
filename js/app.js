// Portal Room - Enhanced Retro 00s Edition
class PortalRoom {
    constructor() {
        this.currentUser = null;
        this.modalOpen = null;
        this.init();
    }

    init() {
        this.loadCurrentUser();
        this.checkAuth();
        this.setupEventListeners();
        this.renderPage();
        this.initializeUserData();
    }

    // Initialize user data structures
    initializeUserData() {
        if (!this.currentUser) return;

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const user = users[this.currentUser];

        if (user && !user.profile) {
            user.profile = {
                bio: 'Hello! I love sharing interesting links.',
                avatar: this.getInitial(this.currentUser),
                joinedAt: user.joinedAt || new Date().toISOString(),
                karma: 0,
                badges: ['active'],
                bookmarks: [],
                following: [],
                followers: []
            };
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    getInitial(username) {
        return username ? username[0].toUpperCase() : '?';
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
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
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

        // Profile edit button
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.showEditProfileModal());
        }

        // Close modal on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab')) {
                this.switchTab(e.target);
            }
        });
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
                this.showNotification('Login successful! Welcome back! 🌟', 'success');
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
                joinedAt: new Date().toISOString(),
                profile: {
                    bio: 'Hello! I love sharing interesting links.',
                    avatar: this.getInitial(username),
                    karma: 0,
                    badges: ['founder'],
                    bookmarks: [],
                    following: [],
                    followers: []
                }
            };
            localStorage.setItem('users', JSON.stringify(users));

            this.currentUser = username;
            localStorage.setItem('currentUser', username);
            this.showNotification('Registration successful! Welcome to Portal Room! 🎉', 'success');
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
            const category = document.getElementById('link-category')?.value || 'other';
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
                category: category,
                tags: tags.map(tag => this.sanitizeHTML(tag)),
                author: this.currentUser,
                timestamp: new Date().toISOString(),
                comments: [],
                votes: { up: [], down: [] },
                views: 0,
                bookmarkedBy: []
            };

            const users = JSON.parse(localStorage.getItem('users') || '{}');
            users[this.currentUser].links.push(link);

            // Award karma for posting
            if (users[this.currentUser].profile) {
                users[this.currentUser].profile.karma += 5;
                this.checkBadges(users[this.currentUser]);
            }

            localStorage.setItem('users', JSON.stringify(users));

            const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
            allLinks.push(link);
            localStorage.setItem('allLinks', JSON.stringify(allLinks));

            this.showNotification('Link submitted successfully! +5 karma 🌟', 'success');
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
            const isPublic = document.getElementById('list-public')?.checked !== false;

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
                timestamp: new Date().toISOString(),
                isPublic: isPublic
            };

            const users = JSON.parse(localStorage.getItem('users') || '{}');
            users[this.currentUser].lists.push(list);
            localStorage.setItem('users', JSON.stringify(users));

            this.showNotification('List created successfully! 📋', 'success');
            setTimeout(() => window.location.href = 'profile.html', 500);
        } catch (error) {
            this.showNotification('Failed to create list. Please try again.', 'error');
        }
    }

    handleLogout(e) {
        e.preventDefault();
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showNotification('Logged out successfully. See you soon! 👋', 'success');
        setTimeout(() => window.location.href = 'index.html', 500);
    }

    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        this.filterLinks({ search: query });
    }

    filterLinks(options = {}) {
        const container = document.getElementById('links-list');
        if (!container) return;

        let allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');

        if (options.search) {
            allLinks = allLinks.filter(link =>
                link.title.toLowerCase().includes(options.search) ||
                link.description.toLowerCase().includes(options.search) ||
                link.tags.some(tag => tag.toLowerCase().includes(options.search)) ||
                link.category.toLowerCase().includes(options.search)
            );
        }

        if (options.category && options.category !== 'all') {
            allLinks = allLinks.filter(link => link.category === options.category);
        }

        const recentLinks = allLinks.slice(-50).reverse();
        container.innerHTML = '';

        if (recentLinks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3>No links found</h3>
                    <p>Try a different search term or clear your filters</p>
                </div>
            `;
            return;
        }

        recentLinks.forEach(link => {
            const linkElement = this.createLinkCard(link);
            container.appendChild(linkElement);
        });
    }

    // Voting system
    voteLink(linkId, voteType) {
        if (!this.currentUser) {
            this.showNotification('Please log in to vote', 'error');
            return;
        }

        try {
            const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
            const link = allLinks.find(l => l.id === linkId);

            if (!link) return;

            const upVotes = link.votes.up || [];
            const downVotes = link.votes.down || [];

            const alreadyUpvoted = upVotes.includes(this.currentUser);
            const alreadyDownvoted = downVotes.includes(this.currentUser);

            if (voteType === 'up') {
                if (alreadyUpvoted) {
                    // Remove upvote
                    link.votes.up = upVotes.filter(u => u !== this.currentUser);
                    this.showNotification('Vote removed', 'info');
                } else {
                    // Add upvote, remove downvote if exists
                    link.votes.up = [...upVotes.filter(u => u !== this.currentUser), this.currentUser];
                    link.votes.down = downVotes.filter(u => u !== this.currentUser);
                    this.showNotification('Upvoted! +1', 'success');

                    // Award karma to author
                    this.updateKarma(link.author, 1);
                }
            } else {
                if (alreadyDownvoted) {
                    // Remove downvote
                    link.votes.down = downVotes.filter(u => u !== this.currentUser);
                    this.showNotification('Vote removed', 'info');
                } else {
                    // Add downvote, remove upvote if exists
                    link.votes.down = [...downVotes.filter(u => u !== this.currentUser), this.currentUser];
                    link.votes.up = upVotes.filter(u => u !== this.currentUser);
                    this.showNotification('Downvoted', 'info');

                    // Remove karma from author
                    this.updateKarma(link.author, -1);
                }
            }

            localStorage.setItem('allLinks', JSON.stringify(allLinks));
            this.renderPage();
        } catch (error) {
            this.showNotification('Failed to vote', 'error');
        }
    }

    updateKarma(username, amount) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[username] && users[username].profile) {
            users[username].profile.karma = (users[username].profile.karma || 0) + amount;
            this.checkBadges(users[username]);
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    checkBadges(user) {
        if (!user.profile) return;

        const badges = new Set(user.profile.badges || []);
        const karma = user.profile.karma || 0;
        const linkCount = user.links?.length || 0;

        if (karma >= 100) badges.add('contributor');
        if (linkCount >= 10) badges.add('active');
        if (karma >= 500) badges.add('expert');

        user.profile.badges = Array.from(badges);
    }

    // Bookmark system
    toggleBookmark(linkId) {
        if (!this.currentUser) {
            this.showNotification('Please log in to bookmark', 'error');
            return;
        }

        try {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const bookmarks = users[this.currentUser].profile.bookmarks || [];

            if (bookmarks.includes(linkId)) {
                users[this.currentUser].profile.bookmarks = bookmarks.filter(id => id !== linkId);
                this.showNotification('Bookmark removed', 'info');
            } else {
                users[this.currentUser].profile.bookmarks.push(linkId);
                this.showNotification('Bookmarked! ⭐', 'success');
            }

            localStorage.setItem('users', JSON.stringify(users));

            // Update bookmark count on link
            const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
            const link = allLinks.find(l => l.id === linkId);
            if (link) {
                link.bookmarkedBy = link.bookmarkedBy || [];
                if (bookmarks.includes(linkId)) {
                    link.bookmarkedBy = link.bookmarkedBy.filter(u => u !== this.currentUser);
                } else {
                    link.bookmarkedBy.push(this.currentUser);
                }
                localStorage.setItem('allLinks', JSON.stringify(allLinks));
            }

            this.renderPage();
        } catch (error) {
            this.showNotification('Failed to bookmark', 'error');
        }
    }

    // View tracking
    incrementViews(linkId) {
        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const link = allLinks.find(l => l.id === linkId);
        if (link) {
            link.views = (link.views || 0) + 1;
            localStorage.setItem('allLinks', JSON.stringify(allLinks));
        }
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

        this.showEditLinkModal(link);
    }

    showEditLinkModal(link) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Edit Link</h3>
                    <button class="modal-close" onclick="app.closeModal()">×</button>
                </div>
                <form id="edit-link-form">
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" id="edit-title" value="${link.title}" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="edit-description">${link.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Tags (comma separated)</label>
                        <input type="text" id="edit-tags" value="${link.tags.join(', ')}">
                    </div>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        this.modalOpen = modal;

        document.getElementById('edit-link-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEditedLink(link.id);
        });
    }

    saveEditedLink(linkId) {
        try {
            const title = document.getElementById('edit-title').value.trim();
            const description = document.getElementById('edit-description').value.trim();
            const tags = document.getElementById('edit-tags').value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag);

            const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
            const link = allLinks.find(l => l.id === linkId);

            if (link) {
                link.title = this.sanitizeHTML(title);
                link.description = this.sanitizeHTML(description);
                link.tags = tags.map(tag => this.sanitizeHTML(tag));

                localStorage.setItem('allLinks', JSON.stringify(allLinks));

                const users = JSON.parse(localStorage.getItem('users') || '{}');
                const userLink = users[this.currentUser].links.find(l => l.id === linkId);
                if (userLink) {
                    userLink.title = link.title;
                    userLink.description = link.description;
                    userLink.tags = link.tags;
                    localStorage.setItem('users', JSON.stringify(users));
                }

                this.showNotification('Link updated successfully', 'success');
                this.closeModal();
                this.renderPage();
            }
        } catch (error) {
            this.showNotification('Failed to update link', 'error');
        }
    }

    showEditProfileModal() {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const profile = users[this.currentUser]?.profile || {};

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Edit Profile</h3>
                    <button class="modal-close" onclick="app.closeModal()">×</button>
                </div>
                <form id="edit-profile-form">
                    <div class="form-group">
                        <label>Bio</label>
                        <textarea id="edit-bio" maxlength="200">${profile.bio || ''}</textarea>
                        <span class="form-helper">Max 200 characters</span>
                    </div>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        this.modalOpen = modal;

        document.getElementById('edit-profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });
    }

    saveProfile() {
        try {
            const bio = document.getElementById('edit-bio').value.trim();
            const users = JSON.parse(localStorage.getItem('users') || '{}');

            if (users[this.currentUser].profile) {
                users[this.currentUser].profile.bio = this.sanitizeHTML(bio);
                localStorage.setItem('users', JSON.stringify(users));
                this.showNotification('Profile updated! ✨', 'success');
                this.closeModal();
                this.renderPage();
            }
        } catch (error) {
            this.showNotification('Failed to update profile', 'error');
        }
    }

    closeModal() {
        if (this.modalOpen) {
            this.modalOpen.remove();
            this.modalOpen = null;
        }
    }

    getLinkById(linkId) {
        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        return allLinks.find(l => l.id === linkId);
    }

    addLinkToList(linkId, listId) {
        if (!listId) {
            this.showNotification('Please select a list', 'error');
            return;
        }

        try {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const list = users[this.currentUser]?.lists.find(l => l.id === parseInt(listId));

            if (list) {
                if (!list.links.includes(linkId)) {
                    list.links.push(linkId);
                    localStorage.setItem('users', JSON.stringify(users));
                    this.showNotification('Link added to list! 📋', 'success');
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
                exportDate: new Date().toISOString(),
                version: '2.0'
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `portalroom-backup-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);

            this.showNotification('Data exported successfully! 💾', 'success');
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

                    this.showNotification('Data imported successfully! 📥', 'success');
                    setTimeout(() => window.location.reload(), 1000);
                }
            } catch (error) {
                this.showNotification('Invalid backup file', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Tab switching
    switchTab(tabElement) {
        const tabGroup = tabElement.closest('.tabs');
        const tabs = tabGroup.querySelectorAll('.tab');
        const contentId = tabElement.dataset.tab;

        tabs.forEach(tab => tab.classList.remove('active'));
        tabElement.classList.add('active');

        const contents = document.querySelectorAll('.tab-content');
        contents.forEach(content => content.classList.remove('active'));

        const targetContent = document.getElementById(contentId);
        if (targetContent) {
            targetContent.classList.add('active');
        }
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
                    <div class="empty-state-icon">🌐</div>
                    <h3>No links yet</h3>
                    <p>Be the first to share something interesting!</p>
                    <a href="register.html" class="btn btn-primary">Join Portal Room</a>
                </div>
            `;
            return;
        }

        recentLinks.forEach(link => {
            const linkElement = this.createLinkCard(link);
            container.appendChild(linkElement);
        });

        // Render sidebar if exists
        this.renderSidebar();
    }

    renderDashboard() {
        const container = document.getElementById('links-list');
        if (!container) return;

        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const recentLinks = allLinks.slice(-50).reverse();

        container.innerHTML = '';

        if (recentLinks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <h3>No links yet</h3>
                    <p>Be the first to share something!</p>
                    <a href="submit.html" class="btn btn-primary">Submit a Link</a>
                </div>
            `;
            return;
        }

        recentLinks.forEach(link => {
            const linkElement = this.createLinkCard(link);
            container.appendChild(linkElement);
        });

        // Render sidebar
        this.renderSidebar();
    }

    renderSidebar() {
        const sidebar = document.getElementById('sidebar-left');
        if (!sidebar || !this.currentUser) return;

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const user = users[this.currentUser];
        const profile = user?.profile || {};

        sidebar.innerHTML = `
            <div class="widget user-card">
                <div class="user-avatar">${profile.avatar || this.getInitial(this.currentUser)}</div>
                <div class="user-name">${this.currentUser}</div>
                <div class="user-bio">${profile.bio || 'No bio yet'}</div>
                <div class="user-stats">
                    <div class="stat-item">
                        <span class="stat-number">${profile.karma || 0}</span>
                        <span class="stat-label">Karma</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${user.links?.length || 0}</span>
                        <span class="stat-label">Links</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${user.lists?.length || 0}</span>
                        <span class="stat-label">Lists</span>
                    </div>
                </div>
                <div class="badges">
                    ${(profile.badges || []).map(badge => `<span class="badge ${badge}">${badge}</span>`).join('')}
                </div>
                <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" onclick="app.showEditProfileModal()">Edit Profile</button>
            </div>

            <div class="widget">
                <div class="widget-header">
                    <h3>🔥 Trending</h3>
                </div>
                ${this.renderTrendingLinks()}
            </div>
        `;
    }

    renderTrendingLinks() {
        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const trending = allLinks
            .map(link => ({
                ...link,
                score: (link.votes.up?.length || 0) - (link.votes.down?.length || 0) + (link.views || 0) * 0.1
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        if (trending.length === 0) {
            return '<p style="color: var(--text-light); font-size: 0.9rem;">No trending links yet</p>';
        }

        return trending.map((link, index) => `
            <div style="margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color);">
                <div style="font-size: 0.75rem; color: var(--text-light);">#${index + 1}</div>
                <a href="${link.url}" target="_blank" style="color: var(--accent-blue); font-weight: 600; font-size: 0.9rem; text-decoration: none;">
                    ${link.title.substring(0, 50)}${link.title.length > 50 ? '...' : ''}
                </a>
                <div style="font-size: 0.75rem; color: var(--text-light); margin-top: 0.25rem;">
                    ${(link.votes.up?.length || 0)} votes · ${link.views || 0} views
                </div>
            </div>
        `).join('');
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
                userLinksList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <h3>No links yet</h3>
                        <p>Share something interesting!</p>
                        <a href="submit.html" class="btn btn-primary">Submit Link</a>
                    </div>
                `;
            } else {
                userLinks.slice().reverse().forEach(link => {
                    const linkElement = this.createLinkCard(link);
                    userLinksList.appendChild(linkElement);
                });
            }
        }

        if (listsContainer) {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const userLists = users[this.currentUser]?.lists || [];

            listsContainer.innerHTML = '';

            if (userLists.length === 0) {
                listsContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <h3>No lists yet</h3>
                        <p>Organize your favorite links!</p>
                        <a href="list.html" class="btn btn-primary">Create List</a>
                    </div>
                `;
            } else {
                userLists.slice().reverse().forEach(list => {
                    const listElement = this.createListElement(list);
                    listsContainer.appendChild(listElement);
                });
            }
        }

        // Render bookmarks tab
        this.renderBookmarks();
    }

    renderBookmarks() {
        const bookmarksContainer = document.getElementById('bookmarks-list');
        if (!bookmarksContainer) return;

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const bookmarks = users[this.currentUser]?.profile?.bookmarks || [];
        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');

        const bookmarkedLinks = allLinks.filter(link => bookmarks.includes(link.id));

        bookmarksContainer.innerHTML = '';

        if (bookmarkedLinks.length === 0) {
            bookmarksContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⭐</div>
                    <h3>No bookmarks yet</h3>
                    <p>Save links you want to revisit later!</p>
                </div>
            `;
        } else {
            bookmarkedLinks.forEach(link => {
                const linkElement = this.createLinkCard(link);
                bookmarksContainer.appendChild(linkElement);
            });
        }
    }

    createListElement(list) {
        const element = document.createElement('div');
        element.className = 'link-card';

        const allLinks = JSON.parse(localStorage.getItem('allLinks') || '[]');
        const linksHTML = list.links.map(linkId => {
            const link = allLinks.find(l => l.id === linkId);
            return link ? `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--sky-lightest); border-radius: 8px; margin-bottom: 0.5rem;">
                    <a href="${link.url}" target="_blank" style="color: var(--accent-blue); text-decoration: none; flex: 1;">${link.title}</a>
                    <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="app.removeLinkFromList(${linkId}, ${list.id})">Remove</button>
                </div>
            ` : '';
        }).join('');

        element.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div>
                    <h3 style="color: var(--text-dark); margin-bottom: 0.25rem;">📋 ${list.name}</h3>
                    <div style="font-size: 0.85rem; color: var(--text-light);">
                        ${list.isPublic ? '🌐 Public' : '🔒 Private'} · ${list.links.length} links
                    </div>
                </div>
                <button class="btn btn-danger" onclick="app.deleteList(${list.id})">Delete</button>
            </div>
            <p style="color: var(--text-medium); margin-bottom: 1rem;">${list.description}</p>
            <div>
                ${linksHTML || '<p style="color: var(--text-light); font-style: italic;">No links in this list yet</p>'}
            </div>
        `;

        return element;
    }

    createLinkCard(link) {
        const element = document.createElement('div');
        element.className = 'link-card';

        const upVotes = link.votes?.up?.length || 0;
        const downVotes = link.votes?.down?.length || 0;
        const score = upVotes - downVotes;

        const isUpvoted = link.votes?.up?.includes(this.currentUser);
        const isDownvoted = link.votes?.down?.includes(this.currentUser);
        const isBookmarked = this.currentUser && JSON.parse(localStorage.getItem('users') || '{}')[this.currentUser]?.profile?.bookmarks?.includes(link.id);

        const isAuthor = this.currentUser === link.author;

        const categoryColors = {
            tech: 'tech',
            design: 'design',
            news: 'news',
            other: 'other'
        };

        element.innerHTML = `
            <div class="link-header">
                ${this.currentUser ? `
                    <div class="link-vote">
                        <button class="vote-btn ${isUpvoted ? 'upvoted' : ''}" onclick="app.voteLink(${link.id}, 'up')">▲</button>
                        <div class="vote-count">${score}</div>
                        <button class="vote-btn ${isDownvoted ? 'downvoted' : ''}" onclick="app.voteLink(${link.id}, 'down')">▼</button>
                    </div>
                ` : ''}
                <div class="link-content">
                    <div class="link-title">
                        <a href="${link.url}" target="_blank" onclick="app.incrementViews(${link.id})">${link.title}</a>
                    </div>
                    <div class="link-description">${link.description}</div>
                    <div class="link-meta">
                        <span class="meta-item">by <strong>${link.author}</strong></span>
                        <span class="meta-item">${new Date(link.timestamp).toLocaleDateString()}</span>
                        <span class="meta-item">👁 ${link.views || 0} views</span>
                        <span class="meta-item">💬 ${link.comments?.length || 0} comments</span>
                        ${link.bookmarkedBy?.length ? `<span class="meta-item">⭐ ${link.bookmarkedBy.length} bookmarks</span>` : ''}
                    </div>
                    <div class="tags">
                        <span class="tag ${categoryColors[link.category] || 'other'}">${link.category || 'other'}</span>
                        ${link.tags.map(tag => `<span class="tag ${categoryColors[link.category] || 'other'}">${tag}</span>`).join('')}
                    </div>
                    <div class="link-actions">
                        ${this.currentUser ? `
                            <button class="btn ${isBookmarked ? 'btn-success' : 'btn-secondary'}" onclick="app.toggleBookmark(${link.id})">
                                ${isBookmarked ? '⭐ Bookmarked' : '☆ Bookmark'}
                            </button>
                        ` : ''}
                        ${isAuthor ? `
                            <button class="btn btn-secondary" onclick="app.editLink(${link.id})">✏️ Edit</button>
                            <button class="btn btn-danger" onclick="app.deleteLink(${link.id})">🗑️ Delete</button>
                        ` : ''}
                        ${this.currentUser && this.createListSelector(link.id)}
                    </div>
                    ${this.createCommentsSection(link)}
                </div>
            </div>
        `;

        return element;
    }

    createListSelector(linkId) {
        if (!this.currentUser) return '';

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const userLists = users[this.currentUser]?.lists || [];

        if (userLists.length === 0) return '';

        return `
            <select id="list-selector-${linkId}" class="btn btn-secondary" style="padding: 0.5rem;">
                <option value="">📋 Add to list...</option>
                ${userLists.map(list => `<option value="${list.id}">${list.name}</option>`).join('')}
            </select>
            <button class="btn btn-secondary" onclick="app.addLinkToList(${linkId}, document.getElementById('list-selector-${linkId}').value)">Add</button>
        `;
    }

    createCommentsSection(link) {
        const commentsHTML = (link.comments || []).map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-time">${new Date(comment.timestamp).toLocaleString()}</span>
                </div>
                <div class="comment-text">${comment.text}</div>
                ${comment.author === this.currentUser ? `
                    <div class="comment-actions">
                        <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="app.deleteComment(${link.id}, ${comment.id})">Delete</button>
                    </div>
                ` : ''}
            </div>
        `).join('');

        return `
            <div class="comments-section">
                <div class="comments-header">
                    <h4>💬 Comments (${link.comments?.length || 0})</h4>
                </div>
                <div class="comments-list">
                    ${commentsHTML || '<p style="color: var(--text-light); font-style: italic;">No comments yet</p>'}
                </div>
                ${this.currentUser ? `
                    <form class="comment-form" onsubmit="app.handleCommentSubmit(event, ${link.id}); return false;">
                        <input type="text" placeholder="Add a comment..." required style="flex: 1; padding: 0.75rem; border: 3px solid var(--border-color); border-radius: 8px;">
                        <button type="submit" class="btn btn-primary">Comment</button>
                    </form>
                ` : '<p style="color: var(--text-light); font-style: italic; margin-top: 1rem;">Log in to comment</p>'}
            </div>
        `;
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

                // Award karma for commenting
                this.updateKarma(this.currentUser, 1);

                form.reset();
                this.showNotification('Comment added! +1 karma 💬', 'success');
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
