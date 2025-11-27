# 📱 Windows Installation Guide

Complete step-by-step installation guide for RL Lab on Windows 10/11.

**Estimated time**: 10-15 minutes for first-time setup

---

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] Windows 10 64-bit (version 1903 or higher) or Windows 11
- [ ] Administrator access to install software
- [ ] At least 4GB RAM (8GB recommended)
- [ ] At least 2GB free disk space
- [ ] Active internet connection

---

## Step 1: Open Command Prompt (Terminal)

The Command Prompt (also called "terminal" or "cmd") is where you'll type commands to set up the project.

### Option 1: Using Windows Key + R (Fastest)
1. Press `Windows Key + R` on your keyboard
2. Type `cmd` and press Enter

![Opening cmd with Win+R](installation-screenshots/windows/01-open-cmd-winr.png)

### Option 2: Using Start Menu Search
1. Click the Start menu (Windows icon in bottom-left)
2. Type `cmd` in the search box
3. Click "Command Prompt" in the results

![Opening cmd from Start menu](installation-screenshots/windows/02-open-cmd-start.png)

### Option 3: Right-click Start Menu
1. Right-click the Start menu (Windows icon)
2. Click "Terminal" or "Command Prompt"

**✅ Success Check**: You should see a black window with text like `C:\Users\YourName>`

---

## Step 2: Install Git for Windows

Git is a tool that helps you download code from the internet (like this project).

### 2.1 Download Git

1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Go to: **https://git-scm.com/download/win**
3. The download should start automatically
4. If not, click the "Click here to download" link

![Git download page](installation-screenshots/windows/03-git-download.png)

### 2.2 Install Git

1. Find the downloaded file (usually in your Downloads folder)
   - Look for a file named something like `Git-2.43.0-64-bit.exe`
