# 🐧 Linux Installation Guide

Complete step-by-step installation guide for RL Lab on Linux (Ubuntu/Debian-based distributions).

**Estimated time**: 15-20 minutes for first-time setup

**Note**: This guide is written for Ubuntu 20.04+ and Debian 11+. Other distributions may require different commands.

---

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] Ubuntu 20.04+ or Debian 11+ (or equivalent distribution)
- [ ] Sudo access (administrator privileges)
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

### 2.1 Update Package Lists

First, update your system's package information:
```bash
sudo apt update
```

You'll be asked for your password. Type it and press Enter.
**Note**: You won't see characters appear as you type your password - this is normal for security reasons.

### 2.2 Install Git

Install Git with this command:
```bash
sudo apt install git -y
```

The `-y` flag automatically answers "yes" to prompts. Installation takes about 30 seconds.

![Installing Git](installation-screenshots/linux/02-install-git.png)

### 2.3 Verify Git Installation

Check that Git is installed:
```bash
git --version
```

**✅ Success Check**: You should see output like:
```
git version 2.34.1
```

![Git version check](installation-screenshots/linux/03-git-version.png)

---

## Step 3: Install Docker Engine

Docker runs the RL Lab application in an isolated environment, so you don't need to manually install Python, Node.js, or other dependencies.

**Note**: Linux uses **Docker Engine** (command-line), not Docker Desktop like Windows/Mac.

### 3.1 Install Prerequisites

Install required packages for Docker installation:
```bash
sudo apt install ca-certificates curl gnupg -y
```

### 3.2 Add Docker's Official GPG Key

Create a directory for Docker's key:
```bash
sudo install -m 0755 -d /etc/apt/keyrings
```

Download and add Docker's GPG key:
```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

Set proper permissions:
```bash
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

### 3.3 Set Up Docker Repository

Add Docker's repository to your system:
```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

Update package lists again:
```bash
sudo apt update
```

### 3.4 Install Docker Engine

Install Docker and related tools:
```bash
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y
```

This takes about 1-2 minutes.

![Installing Docker](installation-screenshots/linux/04-install-docker.png)

### 3.5 Add Your User to Docker Group (Important!)

By default, Docker requires `sudo` for every command. To avoid this, add your user to the `docker` group:

```bash
sudo usermod -aG docker $USER
```

Activate the group changes:
```bash
newgrp docker
```

**Important**: If `newgrp` doesn't work on your system, you'll need to **log out and log back in** (or restart your computer) for the group change to take effect.

### 3.6 Verify Docker Installation

Check that Docker is installed and you can run it without `sudo`:
```bash
docker --version
```

**✅ Success Check**: You should see output like:
```
Docker version 24.0.7, build afdd53b
```

![Docker version check](installation-screenshots/linux/05-docker-version.png)

Test that Docker is working:
```bash
docker run hello-world
```

This downloads a tiny test image and runs it. You should see:
```
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

**❌ Troubleshooting**:

- **"permission denied"**: You need to run `newgrp docker` or log out and back in
- **"Cannot connect to the Docker daemon"**: Docker service is not running. Start it with:
  ```bash
  sudo systemctl start docker
  sudo systemctl enable docker
  ```
- **"command not found"**: Docker installation may have failed. Try reinstalling or check for error messages

---

## Step 4: Install Docker Compose (if needed)

Docker Compose should be installed automatically in Step 3.4 as `docker-compose-plugin`. Let's verify:

### 4.1 Check Docker Compose Version

Try the modern syntax first:
```bash
docker compose version
```

**✅ If you see a version number like `Docker Compose version v2.21.0`, you're good! Skip to Step 5.**

**❌ If you get "docker: 'compose' is not a docker command"**, try the legacy syntax:
```bash
docker-compose --version
```

**If neither works**, install docker-compose manually:
```bash
sudo apt install docker-compose -y
```

Then verify:
```bash
docker-compose --version
```

**Note**: In subsequent steps, use whichever version works:
- Modern: `docker compose up`
- Legacy: `docker-compose up`

---

## Step 5: Clone the RL Lab Repository

Now you'll download the RL Lab project files to your computer.

### 5.1 Choose Where to Save the Project

First, decide where you want to save the project. Common locations:
- Home directory: `cd ~`
- Desktop: `cd ~/Desktop` (if you have a Desktop folder)
- Documents: `cd ~/Documents`
- Or anywhere else you prefer!

Navigate to your chosen location. For example, to use your home directory:
```bash
cd ~
```

### 5.2 Clone the Repository

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

![Git clone in progress](installation-screenshots/linux/06-git-clone.png)

### 5.3 Enter the Project Directory

Now move into the project folder:
```bash
cd workshop-rl1-introduction
```

**✅ Success Check**: Type `ls` and press Enter. You should see folders and files like:
```
backend/        frontend/       docs/
README.md       docker-compose.yml
```

![Project directory contents](installation-screenshots/linux/07-directory-contents.png)

**❌ If git clone fails**:
- Check your internet connection
- Make sure you typed the URL correctly
- Try again - sometimes network issues cause temporary failures

---

## Step 6: Start the Application

You're almost there! Now let's start RL Lab.

### 6.1 Start Docker Service (if needed)

Make sure Docker is running:
```bash
sudo systemctl status docker
```

If it says "active (running)", you're good!

If it's not running, start it:
```bash
sudo systemctl start docker
```

### 6.2 Start the Application

