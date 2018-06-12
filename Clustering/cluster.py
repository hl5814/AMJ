from matplotlib import pyplot as plt
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster
import numpy as np
import pandas as pd
import csv, os, shutil, argparse, sys, operator
from io import StringIO
from shutil import copyfile
from scipy.cluster.hierarchy import cophenet
from scipy.spatial.distance import pdist
import scipy.stats, time
# python3 Clustering/cluster.py  -f -s 2016.csv -l 10 -p 0.05 -d

# Parse command line arguments
parser = argparse.ArgumentParser(description="Cluster Malicious JS files based on features")
parser.add_argument("-d", "--dendrogram", action="store_true", help="draw dendrogram")
parser.add_argument("-f", "--file", action="store_true", help="copy files into corresponding cluster")
parser.add_argument("-n", dest='number',default=1,action='store',type=int, help="number of clusters")
parser.add_argument("-l", dest='line',default=1,action='store',type=float, help="line")
parser.add_argument('--verbose', '-v', action='count', default=-1,help="-v print file index for each cluster,-vv print top 3 features of each cluster")
parser.add_argument("-p", dest='percentage', action='store',type=float, default=1, nargs='?', help="randomly pick p%%  from samples")
parser.add_argument("-s", dest='source', required=True, action='store',type=str, help="input csv file path")
parser.add_argument("-r", dest='result', action='store',type=str,default="cluster_result.csv", help="result file path, cluster_result.csv by default")


args = parser.parse_args()
NODES = args.number
VERBOSE = args.verbose
FILE = args.file
LINE_AT = args.line
PERCENT = args.percentage
SOURCE = args.source
RESULT_PATH = args.result

# read input data csv file
# "malwareforum.csv", "2015.csv", "2016.csv", "2017.csv", "javascript-malware-collection.csv"


file_path = os.path.abspath(os.path.dirname(__file__))
dataCSV = os.path.join(file_path, SOURCE)

if (VERBOSE >= 0) : print("Reading data from: " + str(dataCSV))
start_time = time.time()
df = pd.read_csv(dataCSV)
# elapsed_time = time.time() - start_time
# print("read csv: ", elapsed_time)
# start_time = time.time()
if PERCENT >= 0 and PERCENT < 1:
    df = df.sample(frac=PERCENT) # randomly taking 10% of input samples
fileIndex = df.ix[:,0] # get first column as File Indices
FULL_HEADER = df.columns.values

df=df.drop(['header'], axis=1) # drop first column and use the rest as weightArray
df = df.reset_index(drop=True)
fileIndex = fileIndex.reset_index(drop=True)
X =df.as_matrix()
HEADER = df.columns.values

# generate the linkage matrix 
LINKAGE_MATRIX = ['single', 'complete', 'average', 'weighted', 'centroid', 'median', 'ward']
TOP_COPHENET = 0
L_MATRIX = "average"
# for L in LINKAGE_MATRIX:
#     Z = linkage(X, L)
#     c, coph_dists = cophenet(Z, pdist(X))
#     print("linkage:", L)
#     print("cophenet:", c)
#     if c > TOP_COPHENET:
#         TOP_COPHENET = c
#         L_MATRIX = L
# Z = linkage(X, L_MATRIX)

# L_MATRIX = "single"
# L_MATRIX = "ward"
if (VERBOSE >= 0) : print("Clustering into " + str(NODES) + " clusters . . .\n")
Z = linkage(X, L_MATRIX)
c, coph_dists = cophenet(Z, pdist(X))
# print(coph_dists)
# KL = scipy.stats.entropy(coph_dists) 
if (VERBOSE >= 0) : print("Using :[", L_MATRIX, "] as linkage matrix\nwith cophenet value: ", c, "\n")

# First define the leaf label function.
def llf(id):
    return str(id);

