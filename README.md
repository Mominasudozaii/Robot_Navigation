

# NavLab: Robot Navigation FYP

NavLab is a research system for autonomous robot navigation in a 3D warehouse. A user gives a plain-language instruction, such as "Navigate to the destination using the shortest safe route," and a local AI agent plans and replans the robot's route. The project also benchmarks local language models on this task, and it runs entirely on the user's machine.
<img width="2546" height="1198" alt="Screenshot 2026-11-14 170951" src="https://github.com/user-attachments/assets/ba6a717b-d611-4058-8373-71e4c011e803" />


## What the agent does

Mission Control accepts a natural-language instruction. The agent works through these steps:

1. **Understands the instruction.** A local LLM reads the request and extracts the goal, constraints such as "shortest safe route," and replanning conditions.
2. **Plans the route.** [Confirm: a deterministic planner computes the path through the 3D warehouse, avoiding obstacles such as shelves, pallets, and bins.]
3. **Verifies the path.** The planned route is shown on the digital twin as the **Verified path**, in cyan.
4. **Replans when blocked.** If a corridor becomes blocked, the agent computes a new route from the robot's current position. [Confirm how blockages are detected: sensor simulation, user-placed obstacles, or both.]

The simulator is a live digital twin of the warehouse, Zone A-17. You can orbit the scene, switch between Overview, Robot View, and Aisle View, and place Obstacle, Start, and Goal markers by clicking the floor. Play, Pause, Step, and Reset control the run, and the speed slider sets playback from slow to fast.

## Pages

| Page | Purpose |
| --- | --- |
| **Overview** | Summary of the project and its current status. |
| **3D Simulator** | Warehouse digital twin. Plan routes and watch the robot move. |
| **Model Laboratory** | Load, compare, and inspect the local LLMs. |
| **Benchmark Studio** | Run benchmarks that compare models on navigation tasks. |
| **Results & Analysis** | Charts and tables of benchmark results. |
| **Research Report** | Generates a PDF report from the results. |
| **Settings & Help** | Configuration and help. |

## Local LLMs with Ollama

All language models run locally through [Ollama](https://ollama.com). No cloud API is needed, so there are no per-request costs and no data leaves the machine.

- **Default model:** [Confirm the full model name. The screenshot shows `qwen2...`, which is cut off.]
- **Models available:** The runtime panel shows 5 language models ready. [List them, for example from `ollama list`.]
- **Ollama address:** Set with `ROBOT_NAV_OLLAMA_HOST` in `.env`. The default is `http://127.0.0.1:11434`.

To add a model:

```bat
ollama pull [model-name]
```

## Benchmarking

Benchmark Studio compares local models on the same navigation tasks, so the results are directly comparable. Each run records:

- **Task performance:** Whether the route was found, whether it avoided obstacles, and whether the replan succeeded after a blockage. [Confirm the exact metrics.]
- **Response time:** How long each model takes to answer.
- **System resource use:** CPU and memory, tracked with `psutil`.

Results appear in Results & Analysis. Research Report exports them as a PDF, which requires the `report` extras (installed by `pip install -e ".[report]"`).

Because the benchmark runs are deterministic, the same inputs give the same results. This makes it possible to compare models fairly and to repeat an experiment.

## Cost efficiency

- **No API charges:** Models run on your own hardware through Ollama, so each query is free after the model is downloaded.
- **Works offline:** Set `ROBOT_NAV_OFFLINE_MODE=true` to stop the app from making network calls.
- **Measured trade-offs:** Benchmarks record resource use alongside accuracy, so you can see whether a smaller, faster model is good enough for a task.

The main cost is local hardware. Larger models need more RAM and a capable GPU or CPU. The runtime panel shows free disk space, which matters because model files are large.

## Requirements

- **Windows**
- **Python 3.11 or newer**
- **[Ollama](https://ollama.com)**, running locally, with at least one model pulled
- **Disk space:** Enough for the model files. The app checks free space on the drive where the project is stored.

## Setup

1. Install Ollama and pull a model (see [Local LLMs with Ollama](#local-llms-with-ollama)).
2. Copy the environment template:

   ```powershell
   copy .env.example .env
   ```

3. Open PowerShell in the project folder and run:

   ```powershell
   cd D:\Robot_Navigation
   .\scripts\run.ps1
   ```

   The script sets up the environment and starts the application. Cache, result, model, log, and temporary files are written inside the project folder.

You can also double-click `run.bat`, which calls the same script. If the script fails, `run.bat` pauses so you can read the error.

If PowerShell blocks the script, run it with:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run.ps1
```

## Configuration

Settings are read from `.env`.

| Variable | Default | Description |
| --- | --- | --- |
| `ROBOT_NAV_OLLAMA_HOST` | `http://127.0.0.1:11434` | Address of the Ollama server. |
| `ROBOT_NAV_OFFLINE_MODE` | `false` | Set to `true` to block network calls. |
| `ROBOT_NAV_LOG_LEVEL` | `INFO` | Log verbosity. |

Project, data, and cache paths are set automatically. Leave them unset.

## Project structure

```text
Robot_Navigation/
├── backend/              # FastAPI application: agent, planner, benchmarks
├── frontend/             # NavLab user interface
├── scripts/
│   └── run.ps1           # Setup and launch script
├── tests/                # pytest test suite
├── experiments/          # Benchmark and navigation experiments
├── docs/                 # Project documentation
├── models/ollama/        # Local Ollama model storage
├── reports/generated/    # Generated PDF reports
├── run.bat               # Windows launcher
├── pyproject.toml        # Project metadata and dependencies
├── requirements.txt      # Dependency ranges
└── .env.example          # Environment variable template
```

## Testing

```powershell
pytest
ruff check .
```

## Notes for contributors

- Never commit `.env`. It is listed in `.gitignore`.
- Generated folders (`.cache/`, `.tmp/`, `logs/`, `reports/generated/`, `models/`) should not be committed.




