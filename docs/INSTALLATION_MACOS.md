# 🍎 macOS Installation Guide

Complete step-by-step installation guide for RL Lab on macOS.

**Estimated time**: 10-15 minutes for first-time setup

---

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] macOS 14 (Sonoma) or newer recommended ([older versions may work but are not officially supported by Docker](https://docs.docker.com/desktop/install/mac-install/))
- [ ] Administrator access to install software
- [ ] At least 4GB RAM (8GB recommended)
- [ ] At least 4GB free disk space

---

## Step 1: Open Terminal

Terminal is where you'll type commands to set up the project.

1. Press `Command (⌘) + Space` on your keyboard
2. Type `Terminal`
3. Press Enter

**✅ Success Check**: You should see a window with text like `YourName@MacBook ~ %`

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
git version 2.45.2 
```

**❌ If you see "command not found" or are prompted to install Command Line Tools:**

### 2.2 Install Git (if needed)

Follow the official instructions:

https://git-scm.com/book/en/v2/Getting-Started-Installing-Git

https://git-scm.com/install/mac

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
   - For **Apple Silicon (M1/M2/M3/M4)**: Choose "Mac with Apple Silicon"
   - For **Intel Mac**: Choose "Mac with Intel chip"
   - Not sure which you have? Click the Apple menu () → "About This Mac" and look at "Chip"

### 3.2 Install Docker Desktop

1. Find the downloaded file in your Downloads folder
   - Look for `Docker.dmg`
2. Double-click `Docker.dmg` to open it
3. A window appears showing the Docker icon and Applications folder
4. **Drag the Docker icon to the Applications folder**
5. Close the installer window
6. You can eject the Docker disk image (right-click the Docker icon on desktop → Eject)

### 3.3 Start Docker Desktop

1. Press `Command (⌘) + Space` on your keyboard, type in **Docker** and open it
2. Or go to **Applications** folder
3. Find and double-click **Docker**
4. macOS may show a warning: "Docker is an app downloaded from the Internet. Are you sure you want to open it?"
   - Click **"Open"**
5. Enter your Mac password if prompted (this is normal for Docker)
6. Docker Desktop will take 30-60 seconds to start
7. You may see a "Docker Subscription Service Agreement" - click **"Accept"**
8. You may be asked to create a Docker account - you can **skip** this (click "Continue without signing in" or similar)

**✅ Success Check**: Look for the Docker whale icon in your menu bar (top-right corner of screen). When Docker is running, the whale icon will be steady (not animating).

**Click the whale icon** - you should see "Docker Desktop is running"

### 3.4 Verify Docker Installation

1. Open Terminal (see Step 1 if you closed it)
2. Type this command and press Enter:
   ```bash
   docker --version
   ```

**✅ Success Check**: You should see output like:
```
Docker version 29.0.1, build eedd969
```

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

Output should look like something like this (numbers might vary):
```
Cloning into 'workshop-rl1-introduction'...
remote: Enumerating objects: 543, done.
remote: Counting objects: 100% (543/543), done.
remote: Compressing objects: 100% (312/312), done.
remote: Total 543 (delta 215), reused 489 (delta 178), pack-reused 0
Receiving objects: 100% (543/543), 2.1 MiB | 5.2 MiB/s, done.
Resolving deltas: 100% (215/215), done.
```

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
docker-compose pull
docker-compose up -d
```
(The `pull` downloads the latest RL Lab images - important if you have run RL Lab before, because `up` alone keeps using old images.)

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
username@Mac workshop-rl1-introduction % docker compose up -d
[+] Running 3/3
 ✔ Network workshop-rl1-introduction_rl-network  Created                                                                                                                                                                                                                                              0.0s 
 ✔ Container workshop-rl1-introduction-backend   Started                                                                                                                                                                                                                                              5.3s 
 ✔ Container workshop-rl1-introduction-frontend  Started  
```

**✅ Success**: Your terminal is now free to use for other commands! The services are running in the background (detached mode with `-d`).

**💡 Viewing logs** (optional, for debugging):
If you need to see what's happening or debug issues, open a **separate terminal** and run:
```bash
docker-compose logs -f
```
This shows live logs from both services. Press `Control + C` to stop viewing logs (the services keep running).

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

**✅ Success!** You should see the RL Lab interface:

![Application Screenshot](../docs/screenshots/app/main-interface.png)

---

## Quick Start: Try It Out!

Now that RL Lab is running, let's see it in action:

1. **Look at the default settings** - The parameter panel on the left shows default values for the Q-Learning algorithm
2. **Click "Start Training"** - Watch the agent learn in real-time!
   - Environment viewer shows the agent's position in FrozenLake
   - Reward chart shows learning progress
   - Q-table heatmap shows learned values
3. **Wait for training to complete** 
4. **Click "Play Policy"** 

---

## Stopping the Application

When you're done using RL Lab:

1. Open Terminal (if you closed it)
2. Navigate to the project folder: `cd ~/Desktop/workshop-rl1-introduction` (or wherever you saved it)
3. Run: `docker-compose down`
4. Wait for the containers to stop (you'll see "Stopped" and "Removed" messages)

To start again later, just:
1. Open Terminal
2. Navigate to the project folder: `cd ~/Desktop/workshop-rl1-introduction` (or wherever you saved it)
3. Run: `docker-compose up -d`

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

(If it is a docker container, try listing containers first: `docker ps` and stop with `docker stop <container_id>`)

Otherwise, try this command to kill the process:

```bash
kill 12345
```

Replace `12345` with your actual PID.


**Step 4 - Try starting RL Lab again:**
```bash
docker-compose up -d
```

#### **Option 2: Change RL Lab's Ports** (If you need both applications running)

If you want to keep the other application running, change RL Lab's ports:

1. Open `docker-compose.yml`
2. Find these lines:
   ```yaml
   frontend:
     ports:
       - "3030:80"
   backend:
     ports:
       - "5001:5001"
   ```

3. Change to different ports (e.g., 3001 and 5002):
   ```yaml
   frontend:
     ports:
       - "3031:80"
   backend:
     ports:
       - "5002:5001"
   ```

4. Save the file
5. Start RL Lab: `docker-compose up -d`
6. Access at the new port: `http://localhost:3031`

**Common culprits using these ports**:
- **Port 3030**: Less common, but could conflict with other services
- **Port 5001**: Flask apps, other Python servers, **macOS AirPlay Receiver** (very common!)

### Browser shows "This site can't be reached"
**Solutions**:
1. Make sure Docker containers are running: `docker-compose ps`
2. Wait a bit longer - first startup can take 2-3 minutes
3. Try refreshing the browser
4. Check Docker Desktop is running (look for whale icon in menu bar)
5. View logs for error messages: `docker-compose logs`

### Apple Silicon (M1/M2/M3) Performance Issues
**Symptoms**: Slow performance or warnings about architecture

**Solutions**:
1. Make sure you downloaded "Mac with Apple chip" version of Docker Desktop
2. In Docker Desktop settings, ensure "Use Rosetta for x86/amd64 emulation on Apple Silicon" is checked
3. Restart Docker Desktop

