#!/bin/bash

# get current working directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ "$NODE_ENV" == "production" ]; then
	echo ""
	echo "******************"
	echo "*** PRODUCTION ***"
	echo "******************"
	echo ""

	FOREVER="forever"
else
	echo ""
	echo "*******************"
	echo "*** DEVELOPMENT ***"
	echo "*******************"
	echo ""

	FOREVER="$DIR/node_modules/forever/bin/forever"
fi

PROCESSID=`ps ax | grep "$DIR/server.js" | grep 'node\|iojs' | awk '{print $1}'`

if [ $? -eq "0" ] && [ -n "$PROCESSID" ]; then
	echo "Killing previous server..."
	"$FOREVER" stop "$DIR/server.js"
	sleep 5;
fi

"$DIR/build-resources"

echo "Starting new server..."

"$FOREVER" start -o "$DIR/output.txt" -e "$DIR/output.txt" --minUptime 2000 --spinSleepTime 500 --append --sourceDir "$DIR/" server.js

sleep 2

echo "Done."
