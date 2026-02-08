from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# ---------------------------------
# Build DP Table WITH ARROWS (with initialization steps)
# ---------------------------------
def lcs_steps(X, Y):
    m, n = len(Y), len(X)

    dp = [[None]*(n+1) for _ in range(m+1)]
    arrow = [[""]*(n+1) for _ in range(m+1)]
    steps = []

    # STEP 1: Initialize first cell (0,0)
    dp[0][0] = 0
    steps.append({
        "dp": [row[:] for row in dp],
        "arrow": [row[:] for row in arrow],
        "current_i": 0,
        "current_j": 0,
        "phase": "init"
    })

    # STEP 2: Initialize first row (i=0, j=1 to n)
    for j in range(1, n+1):
        dp[0][j] = 0
        steps.append({
            "dp": [row[:] for row in dp],
            "arrow": [row[:] for row in arrow],
            "current_i": 0,
            "current_j": j,
            "phase": "init"
        })

    # STEP 3: Initialize first column (i=1 to m, j=0)
    for i in range(1, m+1):
        dp[i][0] = 0
        steps.append({
            "dp": [row[:] for row in dp],
            "arrow": [row[:] for row in arrow],
            "current_i": i,
            "current_j": 0,
            "phase": "init"
        })

    # STEP 4: Fill the DP table
    for i in range(1, m+1):
        for j in range(1, n+1):

            if Y[i-1] == X[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
                arrow[i][j] = "diag"
            else:
                # Check for multiple paths
                if dp[i-1][j] > dp[i][j-1]:
                    dp[i][j] = dp[i-1][j]
                    arrow[i][j] = "up"
                elif dp[i-1][j] < dp[i][j-1]:
                    dp[i][j] = dp[i][j-1]
                    arrow[i][j] = "left"
                else:
                    # BOTH paths have equal value - multiple LCS possible
                    dp[i][j] = dp[i-1][j]
                    arrow[i][j] = "both"

            steps.append({
                "dp": [row[:] for row in dp],
                "arrow": [row[:] for row in arrow],
                "current_i": i,
                "current_j": j,
                "phase": "fill"
            })

    return dp, arrow, steps


# ---------------------------------
# FIND ALL LCS - Check DP values during backtracking
# ---------------------------------
def find_all_lcs_paths(X, Y, dp, arrow):
    all_paths = []
    
    def backtrack(i, j, lcs_string, path):
        # Base case - reached top-left corner
        if i == 0 or j == 0:
            all_paths.append({
                "lcs": lcs_string[::-1],
                "path": path[::-1]
            })
            return
        
        current_val = dp[i][j]
        
        # Check if diagonal is valid (character match AND contributes to LCS)
        if i > 0 and j > 0 and Y[i-1] == X[j-1] and dp[i-1][j-1] + 1 == current_val:
            backtrack(i-1, j-1, lcs_string + Y[i-1], path + [(i, j)])
        
        if i > 0 and dp[i-1][j] == current_val:
            backtrack(i-1, j, lcs_string, path + [(i, j)])
        
        if j > 0 and dp[i][j-1] == current_val:
            backtrack(i, j-1, lcs_string, path + [(i, j)])
    
    backtrack(len(Y), len(X), "", [])
    
    lcs_groups = {}
    for item in all_paths:
        lcs_str = item["lcs"]
        if lcs_str not in lcs_groups:
            lcs_groups[lcs_str] = []
        lcs_groups[lcs_str].append(item["path"])
    
    # Format result
    result = []
    for lcs_str, paths in lcs_groups.items():
        result.append({
            "lcs": lcs_str,
            "paths": paths,
            "count": len(paths)
        })
    
    return result


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/solve", methods=["POST"])
def solve():
    data = request.json
    X = data["seq1"]
    Y = data["seq2"]

    dp, arrow, steps = lcs_steps(X, Y)
    all_lcs = find_all_lcs_paths(X, Y, dp, arrow)
    
    return jsonify({
        "steps": steps,
        "all_lcs": all_lcs,
        "total_lcs": len(all_lcs),
        "length": dp[len(Y)][len(X)],
        "X": X,
        "Y": Y,
        "final_dp": dp,
        "final_arrow": arrow
    })


if __name__ == "__main__":
    app.run(debug=True)