def fancy_dendrogram(*args, **kwargs):
    max_d = kwargs.pop('max_d', None)
    if max_d and 'color_threshold' not in kwargs:
        kwargs['color_threshold'] = max_d
    annotate_above = kwargs.pop('annotate_above', 0)


    ddata = dendrogram(*args, **kwargs)
    if not kwargs.get('no_plot', False):
        # plt.title('Hierarchical Clustering Dendrogram (truncated)')
        plt.title('Hierarchical Clustering Dendrogram(' + L_MATRIX+")")
        plt.xlabel('cluster index')
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
clustdict = {i:[i] for i in range(len(Z)+1)}
for i in range(len(Z)-NODES+1):
    clust1= int(Z[i][0])
    clust2= int(Z[i][1])
    clustdict[max(clustdict)+1] = clustdict[clust1] + clustdict[clust2]
    del clustdict[clust1], clustdict[clust2]

# create result directories for different clusters
RESULT_DIR = os.path.join(file_path, "clusters")

if FILE:
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
FINAL_REPORT = {    "number of files":"",
                    "topFeatures":    "",
                    "topScopes":      "",
                    "topKeywords":    "",
                    "topPunctuators": ""
                }

FEATURE_LIST =  [   "VariableWithFunctionExpression",
                    "VariableWithExpression",       
                    "VariableWithThisExpression",   
                    "VariableWithUnaryExpression",  
                    "VariableWithBinaryExpression", 
                    "VariableWithCallExpression",   
                    "VariableWithLogicalExpression",
                    "VariableWithBitOperation",     
                    "FunctionObfuscation",          
                    "StringConcatenation",          
                    "PredefinedFuncCalls",          
                    "DOM_Operations",               
                    "WINDOW_Operations",            
                    "FuncCallOnBinaryExpr",         
                    "FuncCallOnUnaryExpr",          
                    "FuncCallOnStringVariable",     
                    "FuncCallOnCallExpr",           
                    "FuncCallOnNonLocalArray",      
                    "FuncCallOnUnkonwnReference",   
                    "HtmlCommentInScriptBlock",     
                    "AssigningToThis",              
                    "ConditionalCompilationCode",   
                    "DotNotationInFunctionName",    
                    "LongArray",                    
                    "LongExpression",               
                    "UnfoldEvalSuccess",            
                    "Unescape",                     
                    "UnfoldUnescapeSuccess"]        
    
               

SCOPE_LIST = ["in_main","in_if","in_loop","in_function","in_try","in_switch","in_return","in_file"]

result_df = pd.DataFrame(columns=FULL_HEADER)
result_df['cluster'] = -1
line = 1;


f_df = pd.DataFrame(columns=FEATURE_LIST)
s_df = pd.DataFrame(columns=SCOPE_LIST)

feature_dict = {}
for f in FEATURE_LIST:
    feature_dict[f] = 0

if (VERBOSE >= 0): print("\n--------------------------------------------------")
TOTAL_FILES = 0

