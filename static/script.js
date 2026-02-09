let steps = [], pos = 0, allLcsData = [], finalDP = [], finalArrow = [];
let stringX = "", stringY = "";

function start() {
    const x = document.getElementById("x").value.trim().toUpperCase();
    const y = document.getElementById("y").value.trim().toUpperCase();
    
    if (!x || !y) return alert("Please enter both strings");
    
    stringX = x;
    stringY = y;
    document.getElementById("backtrack-controls").classList.add("hidden");
    document.getElementById("result").innerHTML = "Computing...";
    
    fetch("/solve", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seq1: x, seq2: y })
    })
    .then(r => r.json())
    .then(data => {
        steps = data.steps;
        allLcsData = data.all_lcs;
        finalDP = data.final_dp;
        finalArrow = data.final_arrow;
        pos = 0;
        animate(data.X, data.Y, data.all_lcs, data.length, data.total_lcs);
    })
    .catch(() => alert("Error occurred"));
}

function animate(X, Y, all_lcs, length, total_lcs) {
    if (pos >= steps.length) return displayResults(all_lcs, length, total_lcs);
    drawTable(steps[pos], X, Y);
    pos++;
    setTimeout(() => animate(X, Y, all_lcs, length, total_lcs), steps[pos-1].phase === "init" ? 600 : 900);
}

function displayResults(all_lcs, length, total_lcs) {
    const resultBox = document.getElementById("result");
    resultBox.classList.add("show");
    
    if (total_lcs === 1) {
        resultBox.innerHTML = `LCS = <strong>"${all_lcs[0].lcs}"</strong> | Length = <strong>${length}</strong>`;
    } else {
        resultBox.innerHTML = `<strong>${total_lcs} different LCS found (Length = ${length})</strong><br>
            ${all_lcs.map(i => `"${i.lcs}"`).join(', ')}`;
    }
    
    document.getElementById("backtrack-controls").classList.remove("hidden");
    document.getElementById("lcs-info").innerHTML = `<p><strong>Found LCS:</strong></p><ul>
        ${all_lcs.map((item, i) => `<li><strong>Path ${i + 1}:</strong> "${item.lcs}"</li>`).join('')}
    </ul>`;
    
    document.querySelector(".button-group").innerHTML = 
        all_lcs.map((_, i) => `<button class="btn-path" onclick="showPath(${i})">Show Path ${i + 1}</button>`).join('') +
        '<button class="btn-reset" onclick="resetTable()">Reset Table</button>';
}

function showPath(pathIndex) {
    if (pathIndex >= allLcsData.length) return;
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f7b731"];
    const pathData = allLcsData[pathIndex];
    drawTable({dp: finalDP, arrow: finalArrow}, stringX, stringY, pathData.paths[0], colors[pathIndex % colors.length], pathData.lcs);
}

function resetTable() {
    drawTable({dp: finalDP, arrow: finalArrow}, stringX, stringY);
}

function drawTable(step, X, Y, path = [], color = null, lcs = "") {
    const dp = step.dp;
    const ar = step.arrow;
    const pathSet = new Set(path.map(([i, j]) => `${i},${j}`));
    const arrows = {diag: "↖", up: "↑", left: "←", both: "←↑"};
    
    let html = "<table><tr><th>i/j</th><th>0</th>";
    for (let c of X) html += `<th>${c}</th>`;
    html += "</tr>";
    
    for (let i = 0; i < dp.length; i++) {
        html += `<tr><th>${i == 0 ? "0" : Y[i - 1]}</th>`;
        
        for (let j = 0; j < dp[0].length; j++) {
            const val = dp[i][j] !== null ? dp[i][j] : "";
            const arrow = arrows[ar[i][j]] || "";
            const arrowHtml = arrow ? `<span class="arrow">${arrow}</span>` : "";
            
            let cls = "", style = "";
            
            // Animation highlighting
            if (step.current_i === i && step.current_j === j) {
                cls = step.phase === "init" ? "hl-init" : "hl";
            }
            // Path highlighting
            else if (pathSet.has(`${i},${j}`)) {
                cls = "path-highlight";
                style = color ? `style="background:${color}!important;color:white;font-weight:bold"` : "";
            }
            
            html += `<td class="${cls}" ${style}>${val}${arrowHtml}</td>`;
        }
        html += "</tr>";
    }
    
    html += "</table>";
    if (lcs) html += `<p class="path-result">Backtracking gives: <strong>"${lcs}"</strong></p>`;
    
    document.getElementById("table").innerHTML = html;
}