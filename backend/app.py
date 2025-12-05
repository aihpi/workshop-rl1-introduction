import os
# Set SDL to use dummy video driver to avoid macOS threading issues with pygame
os.environ['SDL_VIDEODRIVER'] = 'dummy'

from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import json
import queue
import threading

print("DEBUG: Starting imports...")

try:
    from algorithms import AlgorithmFactory
    print("DEBUG: AlgorithmFactory imported successfully")
except Exception as e:
    print(f"DEBUG: AlgorithmFactory import failed: {e}")

try:
    from environments.environment_manager import EnvironmentManager
    print("DEBUG: EnvironmentManager imported successfully")
except Exception as e:
    print(f"DEBUG: EnvironmentManager import failed: {e}")

try:
    from training.trainer import TrainingCoordinator
    print("DEBUG: TrainingCoordinator imported successfully")
except Exception as e:
    print(f"DEBUG: TrainingCoordinator import failed: {e}")

print("DEBUG: Creating Flask app...")
app = Flask(__name__)

print("DEBUG: Setting up CORS...")
# Enable CORS for frontend on localhost:3030
CORS(app, origins=['http://localhost:3030', 'http://127.0.0.1:3030'])

print("DEBUG: Creating training coordinator...")
# Global training coordinator
trainer = TrainingCoordinator()
print("DEBUG: Training coordinator created successfully")


@app.route('/test')
def test_route():
    """Simple test route to verify Flask is working"""
    print("DEBUG: Test route was called!")
    return "Test route works!"


@app.route('/api/algorithms', methods=['GET'])
def get_algorithms():
    """
    Get list of available algorithms.

    Returns:
        JSON list of algorithm names
    """
    algorithms = AlgorithmFactory.get_available_algorithms()
    return jsonify(algorithms)


@app.route('/api/environments', methods=['GET'])
def get_environments():
    """
    Get list of available environments.

    Returns:
        JSON list of environment names
    """
    environments = EnvironmentManager.get_available_environments()
    return jsonify(environments)


@app.route('/api/environments/<env_name>/preview', methods=['GET'])
def get_environment_preview(env_name):
    """
    Get a preview frame of an environment's initial state.

    Args:
        env_name: Environment name (e.g., 'FrozenLake-v1')

    Returns:
        JSON with base64-encoded preview frame
    """
    try:
        # Create environment (render_mode is set internally)
        env = EnvironmentManager.create_environment(env_name)

        # Reset to get initial state
        env.reset()

        # Render the first frame (using the actual environment rendering)
        frame = env.render()

        # Convert to base64
        frame_base64 = EnvironmentManager.frame_to_base64(frame)

        # Clean up
        env.close()

        return jsonify({
            'frame': frame_base64,
            'environment': env_name
        })

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to generate preview: {str(e)}'}), 500


@app.route('/api/parameters/<algorithm>', methods=['GET'])
def get_parameters(algorithm):
    """
    Get parameter schema for a specific algorithm.

    Args:
        algorithm: Algorithm name

    Query Parameters:
        environment: Optional environment name for environment-specific parameters

    Returns:
        JSON parameter schema
    """
    try:
        # Get environment from query parameters
        environment = request.args.get('environment')
        schema = AlgorithmFactory.get_parameter_schema(algorithm, environment)
        return jsonify(schema)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/train', methods=['POST'])
def start_training():
    """
    Start a training session.

    Request body:
        {
            "algorithm": "Q-Learning",
            "environment": "FrozenLake-v1",
            "parameters": {...},
            "seed": 42 (optional)
        }

    Returns:
        JSON with session_id
    """
    try:
        data = request.json
        algorithm = data.get('algorithm')
        environment = data.get('environment')
        parameters = data.get('parameters', {})
        seed = data.get('seed')

        # Validate inputs
        if not algorithm:
            return jsonify({'error': 'Algorithm is required'}), 400
        if not environment:
            return jsonify({'error': 'Environment is required'}), 400

        # Create session
        session_id = trainer.create_session(algorithm, environment, parameters, seed)

        return jsonify({'session_id': session_id})

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Internal error: {str(e)}'}), 500


