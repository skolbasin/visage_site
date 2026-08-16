FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
RUN mkdir -p /app/static/uploads && chmod -R 777 /app/static \
    && chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]