In Terminal (make sure you're still in the `workshop-rl1-introduction` folder), type:

**For modern Docker Compose:**
```bash
docker compose up
```

**For legacy docker-compose:**
```bash
docker-compose up
```

Press Enter and wait...

### 6.3 What to Expect

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

![Docker compose running](installation-screenshots/linux/08-docker-compose-up.png)

**⚠️ Important**:
- **Keep this Terminal window open** while you use RL Lab
- Closing it will stop the application
- To stop the application later, press `Ctrl + C` in this window

**❌ Troubleshooting**:

- **"permission denied"**: You're not in the docker group. Run:
  ```bash
  sudo usermod -aG docker $USER
  newgrp docker
  ```
  Then try again.

- **"Cannot connect to Docker daemon"**: Docker service is not running. Start it:
  ```bash
  sudo systemctl start docker
  ```

- **"Port 3030 is already allocated"**: Something else is using port 3030. Close other applications and try again, or check for other containers:
  ```bash
  docker ps
  docker stop <container-id>
  ```

- **"Error response from daemon: pull access denied"**: Check your internet connection and try again.

---

## Step 7: Access RL Lab in Your Browser

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

1. Go back to the Terminal window where `docker compose up` is running
2. Press `Ctrl + C` on your keyboard
3. Wait for the containers to stop (you'll see "Stopping..." messages)
4. You can now close the Terminal window

To start again later, just:
1. Open Terminal
2. Navigate to the project folder: `cd ~/workshop-rl1-introduction` (or wherever you saved it)
3. Run: `docker compose up` (or `docker-compose up` for legacy)

---

## Common Issues and Solutions

### "permission denied" when running Docker commands
**Cause**: Your user is not in the docker group

**Solutions**:
1. Add yourself to the docker group:
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```
2. If that doesn't work, log out and log back in
3. As a last resort, restart your computer

### Docker daemon is not running
**Symptoms**: "Cannot connect to the Docker daemon" error

**Solutions**:
1. Start Docker service:
   ```bash
   sudo systemctl start docker
   ```
2. Enable Docker to start on boot:
   ```bash
   sudo systemctl enable docker
   ```
3. Check Docker status:
   ```bash
   sudo systemctl status docker
   ```

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
sudo lsof -i :3030
```

For port 5001:
```bash
sudo lsof -i :5001
```

**Alternative** (if `lsof` is not installed):
```bash
sudo netstat -tulpn | grep :3030
sudo netstat -tulpn | grep :5001
```

Or using `ss` (modern replacement for netstat):
```bash
sudo ss -tulpn | grep :3030
sudo ss -tulpn | grep :5001
```

You'll see output like:
```
COMMAND   PID      USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node    12345  username   23u  IPv4  12345      0t0  TCP *:3030 (LISTEN)
```

The **PID** (Process ID) is in the second column (e.g., `12345`).

**Step 2 - Find out what program it is:**

The `COMMAND` column shows what's running (e.g., `node`, `python3`, `docker-proxy`).

For more details:
```bash
ps aux | grep 12345
```

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

**Note**: If the process belongs to another user or requires elevated privileges, use:
```bash
sudo kill 12345
```

**Step 4 - Try starting RL Lab again:**
```bash
docker compose up
```

#### **Option 2: Change RL Lab's Ports** (If you need both applications running)

If you want to keep the other application running, change RL Lab's ports:

1. Open `docker-compose.yml` in a text editor (nano, vim, gedit, or any editor):
   ```bash
   nano docker-compose.yml
   ```

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

4. Save the file (in nano: `Ctrl + O`, then Enter, then `Ctrl + X`)
5. Start RL Lab: `docker compose up`
6. Access at the new port: `http://localhost:3001`

**Common culprits using these ports**:
- **Port 3030**: React development servers, other Node.js apps
- **Port 5001**: Flask apps, other Python servers
- Check for other Docker containers: `docker ps`
- Check for services: `sudo systemctl list-units --type=service --state=running`

### Browser shows "Unable to connect" or "Connection refused"
**Solutions**:
1. Make sure `docker compose up` is still running (check Terminal window)
2. Wait a bit longer - first startup can take 2-3 minutes
3. Try refreshing the browser
4. Check Docker is running: `sudo systemctl status docker`
5. Look at Terminal output for error messages

### Training doesn't start or shows errors
**Solutions**:
1. Check Terminal window for backend error messages
2. Try clicking "Reset" and then "Start Training" again
3. Refresh the browser page

### Firewall blocking connections
**Symptoms**: Can't access localhost:3030 even though containers are running

**Solutions**:
1. Check firewall status:
   ```bash
   sudo ufw status
   ```
2. If firewall is active, allow the ports:
   ```bash
   sudo ufw allow 3000
   sudo ufw allow 5001
   ```
3. Or temporarily disable firewall for testing:
   ```bash
   sudo ufw disable
   ```

---

## Distribution-Specific Notes

### Fedora / RHEL / CentOS
Use `dnf` instead of `apt`:
```bash
sudo dnf install git docker docker-compose
```

### Arch Linux
Use `pacman`:
```bash
sudo pacman -S git docker docker-compose
```

### openSUSE
Use `zypper`:
```bash
sudo zypper install git docker docker-compose
```

After installation, make sure to:
1. Start Docker: `sudo systemctl start docker`
2. Enable on boot: `sudo systemctl enable docker`
3. Add user to docker group: `sudo usermod -aG docker $USER`

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
