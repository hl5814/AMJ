from sklearn.neighbors import KNeighborsClassifier
import numpy as np
import pandas as pd
import csv, os, shutil
from pathlib import Path
import argparse, subprocess, math

# Parse command line arguments
parser = argparse.ArgumentParser(description="Classifier Malicious JS Code based on Clusters")
parser.add_argument("file", type=str, help="path of JS file to be classifier")
parser.add_argument('--verbose', '-v', action='count', default=-1,help="verbose level")
parser.add_argument("neighbours", type=int, nargs='?', default=-1, help="number of neighbors used for classifier")

args = parser.parse_args()
PATH = args.file
VERBOSE = args.verbose
NEIGHBORS = args.neighbours

if (VERBOSE >= 0) : print("Parsing input file [" + PATH + "] ...")
PARSE_RESULT = subprocess.run(['node', 'main.js','-s', PATH, "-w"], stdout=subprocess.PIPE)
INPUT_ARRAY = [float(x) for x in PARSE_RESULT.stdout.decode('utf-8')[:-1].split(",")[1:] ]

# read input data csv file
DATA_FILES = ["Clustering/cluster_result.csv"]
DATA_FILE_INDEX = 0

# if cluster_result.csv not exists, run the clustering script first
if not os.path.exists(DATA_FILES[DATA_FILE_INDEX]) or NEIGHBORS == -1:
	if (VERBOSE >= 0) : print("Clustering Sample Data ... ")
	r = subprocess.run(['python3', 'Clustering/cluster.py','-f','-s','2016.csv','-l','30','-p','0.1'], stdout=subprocess.PIPE).stdout.decode('utf-8')[:-1]
	NEIGHBORS = math.ceil(float(r))

file_path = os.path.abspath(os.path.dirname(__file__))
parent_path = Path(file_path).parent
cluster_data = os.path.join(parent_path, DATA_FILES[DATA_FILE_INDEX])

# if (VERBOSE >= 0) : print("Reading data from: " + str(dataCSV))


df = pd.read_csv(cluster_data)
X = df.drop(['cluster'], axis=1).as_matrix()
y = df['cluster'].values

neigh = KNeighborsClassifier(n_neighbors=NEIGHBORS)
neigh.fit(X, y)

print("Input File Belongs to Cluster: ", neigh.predict([INPUT_ARRAY]))
if (VERBOSE >= 1) : print("\nProbabilities:\n", neigh.predict_proba([INPUT_ARRAY]))


