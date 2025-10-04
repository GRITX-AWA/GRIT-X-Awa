# NASA Space Apps Challenge - Backend

This is the **backend API** for the NASA Space Apps Challenge project, designed to serve machine learning predictions and space data analysis for the frontend dashboard.



## Table of Contents

- [Project Overview](#project-overview)
- [Folder Structure](#folder-structure)
- [Backend Routes](#backend-routes)
- [Setup & Installation](#setup--installation)
- [Running the Project](#running-the-project)
- [Swagger Documentation](#swagger-documentation)
- [Environment Variables](#environment-variables)
- [Dependencies](#dependencies)



## Project Overview

This backend is built with **FastAPI** and **SQLite**. It provides the following functionalities:

- Serve and manage **astronomical datasets**
- Call external **ML model API** for predictions
- Provide **structured API endpoints** for frontend consumption
- Interactive **Swagger UI** for testing APIs

The ML model itself is **deployed separately** as another API. This backend interacts with it via `ML_API_URL`.



## Folder Structure

```text
.
├── app
│   ├── api
│   │   ├── __init__.py
│   │   └── v1
│   │       ├── data.py
│   │       ├── __init__.py
│   │       ├── models.py
│   │       └── predictions.py
│   ├── core
│   │   ├── config.py
│   │   └── __init__.py
│   ├── db
│   │   ├── database.py
│   │   └── __init__.py
│   ├── models
│   │   ├── dataset.py
│   │   └── __init__.py
│   ├── schemas
│   │   ├── dataset.py
│   │   └── __init__.py
│   ├── services
│   │   ├── __init__.py
│   │   └── ml_service.py
│   ├── __init__.py
│   └── main.py
├── README.md
└── requirements.txt
````



## Backend Routes

All routes are prefixed with `/api/v1/`:

| Endpoint                     | Method | Description                                  |
| ---------------------------- | ------ | -------------------------------------------- |
| `/api/v1/data/`              | GET    | Fetch all dataset entries                    |
| `/api/v1/data/{id}`          | GET    | Fetch dataset entry by ID                    |
| `/api/v1/data/`              | POST   | Add a new dataset entry                      |
| `/api/v1/predictions/`       | POST   | Call ML API to get prediction for input data |
| `/api/v1/predictions/status` | GET    | Get status of available ML models            |

> Routes are versioned (`v1`) to allow future updates without breaking existing clients.



## Setup & Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd backend
```

### 2. Create a virtual environment (without Conda)

```bash
# Create venv
python3 -m venv venv

# Activate venv
source venv/bin/activate    # Linux/macOS
venv\Scripts\activate       # Windows
```

### 3. Install dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```



## Running the Project

Start the backend server using **Uvicorn**:

```bash
uvicorn app.main:app --reload
```

The API will run at:

```
http://127.0.0.1:8000
```



## Swagger Documentation

FastAPI automatically generates **interactive API docs** at:

```
http://127.0.0.1:8000/docs
```

You can also access the **alternative ReDoc documentation** at:

```
http://127.0.0.1:8000/redoc
```

These allow you to test API endpoints directly from your browser.



## Environment Variables

Create a `.env` file in the root folder and define:

```env
DATABASE_URL=sqlite:///./exoplanets.db
ML_API_URL=http://localhost:8001
MODEL_API_KEY=your_model_api_key_here
```

* `DATABASE_URL` – Path to SQLite database
* `ML_API_URL` – URL of your deployed ML model API
* `MODEL_API_KEY` – API key for ML model (if required)

Make sure `.env` is included in `.gitignore` to **hide sensitive data**.



## Dependencies

Key dependencies:

* `fastapi` – Web framework
* `uvicorn` – ASGI server
* `pydantic-settings` – Settings management
* `sqlalchemy` – Database ORM
* `sqlite3` – Lightweight database
* `requests` – To call external ML API

```
