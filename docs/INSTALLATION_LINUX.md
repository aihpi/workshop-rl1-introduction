# 🐧 Linux Installation Guide

Complete step-by-step installation guide for RL Lab on Linux (Ubuntu/Debian-based distributions).

**Estimated time**: 10-15 minutes for first-time setup

---

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] Ubuntu 20.04+ or Debian 11+ (or equivalent distribution)
- [ ] Administrator (sudo) access
- [ ] At least 4GB RAM (8GB recommended)
- [ ] At least 2GB free disk space
- [ ] Active internet connection

---

## Step 1: Open Terminal

Terminal is where you'll type commands to set up the project.

### Option 1: Keyboard Shortcut (Fastest)
1. Press `Ctrl + Alt + T` on your keyboard
2. Terminal opens immediately

### Option 2: Using Activities Search
1. Click **Activities** in the top-left corner (or press the Super/Windows key)
2. Type `Terminal`
3. Click the Terminal icon

### Option 3: Right-click Desktop
1. Right-click on an empty area of your desktop
2. Select **"Open Terminal"** or **"Open in Terminal"** (if available on your distribution)

**✅ Success Check**: You should see a window with text like `username@hostname:~$`

![Terminal window open](installation-screenshots/linux/01-terminal-open.png)

---

## Step 2: Install Git

Git is a tool that helps you download code from the internet (like this project).

### Quick Installation

In Terminal, type:
```bash
sudo apt update && sudo apt install git -y
```

You'll be asked for your password. Type it and press Enter.
**Note**: You won't see characters appear as you type your password - this is normal for security reasons.

### Verify Git Installation

Check that Git is installed:
```bash
git --version
```

**✅ Success Check**: You should see output like:
```
git version 2.34.1
```

