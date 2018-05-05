from matplotlib import pyplot as plt
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster
import numpy as np
import csv, os, shutil
from io import StringIO
from shutil import copyfile
import argparse

# Parse command line arguments
parser = argparse.ArgumentParser(description="Cluster Malicious JS files based on features")
parser.add_argument("-d", "--dendrogram", action="store_true", help="draw dendrogram")
parser.add_argument("level", type=int, help="number of clusters")

args = parser.parse_args()
LEVEL = args.level

print("Clustering to " + str(LEVEL) + " clusters . . .\n")


def fancy_dendrogram(*args, **kwargs):
    max_d = kwargs.pop('max_d', None)
    if max_d and 'color_threshold' not in kwargs:
        kwargs['color_threshold'] = max_d
    annotate_above = kwargs.pop('annotate_above', 0)

    ddata = dendrogram(*args, **kwargs)

    if not kwargs.get('no_plot', False):
        plt.title('Hierarchical Clustering Dendrogram (truncated)')
        plt.xlabel('sample index or (cluster size)')
        plt.ylabel('distance')
        for i, d, c in zip(ddata['icoord'], ddata['dcoord'], ddata['color_list']):
            x = 0.5 * sum(i[1:3])
            y = d[1]
            if y > annotate_above:
                plt.plot(x, y, 'o', c=c)
                plt.annotate("%.3g" % y, (x, y), xytext=(0, -5),
                             textcoords='offset points',
                             va='top', ha='center')
        if max_d:
            plt.axhline(y=max_d, c='k')
    return ddata


DATA_FILES = ["FeaturesArray.csv" , "ScopeArray.csv", "FeatureScopeArray.csv", "Feature_Scope_Keyword_Punctuator.csv"]
DATA_FILE_INDEX = 1;    #Feature_Scope_Keyword_Punctuator.csv

file_path = os.path.abspath(os.path.dirname(__file__))
dataCSV = os.path.join(file_path, DATA_FILES[DATA_FILE_INDEX])
with open(dataCSV, 'r+') as csvfile:
    spamreader = csv.reader(csvfile, delimiter=':', quotechar='|')
    fileData = ""
    fileIndex = []
    for row in spamreader:
        fileIndex.append(row[0])
        fileData = fileData + row[1] + "\n"
        

dataArray = np.loadtxt(StringIO(fileData), delimiter=',')
X = np.array(dataArray)

# generate the linkage matrix ['complete', 'single', etc.]
Z = linkage(X, 'ward')


# # set cut-off to 50
# max_d = 50  # max_d as in max_distance
# fancy_dendrogram(
#     Z,
#     truncate_mode='lastp',
#     p=12,
#     leaf_rotation=90.,
#     leaf_font_size=12.,
#     show_contracted=True,
#     annotate_above=10,
#     max_d=max_d,  # plot a horizontal cut-off line
# )
# plt.show()


# Print out file index within each cluster
linkage = Z
clusternum = LEVEL
clustdict = {i:[i] for i in range(len(linkage)+1)}
for i in range(len(linkage)-clusternum+1):
    clust1= int(linkage[i][0])
    clust2= int(linkage[i][1])
    clustdict[max(clustdict)+1] = clustdict[clust1] + clustdict[clust2]
    del clustdict[clust1], clustdict[clust2]


# create result directories for different clusters
RESULT_DIR = os.path.join(file_path, "cluster_result")

shutil.rmtree(RESULT_DIR)
if not os.path.exists(RESULT_DIR):
    os.makedirs(RESULT_DIR)

for key, value in clustdict.items():
    CLUSTER_DIR = os.path.join(file_path, "cluster_result", str(key))
    if not os.path.exists(CLUSTER_DIR):
        os.makedirs(CLUSTER_DIR)
    for v in value:
        FILE_PATH = os.path.join(CLUSTER_DIR, str(v)+".js")
        copyfile(fileIndex[v][1:-1], FILE_PATH)
    print(key, "\n", value, "\n")


# calculate full dendrogram
plt.figure(figsize=(25, 10))
plt.title('Hierarchical Clustering Dendrogram')
plt.xlabel('sample index')
plt.ylabel('distance')
dendrogram(
    Z,
    leaf_rotation=90.,  # rotates the x axis labels
    leaf_font_size=8.,  # font size for the x axis labels
)

if (args.dendrogram):
        plt.show();






