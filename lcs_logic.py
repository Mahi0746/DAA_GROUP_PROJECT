def lcs_steps(X, Y):
    m, n = len(Y), len(X)

    dp = [[None]*(n+1) for _ in range(m+1)]
    arrow = [[""]*(n+1) for _ in range(m+1)]
    steps = []

    # Step 1: Initialize first cell
    dp[0][0] = 0
    steps.append({
        "dp": [row[:] for row in dp],
        "arrow": [row[:] for row in arrow],
        "current_i": 0,
        "current_j": 0,
        "phase": "init"
    })

    # Step 2: Initialize first row
    for j in range(1, n+1):
        dp[0][j] = 0
        steps.append({
            "dp": [row[:] for row in dp],
            "arrow": [row[:] for row in arrow],
            "current_i": 0,
            "current_j": j,
            "phase": "init"
        })

    # Step 3: Initialize first column
    for i in range(1, m+1):
        dp[i][0] = 0
        steps.append({
            "dp": [row[:] for row in dp],
            "arrow": [row[:] for row in arrow],
            "current_i": i,
            "current_j": 0,
            "phase": "init"
        })

    # Step 4: Fill DP table
    for i in range(1, m+1):
        for j in range(1, n+1):
            if Y[i-1] == X[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
                arrow[i][j] = "diag"
            else:
                if dp[i-1][j] > dp[i][j-1]:
                    dp[i][j] = dp[i-1][j]
                    arrow[i][j] = "up"
                elif dp[i-1][j] < dp[i][j-1]:
                    dp[i][j] = dp[i][j-1]
                    arrow[i][j] = "left"
                else:
                    dp[i][j] = dp[i-1][j]
                    arrow[i][j] = "both"

            steps.append({
                "dp": [row[:] for row in dp],
                "arrow": [row[:] for row in arrow],
                "current_i": i,
                "current_j": j,
                "phase": "fill"
            })
    print("DP Table:--",dp)
    print("\nArrow Table:--",arrow)
    print("\nSteps:--",steps)
    return dp, arrow, steps


def find_all_lcs_paths(X, Y, dp):
    all_paths = []

    def backtrack(i, j, lcs_string, path):
        if i == 0 or j == 0:
            all_paths.append({
                "lcs": lcs_string[::-1],
                "path": path[::-1]
            })
            return
        current_val = dp[i][j]
        if i > 0 and j > 0 and Y[i-1] == X[j-1] and dp[i-1][j-1]+1 == current_val:
            backtrack(i-1, j-1, lcs_string + Y[i-1], path + [(i, j)])
        if i > 0 and dp[i-1][j] == current_val:
            backtrack(i-1, j, lcs_string, path+[(i,j)])
        if j > 0 and dp[i][j-1] == current_val:
            backtrack(i, j-1, lcs_string, path+[(i,j)])

    backtrack(len(Y), len(X), "", [])
    print("\nAll Paths:--",all_paths)
    lcs_groups = {}
    for item in all_paths:
        lcs_str = item["lcs"]
        if lcs_str not in lcs_groups:
            lcs_groups[lcs_str] = []
        lcs_groups[lcs_str].append(item["path"])

    result = []
    for lcs_str, paths in lcs_groups.items():
        result.append({
            "lcs": lcs_str,
            "paths": paths,
            "count": len(paths)
        })

    return result
