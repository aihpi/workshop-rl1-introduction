import random
import threading
import uuid
from typing import Dict, Any, Optional
from algorithms import AlgorithmFactory
from environments.environment_manager import EnvironmentManager


def resolve_seed(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """
    Return a copy of parameters with 'seed' resolved to an int
    (drawn randomly when empty/missing - a non-reproducible run).
    """
    raw_seed = parameters.get('seed')
    if raw_seed in (None, ''):
        raw_seed = random.randint(0, 2**31 - 1)
    return {**parameters, 'seed': int(raw_seed)}


class TrainingCoordinator:
    """
    Manages training sessions with UUID-based identification.

    Handles session creation, training execution, and policy playback
    in an algorithm-agnostic manner.
    """

    def __init__(self):
        """Initialize training coordinator with empty session storage."""
        self.sessions: Dict[str, Dict[str, Any]] = {}

    def create_session(
        self,
        algorithm_name: str,
        environment_name: str,
        parameters: Dict[str, Any]
    ) -> str:
        """
        Create a new training session.

        The random seed comes from parameters['seed']; empty/missing means
        a randomly drawn seed, i.e. a non-reproducible run.

        Args:
            algorithm_name: Name of the algorithm to use
            environment_name: Name of the environment
            parameters: Algorithm parameters

        Returns:
            Session ID (UUID string)

        Raises:
            ValueError: If algorithm or environment is invalid
        """
        # Resolve the seed: explicit value -> reproducible run,
        # empty/missing -> draw one randomly. Algorithms read it
        # from their parameters.
        parameters = resolve_seed(parameters)

        # Create environment
        env = EnvironmentManager.create_environment(environment_name, parameters['seed'])

        # Create algorithm instance (validates algorithm/environment compatibility)
        algorithm = AlgorithmFactory.create_algorithm(
            algorithm_name, env, parameters, environment_name=environment_name
        )

        # Generate session ID
        session_id = str(uuid.uuid4())

        # Store session
        self.sessions[session_id] = {
            'algorithm': algorithm,
            'environment': env,
            'algorithm_name': algorithm_name,
            'environment_name': environment_name,
            'parameters': parameters,
            'trained': False,
            'stop_event': threading.Event()
        }

        return session_id

    def train(
        self,
        session_id: str,
        callback: Optional[callable] = None
    ) -> None:
        """
        Train the algorithm for a session. The training budget comes from
        the algorithm's own parameters (num_episodes or total_timesteps).

        Args:
            session_id: Session UUID
            callback: Optional callback function for episode updates

        Raises:
            ValueError: If session ID is invalid
        """
        if session_id not in self.sessions:
            raise ValueError(f"Session '{session_id}' not found")

        session = self.sessions[session_id]
        algorithm = session['algorithm']

        # Train with callback; a stopped run still counts as trained
        # (a partially-trained policy is playable)
        algorithm.train(callback, stop_event=session['stop_event'])

        # Mark as trained
        session['trained'] = True

    def evaluate(
        self,
        session_id: str,
        num_episodes: int = 100,
        callback: Optional[callable] = None
    ):
        """
        Evaluate a session's policy (greedy, no rendering). Untrained
        sessions are allowed on purpose: the initialized policy's score is
        the baseline participants compare training against.

        Args:
            session_id: Session UUID
            num_episodes: Number of evaluation episodes
            callback: Optional per-episode callback (index, episode_return)

        Returns:
            Evaluation summary dict

        Raises:
            ValueError: If the session is unknown
        """
        if session_id not in self.sessions:
            raise ValueError(f"Session '{session_id}' not found")

        return self.sessions[session_id]['algorithm'].evaluate(num_episodes, callback)

    def request_stop(self, session_id: str) -> bool:
        """
        Request a graceful stop of a running training session.

        Args:
            session_id: Session UUID

        Returns:
            True if the session exists and the stop was requested, else False
        """
        session = self.sessions.get(session_id)
        if session is None:
            return False
        session['stop_event'].set()
        return True

    def play_policy(
        self,
        session_id: str,
        callback: Optional[callable] = None
    ) -> list:
        """
        Execute the session's policy. Untrained sessions are allowed on
        purpose: playing the freshly initialized policy shows what the
        agent does before any learning.

        Args:
            session_id: Session UUID
            callback: Optional callback for step updates

        Returns:
            List of frames from policy execution

        Raises:
            ValueError: If session ID is invalid
        """
        if session_id not in self.sessions:
            raise ValueError(f"Session '{session_id}' not found")

        return self.sessions[session_id]['algorithm'].play_policy(callback)

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get session data.

        Args:
            session_id: Session UUID

        Returns:
            Session dictionary or None if not found
        """
        return self.sessions.get(session_id)

    def reset_all_sessions(self) -> None:
        """Clear all sessions from memory."""
        # Signal running trainings to stop before closing their envs
        for session in self.sessions.values():
            session['stop_event'].set()

        # Close all environments
        for session in self.sessions.values():
            env = session.get('environment')
            if env:
                env.close()

        self.sessions.clear()

    def session_exists(self, session_id: str) -> bool:
        """
        Check if a session exists.

        Args:
            session_id: Session UUID

        Returns:
            True if session exists, False otherwise
        """
        return session_id in self.sessions
