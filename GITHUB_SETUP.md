# GitHub Setup Guide

## Steps to Push to GitHub

### 1. Create a New Repository on GitHub
- Go to [github.com/new](https://github.com/new)
- Enter repository name: `contact-calls-app`
- Add description: "Contact management app with voice control and call history"
- Choose "Public" (so anyone can access it)
- DO NOT initialize with README, .gitignore, or license (we already have these)
- Click "Create repository"

### 2. Add Remote and Push

After creating the repo, GitHub will show commands. Copy the HTTPS URL and run:

```bash
cd /Users/alp/Documents/contact-calls-app

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/contact-calls-app.git

# Rename branch to main if needed
git branch -M main

# Push to GitHub
git push -u origin main
```

### 3. Verify on GitHub
Open the repository URL in your browser:
```
https://github.com/YOUR_USERNAME/contact-calls-app
```

You should see all files and the commit history.

### 4. (Optional) Enable GitHub Pages

To host the app as a live website:

1. Go to repository Settings
2. Scroll to "Pages" section
3. Select "Deploy from a branch"
4. Choose branch: `main`
5. Choose folder: `/ (root)`
6. Click Save
7. Wait a few seconds for deployment
8. Your site will be live at: `https://YOUR_USERNAME.github.io/contact-calls-app`

---

## Making Updates

After making changes locally, push them with:

```bash
cd /Users/alp/Documents/contact-calls-app

# Stage all changes
git add .

# Create a commit
git commit -m "Your descriptive message here"

# Push to GitHub
git push origin main
```

---

Good luck! 🚀
