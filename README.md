# People Registry (React + Express + MySQL)

## 1. Install and start MySQL (macOS)
    brew install mysql
    brew services start mysql

## 2. Create the database and table
    mysql -u root < backend/schema.sql

## 3. Configure and run the backend
Edit `backend/.env` with your MySQL user/password, then:

    cd backend
    npm install
    npm run dev        # http://localhost:5050

## 4. Run the frontend (new terminal)
    cd frontend
    npm install
    npm run dev        # http://localhost:5173

API: `GET /api/people`, `POST /api/people` `{ firstName, age, barangay, city }`, `DELETE /api/people/:id`
