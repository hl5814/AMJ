from matplotlib import pyplot as plt
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster
import numpy as np
import csv
from io import StringIO

with open("/Users/hongtao/Desktop/JSDetector/Clustering/FeaturesArray.csv", 'r+') as csvfile:
    spamreader = csv.reader(csvfile, delimiter=':', quotechar='|')
    fileData = ""
    fileIndex = []
    for row in spamreader:
        fileIndex.append(row[0])
        fileData = fileData + row[1] + "\n"
        

dataArray = np.loadtxt(StringIO(fileData), delimiter=',')
    
X = np.array(dataArray)

# generate the linkage matrix
Z = linkage(X, 'ward')

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
plt.show()

linkage = Z
clusternum = 5
clustdict = {i:[i] for i in range(len(linkage)+1)}
for i in range(len(linkage)-clusternum+1):
    clust1= int(linkage[i][0])
    clust2= int(linkage[i][1])
    clustdict[max(clustdict)+1] = clustdict[clust1] + clustdict[clust2]
    del clustdict[clust1], clustdict[clust2]

for key, value in clustdict.items():
    print(key)
    for v in value:
        print(fileIndex[v])
    print("\n\n")
