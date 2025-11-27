# 🍎 macOS Installation Guide

Complete step-by-step installation guide for RL Lab on macOS.

**Estimated time**: 10-15 minutes for first-time setup

---

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] macOS 10.15 (Catalina) or newer
- [ ] Administrator access to install software
- [ ] At least 4GB RAM (8GB recommended)
- [ ] At least 2GB free disk space
- [ ] Active internet connection

---

## Step 1: Open Terminal

Terminal is where you'll type commands to set up the project.

### Option 1: Using Spotlight Search (Fastest)
1. Press `Command (⌘) + Space` on your keyboard
2. Type `Terminal`
3. Press Enter

![Opening Terminal with Spotlight](installation-screenshots/macos/01-spotlight-terminal.png)

### Option 2: Using Finder
1. Open Finder
2. Go to **Applications** folder
3. Open the **Utilities** folder
4. Double-click **Terminal**

### Option 3: Using Launchpad
1. Click the Launchpad icon in your Dock (rocket icon)
2. Type `Terminal` in the search box
3. Click the Terminal icon

**✅ Success Check**: You should see a window with text like `YourName@MacBook ~ %`

![Terminal window open](installation-screenshots/macos/02-terminal-open.png)

---

## Step 2: Check if Git is Installed

macOS usually comes with Git pre-installed. Let's verify:

### 2.1 Check Git Version

In Terminal, type this command and press Enter:
```bash
git --version
```

**✅ If you see something like this, Git is installed! Skip to Step 3:**
```
git version 2.39.2 (Apple Git-143)
```

![Git version check](installation-screenshots/macos/03-git-version.png)

**❌ If you see "command not found" or are prompted to install Command Line Tools:**

### 2.2 Install Git (if needed)

You'll see a popup asking to install Command Line Tools. Click **"Install"** and follow the prompts:

1. Click "Install" in the popup
2. Click "Agree" to the license terms
3. Wait for installation (takes 5-10 minutes)
4. Click "Done" when finished

**Alternative method** - Install via command:
```bash
xcode-select --install
```

After installation completes, verify again:
```bash
git --version
```

You should now see the Git version number.

---

## Step 3: Install Docker Desktop

Docker runs the RL Lab application in an isolated environment, so you don't need to manually install Python, Node.js, or other dependencies.

### 3.1 Download Docker Desktop

1. Open your web browser (Safari, Chrome, Firefox, etc.)
2. Go to: **https://www.docker.com/products/docker-desktop/**
3. Click **"Download for Mac"**
   - For **Apple Silicon (M1/M2/M3)**: Choose "Mac with Apple chip"
   - For **Intel Mac**: Choose "Mac with Intel chip"
   - Not sure which you have? Click the Apple menu () → "About This Mac" and look at "Chip" or "Processor"

4. Wait for download to complete (file is about 500MB)

![Docker Desktop download page](installation-screenshots/macos/04-docker-download.png)

### 3.2 Install Docker Desktop

1. Find the downloaded file in your Downloads folder
   - Look for `Docker.dmg`
2. Double-click `Docker.dmg` to open it
3. A window appears showing the Docker icon and Applications folder
4. **Drag the Docker icon to the Applications folder**

![Docker DMG installation](installation-screenshots/macos/05-docker-dmg.png)

5. Close the installer window
6. You can eject the Docker disk image (right-click the Docker icon on desktop → Eject)

### 3.3 Start Docker Desktop

1. Open Finder
2. Go to **Applications** folder
3. Find and double-click **Docker**
4. macOS may show a warning: "Docker is an app downloaded from the Internet. Are you sure you want to open it?"
   - Click **"Open"**
5. Enter your Mac password if prompted (this is normal for Docker)
6. Docker Desktop will take 30-60 seconds to start
7. You may see a "Docker Subscription Service Agreement" - click **"Accept"**
8. You may be asked to create a Docker account - you can **skip** this (click "Continue without signing in" or similar)

**✅ Success Check**: Look for the Docker whale icon in your menu bar (top-right corner of screen). When Docker is running, the whale icon will be steady (not animating).

![Docker running in menu bar](installation-screenshots/macos/06-docker-running.png)

**Click the whale icon** - you should see "Docker Desktop is running"

### 3.4 Verify Docker Installation

1. Open Terminal (see Step 1 if you closed it)
2. Type this command and press Enter:
   ```bash
   docker --version
   ```

**✅ Success Check**: You should see output like:
```
Docker version 24.0.7, build afdd53b
```

![Docker version check](installation-screenshots/macos/07-docker-version.png)

**❌ Troubleshooting**:

- **"docker: command not found"**: Docker Desktop might not be fully started. Wait a bit longer and try again.
- **"Cannot connect to the Docker daemon"**: Docker Desktop is not running. Open Docker from Applications and wait for the whale icon to appear in the menu bar.
- **Permission denied**: You may need to add your user to the docker group or run Docker Desktop with administrator privileges.

---

## Step 4: Clone the RL Lab Repository

Now you'll download the RL Lab project files to your computer.

### 4.1 Choose Where to Save the Project

First, decide where you want to save the project. Common locations:
- Desktop: `cd ~/Desktop`
- Documents: `cd ~/Documents`
- Or anywhere else you prefer!

1. In Terminal, navigate to your chosen location. For example, to use Desktop:
   ```bash
   cd ~/Desktop
   ```

**Tip**: `~` is a shortcut for your home folder (`/Users/YourName`)

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

![Git clone in progress](installation-screenshots/macos/08-git-clone.png)

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

