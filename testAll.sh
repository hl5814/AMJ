#!/bin/bash

for i in 0 1 2 3 4 5 6 7 8 9 10;
do
	echo -ne "Program $i: \t"
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

rm testProgramsResults/temp_result testProgramsResults/temp_diff
