# Push to GitHub - Quick Instructions

Your code is committed and ready to push! GitHub requires authentication via **Personal Access Token** (not password).

## Quick Steps

### Step 1: Create Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: "DCS Apex"
4. Select scope: ✅ **repo** (check the "repo" checkbox)
5. Click "Generate token"
6. **Copy the token** (you'll only see it once!)

### Step 2: Create Repository on GitHub

1. Go to: https://github.com/new
2. Repository name: `dcs-apex` (or any name you prefer)
3. Choose Public or Private
4. **DO NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

### Step 3: Push Your Code

Run these commands in your terminal:

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/dcs-apex.git

# Push to GitHub
git push -u origin main
```

When prompted:
- **Username**: `DINGZTRADER`
- **Password**: Paste your **Personal Access Token** (NOT your GitHub password!)

---

## Alternative: Using GitHub CLI (Easiest)

If you have GitHub CLI installed:

```bash
# Login to GitHub
gh auth login

# Create repository and push
gh repo create dcs-apex --public --source=. --remote=origin --push
```

---

## Verify

After pushing, check:
- Go to https://github.com/DINGZTRADER/dcs-apex
- You should see all your files!

---

**Note**: Never commit `.env` files or passwords to GitHub!
