# Prompt for Claude in PowerPoint: rework the RL1 workshop deck

Copy everything below the line into Claude inside PowerPoint, with the deck open. Fill in the language bracket first.

---

You are reworking this workshop presentation end to end. Read everything below before touching a slide.

## Context

This deck accompanies "Reinforcement Learning I - Introduction", a hands-on workshop by the AI Service Center Berlin-Brandenburg (HPI). Two presenters alternate: David (DG) runs live demos in "RL Lab", a browser tool the participants also install and use themselves; Jill (JB) presents theory and history. The deck's job is to carry the theory blocks and frame the demos. The spoken word carries the detail; slides carry structure, one idea each, and the few formulas that must be seen.

The deck language is [GERMAN / ENGLISH - keep every slide in this language; technical terms like Q-Learning, replay buffer, policy stay English].

## Target structure

Rebuild the deck to follow this agenda exactly, in this order. Each item becomes one section; sections get a minimal divider slide (section number, section title, presenter initials, nothing else).

PART 1

1. Introduction (DG)
2. Historical context, 1950s to 1990s (JB)
3. Core concepts: agent, environment, state, action, reward, episode, policy (JB)
4. RL Lab demo: untrained agent on FrozenLake (DG) - divider only, demo is live
5. Q-Learning (JB)
6. RL Lab demo: Q-Learning training + Q&A (DG) - divider only
7. RL Lab installation by participants (DG) - one slide with the exact commands: `git clone https://github.com/aihpi/workshop-rl1-introduction.git`, `cd workshop-rl1-introduction`, `docker compose pull`, `docker compose up -d`, open http://localhost:3030

BREAK

PART 2

8. Slippery FrozenLake: stochasticity, what makes a problem an RL problem, where RL excels (JB/DG)
9. Deep RL history (JB), then the DQN explanation (DG and JB jointly)
10. CartPole (DG) - divider plus at most one slide on the environment
11. PPO, brief (JB)
12. MountainCar (optional section, mark it clearly as skippable)
13. Today and beyond: applications, robotics/drones, RLHF/RLVR, limitations, open challenges
14. Pen and paper exercise: participants sketch their own RL use case (what is the state space, action space, reward; is RL actually suited for it) - one instruction slide
15. Outlook: homework notebooks in the repo (Q-Learning from scratch, stable-baselines3 quickstart), links to Gymnasium, stable-baselines3, the Hugging Face Deep RL course
16. Conclusion

Consolidate aggressively: reuse existing slide content where it fits this structure, delete slides that fit nowhere, and do not preserve slides just because they exist. Target well under half the current slide count. Keep existing speaker notes wherever the slide survives; correct them only if factually wrong.

## Design system (replace the Canva style everywhere)

