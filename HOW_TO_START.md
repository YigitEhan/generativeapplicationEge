# 🚀 How to Start the Application

## The Problem You Were Having

You kept getting this error:
```
Error: listen EADDRINUSE: address already in use :::3000
```

This happens because Node.js processes don't always shut down cleanly when you stop them with Ctrl+C. The process keeps running in the background and holds onto port 3000.

---

## ✅ THE SOLUTION

I've created scripts that automatically kill any processes on ports 3000 and 5173-5176 before starting the application.

### Option 1: Kill Ports Then Start (RECOMMENDED)

**Step 1: Kill any processes on the ports**
```powershell
powershell -ExecutionPolicy Bypass -File kill-ports.ps1
```

**Step 2: Start the application**
```powershell
npm run dev
```

### Option 2: Use the Start Script (All-in-One)

```powershell
powershell -ExecutionPolicy Bypass -File start.ps1
```

This does both steps automatically.

---

## 📝 What Each Script Does

### `kill-ports.ps1`
- Finds all processes using ports 3000, 5173, 5174, 5175, 5176
- Kills them forcefully
- Shows you what it killed
- Tells you when it's done

### `start.ps1`
- Runs `kill-ports.ps1` automatically
- Then starts `npm run dev`

---

## 🔧 Manual Method (If Scripts Don't Work)

**Step 1: Find the process on port 3000**
```powershell
netstat -ano | findstr :3000
```

You'll see output like:
```
TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    12345
```

The last number (12345) is the PID.

**Step 2: Kill the process**
```powershell
taskkill /F /PID 12345
```

Replace `12345` with the actual PID from step 1.

**Step 3: Start the application**
```powershell
npm run dev
```

---

## 🎯 Quick Reference

| What You Want | Command |
|---------------|---------|
| Kill ports only | `powershell -ExecutionPolicy Bypass -File kill-ports.ps1` |
| Kill ports + start | `powershell -ExecutionPolicy Bypass -File start.ps1` |
| Start normally | `npm run dev` |
| Stop servers | Press `Ctrl+C` in the terminal |

---

## 🌐 Access the Application

Once started, you can access:

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs

**Demo Login:**
- Email: `applicant@recruitment.com`
- Password: `applicant123`

---

## ❓ Troubleshooting

### "Port 3000 is still in use"

Run the kill script again:
```powershell
powershell -ExecutionPolicy Bypass -File kill-ports.ps1
```

Wait 2-3 seconds, then start again.

### "Cannot find module" errors

Install dependencies:
```powershell
npm install
```

### "Database connection error"

Check your `.env` file in the `backend/` folder. Make sure `DATABASE_URL` is correct.

### Frontend shows blank page

1. Check browser console for errors (F12)
2. Make sure backend is running on port 3000
3. Check CORS settings in `backend/src/index.ts`

---

## 🎉 That's It!

You should never see the "port already in use" error again if you use the `kill-ports.ps1` script before starting.

**Recommended workflow:**
1. Open PowerShell in the project folder
2. Run: `powershell -ExecutionPolicy Bypass -File kill-ports.ps1`
3. Run: `npm run dev`
4. Open browser to http://localhost:5173
5. Login with demo account
6. When done, press Ctrl+C to stop

---

**Created**: 2026-01-13  
**Status**: ✅ Working Solution

