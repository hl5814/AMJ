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
    -p|--prefix)
    PREFIX="$2"
    shift # past argument
    shift # past value
    ;;
    -k|--skip)
    SKIP="$2"
    shift # past argument
    shift # past value
    ;;
    -v|--verbose)
    VERBOSE=" -v"
    shift # past argument
    ;;
    -d|--debug)
    DEBUG_MODE=" -d"
    shift # past argument
    ;;
    -q|--quiet)
    QUIET=" -q"
    shift # past argument
    ;;    
    *)
    echo "usage: "
    echo "      ./checkFiles.sh [-s|--source] [-k|--skip] [filePath/directoryPath] [-v|--verbose]? [-d|--debug]?"
    exit 1
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters



# check if the given source path is directory/file
if [ -d $SOURCE ]; then
    node main.js -h  2>/dev/null | grep -E "header"
    if [ -n $PREFIX ]; then
        total=$(find $SOURCE/* 2>/dev/null| wc -l)
    else
        total=$(find $SOURCE -name "$PREFIX"*  2>/dev/null| wc -l)
    fi

    curr=0
    # echo "$SOURCE is a directory"
    for filename in $SOURCE/"$PREFIX"*; do
        if [[ -n $SKIP ]]; then
            if [ "$SKIP" = "$filename" ] || [ "$SKIP" = "$curr" ]; then
                SKIP=""
            else
                curr="$(($curr + 1))"
                continue
            fi
        fi
        if [ $DEBUG_MODE ]; then
        	# echo $filename
            var=$(node main.js -s $filename ${VERBOSE}  -w   | grep -E "hongtao")
            ret_code=$?
            if [ $ret_code != 0 ]; then
                printf "Error [$ret_code] at [$curr]: $filename \n" 
                read -p "Press enter to continue"
            fi
        else
            node main.js -s $filename ${VERBOSE}  -w  2>/dev/null | grep -E "hongtao"
        fi


        if [ ! $QUIET ]; then
            >&2 echo -ne "$((${curr}*100/${total})) % [ ${curr}/${total} ] $filename \r"
        fi
        curr="$(($curr + 1))"
    done
elif [ -f $SOURCE ]; then
    node main.js -s $SOURCE -w ${VERBOSE}
else
    echo "$SOURCE is not valid"
    exit 1
fi

>&2 echo  "$((${curr}*100/${total})) % [ ${curr}/${total} ] $filename"
# ./checkFiles.sh -s /Users/hongtao/Desktop/IndividualProject/jsob/samples/badstuff/javascript-malware-collection > Clustering/javascript-malware-collection.csv 








