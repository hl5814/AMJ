#!/bin/bash

# print help and exit 1 if no argument is given
if [ -z "$2" ]
  then
    echo "usage: "
    echo "      ./checkFiles.sh [-s|--source] [filePath/directoryPath] [-v|--verbose]?"
    exit 1
fi

# parse command line flag "-s" for path of JS file/directories
POSITIONAL=()

while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -s|--source)
    SOURCE="$2"
    shift # past argument
    shift # past value
    ;;
    -v|--verbose)
    VERBOSE=" -v"
    shift # past argument
    ;;    
    *)
    echo "usage: "
    echo "      ./checkFiles.sh [-s|--source] [filePath/directoryPath] [-v|--verbose]?"
    exit 1
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

# check if the given source path is directory/file
if [ -d $SOURCE ]; then
    echo "$SOURCE is a directory"
    for filename in $SOURCE/*; do
    	echo $filename
        node main.js -s $filename ${VERBOSE}  -w   | grep -E "FEATURE|POINT|Length|Weight|Total|Tokens|--"
    done
elif [ -f $SOURCE ]; then
    node main.js -s $SOURCE -w ${VERBOSE}
else
    echo "$SOURCE is not valid"
    exit 1
fi

