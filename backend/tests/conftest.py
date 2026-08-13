"""
Shared test fixtures for RL Playground backend tests.

Fixtures are reusable test setup code. They're like helpers that pytest
automatically provides to your tests.
"""

import pytest
import sys
from pathlib import Path

# Add parent directory to path so we can import our app modules
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))


@pytest.fixture
def app():
    """
    Create a Flask app for testing.

    This fixture creates a fresh Flask app instance for each test.
    Tests can use this to make requests or check responses.

    Usage in tests:
        def test_something(app):
            # app is automatically provided by pytest
            client = app.test_client()
            response = client.get('/api/algorithms')
    """
    from app import app as flask_app
    flask_app.config['TESTING'] = True
    return flask_app


@pytest.fixture
def client(app):
    """
    Create a test client for making API requests.

    The test client lets you make HTTP requests to your app
    without running a real server.

    Usage in tests:
        def test_api_endpoint(client):
            response = client.get('/api/algorithms')
            assert response.status_code == 200
    """
    return app.test_client()
