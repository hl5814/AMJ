#!/bin/bash

# move all subdiretories files into current directory
# find . -mindepth 2 -type f -print -exec mv {} . \;
# delete all non-js files
# find . -type d ! -name '*.js' -delete

# print help and exit 1 if no argument is given
if [ -z "$2" ]
  then
    echo "usage: "
    echo "      ./checkFiles.sh [-s|--source] [filePath/directoryPath] [-v|--verbose]? [-d|--debug]?"
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
    echo "      ./filterPayloads.sh [-s|--source] ?"
    exit 1
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters


# check if the given source path is directory/file
if [ -d $SOURCE ]; then

    curr=0
    # echo "$SOURCE is a directory"
    for filename in $SOURCE/"$PREFIX"*; do
        
        filesize=$(stat -c%s "$filename")
        echo filesize
        maxsize=5
        if [ [$FILESIZE > MAXSIZE] ]; then
            node main.js -s $filename ${VERBOSE} -w 2>/dev/null | grep -E "hongtao"
        fi


        if [ ! $QUIET ]; then
            >&2 echo -ne "$((${curr}*100/${total})) % [ ${curr}/${total} ] $filename \r"
        fi
        curr="$(($curr + 1))"
    done

else
    echo "$SOURCE is not valid"
    exit 1
fi

>&2 echo  "$((${curr}*100/${total})) % [ ${curr}/${total} ] $filename"



# ./checkFiles.sh -s /Users/hongtao/Desktop/IndividualProject/jsob/samples/badstuff/javascript-malware-collection > Clustering/javascript-malware-collection.csv 
# ----
# ./checkFiles.sh -s /Users/hongtao/javascript-malware-collection/2016/ -p 201601 -l > Clustering/201601.csv &
# ./checkFiles.sh -s /Users/hongtao/javascript-malware-collection/2016/ -p 201602 > Clustering/201602.csv &
# ./checkFiles.sh -s /Users/hongtao/javascript-malware-collection/2016/ -p 201603 > Clustering/201603.csv &
# ./checkFiles.sh -s /Users/hongtao/javascript-malware-collection/2016/ -p 201604 > Clustering/201604.csv &
# ./checkFiles.sh -s /Users/hongtao/javascript-malware-collection/2016/ -p 201605 > Clustering/201605.csv &
# ./checkFiles.sh -s /Users/hongtao/javascript-malware-collection/2016/ -p 201606 > Clustering/201606.csv &
# ./checkFiles.sh -s /Users/hongtao/javascript-malware-collection/2016/ -p 201607 > Clustering/201607.csv &
# ./checkFiles.sh -s /Users/hongtao/javascript-malware-collection/2016/ -p 201608 > Clustering/201608.csv &
# ./checkFiles.sh -s /Users/hongtao/javascript-malware-collection/2016/ -p 201609 > Clustering/201609.csv &
# ./checkFiles.sh -s /Users/hongtao/javascript-malware-collection/2016/ -p 201610 > Clustering/201610.csv &
# ./checkFiles.sh -s /Users/hongtao/javascript-malware-collection/2016/ -p 201611 > Clustering/201611.csv &
# ./checkFiles.sh -s /Users/hongtao/javascript-malware-collection/2016/ -p 201612 > Clustering/201612.csv &


