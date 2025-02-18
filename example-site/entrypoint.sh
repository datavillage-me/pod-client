#!/bin/bash
: "${VITE_LOGIN_CALLBACK?Need a login callback}"
: "${VITE_CLIENT_NAME?Need a client name}"

pattern="/usr/share/nginx/html/assets/*.js"
file=( $(compgen -W "$pattern") )

sed -i "s|__VITE_LOGIN_CALLBACK__|$VITE_LOGIN_CALLBACK|g" "$file"
sed -i "s|__VITE_CLIENT_NAME__|$VITE_CLIENT_NAME|g" "$file"

exec "$@"