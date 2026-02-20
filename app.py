from flask import Flask, render_template, request, jsonify
from lcs_logic import lcs_steps, find_all_lcs_paths  # <- separated logic

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/solve", methods=["POST"])
def solve():
    data = request.json
    X = data["seq1"].upper()
    Y = data["seq2"].upper()

    dp, arrow, steps = lcs_steps(X, Y)
    all_lcs = find_all_lcs_paths(X, Y, dp)
    
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
    port = int(os.environ.get("PORT", 5000))
    # Must use 0.0.0.0 to be accessible externally
    app.run(host="0.0.0.0", port=port)
