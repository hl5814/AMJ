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

SOURCE_DIR="RegressionTests/testPrograms"
RESULT_DIR="RegressionTests/expectedResults"

if [ -d $SOURCE_DIR ]; then
    for filename in $SOURCE_DIR/*; do
    	s=${filename##*/}
		echo -ne "[${filename##*/}]: \t\t"
		if [ ${UPDATE} ] ;
		then
			echo -e "\033[33m [update] \033[0m"
			node main.js -s $filename -v > ${RESULT_DIR}/${s%.*}
			continue
		fi

		node main.js -s $filename -v > ${RESULT_DIR}/temp_result
		diff ${RESULT_DIR}/${s%.*} ${RESULT_DIR}/temp_result > ${RESULT_DIR}/temp_diff

		if [ $? -ne 0 ] ; 
		then
			echo -e "\033[31m [FAIL] \033[0m"
			cat ${RESULT_DIR}/temp_diff
		else
			echo -e "\033[32m [PASS] \033[0m"
		fi
done
else
    echo "$SOURCE_DIR is not valid"
    exit 1
fi

# clean up intermediate files if exits
if [ -f ${RESULT_DIR}/temp_result ]; then
    rm ${RESULT_DIR}/temp_result
fi

if [ -f ${RESULT_DIR}/temp_diff ]; then
    rm ${RESULT_DIR}/temp_diff
fi



