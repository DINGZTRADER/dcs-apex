# GitHub Setup Instructions

## ⚠️ IMPORTANT: Security Notice

GitHub no longer accepts password authentication for Git operations. You must use one of these methods:

1. **Personal Access Token (PAT)** - Recommended
2. **SSH Keys** - Most secure
3. **GitHub CLI** - Easiest

---

## Option 1: Using Personal Access Token (Recommended)

### Step 1: Create a Personal Access Token

1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: "DCS Apex Deployment"
4. Select scopes: `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)

### Step 2: Add Remote and Push

Run these commands in your terminal:

```bash
# Add remote repository (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push using token (replace YOUR_TOKEN with your PAT)
git push -u origin main

# When prompted:
# Username: DINGZTRADER
# Password: YOUR_PERSONAL_ACCESS_TOKEN (not your GitHub password!)
```

---

## Option 2: Using GitHub CLI (Easiest)

### Step 1: Install GitHub CLI

**Windows**:
```powershell
winget install GitHub.cli
```

**Or download from**: https://cli.github.com/

### Step 2: Authenticate

```bash
gh auth login
```

Follow the prompts to authenticate.

### Step 3: Create Repository and Push

```bash
# Create repository on GitHub (will prompt for name, visibility, etc.)
gh repo create dcs-apex --public --source=. --remote=origin --push

# Or if repository already exists:
git remote add origin https://github.com/DINGZTRADER/dcs-apex.git
git branch -M main
git push -u origin main
```

---

## Option 3: Using SSH Keys (Most Secure)

### Step 1: Generate SSH Key

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Press Enter to accept default location, then enter a passphrase.

### Step 2: Add SSH Key to GitHub

1. Copy your public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

2. Go to GitHub.com → Settings → SSH and GPG keys → New SSH key
3. Paste your public key
4. Click "Add SSH key"

### Step 3: Add Remote and Push

```bash
# Add remote using SSH URL
git remote add origin git@github.com:DINGZTRADER/YOUR_REPO_NAME.git

# Push
git branch -M main
git push -u origin main
```

---

## Quick Setup (If you already have a token)

If you have a Personal Access Token ready, run:

```bash
# 1. Create repository on GitHub first (via web interface)
# 2. Then run:

git remote add origin https://github.com/DINGZTRADER/REPO_NAME.git
git branch -M main
git push -u origin main
```

When prompted for password, use your **Personal Access Token**, not your GitHub password.

---

## Verify Setup

After pushing, verify:

```bash
git remote -v
git status
```

You should see your remote repository URL.

---

## Troubleshooting

### "Authentication failed"
- Make sure you're using a Personal Access Token, not your password
- Token must have `repo` scope

### "Repository not found"
- Create the repository on GitHub first
- Check the repository name matches

### "Permission denied"
- Verify your token has correct permissions
- Try regenerating the token

---

**Important**: Never commit `.env` files or credentials to GitHub!
