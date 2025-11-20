
```markdown
# Portal Room

> *A minimalist social link aggregator — where links are shared, curated, and remembered.*

A static, client-side social platform built for the quiet web. No backend. No databases. No tracking. Just links, comments, and lists — hosted on GitHub Pages.

---

##  What is Portal Room?

Portal Room is a simple, retro-inspired social platform where users can:

- **Submit links** with titles and descriptions  
- **Comment on links** anonymously or with a username  
- **Create curated lists** of related links  
- **View public and personal dashboards**  
- **Browse others’ profiles** and their collections  

It’s designed for people who want to share interesting finds without the noise of likes, algorithms, or follower counts.

Think of it as a cross between **LinkShare**, **Neocities**, and **old-school forums** — stripped down to its essentials.

---

##  Features

| Feature | Description |
|--------|-------------|
| **User Accounts** | Register and log in with a username/password (stored in localStorage) |
| **Link Submission** | Submit URLs with title, description, and tags |
| **Comments** | Add text comments to any link — visible to all |
| **Link Lists** | Create custom collections of links (e.g., “Music I’m Listening To”) |
| **Profile Pages** | View your own links and lists, or others’ if you know their username |
| **No Backend** | 100% static: HTML, CSS, JS + localStorage |
| **No Tracking** | No cookies, no analytics, no ads |
| **GitHub Pages Ready** | Deploy in 1 click |

---

##  File Structure

```
portalroom/
├── index.html             # Homepage: latest links
├── login.html             # User login
├── register.html          # New user registration
├── dashboard.html         # Logged-in feed (same as home, but with logout)
├── submit.html            # Form to submit new links
├── profile.html           # View your own links and lists
├── list.html              # Create a new link list
├── css/
│   └── style.css          # Minimalist, clean styling
└── js/
    └── app.js             # Core logic (localStorage-based)
```

---

## How to Deploy

1. **Fork or clone** this repo
2. Go to **Settings → Pages**
3. Set **Source** to `main` branch → `/ (root)`
4. Click **Save**
5. Wait 1–2 minutes — your site will be live at:  
   `https://YOURUSERNAME.github.io/portalroom`

> No server needed. Works on any GitHub Pages account.

---

## How User Data Works

- All user data (accounts, links, comments, lists) is stored **locally** in `localStorage`
- This means **each user’s data only exists in their own browser**
- **There is no central database** — so data is **not shared between devices or browsers**
- If you clear your cache or switch devices, your content is gone

> *This is intentional. Portal Room is designed as a personal, ephemeral space — not a permanent archive.*

---

## Future Ideas (for you to build)

- Add RSS feeds for users or lists
- Implement a simple “Follow” system via URL sharing
- Allow exporting/importing your data as JSON
- Add dark mode toggle
- Integrate with GitHub Gists to persist data across devices
- Add a “Top Links” page based on comment count

---

## License

MIT — Do whatever you want with this.  
Modify it. Break it. Make it yours.

---

## Built For

People who miss the web before it became a factory.  
For those who write in notepads, save bookmarks in folders,  
and still believe that quiet spaces on the internet are worth keeping.

---

> *“I don’t want to be famous. I just want to leave something behind.”*  
> — Portal Room
