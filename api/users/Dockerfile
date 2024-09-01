FROM python:3.12-slim-bookworm

WORKDIR /app
COPY ./requirements.txt /app
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt
COPY . /app

EXPOSE 5000

CMD ["python3", "server.py"]
