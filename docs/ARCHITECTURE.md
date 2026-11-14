# Architecture and safety boundary

```text
Operator instruction
  → selected local Ollama model
  → validated NavigationTask schema
  → deterministic A* planner
  → independent route validator
  → authoritative simulation state
  → React Three Fiber warehouse visualization

Benchmark runner
  → actual Ollama response fields + local process observations
  → SQLite evidence store
  → dashboard charts / JSON / CSV / HTML / PDF exports
```

The language model can only express intent such as a preference for shortest or safe movement, named areas to avoid, and whether a replan is requested. It never supplies a route and cannot directly drive the robot. A route must be created by A*, pass the independent validator, and then be executed by the simulation engine. A dynamic obstacle first causes a stop; a new valid route is required before movement resumes.

## Measurements

Each real model request stores wall response time, Ollama total duration, generated-token count, generation duration and tokens/sec where supplied by Ollama. The benchmark runner observes local `ollama` process CPU-time deltas and resident memory while a request runs. If a metric cannot be observed, it remains null and is displayed as unavailable—not zero.

A completed navigation task requires both a matching structured interpretation and a validator-approved A* route. A generated LLM response is never itself counted as robot-navigation success.
