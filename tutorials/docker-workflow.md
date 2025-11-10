
#### Development Guide for Docker Beginners

This guide walks you through the complete development workflow using Docker, from setup to daily development.

**Visual Overview of Your Development Setup:**

```
┌─────────────────────────────────────────────────────────────┐
│ Your Computer (macOS/Windows/Linux)                        │
│                                                             │
│  ┌──────────────┐         ┌──────────────┐                │
│  │ VS Code      │         │ Browser      │                │
│  │ Editor       │         │              │                │
│  └──────────────┘         └──────────────┘                │
│         │                        │                         │
│         │ Edit files             │ View app                │
│         ↓                        ↓                         │
│  ┌──────────────┐         ┌──────────────┐                │
│  │ backend/     │◄────────┤ localhost:   │                │
│  │ frontend/    │ Mounted │ 3000, 5001   │                │
│  │ (Your code)  │         │              │                │
│  └──────────────┘         └──────────────┘                │
│         ║                        ║                         │
│         ║ Volume mounting        ║ Port forwarding         │
│         ↓                        ↓                         │
│  ╔═══════════════════════════════════════════╗            │
│  ║ Docker Desktop                             ║            │
│  ║  ┌─────────────┐    ┌─────────────┐      ║            │
│  ║  │ Backend     │    │ Frontend    │      ║            │
│  ║  │ Container   │◄───┤ Container   │      ║            │
│  ║  │ (Python)    │    │ (Node.js)   │      ║            │
│  ║  └─────────────┘    └─────────────┘      ║            │
│  ╚═══════════════════════════════════════════╝            │
└─────────────────────────────────────────────────────────────┘

Changes flow: Edit file → Container sees change → Server reloads → Browser updates
```

##### 1️⃣ First-Time Setup (Do this once)

**Step 1: Install Docker Desktop**
- Download from https://www.docker.com/products/docker-desktop/
- Install and start Docker Desktop
- Verify installation:
  ```bash
  docker --version
  docker-compose --version
  ```
  You should see version numbers for both commands.

**Step 2: Clone the Repository**
```bash
git clone <repository-url>
cd workshop-rl1-introduction
```

**Step 3: Build and Start Containers (First Build)**

The first build will take 5-10 minutes because Docker needs to:
- Download base images (Python, Node.js)
- Install all Python packages
- Install all npm packages

```bash
docker-compose up --build
```

Watch the output. You'll see:
- `backend_1` and `frontend_1` building
- Package installations scrolling by
- Eventually: "Server running on http://localhost:5001" (backend)
- Eventually: "webpack compiled successfully" (frontend)

**Step 4: Verify Everything Works**
- Open browser to http://localhost:3000
- You should see the RL Playground interface
- Try starting a training session to verify everything works

**Step 5: Stop the Containers**

Press `Ctrl+C` in the terminal where docker-compose is running.

---

##### 2️⃣ Daily Development Workflow

**Starting Your Work Day**

```bash
# Navigate to project directory
cd workshop-rl1-introduction

# Start containers (much faster after first build - takes ~10 seconds)
docker-compose up
```

Keep this terminal open. You'll see logs from both backend and frontend here.

**Opening a Second Terminal for Commands**

Open a new terminal window/tab for git commands, checking files, etc. Leave the docker-compose terminal running.

---

##### 3️⃣ Making Code Changes

**The Magic: Live Code Reloading**

Your code on your computer is "mounted" into the Docker containers. This means:
- You edit files in your normal editor (VS Code, PyCharm, etc.)
- The containers see the changes immediately
- The servers automatically reload

**Example: Editing Backend Code**

1. Open `backend/algorithms/q_learning.py` in your editor
2. Make a change (add a print statement, modify logic, etc.)
3. Save the file
4. Watch the docker-compose terminal - you'll see:
   ```
   backend_1  | * Detected change in '/app/algorithms/q_learning.py', reloading
   backend_1  | * Restarting with stat
   ```
5. The backend automatically restarted with your changes!

**Example: Editing Frontend Code**

1. Open `frontend/src/components/ParameterPanel.jsx`
2. Make a change (modify text, add a button, etc.)
3. Save the file
4. Watch your browser - the page automatically refreshes!
5. Your changes appear instantly (no manual refresh needed)

**What You DON'T Need to Do:**
- ❌ Restart containers manually
- ❌ Run build commands
- ❌ Refresh the browser (frontend does it automatically)
- ❌ Reinstall packages (unless you add new dependencies)

---

##### 4️⃣ Adding New Dependencies

