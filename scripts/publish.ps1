param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$MessageParts
)

$ErrorActionPreference = 'Stop'
$message = ($MessageParts -join ' ').Trim()
if ([string]::IsNullOrWhiteSpace($message)) {
    $message = 'Update PharmaCampus'
}

Write-Host 'Verification du build frontend...'
npm run build
if ($LASTEXITCODE -ne 0) {
    throw 'Le build frontend a echoue. Le push est annule.'
}

git add -A
if ($LASTEXITCODE -ne 0) {
    throw 'Impossible de preparer les fichiers Git.'
}

git restore --staged -- backend/data/*.db backend/data/*.db-shm backend/data/*.db-wal 2>$null

$stagedChanges = git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host 'Aucun changement a envoyer.'
    exit 0
}

git commit -m $message
if ($LASTEXITCODE -ne 0) {
    throw 'Le commit Git a echoue. Le push est annule.'
}

git push origin main
if ($LASTEXITCODE -ne 0) {
    throw 'Le push GitHub a echoue.'
}

Write-Host 'Mise a jour envoyee sur GitHub avec succes.'