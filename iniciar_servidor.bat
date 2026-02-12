@echo off
echo Iniciando servidor local na porta 8080...
echo.
echo Abra o navegador e acesse: http://localhost:8080
echo.
echo Pressione Ctrl+C para parar o servidor
echo.
python -m http.server 8080