**📖 Need detailed help?** See the [official Git installation guide for Linux](https://git-scm.com/download/linux)

![Git version check](installation-screenshots/linux/03-git-version.png)

---

## Step 3: Install Docker Desktop

Docker runs the RL Lab application in an isolated environment, so you don't need to manually install Python, Node.js, or other dependencies.

### 3.1 Download Docker Desktop

1. Open your web browser
2. Go to: **https://docs.docker.com/desktop/install/linux-install/**
3. Choose your Linux distribution:
   - **Ubuntu** (most common)
   - **Debian**
   - **Fedora**
   - **Arch**
4. Download the appropriate `.deb` or `.rpm` package for your system

**📖 Detailed Instructions**: Follow the [official Docker Desktop installation guide for Linux](https://docs.docker.com/desktop/install/linux-install/)

The official guide provides:
- System-specific installation commands
- Distribution-specific instructions
- Prerequisites and dependencies
- Post-installation setup

![Docker Desktop download page](installation-screenshots/linux/04-docker-download.png)

### 3.2 Install Docker Desktop

For **Ubuntu/Debian** users, the typical installation is:

```bash
# Navigate to your Downloads folder
cd ~/Downloads

# Install Docker Desktop (replace with your actual filename)
sudo apt install ./docker-desktop-<version>-<arch>.deb
```

For other distributions, follow the official guide linked above.

### 3.3 Start Docker Desktop

After installation:
```bash
# Start Docker Desktop
systemctl --user start docker-desktop
```

Or find "Docker Desktop" in your applications menu and launch it.

### 3.4 Verify Docker Installation

Check that Docker is working:
```bash
docker --version
```

**✅ Success Check**: You should see output like:
```
Docker version 24.0.7, build afdd53b
```

Also verify Docker Compose is installed:
```bash
docker compose version
```

**✅ Success Check**: You should see output like:
```
Docker Compose version v2.21.0
```

![Docker version check](installation-screenshots/linux/07-docker-version.png)

**❌ Troubleshooting**:
- **"command not found"**: Docker Desktop may not be in your PATH. Try restarting your terminal or logging out/in.
- **"Cannot connect to Docker daemon"**: Docker Desktop is not running. Start it from your applications menu.

---

## Step 4: Clone the RL Lab Repository

Now you'll download the RL Lab project files to your computer.

### 4.1 Choose Where to Save the Project

First, decide where you want to save the project. Common locations:
- Home directory: `cd ~`
- Documents: `cd ~/Documents`
- Desktop: `cd ~/Desktop`

For example, to use your home directory:
```bash
cd ~
```

### 4.2 Clone the Repository

Type this command and press Enter:
```bash
git clone https://github.com/aihpi/workshop-rl1-introduction.git
```

**What you'll see**: Git will download all the project files. This takes about 10-30 seconds.

Output should look like:
```
Cloning into 'workshop-rl1-introduction'...
remote: Enumerating objects: 543, done.
remote: Counting objects: 100% (543/543), done.
remote: Compressing objects: 100% (312/312), done.
remote: Total 543 (delta 215), reused 489 (delta 178), pack-reused 0
Receiving objects: 100% (543/543), 2.1 MiB | 5.2 MiB/s, done.
Resolving deltas: 100% (215/215), done.
```

![Git clone in progress](installation-screenshots/linux/05-git-clone.png)

### 4.3 Enter the Project Directory

Now move into the project folder:
```bash
cd workshop-rl1-introduction
```

**✅ Success Check**: Type `ls` and press Enter. You should see folders and files like:
```
backend/        frontend/       docs/
README.md       docker-compose.yml
```

![Project directory contents](installation-screenshots/linux/06-directory-contents.png)

---

## Step 5: Start the Application

You're almost there! Now let's start RL Lab.

### 5.1 Make Sure Docker Desktop is Running

Before continuing, check that Docker Desktop is running:
- Look for Docker in your system tray or applications menu
- Or check with: `docker ps` (should not error)

### 5.2 Start the Application

In Terminal (make sure you're still in the `workshop-rl1-introduction` folder), type:

```bash
docker compose up -d
```

Press Enter and wait...

### 5.3 What to Expect

**First time running** (~1-2 minutes):
- Docker will download pre-built images from the internet
- You'll see messages like:
  - `Pulling backend...`
  - `Pulling frontend...`
  - `Creating workshop-rl1-introduction_backend_1`
  - `Creating workshop-rl1-introduction_frontend_1`
  - `Started`

**When ready, you'll see**:
```
✔ Container workshop-rl1-introduction-backend   Started
✔ Container workshop-rl1-introduction-frontend  Started
```

![Docker compose running](installation-screenshots/linux/08-docker-compose-up.png)

**✅ Success**: Your terminal is now free to use for other commands! The services are running in the background (detached mode with `-d`).

**💡 Viewing logs** (optional, for debugging):
If you need to see what's happening or debug issues, open a **separate terminal** and run:
```bash
docker compose logs -f
```
This shows live logs from both services. Press `Ctrl + C` to stop viewing logs (the services keep running).

**❌ Troubleshooting**:

- **"Cannot connect to Docker daemon"**: Docker Desktop is not running. Start it from your applications menu.
- **"Port 3030 is already allocated"**: Something else is using port 3030. Check what's using it:
  ```bash
  sudo lsof -i :3030
  ```
  Then stop that process or change RL Lab's port in docker-compose.yml.

---

## Step 6: Access RL Lab in Your Browser

🎉 You're ready to use RL Lab!

1. Open your web browser (Firefox, Chrome, Chromium - any browser works)
2. In the address bar, type: **`http://localhost:3030`**
3. Press Enter

**✅ Success!** You should see the RL Lab interface with:
- Parameter controls on the left
- Environment viewer in the center
- Visualization panels on the right

![RL Lab interface](installation-screenshots/app/01-interface.png)

---

## Quick Start: Try It Out!

Now that RL Lab is running, let's see it in action:

1. **Look at the default settings** - The parameter panel on the left shows default values for the Q-Learning algorithm
2. **Click "Start Training"** - Watch the agent learn in real-time!
   - Environment viewer shows the agent's position in FrozenLake
   - Reward chart shows learning progress
   - Q-table heatmap shows learned values
3. **Wait for training to complete** (with default settings, takes about 10-20 seconds)
4. **Click "Play Policy"** - Watch the trained agent navigate from start to goal!

![RL Lab training](installation-screenshots/app/02-training.png)

---

## Stopping the Application

When you're done using RL Lab:

1. Open Terminal (if you closed it)
2. Navigate to the project folder: `cd ~/workshop-rl1-introduction` (or wherever you saved it)
3. Run: `docker compose down`
4. Wait for the containers to stop (you'll see "Stopped" and "Removed" messages)

To start again later, just:
1. Open Terminal
2. Navigate to the project folder: `cd ~/workshop-rl1-introduction` (or wherever you saved it)
3. Run: `docker compose up -d`

---

## Common Issues and Solutions

### Docker Desktop won't start
**Symptoms**: Docker commands fail, daemon not available

**Solutions**:
1. Restart Docker Desktop from applications menu
2. Check system requirements on the [official Docker Desktop page](https://docs.docker.com/desktop/install/linux-install/)
3. Reinstall Docker Desktop following the official guide

### "git: command not found"
**Solutions**:
1. Install Git: `sudo apt install git -y`
2. Verify installation: `git --version`
3. Close and reopen Terminal

### Port conflicts (3030 or 5001 already in use)
**Symptoms**: Error messages like:
```
Error: bind: address already in use
Error starting userland proxy: listen tcp 0.0.0.0:3030: bind: address already in use
```

This means another program is already using port 3030 (frontend) or 5001 (backend).

#### **Find and Stop the Conflicting Process**

**Step 1 - Find what's using the port:**

For port 3030:
```bash
sudo lsof -i :3030
```

For port 5001:
```bash
sudo lsof -i :5001
```

You'll see output like:
```
COMMAND   PID      USER   FD   TYPE    DEVICE SIZE/OFF NODE NAME
node    12345  username   23u  IPv4  0x1234567      0t0  TCP *:3030 (LISTEN)
```

The **PID** (Process ID) is in the second column (e.g., `12345`).

**Step 2 - Stop the process:**

```bash
kill 12345
```

Replace `12345` with your actual PID.

If that doesn't work, force stop:
```bash
kill -9 12345
```

**Step 3 - Try starting RL Lab again:**
```bash
docker compose up -d
```

### Browser shows "This site can't be reached"
**Solutions**:
1. Make sure Docker containers are running: `docker compose ps`
2. Wait a bit longer - first startup can take 2-3 minutes
3. Try refreshing the browser
4. Check Docker Desktop is running
5. View logs for error messages: `docker compose logs`

### Training doesn't start or shows errors
**Solutions**:
1. View logs for backend error messages: `docker compose logs backend`
2. Try clicking "Reset" and then "Start Training" again
3. Refresh the browser page

---

## Next Steps

✅ **Installation complete!** You're ready to explore reinforcement learning.

**Learn More**:
- [README.md](../README.md) - Project overview and features
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical details about how RL Lab works
- [Docker Workflow Guide](../tutorials/docker-workflow.md) - Advanced Docker usage

**Official Documentation**:
- [Docker Desktop for Linux](https://docs.docker.com/desktop/install/linux-install/)
- [Git for Linux](https://git-scm.com/download/linux)

**Need Help?**
- Check the troubleshooting section above
- Ask your workshop instructor
- Open an issue on GitHub: https://github.com/aihpi/workshop-rl1-introduction/issues

---

**🎓 Ready to learn? Start experimenting with different parameters and see how they affect the agent's learning!**
