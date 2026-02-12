@echo off
echo ========================================
echo   SUBINDO PROJETO PARA GITHUB
echo   Usuario: augustope99
echo   Repositorio: doc-permite
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Inicializando repositorio Git...
git init

echo.
echo [2/5] Adicionando arquivos...
git add .

echo.
echo [3/5] Criando commit...
git commit -m "Deploy: Landing Page Doc Permite"

echo.
echo [4/5] Conectando ao GitHub...
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/augustope99/doc-permite.git

echo.
echo [5/5] Enviando para GitHub...
git push -u origin main --force

echo.
echo ========================================
echo   CONCLUIDO!
echo   Acesse: https://augustope99.github.io/doc-permite/
echo ========================================
echo.
pause
