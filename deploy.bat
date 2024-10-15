@echo off
cd /d "C:\Chemin\Vers\Ton\Projet"
echo deploy.bat >> .gitignore
git add .
git commit -m "Mise à jour automatique"
git push origin main