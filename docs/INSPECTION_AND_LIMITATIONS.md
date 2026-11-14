# Source inspection and verification record

## Supplied archives

- `Benchmarking_LLM.zip` contained the working foundation: a FastAPI backend, React/Three.js frontend, A* planner, logical simulation, SQLite evidence store, Ollama client, reports, scripts, scenarios, and tests. Its original catalogue had three configured models: `qwen2.5:0.5b`, `qwen3:0.6b`, and `smollm2:1.7b-instruct-q4_K_M`.
- `Robot_Navigation_FYP.zip` contained only 17 empty folder entries. It included no source code, assets, dependency files, or configuration to preserve. The warehouse/robot presentation is consequently an extension of the usable supplied implementation, not a claim that missing robot source was recovered.

## Corrections made

- Replaced the fixed old `D:\Robot_Navigation_FYP` source-path assumptions with a project-relative runtime root. When extracted to D:, all project-created caches, models, results, reports, logs, temporary files, package installation, and virtual environment paths resolve inside that D: folder.
- Added two compatible, locally runnable Ollama tags: `phi3:mini` and `deepseek-r1:1.5b`. Their availability is checked from the actual local Ollama API before a benchmark begins.
- Raised the benchmark selection limit from four to five; added individual/all-five selection, progress, stop, clear, detailed results, exports, resource-aware charts, and cost-efficiency calculation.
- Extended backend evidence fields for generation duration, tokens/sec, CPU percentage, and Ollama RAM. Existing databases receive additive columns rather than silently losing data.
- Rebuilt the plain grid presentation into a warehouse scene with an AMR-style vehicle, wheels, LiDAR, front sensor, lighting, shadows, racking, pallets, route markers, smooth interpolation, and orbit controls.

## Verification performed in this environment

- Every PowerShell launcher/configuration script parses without a PowerShell syntax error.
- The archive has no copied model weight, virtual environment, `node_modules`, cache, log, experiment database, or prior benchmark-result payload, so it cannot present old values as new measurements.
- Runtime verification could not be completed here: the environment has no executable Python or npm and blocks access to its local Ollama port. Therefore no claims are made that the five models are installed or that a new live measurement was produced here. Follow the README verification commands after extraction onto D:.
