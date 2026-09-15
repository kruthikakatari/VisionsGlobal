# Visions Learn (VisionsGlobal)

A MERN stack student education and progress tracking platform.

## Project Structure

```text
.
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── features/
│   │   │   ├── students/
│   │   │   ├── assessments/
│   │   │   ├── assignments/
│   │   │   ├── content/
│   │   │   └── parent/
│   │   └── api/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── server/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── services/
    ├── server.js
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation

Install dependencies for all workspaces:
```bash
npm run install:all
```

Or install separately:
```bash
cd server && npm install
cd ../client && npm install
```

### Running the Application

- **Run Server** (default on `http://localhost:5001`):
  ```bash
  npm run dev:server
  ```

- **Run Client** (default on `http://localhost:3000`):
  ```bash
  npm run dev:client
  ```

### API Health Check

```bash
curl http://localhost:5001/api/health
```
Response:
```json
{
  "message": "Server is running"
}
```