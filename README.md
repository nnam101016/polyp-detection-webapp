Polyp Detection Webapp

An AI-powered web application for polyp detection in endoscopic images.
Built with FastAPI (Backend) and React + Tailwind (Frontend).

🚀 Quick Start
1. Clone the Repository
git clone https://github.com/your-username/polyp-detection-webapp.git
cd polyp-detection-webapp

2. Backend Setup (FastAPI)

Go to backend folder:

cd endo_backend


Create virtual environment & install dependencies:

python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt


Create a .env file in the backend folder with the following format:

AWS_ACCESS_KEY_ID=[YOUR_AWS_ACCESS_KEY]
AWS_SECRET_ACCESS_KEY=[YOUR_SECRET_ACCESS_KEY]
AWS_BUCKET_NAME=[YOUR_BUCKET_NAME]
MONGODB_URI=[YOUR_MONGODB_URI]


Run the server:

uvicorn main:app --reload


Backend will run at: http://127.0.0.1:8000

3. Frontend Setup (React)

Open a new terminal & go to frontend folder:

cd endo_frontend


Install dependencies:

npm install


Run the frontend:

npm start


Frontend will run at: http://localhost:3000

4. Usage

Open the webapp at http://localhost:3000

Login/Register

Upload polyp images (supports multiple uploads)

View processed results and upload history

📌 Notes

Default backend port: 8000

Default frontend port: 3000

Make sure .env is created before starting backend

Start backend before frontend