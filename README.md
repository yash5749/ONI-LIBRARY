# About
📘 Full-Stack Library System — NestJS + Prisma + Postgres + React
This project is a full-stack Library Management System built as part of a technical assignment.
It includes a NestJS backend, Prisma ORM, Postgres (Supabase), and a React.js frontend.

# 🚀 Features
- 📚 Books
- Create / Edit / Delete books
- Search & filter books
- Show availability status
- Borrow / Return flows
- Relation with authors
- 🖊 Authors
- Create / Update / Delete authors
- List all authors
- 👤 Users
- Create users
- List users
- Promote user → admin
- 📕 Borrowing System
- Borrow a book
- Return a book
- Check my borrowed books
- Prevent double borrowing
- Track which user borrowed a book
- 🔐 Authentication
- JWT-based auth
- Protected admin-only routes
- Auto attachement of user from token
- 🗄 Database
- Prisma + Postgres (Supabase)
- Relations: User ↔ BorrowedBooks ↔ Book ↔ Author

# API Documentation (Swagger)
```shell
http://localhost:3000/api/docs
```

# 🛠️ Tech Stack
- Backend
    - NestJS
    - Prisma ORM
    - PostgreSQL (Supabase)
    - JWT Auth
    - Swagger (OpenAPI)
- Frontend
    - React.js (TypeScript)
    - Axios
    - React Router
    - TailwindCSS + shadcn/ui
    - Custom premium UI theme (glassmorphic red theme)

# Folder Structure
- backend/
-app/
     - src/
          - auth/
          - books/
          - authors/
          - users/
          - borrow/
          - prisma.service.ts
          - app.module.ts
          - main.ts
      - prisma/
          - schema.prisma
          - migrations/
- frontend/
   - src/
      - api/
      - pages/
      - components/
      - context/

# Environment Variables

```shell
backend/app/.env
-------------------------------------------------------
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your-secret-key"

```
# 🧪 Running the Backend

## 1. Install dependencies
```shell 
cd backend/app
npm install
```
## 2. Apply Migrations
```shell 
npx prisma migrate deploy
```
## Or generate local DB schema
```shell 
npx prisma migrate dev
```
## 3. Start Backend
```shell 
npm run start:dev
```
## Runs at 
```shell 
http://localhost:3000
swagger-> http://localhost:3000/api/docs
```

# 🐳 Docker Support
## If you want to run dockerized backend then do this

```
cd backend/app
docker build -t library-backend .
docker run -p 3000:3000 library-backend
```

## Or if you want Backend + Postgres
```
version: '3.8'

services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: library
    ports:
      - "5433:5432"  
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: .
    container_name: library-backend
    restart: always
    ports:
      - "3333:3333"
    environment:
      DATABASE_URL: "postgresql://postgres:your-pass@db:5432/library"
      JWT_SECRET: "supersecret123"
      JWT_EXPIRES_IN: "1d"
      PORT: 3333
    depends_on:
      - db

volumes:
  pgdata:

```

run both using
```
docker-compose up --build
```

# Running the Frontend

## Install dependencies
```shell 
cd frontend/oni-frontend
npm install

```
## Runs at 
```shell 
npm run dev

```
## Runs at 
```shell 
http://localhost:5173

```
## Runs at 
```shell 
http://localhost:3000
swagger-> http://localhost:3000/api/docs
```


# 🧾 Design Notes
- Users cannot borrow a book already borrowed by another user.
- Users can return only their own borrowed books.
- Books store the borrowedByUserId + isBorrowed boolean for fast - querying.
- Admins manage books/authors/users; normal users only borrow books.
- Prisma relations sync automatically via migrations.

### [🎥 Demo Video (Required)]([https://your-video-link.com](https://drive.google.com/file/d/1xbxCIWp6ORJmXF2t4WhfNnkU0y-dhIVS/view?usp=sharing))
- Record a short walkthrough of:
- Logging in
- Viewing books
- Borrowing a book
- Returning it
- Admin panel features (CRUD books/authors/users)
- Swagger UI
- Database view (Supabase)

# 📄 License
MIT