![Project directory contents](installation-screenshots/macos/09-directory-contents.png)

**❌ If git clone fails**:
- Check your internet connection
- Make sure you typed the URL correctly
- Try again - sometimes network issues cause temporary failures

---

## Step 5: Start the Application

You're almost there! Now let's start RL Lab.

### 5.1 Make Sure Docker Desktop is Running

Before continuing, check that Docker Desktop is running:
- Look for the Docker whale icon in your menu bar (top-right)
- Click it - you should see "Docker Desktop is running"
- If it says "Docker Desktop is starting", wait until it's fully started

### 5.2 Start the Application

In Terminal (make sure you're still in the `workshop-rl1-introduction` folder), type:
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

![Docker compose running](installation-screenshots/macos/10-docker-compose-up.png)

**⚠️ Important**:
- **Keep this Terminal window open** while you use RL Lab
- Closing it will stop the application
- To stop the application later, press `Control + C` in this window

**❌ Troubleshooting**:

- **"Cannot connect to Docker daemon"**: Docker Desktop is not running. Open it from Applications and wait for the whale icon to appear in menu bar.
- **"Port 3030 is already allocated"**: Something else is using port 3030. Close other applications (especially other development servers) and try again.
- **"Error response from daemon: pull access denied"**: Check your internet connection and try again.

---

## Step 6: Access RL Lab in Your Browser

🎉 You're ready to use RL Lab!

1. Open your web browser (Safari, Chrome, Firefox - any browser works)
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

1. Go back to the Terminal window where `docker-compose up` is running
2. Press `Control + C` on your keyboard
3. Wait for the containers to stop (you'll see "Stopping..." messages)
4. You can now close the Terminal window

To start again later, just:
1. Open Terminal
2. Navigate to the project folder: `cd ~/Desktop/workshop-rl1-introduction` (or wherever you saved it)
3. Run: `docker-compose up`

---

## Common Issues and Solutions

### Docker Desktop won't start
**Symptoms**: Docker icon in menu bar shows error, or never finishes starting

**Solutions**:
1. Restart your Mac
2. Check macOS version (must be 10.15 or newer)
3. Make sure you downloaded the correct version (Apple Silicon vs Intel)
4. Reinstall Docker Desktop

### "git: command not found"
**Solutions**:
1. Install Xcode Command Line Tools: `xcode-select --install`
2. Wait for installation to complete
3. Close Terminal and open a new one

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
```bash
lsof -i :3030
```

For port 5001:
```bash
lsof -i :5001
```

You'll see output like:
```
COMMAND   PID      USER   FD   TYPE    DEVICE SIZE/OFF NODE NAME
node    12345  username   23u  IPv4  0x1234567      0t0  TCP *:3030 (LISTEN)
```

The **PID** (Process ID) is in the second column (e.g., `12345`).

**Step 2 - Find out what program it is:**

The `COMMAND` column already shows you what's running (e.g., `node`, `python`, `Docker`).

**Step 3 - Stop the process:**

**Method A** - Graceful stop (try this first):
```bash
kill 12345
```

Replace `12345` with your actual PID.

**Method B** - Force stop (if graceful doesn't work):
```bash
kill -9 12345
```

The `-9` flag forces immediate termination.

**Step 4 - Try starting RL Lab again:**
```bash
docker-compose up
```

#### **Option 2: Change RL Lab's Ports** (If you need both applications running)

If you want to keep the other application running, change RL Lab's ports:

1. Open `docker-compose.yml` in a text editor (TextEdit, nano, or any editor)
2. Find these lines:
   ```yaml
   frontend:
     ports:
       - "3030:3000"
   backend:
     ports:
       - "5001:5001"
   ```

3. Change to different ports (e.g., 3001 and 5002):
   ```yaml
   frontend:
     ports:
       - "3031:3000"
   backend:
     ports:
       - "5002:5001"
   ```

4. Save the file
5. Start RL Lab: `docker-compose up`
6. Access at the new port: `http://localhost:3031`

**Common culprits using these ports**:
- **Port 3030**: Less common, but could conflict with other services
- **Port 5001**: Flask apps, other Python servers, **macOS AirPlay Receiver** (very common!)
- **Port 7000**: macOS Control Center may use nearby ports

**Special note for macOS users**: Port 5000 and 5001 are often used by **AirPlay Receiver**. To disable:
1. Open **System Settings** (or System Preferences)
2. Go to **General** → **AirDrop & Handoff** (or **Sharing** on older macOS)
3. Uncheck **AirPlay Receiver**

Alternatively, just use Option 2 above to change RL Lab's backend port to 5002.

Also check for other Docker containers: `docker ps`

### Browser shows "This site can't be reached"
**Solutions**:
1. Make sure `docker-compose up` is still running (check Terminal window)
2. Wait a bit longer - first startup can take 2-3 minutes
3. Try refreshing the browser
4. Check Docker Desktop is running (look for whale icon in menu bar)
5. Look at Terminal output for error messages

### Training doesn't start or shows errors
**Solutions**:
1. Check Terminal window for backend error messages
2. Try clicking "Reset" and then "Start Training" again
3. Refresh the browser page

### Apple Silicon (M1/M2/M3) Performance Issues
**Symptoms**: Slow performance or warnings about architecture

**Solutions**:
1. Make sure you downloaded "Mac with Apple chip" version of Docker Desktop
2. In Docker Desktop settings, ensure "Use Rosetta for x86/amd64 emulation on Apple Silicon" is checked
3. Restart Docker Desktop

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
