#!/bin/bash

# parse command line flag "-s" for path of JS file/directories

POSITIONAL=()

if [ -z "$2" ]
  then
    echo "usage: "
    echo "      ./checkFiles.sh -s [filePath/directoryPath]"
    exit 1
fi

while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -s|--source)
    SOURCE="$2"
    shift # past argument
    shift # past value
    ;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters


if [ -d $SOURCE ]; then
    echo "$SOURCE is a directory"
    for filename in $SOURCE/*; do
    	echo $filename
		node main.js -s $filename -w | grep POINT
done
elif [ -f $SOURCE ]; then
    node main.js -s $SOURCE -w
else
    echo "$SOURCE is not valid"
    exit 1
fi

