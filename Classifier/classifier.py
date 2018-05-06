# Create and fit a nearest-neighbor classifier
from sklearn.neighbors import KNeighborsClassifier
import numpy as np
import pandas as pd
import csv, os, shutil
from pathlib import Path

# read input data csv file
DATA_FILES = ["Clustering/cluster_result.csv"]
DATA_FILE_INDEX = 0;

file_path = os.path.abspath(os.path.dirname(__file__))
parent_path = Path(file_path).parent
cluster_data = os.path.join(parent_path, DATA_FILES[DATA_FILE_INDEX])

# if (VERBOSE >= 0) : print("Reading data from: " + str(dataCSV))
# if (VERBOSE >= 0) : print("Clustering into " + str(LEVEL) + " clusters . . .\n")

df = pd.read_csv(cluster_data)
# print(df)
X = df.drop(['cluster'], axis=1).as_matrix()
y = df['cluster'].values
# print(X)
# print(y)
from sklearn.neighbors import KNeighborsClassifier
neigh = KNeighborsClassifier(n_neighbors=5)
neigh.fit(X, y) 
print(neigh.predict([[
	0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0.25,0.25,0,0,0,0,0,0,0,0,0,0.25,0,0,0,0.25,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0.05761316872427984
	]]))
# print(neigh.predict_proba([[4]]))

