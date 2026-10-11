FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app app
COPY training training
COPY models models
RUN addgroup --system careerai && adduser --system --ingroup careerai careerai && chown -R careerai:careerai /app
USER careerai
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

