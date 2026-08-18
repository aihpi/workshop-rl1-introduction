import os
# Set SDL to use dummy video driver to avoid macOS threading issues with pygame
os.environ['SDL_VIDEODRIVER'] = 'dummy'

# Gymnasium's env.close() calls pygame.quit(), which tears down SDL subsystems
# (joystick/IOKit) registered on the thread that first rendered. Our envs render
# in short-lived Flask/SSE threads, so a later close() or GC finalization from
# another thread segfaults on macOS (SIGSEGV in SDL_JoystickQuit). Neutralize
# pygame teardown for the server's lifetime - SDL cleanup only matters at
# process exit anyway.
import pygame
pygame.quit = lambda: None
pygame.display.quit = lambda: None

from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import json
import queue
import threading

from algorithms import AlgorithmFactory
from environments.environment_manager import EnvironmentManager
from training.trainer import TrainingCoordinator, resolve_seed

app = Flask(__name__)

# Enable CORS for frontend on localhost:3030
CORS(app, origins=['http://localhost:3030', 'http://127.0.0.1:3030'])

# Global training coordinator
trainer = TrainingCoordinator()


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


@app.route('/api/compatibility', methods=['GET'])
def get_compatibility():
    """
    Get the algorithm -> supported environments mapping.

    Returns:
        JSON dict mapping algorithm names to lists of environment names
    """
    return jsonify(AlgorithmFactory.get_compatibility())


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


@app.route('/api/learning-data/preview', methods=['POST'])
def preview_learning_data():
    """
    Learning data of a freshly initialized, untrained algorithm - e.g.
    the initial Q-table - so the UI can show the starting point before
    training and reflect initialization parameters live.

    Request body: {"algorithm": ..., "environment": ..., "parameters": {...}}

    Returns:
        JSON learning data (same shape as during training)
    """
    try:
        data = request.json
        algorithm = data.get('algorithm')
        environment = data.get('environment')
        parameters = resolve_seed(data.get('parameters', {}))

        env = EnvironmentManager.create_environment(environment, parameters['seed'])
        try:
            algo = AlgorithmFactory.create_algorithm(
                algorithm, env, parameters, environment_name=environment
            )
            return jsonify(algo.get_learning_data())
        finally:
            env.close()

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Internal error: {str(e)}'}), 500


@app.route('/api/train', methods=['POST'])
def start_training():
    """
    Start a training session.

    Request body:
        {
            "algorithm": "Q-Learning",
            "environment": "FrozenLake-v1",
            "parameters": {...}
        }

    The seed lives in parameters ('seed'); empty/missing means a random run.

    Returns:
        JSON with session_id
    """
    try:
        data = request.json
        algorithm = data.get('algorithm')
        environment = data.get('environment')
        parameters = data.get('parameters', {})

        # Validate inputs
        if not algorithm:
            return jsonify({'error': 'Algorithm is required'}), 400
        if not environment:
            return jsonify({'error': 'Environment is required'}), 400

        # Create session
        session_id = trainer.create_session(algorithm, environment, parameters)

        # Report the resolved seed (drawn randomly when none was given),
        # so any run can be replicated
        used_seed = trainer.get_session(session_id)['parameters']['seed']

        return jsonify({'session_id': session_id, 'seed': used_seed})

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

    def generate():
        """Generator function for SSE events."""
        # Create a queue to pass data from training thread to SSE stream
        event_queue = queue.Queue()

        def callback(episode, reward, learning_data, frame):
            """Callback for each episode - puts data into queue.

            frame may be None: algorithms throttle rendering during fast
            training and only some episodes carry a frame.
            """
            event_queue.put({
                'episode': episode,
                'reward': reward,
                'learning_data': learning_data,
                'frame': EnvironmentManager.frame_to_base64(frame) if frame is not None else None,
                'status': 'training'
            })

        def train_in_thread():
            """Run training in a separate thread."""
            try:
                print(f"DEBUG: Starting training for session {session_id}")

                # Start training (budget comes from the algorithm's parameters)
                trainer.train(session_id, callback)

                # Distinguish a user-requested stop from natural completion
                stopped = session['stop_event'].is_set()
                event_queue.put({
                    'status': 'stopped' if stopped else 'complete',
                    'message': 'Training stopped by user' if stopped else 'Training completed successfully'
                })

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
        try:
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
        finally:
            # Runs on client disconnect too (GeneratorExit on the next yield):
            # stop the training thread so an abandoned run doesn't keep
            # burning CPU and filling the queue unbounded. Harmless after
            # normal completion (the thread has already finished).
            session['stop_event'].set()

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


