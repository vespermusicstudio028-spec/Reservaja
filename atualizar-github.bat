@echo off
:: Garante que o script roda na pasta onde ele esta localizado
cd /d "%~dp0"

echo ===================================================
echo      ATUALIZADOR DE REPOSITORIO - RESERVA JA
echo ===================================================
echo.

echo 1. Buscando atualizacoes no GitHub (Git Pull)...
git pull --rebase
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao sincronizar com o GitHub. Verifique sua conexao ou credenciais.
    goto fim
)

echo.
echo 2. Preparando arquivos para envio (Git Add)...
git add .

echo.
set /p msg="Digite a mensagem do commit (ou aperte ENTER para usar 'Atualizacao automatica'): "
if "%msg%"=="" set msg=Atualizacao automatica

echo.
echo 3. Criando o commit...
git commit -m "%msg%"

echo.
echo 4. Enviando alteracoes para o GitHub (Git Push)...
git push origin master
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao enviar para o GitHub. Verifique suas credenciais.
    goto fim
)

echo.
echo ===================================================
echo   [SUCESSO] Repositorio atualizado com sucesso!
echo ===================================================

:fim
echo.
pause
