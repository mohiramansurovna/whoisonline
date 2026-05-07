# Who Is Online

A real-time user presence tracking application built with Node.js, TypeScript, WebSockets, and PostgreSQL.

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

### 3. Run Docker Compose

```bash
docker compose up
```

### 4. Run migrations

```bash
npm run migrate:up
```

### 5. Start the Server

```bash
npm start
```

## Frontend Setup
Frontend is simple html files. Open client/main.html