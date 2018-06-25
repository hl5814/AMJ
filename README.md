AMJ [Analyzer for Malicious JavaScript]
================================================================
Parse the given JavaScript Codes and extract features, and then cluster the given samples into different groups.

## Usage
#### main program:
```
node main.js [-v|verbose flag]? [-w|show weighted points for SVM]? [-s source|source file path]?
````
#### unit Test
```
mocha test
```
#### regression Test
```
./testAll.sh
```
#### script for batch input files:
```
./checkFiles.sh [-s|--source] [filePath/directoryPath] [-v|--verbose]?
```
EXAMPLE:
```
./checkFiles.sh -s /Users/hongtao/Desktop/IndividualProject/jsob/samples/badstuff/malwareforum/  > Clustering/Feature_Scope_Keyword_Punctuator.csv
```
#### clustering
```
usage: cluster.py [-h] [-d] level
	python3 Clustering/cluster.py 5
```

Deatils could be found in report.pdf

