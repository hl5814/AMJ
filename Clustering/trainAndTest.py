from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split


import threading
import multiprocessing as mp
import numpy as np
import pandas as pd
import csv, os, shutil
from pathlib import Path
import argparse, subprocess, math
import sys, operator, random
import glob

# Parse command line arguments
parser = argparse.ArgumentParser(description="Cluster Malicious JS files based on features")
parser.add_argument("-s", dest='source', required=True, action='store',type=str, help="input csv file path")
parser.add_argument("-n", dest='neighbours',default=1,action='store',type=int, help="number of neighbours")


CLUSTER_NUMS = [5]
TEST_NUMS = [0.1]
# CLUSTER_NUMS = [10]
# TEST_NUMS = [0.25]


args = parser.parse_args()
SOURCE = args.source
NEIGHBOURS = args.neighbours


file_path = os.path.abspath(os.path.dirname(__file__))

cluster_data = os.path.join(file_path, "cluster_result.csv")



for CLUSTER_NUM in CLUSTER_NUMS:
	print("CLUSTER_NUM>>", CLUSTER_NUM)

	expect_cluster_dict = {}
	subprocess.run(['python3', 'Clustering/cluster.py','-s', SOURCE,"-n", str(CLUSTER_NUM)], stdout=subprocess.PIPE)
	df = pd.read_csv(cluster_data)
	data_df = pd.read_csv(os.path.join(file_path, SOURCE))

	# Record the expected cluster for all data
	for index, row in df.iterrows():
		key = row[-1]
		value = row[0]
		if key in expect_cluster_dict:
			expect_cluster_dict[key].append(value)
		else:
			expect_cluster_dict[key] = [value]


	numberOfClusters = len(set(df['cluster'].values))
	
	for TEST_NUM in TEST_NUMS:
		print("TEST_NUM>>", TEST_NUM)
		for i in range(40):
			NEIGHBOURS=i+1
			X = df.drop(['cluster', 'header'], axis=1).as_matrix()
			y = df['cluster'].values
			neigh = KNeighborsClassifier(n_neighbors=NEIGHBOURS)
			neigh.fit(X, y)

			number_of_clusters = len(set(df['cluster'].values))


			# # Define an output queue
			output = mp.Queue()

			def runTest(number, output):
				test_file_name = "train_df" + str(number) + ".csv"
				test_cluster_data = "testing_cluster_result" + str(number) + ".csv"
				train_df, test_df = train_test_split(data_df, test_size=TEST_NUM, random_state=random.randint(1, 50000))
				train_df.to_csv(os.path.join(file_path, test_file_name), encoding='utf-8', index=False)
				# Clustering the training data set
				actual_cluster_dict = {}
				subprocess.run(['python3', 'Clustering/cluster.py','-s', test_file_name, "-r", test_cluster_data,"-n", str(CLUSTER_NUM)], stdout=subprocess.PIPE)
				t_df = pd.read_csv(os.path.join(file_path, test_cluster_data))
				for index, row in t_df.iterrows():
					key = row[-1]
					value = row[0]
					if key in actual_cluster_dict:
						actual_cluster_dict[key].append(value)
					else:
						actual_cluster_dict[key] = [value]



				Xt = t_df.drop(['cluster', 'header'], axis=1).as_matrix()
				yt = t_df['cluster'].values

				t_neigh = KNeighborsClassifier(n_neighbors=NEIGHBOURS)
				t_neigh.fit(Xt, yt)


				total_good = 0;
				total_bad = 0;
				for index, row in test_df.iterrows():
					intput_array = row.tolist()[1:]

					expect_cluster = neigh.predict([intput_array])[0]
					actual_cluster = t_neigh.predict([intput_array])[0]
					
					sub_cluster_files = actual_cluster_dict[actual_cluster]
					cluster_files = expect_cluster_dict[expect_cluster]

					good = []
					bad = []
					for f in sub_cluster_files:
						if not f in cluster_files :
							bad.append(f)
							# print("Expect:", expect_cluster, "  Actual:", actual_cluster, "  file:", f)
						else:
							good.append(f)

					total_good = total_good + len(good)
					total_bad = total_bad + len(bad)

				false_rate = (total_bad/(total_bad+total_good))
				output.put(false_rate)

				os.remove(os.path.join(file_path, test_file_name))
				os.remove(os.path.join(file_path, test_cluster_data)) 
				# print("%.2f%%" % accuracy_rate)

			processes = [mp.Process(target=runTest, args=(x, output)) for x in range(1)]
			# ts = [threading.Thread(target=runTest, args=(x, output)) for x in range(5)]
			# for t in ts:
			#     t.start()

			# # Exit the completed processes
			# for t in ts:
			#     t.join()


			# Run processes
			for p in processes:
			    p.start()

			# Exit the completed processes
			for p in processes:
			    p.join()

			# Get process results from the output queue
			# l = [1,2,3,4,5]
			results = [output.get() for p in processes]
			# results = [output.get() for t in ts]

			# print(results)
			print("%.2f" % (sum(results) / float(len(results))))


