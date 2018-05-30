from sklearn.neighbors import KNeighborsClassifier
import numpy as np
import pandas as pd
import csv, os, shutil
from pathlib import Path
import argparse, subprocess, math

# Parse command line arguments
parser = argparse.ArgumentParser(description="Classifier Malicious JS Code based on Clusters")
parser.add_argument('--verbose', '-v', action='count', default=-1,help="verbose level")
parser.add_argument("-n", dest='neighbours', action='store',type=float, default=1, nargs='?', help="number of neighbors used for classifier")
parser.add_argument("-s", dest='source', required=True, action='store',type=str,nargs='?',default="Clustering/cluster_result.csv", help="labled cluster csv file")
parser.add_argument("-f", dest='file', required=True, action='store',type=str, help="JS/HTML file to be classifier")
args = parser.parse_args()
PATH = args.file
SOURCE = args.source
VERBOSE = args.verbose
NEIGHBORS = args.neighbours

if (VERBOSE >= 0) : print("Parsing input file [" + PATH + "] ...")
PARSE_RESULT = subprocess.run(['node', 'main.js','-s', PATH, "-w"], stdout=subprocess.PIPE)
INPUT_ARRAY = [float(x) for x in PARSE_RESULT.stdout.decode('utf-8')[:-1].split(",")[1:] ]

# if cluster_result.csv not exists, run the clustering script first
if not os.path.exists(SOURCE):
	print("[ERROR] Please run Clustering Script first to get the labled data for classification.")
	exit(-1)


file_path = os.path.abspath(os.path.dirname(__file__))
parent_path = Path(file_path).parent
cluster_data = os.path.join(parent_path, SOURCE)

print("Reading data from: " + str(cluster_data))


df = pd.read_csv(cluster_data)
X = df.drop(['cluster','header'], axis=1).as_matrix()
y = df['cluster'].values

neigh = KNeighborsClassifier(n_neighbors=NEIGHBORS)
neigh.fit(X, y)

print("Input File Belongs to Cluster: ", neigh.predict([INPUT_ARRAY]))
if (VERBOSE >= 1) : print("\nProbabilities:\n", neigh.predict_proba([INPUT_ARRAY]))