for key, value in clustdict.items():
    TOTAL_FILES = TOTAL_FILES + len(value)
    if (VERBOSE == -1):
        print(printProgress("1",iteration,NODES,"","Cluster:["+str(key)+"]"), end="\r", flush=True, file=sys.stderr)
        iteration = iteration + 1

    cluster_size.append(len(value))

    CLUSTER_DIR = os.path.join(RESULT_DIR, str(key))
    if FILE:    
        if not os.path.exists(CLUSTER_DIR):
            os.makedirs(CLUSTER_DIR)
        CLUSTER_REPORT = os.path.join(CLUSTER_DIR, "cluster_report.txt")
        FILE_SOURCES = []

    c_df = pd.DataFrame(columns=HEADER)
    feature_df = None
    scope_df = None
    keyword_df = None
    punctuator_df = None

    for v in value:
        # update result dataframe
        result_df.loc[line] = np.concatenate(([fileIndex[v]], X[v], [str(key)]), axis=0)
        line = line + 1

        if FILE:
            FILE_PATH = os.path.join(CLUSTER_DIR, str(v)+".js")
            FILE_SOURCES.append(str(v)+','+fileIndex[v])
            copyfile(fileIndex[v], FILE_PATH)

        df.at[v, 'cluster'] = str(key) # update cluster number for the input dataFrame
        
        c_df.loc[len(c_df)] = X[v]
        # Cluster Report DataFrames Processing
        file_df = c_df[["CommentPerFile"]]
        averageCommentPercentage = file_df.mean().values[0] * 100


    if FILE :
        feature_df = c_df[FEATURE_LIST]
        f_df.loc[key] = feature_df.mean().values
        feature_df = feature_df.loc[:, (feature_df != 0).any(axis=0)]
        feature_df = feature_df.reindex(feature_df.sum().sort_values(ascending=False).index, axis=1)

        scope_df = c_df[SCOPE_LIST]
        s_df.loc[key] = scope_df.mean().values
        scope_df = scope_df.loc[:, (scope_df != 0).any(axis=0)]
        scope_df = scope_df.reindex(scope_df.sum().sort_values(ascending=False).index, axis=1)

        keyword_df = c_df[["break", "case", "catch", "continue", "debugger", "default", "delete", "do", "else", "finally", "for", "function", "if", "in", "instanceof", "new", "return", "switch", "this", "throw","try", "typeof", "var", "const", "void", "while", "with", "document","MY_MJSA_THIS"]]
        keyword_df = keyword_df.loc[:, (keyword_df != 0).any(axis=0)]
        keyword_df = keyword_df.reindex(keyword_df.sum().sort_values(ascending=False).index, axis=1)

        punctuator_df = c_df[["!","!=","!==","%","%=","&","&&","&=","(",")","*","*=","+","++",
                            "+=",",","-","--","-=",".","/","/=",":",";","<","<<","<<=","<=",
                            "=","==","===",">",">=",">>",">>=",">>>",">>>=","?","[","]","^",
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

        f.write('\n# FILES:\n\n')
        f.write('\n'.join(FILE_SOURCES))
        f.write('\n--------------------------------------------------\n')

        f.close()

        FINAL_REPORT["number of files"] += "{:>5}".format(str(key)) + ":  " + str(len(value)) + "\n"
        FINAL_REPORT["topFeatures"] += "{:>5}".format(str(key)) + ": [" + ", ".join(feature_df.columns.values) + "]\n"
        FINAL_REPORT["topScopes"] += "{:>5}".format(str(key)) + ": [" + ", ".join(scope_df.columns.values) + "]\n"
        FINAL_REPORT["topKeywords"] += "{:>5}".format(str(key)) + ": [" + ", ".join(keyword_df.columns.values) + "]\n"
        FINAL_REPORT["topPunctuators"] += "{:>5}".format(str(key)) + ": [" + ", ".join(punctuator_df.columns.values) + "]\n"

        # update feature dict
        for f in feature_df.columns.values:
            feature_dict[f] = feature_dict[f] + feature_df[f].astype(bool).sum()


    if (VERBOSE >= 0): 
        commentReport = ""
        if (averageCommentPercentage > 10):
            commentReport = " => %.2f%% comment/file" % averageCommentPercentage

        print("Cluster[{:>5}]".format(str(key))+"  #files:{:>5}".format(len(value)) + commentReport)

if (VERBOSE >= 0): print("--------------------------------------------------\nTotal: ", TOTAL_FILES)
    
f_df = f_df.loc[:, (f_df != 0).any(axis=0)]
s_df = s_df.loc[:, (s_df != 0).any(axis=0)]
NUMBER_OF_COLUMNS = max(len(f_df.columns.values), len(s_df.columns.values))

if len(f_df.columns.values) != NUMBER_OF_COLUMNS:
    for i in range(len(f_df.columns.values), NUMBER_OF_COLUMNS):
        f_df[i] = 0

if len(s_df.columns.values) != NUMBER_OF_COLUMNS:
    for i in range(len(s_df.columns.values), NUMBER_OF_COLUMNS):
        s_df[i] = 0



sorted_f = None


if FILE:
    sorted_f = sorted(feature_dict.items(), key=operator.itemgetter(1), reverse=True)
    FINAL_REPORT_PATH = os.path.join(file_path, "final_report.txt")
    f = open(FINAL_REPORT_PATH, 'w+')
    f.write("\n\nTop Features from the sample set:\n--------------------------------------------------\n")
    for ft in sorted_f:
        if ft[1] > 0:
            percent = ft[1]/TOTAL_FILES * 100
            f.write("{:<35}:{:<5}({:>7}\n".format(ft[0],ft[1],"%.2f%%)" % percent))

    UN_FOUND_FEATURES = set(FEATURE_LIST) - set(f_df.columns.values)
    UN_FOUND_SCOPES = set(SCOPE_LIST) - set(s_df.columns.values)
    f.write("\n\nUN_FOUND_FEATURES:\n"+ str(UN_FOUND_FEATURES))
    f.write("\nUN_FOUND_SCOPES:\n"+ str(UN_FOUND_SCOPES) + "\n\n")

    for key, value in FINAL_REPORT.items():
        f.write(key + ":\n")
        f.write(value + "\n")
    f.close()

    FEATURE_MEAN_CSV = os.path.join(file_path, "f_df.csv")
    f_df.to_csv(FEATURE_MEAN_CSV, encoding='utf-8', index=True)

    SCOPE_MEAN_CSV = os.path.join(file_path, "s_df.csv")
    s_df.to_csv(SCOPE_MEAN_CSV, encoding='utf-8', index=True)


CLUSTER_RESULT = os.path.join(file_path, RESULT_PATH)
result_df.to_csv(CLUSTER_RESULT, encoding='utf-8', index=False)

if (VERBOSE == -1):
    print("                                                              ", end="\r", flush=True, file=sys.stderr)
if (VERBOSE >=0) :
    print("\n\nTop Features from the sample set:\n--------------------------------------------------")
    sorted_f = sorted(feature_dict.items(), key=operator.itemgetter(1), reverse=True)
    for f in sorted_f:
        if f[1] > 0:
            percent = f[1]/TOTAL_FILES * 100
            print("{:<35}".format(f[0]), ":" ,"{:<5}".format(f[1]), "("+"{:>7}".format("%.2f%%)" % percent))

    UN_FOUND_FEATURES = set(FEATURE_LIST) - set(f_df.columns.values)
    UN_FOUND_SCOPES = set(SCOPE_LIST) - set(s_df.columns.values)
    if len(UN_FOUND_FEATURES) > 0: print("\n\nUN_FOUND_FEATURES:\n", UN_FOUND_FEATURES)
    if len(UN_FOUND_SCOPES) > 0: print("\nUN_FOUND_SCOPES:\n", UN_FOUND_SCOPES)

    print("\n--------------------------------------------------\nAverage Cluster Size:  ", sum(cluster_size)/len(cluster_size))
else:
    print(sum(cluster_size)/len(cluster_size))


# draw full dendrogram
if (args.dendrogram):
    fig = plt.figure()
    # plt.figure(figsize=(5, 4))
    plt.figure(figsize=(10, 4))
    # plt.figure(figsize=(20, 8))
    sys.setrecursionlimit(1500)
    max_d = LINE_AT  # max_d as in max_distance for colouring sub tree
    fancy_dendrogram(
        Z,
        leaf_label_func=llf,
        truncate_mode='lastp',
        p=NODES,
        # truncate_mode='level',
        # p=100,
        leaf_font_size=8.,
        show_contracted=True,
        annotate_above=0.5,
        # max_d=max_d,  # plot a horizontal cut-off line
    )
    if RESULT_PATH != "cluster_result.csv":
        plt.savefig(os.path.join(file_path,'t_dendrogram.png'))
    else:
        plt.savefig(os.path.join(file_path,'dendrogram('+L_MATRIX+').png'))




