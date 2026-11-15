# Prepara o MySQL 8.4 no Windows para desenvolvimento local do Deck-it.
#
# Pré-requisito: MySQL instalado (winget install --id Oracle.MySQL -e)
# Rodar como ADMINISTRADOR:  powershell -ExecutionPolicy Bypass -File db\setup-mysql-windows.ps1
#
# O que faz (pode rodar de novo sem problema):
#   1. cria o my.ini (porta 3306, só aceita conexões locais, utf8mb4)
#   2. inicializa a pasta de dados com root SEM senha (ok só porque escuta apenas em 127.0.0.1)
#   3. registra e liga o serviço "MySQL84" (inicia junto com o Windows)
# Depois disso, rode o db/setup.sql para criar os bancos e o usuário deckit.

param(
  [string]$BaseDir = "C:\Program Files\MySQL\MySQL Server 8.4",
  [string]$DataRoot = "C:\ProgramData\MySQL\MySQL Server 8.4",
  [string]$ServiceName = "MySQL84"
)

$ErrorActionPreference = 'Stop'
$mysqld = Join-Path $BaseDir 'bin\mysqld.exe'
if (-not (Test-Path $mysqld)) { throw "mysqld.exe não encontrado em $BaseDir. Instale com: winget install --id Oracle.MySQL -e" }

New-Item -ItemType Directory -Force $DataRoot | Out-Null
$ini = Join-Path $DataRoot 'my.ini'
$dataDir = Join-Path $DataRoot 'Data'

if (-not (Test-Path $ini)) {
  $content = @"
[mysqld]
basedir="$($BaseDir -replace '\\','/')"
datadir="$($dataDir -replace '\\','/')"
port=3306
bind-address=127.0.0.1
character-set-server=utf8mb4
collation-server=utf8mb4_0900_ai_ci
"@
  Set-Content -Path $ini -Value $content -Encoding ascii
  Write-Host "my.ini criado em $ini"
}

# O mysqld escreve o log normal no stderr; no PowerShell 5.1 isso viraria erro com 'Stop'.
function Invoke-Native([string]$exe, [string[]]$arguments) {
  $ErrorActionPreference = 'Continue'
  & $exe @arguments 2>&1 | ForEach-Object { Write-Host "$_" }
  return $LASTEXITCODE
}

# Pasta "mysql" dentro de Data = já inicializado. Sem ela, qualquer resto é de uma tentativa que falhou.
if (-not (Test-Path (Join-Path $dataDir 'mysql'))) {
  if (Test-Path $dataDir) { Remove-Item -Recurse -Force $dataDir }
  Write-Host "Inicializando a pasta de dados..."
  $code = Invoke-Native $mysqld @("--defaults-file=$ini", '--initialize-insecure', '--console')
  if ($code -ne 0) { throw "Falha ao inicializar o MySQL (código $code)" }
}

if (-not (Get-Service $ServiceName -ErrorAction SilentlyContinue)) {
  Write-Host "Registrando o serviço $ServiceName..."
  $code = Invoke-Native $mysqld @('--install', $ServiceName, "--defaults-file=$ini")
  if ($code -ne 0) { throw "Falha ao registrar o serviço (código $code)" }
}

Start-Service $ServiceName
Get-Service $ServiceName | Format-Table Name, Status, StartType
Write-Host "MySQL pronto em 127.0.0.1:3306 (usuário root sem senha, só local)."