@app.route('/api/train/stream/<session_id>', methods=['GET'])
def stream_training(session_id):
    """
    Stream training updates via Server-Sent Events.

    Args:
        session_id: Session UUID

    Returns:
        SSE stream of training updates
    """
    if not trainer.session_exists(session_id):
        return jsonify({'error': 'Session not found'}), 404

    session = trainer.get_session(session_id)
    num_episodes = int(session['parameters'].get('num_episodes', 1000))

    def generate():
        """Generator function for SSE events."""
        # Create a queue to pass data from training thread to SSE stream
        event_queue = queue.Queue()

        def callback(episode, reward, learning_data, frame):
            """Callback for each episode - puts data into queue."""
            print(f"DEBUG: Episode {episode} completed with reward {reward}")

            # Convert frame to base64
            frame_base64 = EnvironmentManager.frame_to_base64(frame)

            # Create event data
            event_data = {
                'episode': episode,
                'reward': reward,
                'learning_data': learning_data,
                'frame': frame_base64,
                'status': 'training'
            }

            # Put event into queue (instead of yielding)
            event_queue.put(event_data)

        def train_in_thread():
            """Run training in a separate thread."""
            try:
                print(f"DEBUG: Starting training for session {session_id} with {num_episodes} episodes")

                # Start training
                trainer.train(session_id, num_episodes, callback)

                print(f"DEBUG: Training completed successfully for session {session_id}")

                # Send completion event
                completion_data = {
                    'status': 'complete',
                    'message': 'Training completed successfully'
                }
                event_queue.put(completion_data)

            except Exception as e:
                print(f"DEBUG: Training failed with error: {e}")
                print(f"DEBUG: Error type: {type(e)}")
                import traceback
                print(f"DEBUG: Full traceback: {traceback.format_exc()}")

                # Send error event
                error_data = {
                    'status': 'error',
                    'message': str(e)
                }
                event_queue.put(error_data)
            finally:
                # Signal end of training
                event_queue.put(None)

        # Start training in background thread
        training_thread = threading.Thread(target=train_in_thread)
        training_thread.daemon = True
        training_thread.start()

        # Yield events from the queue
        while True:
            try:
                # Get event from queue (blocks until available)
                event_data = event_queue.get(timeout=1)

                if event_data is None:
                    # End of training signal
                    break

                # Yield SSE event
                yield f"data: {json.dumps(event_data)}\n\n"

            except queue.Empty:
                # No data available, send keep-alive comment
                yield ": keep-alive\n\n"
                continue

    # Return SSE response with proper headers
    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
            'Connection': 'keep-alive'
        }
    )


@app.route('/api/play-policy/stream/<session_id>', methods=['GET'])
def stream_playback(session_id):
    """
    Stream policy playback via Server-Sent Events.

    Args:
        session_id: Session UUID

    Returns:
        SSE stream with all frames from policy execution
    """
    if not trainer.session_exists(session_id):
        return jsonify({'error': 'Session not found'}), 404

    def generate():
        """Generator function for SSE events."""
        try:
            # Execute policy and collect all frames
            frames = trainer.play_policy(session_id)

            # Convert all frames to base64
            frames_base64 = [EnvironmentManager.frame_to_base64(frame) for frame in frames]

            # Send all frames in one event
            event_data = {
                'frames': frames_base64,
                'num_frames': len(frames_base64),
                'status': 'complete'
            }
            yield f"data: {json.dumps(event_data)}\n\n"

        except Exception as e:
            # Send error event
            error_data = {
                'status': 'error',
                'message': str(e)
            }
            yield f"data: {json.dumps(error_data)}\n\n"

    # Return SSE response with proper headers
    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
            'Connection': 'keep-alive'
        }
    )


@app.route('/api/reset', methods=['POST'])
def reset_training():
    """
    Clear all training sessions.

    Returns:
        JSON success message
    """
    try:
        trainer.reset_all_sessions()
        return jsonify({'message': 'All sessions reset successfully'})
    except Exception as e:
        return jsonify({'error': f'Reset failed: {str(e)}'}), 500


if __name__ == '__main__':
    print("Starting RL Playground Backend...")
    print("Server running on http://localhost:5001")
    print("\nAvailable endpoints:")
    print("  GET  /api/algorithms")
    print("  GET  /api/environments")
    print("  GET  /api/environments/<env_name>/preview")
    print("  GET  /api/parameters/<algorithm>")
    print("  POST /api/train")
    print("  GET  /api/train/stream/<session_id>")
    print("  GET  /api/play-policy/stream/<session_id>")
    print("  POST /api/reset")
    print("\nPress Ctrl+C to stop")

    # host='0.0.0.0' allows connections from outside the container (required for Docker)
    app.run(host='0.0.0.0', debug=True, port=5001, threaded=True)
