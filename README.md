# Portal Room

> *A minimalist social link aggregator — where links are shared, curated, and remembered.*

A static, client-side social platform built for the quiet web. No backend. No databases. No tracking. Just links, comments, and lists — hosted on GitHub Pages.

---

## 🌟 What is Portal Room?

Portal Room is a simple, retro-inspired social platform where users can:

- **Submit links** with titles, descriptions, and tags
- **Comment on links** with full CRUD operations
- **Create curated lists** of related links
- **View public and personal dashboards**
- **Search and filter** links by keywords and tags
- **Export/Import** your data for backup and portability

It's designed for people who want to share interesting finds without the noise of likes, algorithms, or follower counts.

Think of it as a cross between **LinkShare**, **Neocities**, and **old-school forums** — stripped down to its essentials.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| **User Accounts** | Register and log in with username/password (hashed, stored in localStorage) |
| **Authentication** | Protected pages with automatic login redirects |
| **Link Submission** | Submit URLs with title, description, and tags |
| **Link Management** | Edit and delete your own links |
| **Comments** | Add, view, and delete comments on any link |
| **Link Lists** | Create custom collections and add links to them |
| **List Management** | Delete lists and remove links from lists |
| **Search** | Real-time search across titles, descriptions, and tags |
| **Data Export/Import** | Backup and restore your data as JSON |
| **Password Security** | Client-side password hashing |
| **Input Sanitization** | XSS protection on all user inputs |
| **Form Validation** | Comprehensive client-side validation |
| **Notifications** | Beautiful toast notifications for user feedback |
| **Mobile Responsive** | Fully optimized for mobile devices |
| **No Backend** | 100% static: HTML, CSS, JS + localStorage |
| **No Tracking** | No cookies, no analytics, no ads |
| **GitHub Pages Ready** | Deploy in 1 click |

---

## 📁 File Structure

```
portalroom/
├── index.html             # Homepage: latest links (public)
├── login.html             # User login
├── register.html          # New user registration
├── dashboard.html         # Logged-in feed with search
├── submit.html            # Form to submit new links
├── profile.html           # View your links, lists, and manage data
├── list.html              # Create a new link list
├── css/
│   └── style.css          # Responsive, modern styling
├── js/
│   └── app.js             # Core logic with full CRUD operations
└── README.md              # This file
```

---

## 🚀 How to Deploy

### GitHub Pages (Recommended)

1. **Fork or clone** this repo
2. Go to **Settings → Pages**
3. Set **Source** to your branch (e.g., `main`) → `/ (root)`
4. Click **Save**
5. Wait 1–2 minutes — your site will be live at:
   `https://YOURUSERNAME.github.io/portalroom`

> No server needed. Works on any GitHub Pages account.

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/YOURUSERNAME/portalroom.git
   cd portalroom
   ```

2. Open `index.html` in your browser or use a local server:
   ```bash
   # Python 3
   python -m http.server 8000

   # Or use any static file server
   npx serve
   ```

3. Visit `http://localhost:8000`

---

## 💾 How User Data Works

- All user data (accounts, links, comments, lists) is stored **locally** in `localStorage`
- This means **each user's data only exists in their own browser**
- **There is no central database** — so data is **not shared between devices or browsers**
- Use the **Export Data** feature to backup your content
- Use the **Import Data** feature to restore or migrate between browsers/devices

> *This is intentional. Portal Room is designed as a personal, ephemeral space — but with the power to preserve what matters.*

---

## 🎯 Usage Guide

### Getting Started

1. **Register** a new account (username must be 3+ characters, password 6+)
2. **Login** to access the dashboard
3. **Submit Links** via the Submit Link page
4. **Create Lists** to organize your favorite links
5. **Add Links to Lists** using the dropdown on each link
6. **Search** for links using the search bar on the dashboard
7. **Export** your data regularly to keep backups

### Features in Detail

**Link Management:**
- Edit or delete your own links using the buttons that appear on links you've submitted
- Add links to your curated lists using the "Add to list..." dropdown

**Comments:**
- Add comments to any link (requires login)
- Delete your own comments using the × button

**Lists:**
- Create themed collections of links
- Add any link to your lists
- Remove links from lists
- Delete entire lists

**Data Portability:**
- Export all your data as JSON from your profile page
- Import previously exported data to restore or migrate

---

## 🔒 Security Notes

- Passwords are hashed using a simple client-side hash function
- All user inputs are sanitized to prevent XSS attacks
- No data is sent to any server (100% client-side)
- For production use with real users, consider upgrading to stronger encryption

---

## 🎨 Customization

Portal Room is designed to be easily customizable:

- Edit `css/style.css` to change colors, fonts, and layout
- Modify `js/app.js` to add new features
- All HTML files use semantic markup for easy template modifications

---

## 🛠️ Future Enhancement Ideas

- [ ] Add RSS feeds for users or lists
- [ ] Implement a simple "Follow" system via URL sharing
- [ ] Add dark mode toggle
- [ ] Integrate with GitHub Gists to persist data centrally
- [ ] Add a "Top Links" page based on comment count
- [ ] Link preview thumbnails
- [ ] Tag-based browsing page
- [ ] Markdown support in descriptions and comments
- [ ] Link upvoting/rating system
- [ ] Advanced search with filters

---

## 🐛 Known Limitations

- Data is stored in localStorage (limited to ~5-10MB depending on browser)
- No data synchronization between devices/browsers (use export/import)
- Password reset requires clearing localStorage and re-registering
- Search is case-insensitive but requires exact word matches

---

## 📝 License

MIT — Do whatever you want with this.
Modify it. Break it. Make it yours.

---

## 🌐 Built For

People who miss the web before it became a factory.
For those who write in notepads, save bookmarks in folders,
and still believe that quiet spaces on the internet are worth keeping.

---

## 🤝 Contributing

Portal Room is intentionally minimal, but contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📊 Technical Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Storage**: localStorage API
- **Deployment**: GitHub Pages (or any static host)
- **No dependencies**: Zero npm packages, no build process

---

> *"I don't want to be famous. I just want to leave something behind."*
> — Portal Room

**Version**: 1.0.0 MVP
**Status**: Production Ready ✅
