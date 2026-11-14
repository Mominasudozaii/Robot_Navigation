$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

# Every mutable project payload is kept next to the extracted source tree.
$env:ROBOT_NAV_PROJECT_ROOT = $ProjectRoot
$env:ROBOT_NAV_DATA_DIR = Join-Path $ProjectRoot 'backend\data'
$env:ROBOT_NAV_RESULTS_DIR = Join-Path $ProjectRoot 'experiments\results'
$env:ROBOT_NAV_REPORT_DIR = Join-Path $ProjectRoot 'reports\generated'
$env:ROBOT_NAV_OLLAMA_HOST = if ($env:ROBOT_NAV_OLLAMA_HOST) { $env:ROBOT_NAV_OLLAMA_HOST } else { 'http://127.0.0.1:11434' }
$env:OLLAMA_MODELS = Join-Path $ProjectRoot 'models\ollama'
$env:OLLAMA_NOHISTORY = '1'
$env:PIP_CACHE_DIR = Join-Path $ProjectRoot '.cache\pip'
$env:npm_config_cache = Join-Path $ProjectRoot '.cache\npm'
$env:npm_config_prefix = Join-Path $ProjectRoot '.cache\npm-prefix'
$env:XDG_CACHE_HOME = Join-Path $ProjectRoot '.cache\xdg'
$env:HF_HOME = Join-Path $ProjectRoot '.cache\huggingface'
$env:TEMP = Join-Path $ProjectRoot '.tmp'
$env:TMP = Join-Path $ProjectRoot '.tmp'
$env:PYTHONPYCACHEPREFIX = Join-Path $ProjectRoot '.cache\pycache'
$env:VIRTUAL_ENV = Join-Path $ProjectRoot '.venv'

$requiredDirectories = @($env:ROBOT_NAV_DATA_DIR, $env:ROBOT_NAV_RESULTS_DIR, $env:ROBOT_NAV_REPORT_DIR, $env:OLLAMA_MODELS, $env:PIP_CACHE_DIR, $env:npm_config_cache, $env:npm_config_prefix, $env:XDG_CACHE_HOME, $env:HF_HOME, $env:TEMP, $env:PYTHONPYCACHEPREFIX, (Join-Path $ProjectRoot 'logs'))
foreach ($directory in $requiredDirectories) { New-Item -ItemType Directory -Path $directory -Force | Out-Null }

$venvScripts = Join-Path $env:VIRTUAL_ENV 'Scripts'
if (Test-Path $venvScripts) { $env:Path = "$venvScripts;$env:Path" }
