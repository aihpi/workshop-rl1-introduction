"""
Tests for Flask API endpoints.

These tests use the 'client' fixture from conftest.py to make
HTTP requests to our API without starting a real server.
"""

import pytest
import json


class TestBasicEndpoints:
    """Test the basic GET endpoints that return lists/data."""

    def test_get_algorithms(self, client):
        """
        Test GET /api/algorithms returns list of algorithms.

        WHY: Frontend needs to know which algorithms are available.
        HOW: Make GET request, check status code and response structure.
        """
        # Act - Make the API request
        response = client.get('/api/algorithms')

        # Assert - Check the response
        assert response.status_code == 200, "Should return 200 OK"

        # API returns the list directly, not wrapped in an object
        data = response.get_json()
        assert isinstance(data, list), "Response should be a list"
        assert 'Q-Learning' in data, "Should include Q-Learning"

    def test_get_environments(self, client):
        """
        Test GET /api/environments returns list of environments.

        WHY: Frontend needs to show available environments in dropdown.
        HOW: Make GET request, verify response contains environment list.
        """
        # Act
        response = client.get('/api/environments')

        # Assert
        assert response.status_code == 200

        # API returns the list directly
        data = response.get_json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have at least one environment"
        assert 'FrozenLake-v1-NoSlip' in data, "Should include FrozenLake-v1-NoSlip"

    def test_get_parameters_for_q_learning(self, client):
        """
        Test GET /api/parameters/Q-Learning returns parameter schema.

        WHY: Frontend needs parameter schema to build the UI controls.
        HOW: Request parameters, verify structure matches expected format.
        """
        # Act
        response = client.get('/api/parameters/Q-Learning')

        # Assert
        assert response.status_code == 200
        data = response.get_json()

        # Check all required parameters exist
        required_params = ['learning_rate', 'discount_factor', 'exploration_rate', 'num_episodes']
        for param in required_params:
            assert param in data, f"Should include parameter '{param}'"

        # Verify parameter structure (using learning_rate as example)
        lr = data['learning_rate']
        assert 'type' in lr, "Parameter should specify type"
        assert 'min' in lr, "Parameter should specify min value"
        assert 'max' in lr, "Parameter should specify max value"
        assert 'default' in lr, "Parameter should specify default value"


class TestErrorHandling:
    """Test that API handles errors correctly."""

    def test_unknown_algorithm_returns_error(self, client):
        """
        Test that requesting unknown algorithm returns error.

        WHY: API should gracefully handle invalid requests.
        HOW: Request parameters for non-existent algorithm, expect error status.
        """
        # Act
        response = client.get('/api/parameters/NonExistentAlgorithm')

        # Assert
        # API returns 400 (Bad Request) for unknown algorithms
        assert response.status_code == 400, "Unknown algorithm should return 400"

    def test_reset_endpoint(self, client):
        """
        Test POST /api/reset clears sessions.

        WHY: Users need ability to clear training state.
        HOW: Call reset endpoint, verify success response.
        """
        # Act
        response = client.post('/api/reset')

        # Assert
        assert response.status_code == 200
        data = response.get_json()
        assert 'message' in data, "Should have message key"
        assert 'reset successfully' in data['message'].lower(), "Should confirm reset"
