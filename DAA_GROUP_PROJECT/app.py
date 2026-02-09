from flask import Flask, render_template, request, jsonify
from lcs_algorithm import compute_lcs

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/solve", methods=["POST"])
def solve():
    data = request.json
    result = compute_lcs(data["seq1"], data["seq2"])
    return jsonify({
        **result,
        "s1": data["seq1"],
        "s2": data["seq2"]
    })

if __name__ == "__main__":
    app.run(debug=True)
