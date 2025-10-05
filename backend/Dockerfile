# Use Python 3.11 slim image as base for smaller size and faster builds
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables optimized for Cloud Run
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PORT=8080

# Install system dependencies required for numpy, pandas, and ML libraries
# Clean up apt cache to reduce image size
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy requirements file first for better Docker layer caching
COPY requirements.txt .

# Install Python dependencies
# Use --no-cache-dir to reduce image size
RUN pip install --no-cache-dir -r requirements.txt

# Copy ML model files (these change less frequently than code)
COPY kepler/ ./kepler/
COPY tess/ ./tess/

# Copy application code
COPY app/ ./app/
COPY init_db.py ./
COPY download_datasets.py ./

# Create necessary directories with proper permissions
RUN mkdir -p /app/data /app/logs && \
    chmod -R 755 /app

# Create a non-root user for security (Google Cloud Run best practice)
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port 8080 (Cloud Run requirement)
EXPOSE 8080

# Health check (optional for Cloud Run, but useful for local testing)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Run the application with uvicorn
# Use $PORT environment variable for Cloud Run compatibility
# Single worker recommended for Cloud Run (it handles scaling via instances)
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --workers 1 --log-level info
