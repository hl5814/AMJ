from matplotlib import pyplot as plt
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster
import numpy as np
import pandas as pd
import csv, os, shutil
from io import StringIO
from shutil import copyfile
import argparse, sys
from scipy.cluster.hierarchy import cophenet
from scipy.spatial.distance import pdist

# Parse command line arguments
parser = argparse.ArgumentParser(description="Cluster Malicious JS files based on features")
parser.add_argument("-d", "--dendrogram", action="store_true", help="draw dendrogram")
parser.add_argument("-f", "--file", action="store_true", help="copy files into corresponding cluster")
parser.add_argument("level", type=int, help="number of clusters")
parser.add_argument('--verbose', '-v', action='count', default=-1,help="-v print file index for each cluster,-vv print top 3 features of each cluster")

args = parser.parse_args()
LEVEL = args.level
VERBOSE = args.verbose
FILE = args.file

# read input data csv file
DATA_FILES = ["malwareforum.csv", "2015.csv", "2016.csv", "2017.csv", "javascript-malware-collection.csv", "malware-jail.csv"]
DATA_FILE_INDEX = 0;

file_path = os.path.abspath(os.path.dirname(__file__))
dataCSV = os.path.join(file_path, DATA_FILES[DATA_FILE_INDEX])

if (VERBOSE >= 0) : print("Reading data from: " + str(dataCSV))

df = pd.read_csv(dataCSV)
fileIndex = df.ix[:,0] # get first column as File Indices
df=df.drop(['header'], axis=1) # drop first column and use the rest as weightArray
df_percent = df.sample(frac=0.3) # randomly taking 30% of input samples
X =df.as_matrix()
HEADER = df.columns.values

# # generate the linkage matrix 
LINKAGE_MATRIX = ['single', 'complete', 'average', 'ward', 'weighted', 'centroid', 'median']
# TOP_COPHENET = 0
L_MATRIX = "ward"
# for L in LINKAGE_MATRIX:
#     Z = linkage(X, L)
#     c, coph_dists = cophenet(Z, pdist(X))
#     if c > TOP_COPHENET:
#         TOP_COPHENET = c
#         L_MATRIX = L
# Z = linkage(X, L_MATRIX)
if (VERBOSE >= 0) : print("Clustering into " + str(LEVEL) + " clusters . . .\n")
Z = linkage(X, 'ward')
c, coph_dists = cophenet(Z, pdist(X))
if (VERBOSE >= 0) : print("Using :[", L_MATRIX, "] as linkage matrix\nwith cophenet value: ", c, "\n")



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
RESULT_DIR = os.path.join(file_path, "clusters")

if not os.path.exists(RESULT_DIR):
    os.makedirs(RESULT_DIR)
else:
    shutil.rmtree(RESULT_DIR)
    os.makedirs(RESULT_DIR)

df['cluster'] = -1

cluster_size = []

# -*- coding: utf-8 -*-
def printProgress(id, iteration, total,prefix='', suffix='', decimals=2, barLength=20):
        filledLength = int(round(barLength * iteration / float(total)))
        percents = round(100.00 * (iteration / float(total)), decimals)
        bar = '█' * filledLength + '▒' * (barLength - filledLength)
        return ('%s |%s| %s%s\t%s' % (prefix, bar, str(percents).rjust(7), "%", suffix))

iteration = 1
FINAL_REPORT = {    "topFeatures":    "",
                    "topScopes":      "",
                    "topKeywords":    "",
                    "topPunctuators": ""    
                }

