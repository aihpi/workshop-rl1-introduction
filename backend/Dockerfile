# Slim CPU-only backend image. pygame's manylinux wheels bundle SDL,
# freetype and portmidi, so no system packages are needed at all -
# rendering is offscreen (SDL_VIDEODRIVER=dummy, see app.py).
FROM python:3.10-slim

# uv from the official distroless image (no curl, nothing left behind)
COPY --from=ghcr.io/astral-sh/uv:0.9.6 /uv /uvx /usr/local/bin/

WORKDIR /app

# Dependency layer first (cached until pyproject/lock change)
COPY pyproject.toml uv.lock* ./

# --all-extras includes pytest: the test suite runs inside this container.
# --no-cache keeps the wheel cache out of the image layer (~750MB).
RUN uv sync --all-extras --no-cache

# Application code
COPY . .

EXPOSE 5001

ENV PYTHONUNBUFFERED=1
# The venv created by uv sync
ENV PATH="/app/.venv/bin:$PATH"

# Flask debug/reloader stays off unless FLASK_DEBUG=1 (set by
# docker-compose.dev.yml for maintainers)
CMD ["python", "app.py"]
