param(
    [string]$Version = 'v0.40.11'
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'project-env.ps1')

$expectedVersion = 'v0.40.11'
$expectedSha256 = 'bda4a493ba8a7c24d57263cd843cd68cee84f44aed4299eeed532acad7eda12a'
if ($Version -ne $expectedVersion) {
    throw "This reproducible installer is checksum-pinned to $expectedVersion."
}

$drive = Get-PSDrive -Name D
$minimumFreeBytes = 8GB
if ($drive.Free -lt $minimumFreeBytes) {
    throw "At least 8 GB free on D: is required before downloading the 1.48 GB runtime archive."
}

$downloadDirectory = Join-Path $ProjectRoot '.cache\downloads'
$archive = Join-Path $downloadDirectory "ollama-windows-amd64-$Version.zip"
$destination = Join-Path $ProjectRoot 'tools\ollama'
$url = "https://github.com/ollama/ollama/releases/download/$Version/ollama-windows-amd64.zip"
New-Item -ItemType Directory -Path $downloadDirectory, $destination -Force | Out-Null

if (-not (Test-Path -LiteralPath $archive)) {
    Write-Host "Downloading the official Ollama $Version runtime into this project folder."
    & curl.exe --fail --location --output $archive $url
    if ($LASTEXITCODE -ne 0) { throw "Ollama download failed with exit code $LASTEXITCODE." }
}

$actualSha256 = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actualSha256 -ne $expectedSha256) {
    throw "Checksum mismatch. Expected $expectedSha256 but received $actualSha256."
}

Expand-Archive -LiteralPath $archive -DestinationPath $destination -Force
$executable = Join-Path $destination 'ollama.exe'
if (-not (Test-Path -LiteralPath $executable)) { throw 'The verified archive did not contain ollama.exe.' }
Write-Host "Ollama installed at $executable"
Write-Host "Model storage is $env:OLLAMA_MODELS"
& $executable --version