- Remove ALL decorative freeform shapes, blobs, and the repeated title-slide layout used as dividers.
- Background: plain white. Text: near-black (#2D2D2D). Secondary text: mid gray (#666666).
- ONE accent color: orange #FF7500, used only to highlight the single most important element per slide (a value, a formula part, one arrow). Most slides should be entirely grayscale. Never use more than the accent plus grays on a slide.
- Font: one clean sans-serif throughout (Aptos or Arial), no Canva Sans. Titles bold, 32-40pt; body 18-24pt; nothing below 16pt.
- Layout: title top-left on every content slide, generous margins, generous whitespace, left-aligned text. No text-heavy slides: maximum ~5 short lines or one diagram plus ~3 lines.
- Punctuation rule, strictly: no em dashes anywhere in the deck. Use commas, colons, parentheses, or split the sentence.
- Diagrams: simple boxes, thin gray strokes, one orange accent. No gradients, no shadows, no 3D, no stock icons, no emoji.

## Five slides to build natively (these replace any older equivalents)

A. "Q-Learning" (section 5): agent-environment loop diagram (Agent box, Environment box, arrow down "action a", arrow up "reward r, next state s'"); the update rule in a box: Q(s,a) <- Q(s,a) + alpha * [target - Q(s,a)], with target = r + gamma * max Q(s',a'), and the note "just r if the episode ended"; a small 3x4 example table with one cell highlighted; a compact legend: alpha learning rate, gamma discount, epsilon exploration.

B. "Q-Learning on FrozenLake" (section 5 or 6, the worked example): header band with the same update rule; one small line: alpha = 0.1, gamma = 0.95, reward +1 at the goal else 0, table starts at 0; the 4x4 FrozenLake grid (states 0-15, holes at 5, 7, 11, 12, goal 15); UPDATE 1: state 14, action right, r = 1, episode ends, target = 1, Q(14,right) <- 0 + 0.1 * (1 - 0) = 0.1; UPDATE 2: state 13, action right, lands in 14, r = 0, max Q(14,.) = 0.1 (the value update 1 just wrote), target = 0 + 0.95 * 0.1 = 0.095, Q(13,right) <- 0 + 0.1 * (0.095 - 0) = 0.0095.

C. "From Q-Learning to DQN" (section 9): problem line "continuous states (CartPole: 4 numbers), a table is impossible"; visual: small grid crossed out, arrow, network diagram (state in, one Q-value per action out, outputs in orange); box "same update rule, as a gradient step: loss = (target - Q(s,a))^2, backpropagation carries the error backwards through the layers, every weight nudged in proportion to its share of the error"; two boxes: "1 Replay Buffer: train on random batches of remembered experience, one lucky success teaches the network thousands of times" and "2 Target Network: stable targets from a frozen copy"; footer: DQN = Q-Learning + network + replay buffer + target network. Reference: https://stable-baselines3.readthedocs.io/en/master/modules/dqn.html

D. "DQN on FrozenLake" (optional companion in section 9): state 14 as a one-hot vector (16 cells, index 14 filled), elbow arrow into a "hidden 64x64" box, four output rows Q(14, left/down/right/up) with the greedy one in orange; line "all 16 states -> the familiar Q-table (what RL Lab shows)"; two contrast boxes: table (every cell independent, one update touches one cell, values spread cell by cell) versus network (all values share the weights, every update moves ALL values, terminal states never trained and never used).

E. Section 8 facts (slippery FrozenLake): only a 1/3 chance of moving in the intended direction, 1/3 for each perpendicular direction; even the optimal policy only reaches the goal about 74% of the time; an evaluation score around 0.7 IS optimal play there.

## Historical content (sections 2 and 9)

A separate guide document exists but contains factual errors; do NOT trust it. Keep history brief (3-5 slides per history section) and only include claims you are confident of, e.g.: Bellman and dynamic programming (1950s), temporal-difference learning (Sutton, 1988), Q-Learning (Watkins, 1989; convergence proof 1992), TD-Gammon (Tesauro, early 1990s); then DQN on Atari (DeepMind, 2013/2015 Nature), AlphaGo (2016), PPO (Schulman et al., 2017), RLHF for language models (2022 onward). If a date or attribution is uncertain, omit the claim rather than guess, and add a speaker note "VERIFY" where a fact needs checking by the presenters.

## Facts that must stay consistent with RL Lab (the tool participants use)

- Update targets are masked at terminal states (target = r when the episode ended). Do not show the unmasked rule.
- CartPole: solved at average return 475+ (max 500). MountainCar: reward -1 per step, cap 200 steps, solved at -110 or better; DQN succeeds there, PPO is expected to fail (on-policy, every rollout returns exactly -200, zero gradient signal).
- Q-Learning is tabular and needs discrete states; DQN/PPO handle continuous states.

## Process

Work section by section in agenda order. After restructuring, do a final pass that checks: every slide follows the design system, no em dash survives anywhere (including notes), no slide has more than one accent color, every divider matches the divider template, and the agenda order is exactly as specified. List any slides you deleted and any facts you flagged with VERIFY at the end.
