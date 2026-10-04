# Local dev container for the Hugo site.
# Hugo version is pinned to match .github/workflows/deploy.yml (peaceiris/actions-hugo).
ARG HUGO_VERSION=0.158.0

FROM mcr.microsoft.com/devcontainers/base:ubuntu

ARG HUGO_VERSION

RUN curl -sSL -o /tmp/hugo.tar.gz \
      "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz" \
    && tar -xzf /tmp/hugo.tar.gz -C /usr/local/bin hugo \
    && rm /tmp/hugo.tar.gz \
    && hugo version
