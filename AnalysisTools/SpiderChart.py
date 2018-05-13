# Libraries
import matplotlib.pyplot as plt
import pandas as pd
from math import pi
from pathlib import Path
import os, shutil

# Set data
# df = pd.DataFrame({
# 'group':            ['183', 'code2'],
# 'Assignment':       [641,    2.082],
# 'ExpressionOp':     [510,    5.322],
# 'FuncObfuscation':  [1  ,    3.132],
# 'FunctionCall':     [536,    5.067],
# 'InitVariable':     [507,    1.990],
# 'StringOp':         [259,    2.500],
# 'UndefinedFunction':[137,    3.439]
# })

file_path = os.path.abspath(os.path.dirname(__file__))
parent_path = Path(file_path).parent
featureCSV_dataFile = os.path.join(parent_path, "Clustering/f_df.csv")
scopeCSV_dataFile = os.path.join(parent_path, "Clustering/s_df.csv")
cluster_fig_path = os.path.join(parent_path, "Clustering/figures/")
if not os.path.exists(cluster_fig_path):
    os.makedirs(cluster_fig_path)
else:
    shutil.rmtree(cluster_fig_path)
    os.makedirs(cluster_fig_path)



f_df = pd.read_csv(featureCSV_dataFile,index_col=0)
s_df = pd.read_csv(scopeCSV_dataFile,index_col=0)

feature_headers = f_df.columns.values.tolist()
scope_headers = s_df.columns.values.tolist()

keys = ["group"]

for i in range(0, len(feature_headers)):
	keys.append(feature_headers[i]+'\n'+scope_headers[i])

for index, row in f_df.iterrows():
	f_values = ["FEATURE"] + f_df.loc[index].tolist()
	s_values = ["CONTEXT"] + s_df.loc[index].tolist()

	inputData = {}
	for x in range(0, len(f_df.columns.values)):
		inputData[keys[x]] = [f_values[x],s_values[x]]

	df = pd.DataFrame(inputData)
	# ------- PART 1: Create background

	# number of variable
	categories=list(df)[:-1]
	N = len(categories)

	# What will be the angle of each axis in the plot? (we divide the plot / number of variable)
	angles = [n / float(N) * 2 * pi for n in range(N)]
	angles += angles[:1]
	 

	fig = plt.figure()
	# fig.set_size_inches(6, 4)
	# Initialise the spider plot
	ax = plt.subplot(111, polar=True)
	 
	# If you want the first axis to be on top:
	ax.set_theta_offset(pi / 2)
	ax.set_theta_direction(-1)
	 
	# Draw one axe per variable + add labels labels yet
	plt.xticks(angles[:-1], categories)
	 
	# Draw ylabels
	ax.set_rlabel_position(0)
	plt.yticks([0.1, 0.25, 0.5], ["0.1","0.25","0.5"], color="grey", size=7)
	plt.ylim(0,0.75)
	 
	 
	# ------- PART 2: Add plots
	 
	# Plot each individual = each line of the data
	# I don't do a loop, because plotting more than 3 groups makes the chart unreadable
	 
	# Ind1
	values=df.loc[0].drop('group').values.flatten().tolist()
	values += values[:1]
	ax.plot(angles, values, linewidth=1, linestyle='solid', label="feature")
	ax.fill(angles, values, 'b', alpha=0.3)
	 
	# Ind2
	values=df.loc[1].drop('group').values.flatten().tolist()
	values += values[:1]
	ax.plot(angles, values, linewidth=1, linestyle='solid', label="context")
	ax.fill(angles, values, 'r', alpha=0.3)
	 
	# # Add legend
	plt.legend(loc='upper right', bbox_to_anchor=(0.05, 0.05))
	plt.savefig(os.path.join(cluster_fig_path, 'fig' + str(index) + '.png'))
