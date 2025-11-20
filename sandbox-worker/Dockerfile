# Cloudflare Sandbox Container
# Based on Ubuntu with Python and Node.js support

FROM ubuntu:22.04

# Install Python, Node.js, and common tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    nodejs \
    npm \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /workspace

# Python packages for data analysis (optional)
RUN pip3 install --no-cache-dir \
    requests \
    pandas \
    numpy

CMD ["/bin/bash"]