Sometimes you need to add a new Python package or npm package.

**Adding a Python Package**

1. Stop containers (`Ctrl+C`)
2. Edit `backend/pyproject.toml` to add your package:
   ```toml
   dependencies = [
       "flask>=3.0.0",
       "your-new-package>=1.0.0"  # Add this line
   ]
   ```
3. Rebuild and restart:
   ```bash
   docker-compose up --build
   ```
   The `--build` flag tells Docker to reinstall packages.

**Adding an npm Package**

1. Stop containers (`Ctrl+C`)
2. Add the package to `frontend/package.json` dependencies section:
   ```json
   "dependencies": {
     "react": "^18.2.0",
     "your-new-package": "^1.0.0"
   }
   ```
3. Rebuild and restart:
   ```bash
   docker-compose up --build
   ```

**Why `--build`?** Without it, Docker uses cached package installations. `--build` forces Docker to reinstall everything with your new packages.

---

##### 5️⃣ Viewing Logs and Debugging

**Viewing Logs While Running**

Your docker-compose terminal shows logs from both services. To filter:

```bash
# In a second terminal (keep docker-compose running in first)
docker-compose logs backend      # Only backend logs
docker-compose logs frontend     # Only frontend logs
docker-compose logs -f backend   # Follow backend logs in real-time
```

**Debugging Backend Code**

Print statements work great:
```python
print(f"DEBUG: Episode {episode}, reward {reward}")
```

These print statements appear in your docker-compose terminal immediately.

**Debugging Frontend Code**

Use browser DevTools:
- Open browser DevTools (F12 or Right-click → Inspect)
- Console tab shows `console.log()` output
- Network tab shows API calls to backend
- React DevTools extension helps with component debugging

**Running Commands Inside Containers**

Sometimes you need to run a command inside a container:

```bash
# Open a shell in the backend container
docker-compose exec backend /bin/bash

# Now you're "inside" the container - you can run Python:
python
>>> import numpy as np
>>> np.array([1,2,3])
>>> exit()

# Exit the container shell
exit
```

```bash
# Open a shell in the frontend container
docker-compose exec frontend /bin/bash

# Check installed npm packages
npm list

# Exit
exit
```

---

##### 6️⃣ Common Development Tasks

**Task: Pull Latest Changes from Git**

```bash
# Stop containers
# Press Ctrl+C in docker-compose terminal

# Pull changes
git pull origin main

# Restart containers (rebuild if dependencies changed)
docker-compose up --build
```

**Task: Switch Git Branches**

```bash
# Stop containers (Ctrl+C)

# Switch branch
git checkout feature-branch

# Restart (rebuild if the branch has different dependencies)
docker-compose up --build
```

**Task: Reset to Fresh State**

If something breaks and you want to start completely fresh:

```bash
# Stop containers (Ctrl+C)

# Remove containers and volumes (this deletes everything Docker-related)
docker-compose down -v

# Rebuild from scratch
docker-compose up --build
```

This is like "turning it off and on again" but for Docker. Your code files are safe - this only affects Docker containers.

**Task: Running Tests**

```bash
# Backend tests (if you have them)
docker-compose exec backend pytest

# Frontend tests
docker-compose exec frontend npm test
```

---

##### 7️⃣ Stopping Your Work

**Option A: Keep Containers Running (Recommended)**

Just close your browser and editor. The containers keep running in the background. Tomorrow:
```bash
cd workshop-rl1-introduction
# Containers are still running - just open http://localhost:3000
```

Check if they're running:
```bash
docker-compose ps
```

**Option B: Stop Containers (Saves RAM)**

```bash
# In the docker-compose terminal, press Ctrl+C
# OR in another terminal:
docker-compose down
```

This stops the containers. Tomorrow you'll need to run `docker-compose up` again.

---

##### 8️⃣ Docker Mental Model (Understanding What's Happening)

**Think of Docker containers like lightweight virtual machines:**

- **Your Computer (Host)**: Where you edit code
- **Backend Container**: A mini Linux machine running Python/Flask
- **Frontend Container**: A mini Linux machine running Node.js/React

**Volume Mounting**: Your local folders are "shared" with containers:
- You edit `backend/app.py` on your computer
- The backend container sees the same file at `/app/app.py`
- When you save, the container sees the change immediately

**Networking**: Containers talk to each other:
- Frontend container can reach backend at `http://backend:5001`
- Your browser reaches frontend at `http://localhost:3000`
- Your browser reaches backend at `http://localhost:5001`

