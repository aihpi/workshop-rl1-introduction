"""
Tests for the TrainingCoordinator (session management, stop mechanism).
"""

from training.trainer import TrainingCoordinator


FAST_QL_PARAMS = {'num_episodes': 5}


class TestSessionManagement:
    def test_session_has_stop_event(self):
        coordinator = TrainingCoordinator()
        session_id = coordinator.create_session(
            'Q-Learning', 'FrozenLake-v1-NoSlip', FAST_QL_PARAMS
        )
        try:
            session = coordinator.get_session(session_id)
            assert 'stop_event' in session
            assert not session['stop_event'].is_set()
        finally:
            coordinator.reset_all_sessions()

    def test_request_stop_unknown_session(self):
        coordinator = TrainingCoordinator()
        assert coordinator.request_stop('nonexistent-id') is False

    def test_stopped_session_still_trained(self):
        """A stopped run keeps its partial policy playable."""
        coordinator = TrainingCoordinator()
        session_id = coordinator.create_session(
            'Q-Learning', 'FrozenLake-v1-NoSlip', FAST_QL_PARAMS
        )
        try:
            assert coordinator.request_stop(session_id) is True
            coordinator.train(session_id)  # stops immediately at episode 0

            session = coordinator.get_session(session_id)
            assert session['trained'] is True
            frames = coordinator.play_policy(session_id)
            assert isinstance(frames, list)
        finally:
            coordinator.reset_all_sessions()

    def test_fixed_seed_reproduces_run(self):
        """Same seed -> identical reward sequence (Q-Learning seeds its RNG)."""
        def run():
            coordinator = TrainingCoordinator()
            session_id = coordinator.create_session(
                'Q-Learning', 'FrozenLake-v1-NoSlip',
                {'num_episodes': 100, 'exploration_rate': 0.3, 'seed': 7}
            )
            rewards = []
            coordinator.train(session_id, callback=lambda e, r, ld, f: rewards.append(r))
            coordinator.reset_all_sessions()
            return rewards

        assert run() == run()

    def test_empty_seed_draws_random_one(self):
        """Empty seed -> a random seed is drawn and stored in the parameters."""
        coordinator = TrainingCoordinator()
        session_id = coordinator.create_session(
            'Q-Learning', 'FrozenLake-v1-NoSlip', {'num_episodes': 5, 'seed': ''}
        )
        try:
            resolved = coordinator.get_session(session_id)['parameters']['seed']
            assert isinstance(resolved, int)
        finally:
            coordinator.reset_all_sessions()

    def test_reset_sets_stop_events(self):
        coordinator = TrainingCoordinator()
        session_id = coordinator.create_session(
            'Q-Learning', 'FrozenLake-v1-NoSlip', FAST_QL_PARAMS
        )
        session = coordinator.get_session(session_id)
        stop_event = session['stop_event']

        coordinator.reset_all_sessions()

        assert stop_event.is_set()
        assert not coordinator.session_exists(session_id)
