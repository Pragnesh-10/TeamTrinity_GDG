FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

# Render assigns a dynamic port via the PORT environemnt variable
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}