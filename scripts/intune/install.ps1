# —Silent MSI installation for Microsoft Intune deployment
# Intune install command: powershell.exe -ExecutionPolicy Bypass -File install.ps1
#
# Finds the MSI in the same directory as this script and installs it silently.
# Returns the msiexec exit code so Intune can determine success/failure.

$ErrorActionPreference = 'Stop'

$msi = Get-ChildItem -Path $PSScriptRoot -Filter '*.msi' | Select-Object -First 1

if (-not $msi) {
    Write-Error 'No MSI file found in the package directory.'
    exit 1
}

Write-Host "Installing $($msi.Name) ..."

$process = Start-Process -FilePath 'msiexec.exe' `
    -ArgumentList "/i `"$($msi.FullName)`" /qn /norestart" `
    -Wait -PassThru

exit $process.ExitCode
