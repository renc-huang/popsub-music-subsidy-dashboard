#!/bin/bash
# deploy.sh — 本地 build 後推送 dist/ 到 gh-pages 分支
# 用法：bash deploy.sh

set -e

echo "Building..."
npm run build

echo "Deploying to gh-pages..."
git checkout gh-pages
# 清除舊檔（保留 .git）
find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} +
# 複製 dist 內容到根目錄
git checkout master -- dist
cp -r dist/* .
rm -rf dist
git add -A
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M')" --allow-empty
git push origin gh-pages
git checkout master

echo "Done! gh-pages branch updated."
