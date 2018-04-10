#!/bin/bash

# parse command line flag "-u" for update all
# expected results for pre-defined test cases

POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -u|--update)
    UPDATE=1
    shift # past argument
    shift # past value
    ;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters


# loop through pre-defined test cases
for i in 0 1 2 3 4 5 6 7 8 9 10;
do
	echo -ne "Program $i: \t"
	if [ ${UPDATE} ] ;
	then
		echo -e "\033[33m [update] \033[0m"
		node main.js -v -t $i > testProgramsResults/$i
		continue
	fi

	node main.js -v -t $i > testProgramsResults/temp_result
	diff testProgramsResults/$i testProgramsResults/temp_result > testProgramsResults/temp_diff


	if [ $? -ne 0 ] ; 
	then
		echo -e "\033[31m [FAIL] \033[0m"
		cat testProgramsResults/temp_diff
	else
		echo -e "\033[32m [PASS] \033[0m"
	fi
done


# clean up intermediate files if exits
if [ -f testProgramsResults/temp_result ]; then
    rm testProgramsResults/temp_result
fi

if [ -f testProgramsResults/temp_diff ]; then
    rm testProgramsResults/temp_diff
fi