2. Double-click the file to start the installer
3. Click "Yes" if Windows asks for permission
4. Follow these settings in the installer:
   - **Select Destination Location**: Leave as default, click "Next"
   - **Select Components**: Leave all checkboxes as default, click "Next"
   - **Select Start Menu Folder**: Leave as default, click "Next"
   - **Choosing the default editor**: Select any editor (doesn't matter for this project), click "Next"
   - **Adjusting your PATH environment**: Select "Git from the command line and also from 3rd-party software", click "Next"
   - **All other screens**: Just click "Next" to use defaults
5. Click "Install" and wait for installation to complete
6. Click "Finish"

![Git installer](installation-screenshots/windows/04-git-installer.png)

### 2.3 Verify Git Installation

1. **Close any open Command Prompt windows** (important!)
2. Open a **new** Command Prompt (see Step 1)
3. Type this command and press Enter:
   ```bash
   git --version
   ```

**✅ Success Check**: You should see output like:
```
git version 2.43.0.windows.1
```

![Git version check](installation-screenshots/windows/05-git-version.png)

**❌ If you see "git is not recognized"**:
- Make sure you closed the old Command Prompt and opened a new one
- Try restarting your computer
- Reinstall Git and make sure you selected the PATH environment option

---

## Step 3: Install Docker Desktop

Docker is software that runs the RL Lab application in an isolated environment, so you don't need to manually install Python, Node.js, or other dependencies.

### 3.1 Check System Requirements

Docker Desktop requires **WSL 2** (Windows Subsystem for Linux). Most modern Windows installations already have this, but we'll verify.

1. Open Command Prompt as **Administrator**:
   - Press `Windows Key + R`
   - Type `cmd`
   - Press `Ctrl + Shift + Enter` (instead of just Enter)
   - Click "Yes" when prompted

2. Type this command and press Enter:
   ```bash
   wsl --status
   ```

**If you see WSL status information**: ✅ You're ready! Proceed to 3.2

**If you see "wsl is not recognized" or an error**: You need to install WSL 2 first:

```bash
wsl --install
```

This will take a few minutes. **You'll need to restart your computer** after installation completes.

After restart, open Command Prompt and verify:
```bash
wsl --status
```

![WSL status check](installation-screenshots/windows/06-wsl-status.png)

### 3.2 Download Docker Desktop

1. Open your web browser
2. Go to: **https://www.docker.com/products/docker-desktop/**
3. Click the big **"Download for Windows"** button
4. Wait for the download to complete (file is about 500MB)

![Docker Desktop download page](installation-screenshots/windows/07-docker-download.png)

### 3.3 Install Docker Desktop

1. Find the downloaded file in your Downloads folder
   - Look for `Docker Desktop Installer.exe`
2. Double-click the file to start installation
3. Click "Yes" if Windows asks for permission
4. In the installer:
   - **Check** "Use WSL 2 instead of Hyper-V" (if shown)
   - Click "OK" or "Install"
5. Wait for installation (takes 2-5 minutes)
6. Click "Close" when done
7. **Restart your computer** if prompted

![Docker Desktop installer](installation-screenshots/windows/08-docker-installer.png)

### 3.4 Start Docker Desktop

1. Open the Start menu
2. Search for "Docker Desktop"
3. Click to open it
4. Docker Desktop will take 30-60 seconds to start
5. You may see a "Docker Subscription Service Agreement" - click "Accept"
6. You may be asked to create a Docker account - you can **skip** this (click "Continue without signing in" or similar)

**✅ Success Check**: Look for the Docker whale icon in your system tray (bottom-right corner, near the clock). When Docker is running, the whale icon will be steady (not animating).

![Docker running in system tray](installation-screenshots/windows/09-docker-running.png)

### 3.5 Verify Docker Installation

1. Open Command Prompt (see Step 1)
2. Type this command and press Enter:
   ```bash
   docker --version
   ```

**✅ Success Check**: You should see output like:
```
Docker version 24.0.7, build afdd53b
```

![Docker version check](installation-screenshots/windows/10-docker-version.png)

**❌ Troubleshooting**:

- **"docker is not recognized"**: Docker Desktop might not be running. Open Docker Desktop from the Start menu and wait for it to fully start.
- **"Error during connect"**: Docker daemon is not running. Check the Docker whale icon in system tray - if it says "Docker Desktop is starting", wait a bit longer.
- **WSL 2 error**: Go back to Step 3.1 and ensure WSL 2 is properly installed.

---

## Step 4: Clone the RL Lab Repository

Now you'll download the RL Lab project files to your computer.

### 4.1 Choose Where to Save the Project

First, decide where you want to save the project. Common locations:
- Desktop: `cd %USERPROFILE%\Desktop`
- Documents: `cd %USERPROFILE%\Documents`
- Or anywhere else you prefer!

1. Open Command Prompt
2. Navigate to your chosen location. For example, to use Desktop:
   ```bash
   cd %USERPROFILE%\Desktop
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

![Git clone in progress](installation-screenshots/windows/11-git-clone.png)

### 4.3 Enter the Project Directory

Now move into the project folder:
```bash
cd workshop-rl1-introduction
```

**✅ Success Check**: Type `dir` and press Enter. You should see folders like:
- backend
- frontend
- docs
- And files like README.md, docker-compose.yml

![Project directory contents](installation-screenshots/windows/12-directory-contents.png)

**❌ If git clone fails**:
- Check your internet connection
- Make sure you typed the URL correctly
- Try again - sometimes network issues cause temporary failures

---

## Step 5: Start the Application

You're almost there! Now let's start RL Lab.

### 5.1 Make Sure Docker Desktop is Running

Before continuing, check that Docker Desktop is running:
- Look for the Docker whale icon in your system tray (bottom-right)
- Click it - you should see "Docker Desktop is running"
- If it says "Docker Desktop is starting", wait until it's fully started

### 5.2 Start the Application

In Command Prompt (make sure you're still in the `workshop-rl1-introduction` folder), type:
```bash
docker-compose up
```

Press Enter and wait...

### 5.3 What to Expect

**First time running** (~1-2 minutes):
- Docker will download pre-built images from the internet
- You'll see lots of text scrolling - this is normal!
- Look for messages like:
  - `Pulling backend...`
  - `Pulling frontend...`
  - `Creating workshop-rl1-introduction_backend_1`
  - `Creating workshop-rl1-introduction_frontend_1`

**When ready, you'll see**:
```
backend_1   | * Running on http://0.0.0.0:5001/
frontend_1  | webpack compiled successfully
frontend_1  | Compiled successfully!
```

![Docker compose running](installation-screenshots/windows/13-docker-compose-up.png)

**⚠️ Important**:
- **Keep this Command Prompt window open** while you use RL Lab
- Closing it will stop the application
- To stop the application later, press `Ctrl + C` in this window

**❌ Troubleshooting**:

- **"Cannot connect to Docker daemon"**: Docker Desktop is not running. Open it from Start menu and wait for it to fully start.
- **"Port 3030 is already allocated"**: Something else is using port 3030. Close other applications (especially other development servers) and try again.
- **"Error response from daemon: pull access denied"**: Check your internet connection and try again.

---

## Step 6: Access RL Lab in Your Browser

🎉 You're ready to use RL Lab!

1. Open your web browser (Chrome, Firefox, Edge, Safari - any browser works)
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

1. Go back to the Command Prompt window where `docker-compose up` is running
2. Press `Ctrl + C` on your keyboard
3. Wait for the containers to stop (you'll see "Stopping..." messages)
4. You can now close the Command Prompt window

To start again later, just:
1. Open Command Prompt
2. Navigate to the project folder: `cd %USERPROFILE%\Desktop\workshop-rl1-introduction`
3. Run: `docker-compose up`

---

## Common Issues and Solutions

### Docker Desktop won't start
**Symptoms**: Docker icon in system tray shows error, or "Docker Desktop starting..." never completes

**Solutions**:
1. Restart your computer
2. Check Windows version (must be Windows 10 1903+ or Windows 11)
3. Ensure Virtualization is enabled in BIOS (check Task Manager → Performance → CPU → Virtualization: Enabled)
4. Reinstall Docker Desktop

### "git is not recognized as a command"
**Solutions**:
1. Close Command Prompt and open a new one
2. Restart your computer
3. Reinstall Git for Windows, ensuring you select the PATH option

### Port conflicts (3030 or 5001 already in use)
**Symptoms**: Error messages like:
```
Error: bind: address already in use
Error starting userland proxy: listen tcp 0.0.0.0:3030: bind: address already in use
```

This means another program is already using port 3030 (frontend) or 5001 (backend).

#### **Option 1: Find and Stop the Conflicting Process** (Recommended)

**Step 1 - Find what's using the port:**

For port 3030:
```cmd
netstat -ano | findstr :3030
```

For port 5001:
```cmd
netstat -ano | findstr :5001
```

You'll see output like:
```
TCP    0.0.0.0:3030    0.0.0.0:0    LISTENING    12345
```

The last number (`12345`) is the **Process ID (PID)**.

**Step 2 - Find out what program it is:**
```cmd
tasklist | findstr 12345
```

This shows the program name (e.g., `node.exe`, `python.exe`, or another app).

**Step 3 - Stop the process:**

**Method A** - Using Task Manager (Beginner-friendly):
1. Press `Ctrl + Shift + Esc` to open Task Manager
2. Go to the "Details" tab
3. Find the process with the PID you identified (e.g., `12345`)
4. Right-click it → "End Task"

**Method B** - Using Command Prompt:
```cmd
taskkill /PID 12345 /F
```

Replace `12345` with your actual PID. The `/F` flag forces termination.

**Step 4 - Try starting RL Lab again:**
```cmd
docker-compose up
```

#### **Option 2: Change RL Lab's Ports** (If you need both applications running)

If you want to keep the other application running, change RL Lab's ports:

1. Open `docker-compose.yml` in a text editor (Notepad works)
2. Find these lines:
   ```yaml
   frontend:
     ports:
       - "3000:3030"
   backend:
     ports:
       - "5001:5001"
   ```

3. Change to different ports (e.g., 3001 and 5002):
   ```yaml
   frontend:
     ports:
       - "3001:3030"
   backend:
     ports:
       - "5002:5001"
   ```

4. Save the file
5. Start RL Lab: `docker-compose up`
6. Access at the new port: `http://localhost:3001`

**Common culprits using these ports**:
- Port 3030: React development servers, other Node.js apps
- Port 5001: Flask apps, other Python servers, macOS AirPlay Receiver
- Check if you have other Docker containers running: `docker ps`

### Browser shows "This site can't be reached"
**Solutions**:
1. Make sure `docker-compose up` is still running (check Command Prompt window)
2. Wait a bit longer - first startup can take 2-3 minutes
3. Try refreshing the browser
4. Check Docker Desktop is running
5. Look at Command Prompt output for error messages

### Training doesn't start or shows errors
**Solutions**:
1. Check Command Prompt window for backend error messages
2. Try clicking "Reset" and then "Start Training" again
3. Refresh the browser page

---

## Next Steps

✅ **Installation complete!** You're ready to explore reinforcement learning.

**Learn More**:
- [README.md](../README.md) - Project overview and features
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical details about how RL Lab works
- [Docker Workflow Guide](../tutorials/docker-workflow.md) - Advanced Docker usage

**Need Help?**
- Check the troubleshooting section above
- Ask your workshop instructor
- Open an issue on GitHub: https://github.com/aihpi/workshop-rl1-introduction/issues

---

**🎓 Ready to learn? Start experimenting with different parameters and see how they affect the agent's learning!**
