#!/bin/bash

# move all subdiretories files into current directory
# find . -mindepth 2 -type f -print -exec mv {} . \;


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
    node main.js -h  2>/dev/null | grep -E "header"
    total=$(ls $SOURCE 2>/dev/null| wc -l)
    curr=0
    # echo "$SOURCE is a directory"
    for filename in $SOURCE/*; do
    	# echo $filename
        node main.js -s $filename ${VERBOSE}  -w  2>/dev/null | grep -E "FEATURE|POINT|Length|Weight|Total|Tokens|IndividualProject"
        >&2 echo -ne "$((${curr}*100/${total})) % [ ${curr}/${total} ] \r"
        curr="$(($curr + 1))"
    done
elif [ -f $SOURCE ]; then
    node main.js -s $SOURCE -w ${VERBOSE}
else
    echo "$SOURCE is not valid"
    exit 1
fi

# ./checkFiles.sh -s /Users/hongtao/Desktop/IndividualProject/jsob/samples/badstuff/javascript-malware-collection > Clustering/javascript-malware-collection.csv 








