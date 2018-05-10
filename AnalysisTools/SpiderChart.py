# Libraries
import matplotlib.pyplot as plt
import pandas as pd
from math import pi
 
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

keys = ["group","InitVariable","AssignWithFuncCall","AssignWithBitOperation","PreFunctionObfuscation","StringConcatation","ArrayConcatation","MaliciousFunctionCall","FuncCallOnBinaryExpr","FuncCallOnUnaryExpr","FuncCallOnStringVariable","FuncCallOnCallExpr","NonLocalArrayAccess","HtmlCommentInScriptBlock","UsingKeywordThis","ConditionalCompilationCode","DotNotationInFunctionName","LongArray", "LongExpression"]
values = ["FEATURE",0.6,0.2,0.2,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0]
inputData = {}
for x in range(0, len(keys)):
	inputData[keys[x]] = [values[x]]

print(inputData)

df = pd.DataFrame(inputData)


# ------- PART 1: Create background

# number of variable
categories=list(df)[:-1]
N = len(categories)

# What will be the angle of each axis in the plot? (we divide the plot / number of variable)
angles = [n / float(N) * 2 * pi for n in range(N)]
angles += angles[:1]
 
# Initialise the spider plot
ax = plt.subplot(111, polar=True)
 
# If you want the first axis to be on top:
ax.set_theta_offset(pi / 2)
ax.set_theta_direction(-1)
 
# Draw one axe per variable + add labels labels yet
plt.xticks(angles[:-1], categories)
 
# Draw ylabels
ax.set_rlabel_position(0)
plt.yticks([0.25, 0.5, 0.75], ["0.25","0.5","0.75"], color="grey", size=8)
plt.ylim(0,1)
 
 
# ------- PART 2: Add plots
 
# Plot each individual = each line of the data
# I don't do a loop, because plotting more than 3 groups makes the chart unreadable
 
# Ind1
values=df.loc[0].drop('group').values.flatten().tolist()
values += values[:1]
ax.plot(angles, values, linewidth=1, linestyle='solid', label="occurances")
ax.fill(angles, values, 'b', alpha=0.1)
 
# # Ind2
# values=df.loc[1].drop('group').values.flatten().tolist()
# values += values[:1]
# ax.plot(angles, values, linewidth=1, linestyle='solid', label="code length")
# ax.fill(angles, values, 'r', alpha=0.1)
 
# Add legend
plt.legend(loc='upper right', bbox_to_anchor=(0.1, 0.1))


plt.show()