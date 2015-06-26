#!/bin/sh
# install workphone web personal

# depend follow pkg:
# gcc gcc-c++ pcre-devel zlib-devel make python-setuptools python-devel readline-devel openssl-devel 
# nodejs, pm2


USER=wcloud_wp

# config the db ip to /etc/hosts
if 
    cat /etc/hosts | grep wphone.ws.xthinkers 
then
    echo "The WS IP already exists in the file."
else
    read -p "Please enter the WS IP:" ws_ip
    echo "$ws_ip wphone.ws.xthinkers" >> /etc/hosts
fi 


# stop old server
pm2 delete all
sleep 3

# add user
if [ ! -d "/home/$USER" ]; then  
    useradd -m $USER
fi 

# create workphone_ws env
if [ ! -d "/home/$USER/workphone_wp" ]; then  
    mkdir /home/$USER/workphone_wp
fi 


rm -rf /home/$USER/workphone_wp
cp -rf .  /home/$USER/workphone_wp


# start
chown -R $USER:$USER /home/$USER
pm2 start /home/$USER/workphone_wp/app.js
sleep 1
pm2 dump