**Isolation**: Containers are isolated:
- Deleting a container doesn't delete your code
- Python packages in the container don't affect your computer's Python
- You can't accidentally break your system Python or Node.js

---

##### 9️⃣ Common Beginner Mistakes (and How to Fix Them)

**Mistake 1: Editing files inside the container**
```bash
docker-compose exec backend /bin/bash
vim app.py  # ❌ DON'T DO THIS
```
**Fix**: Edit files on your computer with your normal editor. Changes automatically sync to the container.

**Mistake 2: Forgetting to rebuild after adding dependencies**
- Added a package but getting "Module not found"?
- **Fix**: Stop containers, run `docker-compose up --build`

**Mistake 3: Port already in use**
- Error: "port is already allocated"
- **Fix**: Something else is using port 3000 or 5001. Stop that service or change ports in `docker-compose.yml`

**Mistake 4: Docker Desktop not running**
- Error: "Cannot connect to the Docker daemon"
- **Fix**: Start Docker Desktop application

**Mistake 5: Changes not appearing**
- Made code changes but don't see them?
- **Fix**: Check the docker-compose logs for errors. Restart containers: `docker-compose restart`

---

##### 🔟 Troubleshooting Flowchart

When something goes wrong, follow this decision tree:

**Problem: Docker commands not working**
```
❓ Can you run `docker --version`?
├─ No → Docker Desktop not installed or not running
│        Solution: Install/Start Docker Desktop
└─ Yes → Continue below
```

**Problem: Containers won't start**
```
❓ Do you see "port is already allocated"?
├─ Yes → Port 3000 or 5001 is in use
│        Solution: Find and stop the conflicting service
│        • macOS/Linux: lsof -i :3000 or lsof -i :5001
│        • Windows: Get-NetTCPConnection -LocalPort 3000
└─ No → Check logs: docker-compose logs
         Look for error messages in the output
```

**Problem: Code changes not appearing**
```
❓ Did you save the file?
├─ No → Save it! :)
└─ Yes ↓

❓ Did you add a new dependency (package)?
├─ Yes → Rebuild: docker-compose up --build
└─ No ↓

❓ Does docker-compose logs show errors?
├─ Yes → Read the error message - it usually tells you what's wrong
└─ No → Try restarting: docker-compose restart
        Still broken? Nuclear option: docker-compose down -v
                                      docker-compose up --build
```

**Problem: "Module not found" or "Package not found"**
```
Did you add a new Python package or npm package?
└─ Yes → You forgot to rebuild!
         Solution: docker-compose down
                   docker-compose up --build
```

**Problem: Everything was working, now it's broken**
```
❓ Did someone else push changes to git?
├─ Yes → Pull and rebuild:
│        git pull origin main
│        docker-compose up --build
└─ No ↓

❓ Did you switch branches?
├─ Yes → Rebuild: docker-compose up --build
└─ No → When in doubt, fresh start:
        docker-compose down -v
        docker-compose up --build
```

---

##### 1️⃣1️⃣ Getting Help

If you're stuck after trying the troubleshooting steps:

1. **Check the logs** - most problems show error messages:
   ```bash
   docker-compose logs
   ```

2. **Search the error message** - Copy the key part of the error and search online

3. **Ask for help** - Share:
   - What you were trying to do
   - The error message (from docker-compose logs)
   - What you've already tried

4. **Fresh start** - Often fixes mysterious issues:
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

---

#### Quick Reference: Useful Docker Commands

```bash
# Start in background (detached mode)
docker-compose up -d

# View logs
docker-compose logs -f          # All services
docker-compose logs backend     # Backend only
docker-compose logs frontend    # Frontend only

# Stop containers
docker-compose down

# Rebuild after dependency changes (package.json, pyproject.toml)
docker-compose up --build

# Remove all containers and volumes (fresh start)
docker-compose down -v
```

#### Troubleshooting Docker Setup

**Containers not starting**: Check Docker Desktop is running
```bash
docker --version  # Should show Docker version
```

**Port already in use**: Make sure ports 3000 and 5001 are not used by other applications
```bash
# macOS/Linux
lsof -i :3000
lsof -i :5001

# Windows (PowerShell)
Get-NetTCPConnection -LocalPort 3000
Get-NetTCPConnection -LocalPort 5001
```

**Changes not reflecting**: Restart containers
```bash
docker-compose restart
```

**"Permission denied" errors on Linux**: Add your user to docker group
```bash
sudo usermod -aG docker $USER
# Then log out and log back in
```

---