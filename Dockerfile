# ─────────────────────────────────────────────
#  Stage 1 – dependency installation
# ─────────────────────────────────────────────
FROM mcr.microsoft.com/playwright:v1.51.1-jammy AS deps

WORKDIR /app

# Copy only the manifest files first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install Node dependencies (no devDependencies pruning – we need them for tests)
RUN npm ci

# ─────────────────────────────────────────────
#  Stage 2 – test runner
# ─────────────────────────────────────────────
FROM mcr.microsoft.com/playwright:v1.51.1-jammy

WORKDIR /app

# Install k6 for performance tests
RUN apt-get update && apt-get install -y gnupg2 ca-certificates curl && \
    curl -fsSL https://dl.k6.io/key.gpg | gpg --dearmor -o /usr/share/keyrings/k6-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
      | tee /etc/apt/sources.list.d/k6.list && \
    apt-get update && apt-get install -y k6 && \
    rm -rf /var/lib/apt/lists/*

# Install Allure CLI for report generation
RUN npm install -g allure-commandline --save-dev

# Copy installed node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the project source
COPY . .

# Default environment (can be overridden at runtime via ENV_NAME build-arg or env var)
ENV ENV_NAME=demo
ENV CI=true

# Expose port so the report server can bind (used by allure serve / nginx)
EXPOSE 9323

# Run all Playwright tests by default; override CMD in docker-compose for specific suites
CMD ["npx", "playwright", "test"]
