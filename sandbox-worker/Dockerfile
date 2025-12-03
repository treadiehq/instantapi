FROM docker.io/cloudflare/sandbox:0.5.1

# Install Python AI packages for agent workloads
RUN pip3 install --no-cache-dir \
    openai>=1.0.0 \
    anthropic>=0.18.0 \
    requests>=2.31.0 \
    httpx>=0.25.0 \
    aiohttp>=3.9.0 \
    python-dotenv>=1.0.0 \
    pydantic>=2.0.0 \
    beautifulsoup4>=4.12.0 \
    lxml>=5.0.0

# Install Node.js packages globally for JavaScript agents
RUN npm install -g \
    openai \
    @anthropic-ai/sdk \
    axios \
    node-fetch

# Required during local development to access exposed ports
EXPOSE 8080