@app.route('/api/train/stop/<session_id>', methods=['POST'])
def stop_training(session_id):
    """
    Request a graceful stop of a running training session.
    Training halts at the next episode boundary; the partial policy
    remains playable.

    Args:
        session_id: Session UUID

    Returns:
        JSON success message or 404 if session not found
    """
    if not trainer.request_stop(session_id):
        return jsonify({'error': 'Session not found'}), 404
    return jsonify({'message': 'Stop requested'})


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
        """Generator function for SSE events.

        Streams one event per rendered frame while the rollout executes
        (playback starts immediately, peak memory is one frame), then a
        completion event.
        """
        frame_queue = queue.Queue()

        def on_frame(frame, step, action):
            """Called per rendered frame - encode and enqueue immediately."""
            frame_queue.put({
                'status': 'frame',
                'frame': EnvironmentManager.frame_to_base64(frame),
                'step': int(step),
                'action': int(action)
            })

        def play_in_thread():
            try:
                frames = trainer.play_policy(session_id, on_frame)
                frame_queue.put({'status': 'complete', 'num_frames': len(frames)})
            except Exception as e:
                frame_queue.put({'status': 'error', 'message': str(e)})
            finally:
                frame_queue.put(None)

        playback_thread = threading.Thread(target=play_in_thread, daemon=True)
        playback_thread.start()

        while True:
            try:
                event_data = frame_queue.get(timeout=1)
                if event_data is None:
                    break
                yield f"data: {json.dumps(event_data)}\n\n"
            except queue.Empty:
                yield ": keep-alive\n\n"

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


@app.route('/api/evaluate/stream/<session_id>', methods=['GET'])
def stream_evaluation(session_id):
    """
    Evaluate a trained policy via Server-Sent Events: N greedy episodes
    (no exploration, no rendering), streaming per-episode progress and a
    final statistics summary.

    Query Parameters:
        episodes: Number of evaluation episodes (default 100, max 1000)

    Returns:
        SSE stream of evaluation progress + summary
    """
    if not trainer.session_exists(session_id):
        return jsonify({'error': 'Session not found'}), 404

    num_episodes = max(1, min(1000, int(request.args.get('episodes', 100))))

    def generate():
        """Generator function for SSE events."""
        event_queue = queue.Queue()

        def on_episode(index, episode_return):
            event_queue.put({
                'status': 'evaluating',
                'episode': index + 1,
                'total': num_episodes,
                'return': episode_return
            })

        def evaluate_in_thread():
            try:
                summary = trainer.evaluate(session_id, num_episodes, on_episode)
                event_queue.put({'status': 'complete', **summary})
            except Exception as e:
                event_queue.put({'status': 'error', 'message': str(e)})
            finally:
                event_queue.put(None)

        eval_thread = threading.Thread(target=evaluate_in_thread, daemon=True)
        eval_thread.start()

        while True:
            try:
                event_data = event_queue.get(timeout=1)
                if event_data is None:
                    break
                yield f"data: {json.dumps(event_data)}\n\n"
            except queue.Empty:
                yield ": keep-alive\n\n"

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
    print("  GET  /api/compatibility")
    print("  GET  /api/environments")
    print("  GET  /api/environments/<env_name>/preview")
    print("  GET  /api/parameters/<algorithm>")
    print("  POST /api/train")
    print("  POST /api/train/stop/<session_id>")
    print("  GET  /api/train/stream/<session_id>")
    print("  GET  /api/play-policy/stream/<session_id>")
    print("  POST /api/reset")
    print("\nPress Ctrl+C to stop")

    # host='0.0.0.0' allows connections from outside the container (required for Docker)
    app.run(host='0.0.0.0', debug=True, port=5001, threaded=True)
