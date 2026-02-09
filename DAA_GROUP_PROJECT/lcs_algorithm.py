def compute_lcs(seq_x, seq_y):

    m, n = len(seq_y) + 1, len(seq_x) + 1
    dp = [[0] * n for _ in range(m)]
    arrows = [[""] * n for _ in range(m)]
    
    # Build DP table
    for i in range(m):
        for j in range(n):
            if i == 0 or j == 0:
                dp[i][j] = 0
            elif seq_y[i-1] == seq_x[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
                arrows[i][j] = "⭦"
            else:
                top, left = dp[i-1][j], dp[i][j-1]
                dp[i][j] = max(top, left)
                if top > left:
                    arrows[i][j] = "⭡"
                elif left > top:
                    arrows[i][j] = "⭠"
                else:
                    arrows[i][j] = "⭠⭡"
    
    # Find all LCS strings and their paths
    all_lcs_data = find_all_lcs_with_paths(seq_x, seq_y, dp)
    
    return {
        "final_dp": dp,
        "final_arrows": arrows,
        "lcs_length": dp[m-1][n-1],
        "lcs_strings": all_lcs_data["strings"],
        "backtrack_paths": all_lcs_data["paths"]
    }

def find_all_lcs(seq_x, seq_y, dp):

    lcs_set = set()
    
    def backtrack(i, j, lcs):
        if i == 0 or j == 0:
            lcs_str = lcs[::-1]
            # Only add non-empty LCS strings
            if lcs_str:
                lcs_set.add(lcs_str)
            return
        
        val = dp[i][j]
        
        # Check diagonal (match)
        if seq_y[i-1] == seq_x[j-1] and dp[i-1][j-1] + 1 == val:
            backtrack(i-1, j-1, lcs + seq_y[i-1])
        
        # Check up
        if dp[i-1][j] == val:
            backtrack(i-1, j, lcs)
        
        # Check left
        if dp[i][j-1] == val:
            backtrack(i, j-1, lcs)
    
    backtrack(len(seq_y), len(seq_x), "")
    
    return list(lcs_set)

def find_all_lcs_with_paths(seq_x, seq_y, dp):
    
    all_paths = []
    lcs_strings = set()
    
    def backtrack(i, j, lcs, path):
        if i == 0 or j == 0:
            lcs_str = lcs[::-1]
            # Only add non-empty LCS strings
            if lcs_str:
                lcs_strings.add(lcs_str)
                all_paths.append({
                    "string": lcs_str,
                    "path": path[::-1]  # Reverse to get correct order
                })
            return
        
        val = dp[i][j]
        
        # Check diagonal (match)
        if seq_y[i-1] == seq_x[j-1] and dp[i-1][j-1] + 1 == val:
            backtrack(i-1, j-1, lcs + seq_y[i-1], path + [[i, j]])
        
        # Check up
        if dp[i-1][j] == val:
            backtrack(i-1, j, lcs, path + [[i, j]])
        
        # Check left
        if dp[i][j-1] == val:
            backtrack(i, j-1, lcs, path + [[i, j]])
    
    backtrack(len(seq_y), len(seq_x), "", [])
    
    return {
        "strings": list(lcs_strings),
        "paths": all_paths
    }
