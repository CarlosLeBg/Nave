@echo off
setlocal enabledelayedexpansion

REM Définit le répertoire de ton projet
set projectPath=C:\Users\Ca.lieval\Downloads\Nave

REM Vérifie si le répertoire existe
if exist "%projectPath%" (
    cd /d "%projectPath%"
    echo deploy.bat >> .gitignore
    git add .
    git commit -m "Mise à jour automatique"
    git push origin main
) else (
    echo "Le chemin d'accès spécifié est introuvable."
)
