# Project Setup Guide - Imperious

This guide will help you set up the Imperious full-stack application (React + Flask + MongoDB).

## Prerequisites
- [Node.js](https://nodejs.org/) (Client)
- [Python 3.8+](https://www.python.org/) (Server)
- [MongoDB](https://www.mongodb.com/try/download/community) (Database)

## 1. Database Setup
Ensure you have a local MongoDB instance running.
```bash
# MacOS (if installed via brew)
brew services start mongodb-community
# or run directly
mongod --config /usr/local/etc/mongod.conf
```
The application expects a database named `imperious` at `mongodb://localhost:27017/imperious`.

We recommend running MongoDB manually as a background process to avoid potential `brew services` errors:
```bash
# Start MongoDB in the background
mongod --config /usr/local/etc/mongod.conf --fork
```
To stop it later, use:
```bash
mongod --shutdown --config /usr/local/etc/mongod.conf
```
The backend runs on **Flask** on port **5001**.

1. Navigate to the backend directory:
   ```bash
   cd back-end
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # MacOS/Linux
   # venv\Scripts\activate  # Windows
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the server:
   ```bash
   python run.py
   ```
   You should see output indicating the server is running on `http://0.0.0.0:5001`.

## 3. Frontend Setup
The frontend is a **React** application running on port **3000**.

> **⚠️ Important Configuration Fix**: 
> The current frontend code points to `localhost:5000`, but the backend runs on `5001`.
> Before running, you must update two files in `front-end/src/services/`:
>
> 1. **Edit `front-end/src/services/axios.js`**:
>    Change `baseURL: 'http://localhost:5000'` to `baseURL: 'http://localhost:5001'`.
>
> 2. **Edit `front-end/src/services/socketService.js`**:
>    Change `io('http://localhost:5000'` to `io('http://localhost:5001'`.

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd front-end
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```
   This will open the app in your browser at `http://localhost:3000`.

## 4. Default Credentials (if applicable)
Check `students.xlsx` in the `back-end` directory for initial student data if the database is seeded from it.

## Troubleshooting
- **CORS Errors**: If you see CORS errors, ensure the backend is running and the frontend configuration points to the correct backend port (5001).
- **Module not found**: Ensure you have activated the virtual environment for Python and ran `npm install` for React.
