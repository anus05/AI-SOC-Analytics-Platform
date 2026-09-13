FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy python dependencies file
COPY backend/requirements.txt /app/backend/requirements.txt

# Install python packages
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy source files
COPY . /app

EXPOSE 8000

ENV PYTHONPATH=/app

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
