# === Stage 1: Build Go binary ===
FROM golang:1.24.5 AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .

# === Stage 2: Run minimal image ===
FROM debian:bookworm-slim

WORKDIR /app
COPY --from=builder /app/main .
COPY database.sql .

RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

EXPOSE 8080
CMD ["./main"]
