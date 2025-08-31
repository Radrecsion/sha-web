@echo off
echo ====== CLEANING ======
rmdir /s /q node_modules
del package-lock.json

echo ====== INSTALLING DEPENDENCIES ======
npm install

echo ====== PUSH TO GITHUB ======
git add .
git commit -m "auto deploy"
git push origin main

echo ====== DEPLOY TO GITHUB PAGES ======
npm run deploy

echo ====== DONE ======
pause
