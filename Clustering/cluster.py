from matplotlib import pyplot as plt
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster
import numpy as np
import csv
from io import StringIO

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

with open("/Users/hongtao/Desktop/JSDetector/Clustering/FeaturesArray.csv", 'r+') as csvfile:
# with open("/Users/hongtao/Desktop/JSDetector/Clustering/ScopeArray.csv", 'r+') as csvfile:
# with open("/Users/hongtao/Desktop/JSDetector/Clustering/FeatureScopeArray.csv", 'r+') as csvfile:
    spamreader = csv.reader(csvfile, delimiter=':', quotechar='|')
    fileData = ""
    fileIndex = []
    for row in spamreader:
        fileIndex.append(row[0])
        fileData = fileData + row[1] + "\n"
        

dataArray = np.loadtxt(StringIO(fileData), delimiter=',')
    
X = np.array(dataArray)

# generate the linkage matrix
# Z = linkage(X, 'ward')
Z = linkage(X, 'complete')

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
clusternum = 10
clustdict = {i:[i] for i in range(len(linkage)+1)}
for i in range(len(linkage)-clusternum+1):
    clust1= int(linkage[i][0])
    clust2= int(linkage[i][1])
    clustdict[max(clustdict)+1] = clustdict[clust1] + clustdict[clust2]
    del clustdict[clust1], clustdict[clust2]

for key, value in clustdict.items():
    print(key)
    print(value)
    # for v in value:
        # print(fileIndex[v])

print(fileIndex[99])