for key, value in clustdict.items():
    if (VERBOSE == -1):
        print(printProgress("1",iteration,clusternum,"","Cluster:["+str(key)+"]"), end="\r", flush=True, file=sys.stderr)
        iteration = iteration + 1

    cluster_size.append(len(value))
    if FILE:
        CLUSTER_DIR = os.path.join(RESULT_DIR, str(key))
        if not os.path.exists(CLUSTER_DIR):
            os.makedirs(CLUSTER_DIR)

        CLUSTER_REPORT = os.path.join(CLUSTER_DIR, "cluster_report.txt")

        c_df = pd.DataFrame(columns=HEADER)
        index = 1;
        for v in value:
            FILE_PATH = os.path.join(CLUSTER_DIR, str(v)+".js")
            copyfile(fileIndex[v], FILE_PATH)
            c_df.loc[v] = X[v]
            index += 1
            df.at[v, 'cluster'] = str(key) # update cluster number for the input dataFrame


        # Cluster Report DataFrames Processing
        file_df = c_df[["TokenPerFile"]]

        feature_df = c_df[["InitVariable","AssignWithFuncCall","AssignWithBitOperation","PreFunctionObfuscation","StringConcatation","ArrayConcatation","MaliciousFunctionCall","FuncCallOnBinaryExpr","FuncCallOnUnaryExpr","FuncCallOnStringVariable","FuncCallOnCallExpr","NonLocalArrayAccess","HtmlCommentInScriptBlock","UsingKeywordThis","ConditionalCompilationCode","DotNotationInFunctionName","LongArray", "LongExpression"]]
        feature_df = feature_df.loc[:, (feature_df != 0).any(axis=0)]
        feature_df = feature_df.reindex(feature_df.sum().sort_values(ascending=False).index, axis=1)

        scope_df = c_df[["in_test","in_main","in_if","in_loop","in_function","in_try","in_switch","in_return","in_file"]]
        scope_df = scope_df.loc[:, (scope_df != 0).any(axis=0)]
        scope_df = scope_df.reindex(scope_df.sum().sort_values(ascending=False).index, axis=1)

        keyword_df = c_df[["break", "case", "catch", "continue", "debugger", "default", "delete", "do", "else", "finally", "for", "function", "if", "in", "instanceof", "new", "return", "switch", "this", "throw","try", "typeof", "var", "const", "void", "while", "with", "document","MY_MJSA_THIS"]]
        keyword_df = keyword_df.loc[:, (keyword_df != 0).any(axis=0)]
        keyword_df = keyword_df.reindex(keyword_df.sum().sort_values(ascending=False).index, axis=1)

        punctuator_df = c_df[["!","!=","!==","%","%=","&","&&","&=","(",")","*","*=","+","++",
                            "+=",",","-","--","-=",".","/","/=",":",";","<","<<","<<=","<=",
                            "=","==","===",">",">=",">>",">>=",">>>","?","[","]","^",
                            "^=","{","|","|=","||","}","~"]]
        punctuator_df = punctuator_df.loc[:, (punctuator_df != 0).any(axis=0)]
        punctuator_df = punctuator_df.reindex(punctuator_df.sum().sort_values(ascending=False).index, axis=1)


        f = open(CLUSTER_REPORT, 'a')
        file_df.to_csv(f, encoding='utf-8', index=True)

        f.write('\n# Features:\n\n')
        f.write('FileIndex')
        feature_df.to_csv(f, encoding='utf-8', index=True)
        f.write('\nTop 3: ' + str(feature_df.columns.values[:3]))
        f.write('\n--------------------------------------------------\n')

        f.write('\n# Scopes:\n\n')
        f.write('FileIndex')
        scope_df.to_csv(f, encoding='utf-8', index=True)
        f.write('\nTop 3: ' + str(scope_df.columns.values[:3]))
        f.write('\n--------------------------------------------------\n')

        f.write('\n# Keywords:\n\n')
        f.write('FileIndex')
        keyword_df.to_csv(f, encoding='utf-8', index=True)
        f.write('\nTop 3: ' + str(keyword_df.columns.values[:3]))
        f.write('\n--------------------------------------------------\n')

        f.write('\n# Punctuators:\n\n')
        f.write('FileIndex')
        punctuator_df.to_csv(f, encoding='utf-8', index=True)
        f.write('\nTop 3: ' + str(punctuator_df.columns.values[:3]))
        f.write('\n--------------------------------------------------\n')

        f.close()

        FINAL_REPORT["topFeatures"] += str(key) + ": " +str(feature_df.columns.values[:3]) + "\n"
        FINAL_REPORT["topScopes"] += str(key) + ": " +str(scope_df.columns.values[:3]) + "\n"
        FINAL_REPORT["topKeywords"] += str(key) + ": " +str(keyword_df.columns.values[:3]) + "\n"
        FINAL_REPORT["topPunctuators"] += str(key) + ": " +str(punctuator_df.columns.values[:3]) + "\n"


    if (VERBOSE >= 0): print(key, value)
    
if FILE:
    FINAL_REPORT_PATH = os.path.join(file_path, "final_report.txt")
    f = open(FINAL_REPORT_PATH, 'w+')
    for key, value in FINAL_REPORT.items():
        f.write(key + ":\n")
        f.write(value + "\n")
    f.close()

# draw full dendrogram
# plt.figure(figsize=(25, 10))
# plt.title('Hierarchical Clustering Dendrogram')
# plt.xlabel('sample index')
# plt.ylabel('distance')
# dendrogram(
#     Z,
#     leaf_rotation=90.,  # rotates the x axis labels
#     leaf_font_size=8.,  # font size for the x axis labels
# )


if (args.dendrogram):
    max_d = 30  # max_d as in max_distance
    fancy_dendrogram(
        Z,
        truncate_mode='lastp',
        p=LEVEL,
        leaf_rotation=90.,
        leaf_font_size=12.,
        show_contracted=True,
        annotate_above=10,
        max_d=max_d,  # plot a horizontal cut-off line
    )
    plt.show()

CLUSTER_RESULT = os.path.join(file_path, "cluster_result.csv")
df.to_csv(CLUSTER_RESULT, encoding='utf-8', index=False)

if (VERBOSE == -1):
    print("                                                              ", end="\r", flush=True, file=sys.stderr)
    sys.stderr.flush()
if (VERBOSE >=0) :
    print("\n--------------------------------------------------\nAverage Cluster Size:  ", sum(cluster_size)/len(cluster_size))
else:
    print(sum(cluster_size)/len(cluster_size))









