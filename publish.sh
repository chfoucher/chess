#!/bin/sh
WWW="/var/www/html/chess"

mkdir -p $WWW/history
cp history/conf.php $WWW/history
cp history/get.php $WWW/history

mkdir -p $WWW/scripts
cp scripts/main.js $WWW/scripts

cp index.html $WWW
