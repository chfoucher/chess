#!/bin/sh

publishLocally() {
    WWW="/var/www/html/chess"

    mkdir -p $WWW/history
    cp history/conf.php $WWW/history
    cp history/get.php $WWW/history

    mkdir -p $WWW/scripts
    cp scripts/main.js $WWW/scripts

    cp index.html $WWW
}

publishRemotely() {
    echo "Publish to $1 by FTP"
    ftp -i ftpperso.free.fr <<EOF
    cd Christophe/chess
    put index.html
    put history/get.php
    put scripts/main.js
EOF

}

if [ -z $1 ]
then
    publishLocally
else
    publishRemotely $1
fi
exit 0
