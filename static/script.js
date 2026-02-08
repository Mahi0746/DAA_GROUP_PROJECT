let steps = [], pos = 0;
let allLcsData = [];
let finalDP = [];
let finalArrow = [];
let stringX = "";
let stringY = "";

function start() {
    const x = document.getElementById("x").value.trim().toUpperCase();
    const y = document.getElementById("y").value.trim().toUpperCase();
    
    if (!x || !y) {
        alert("Please enter both strings");
        return;
    }
    
    stringX = x;
    stringY = y;
    
    // Hide backtrack controls initially
    document.getElementById("backtrack-controls").classList.add("hidden");
    
    const resultBox = document.getElementById("result");
    resultBox.classList.add("show");
    resultBox.innerHTML = "Computing...";
    
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
    .catch(err => {
        console.error(err);
        alert("Error occurred");
    });
}

function animate(X, Y, all_lcs, length, total_lcs) {
    if (pos >= steps.length) {
        // Animation complete - show results
        displayResults(all_lcs, length, total_lcs);
        return;
    }
    
    draw(steps[pos], X, Y);
    pos++;
    
    const delay = steps[pos-1].phase === "init" ? 600 : 900;
    setTimeout(() => animate(X, Y, all_lcs, length, total_lcs), delay);
}

function displayResults(all_lcs, length, total_lcs) {
    const resultBox = document.getElementById("result");
    
    if (total_lcs === 1) {
        resultBox.innerHTML = `LCS = <strong>"${all_lcs[0].lcs}"</strong> | Length = <strong>${length}</strong>`;
    } else {
        const lcsStrings = all_lcs.map(item => `"${item.lcs}"`).join(', ');
        resultBox.innerHTML = `
            <strong>${total_lcs} different LCS found (Length = ${length})</strong><br>
            ${lcsStrings}
        `;
    }
    
    // Show backtracking controls
    setupBacktrackControls(all_lcs);
}
function setupBacktrackControls(all_lcs) {
    const controlsDiv = document.getElementById("backtrack-controls");
    const infoDiv = document.getElementById("lcs-info");
    
    controlsDiv.classList.remove("hidden");
    
    // Create info text
    let infoHTML = "<p><strong>Found LCS:</strong></p><ul>";
    all_lcs.forEach((item, index) => {
        infoHTML += `<li><strong>Path ${index + 1}:</strong> "${item.lcs}" (${item.count} way${item.count > 1 ? 's' : ''})</li>`;
    });
    infoHTML += "</ul>";
    infoDiv.innerHTML = infoHTML;
    
    // DYNAMICALLY CREATE BUTTONS for all paths
    const buttonGroup = document.querySelector(".button-group");
    buttonGroup.innerHTML = ""; // Clear existing buttons
    
    // Create a button for each LCS path
    all_lcs.forEach((item, index) => {
        const btn = document.createElement("button");
        btn.className = "btn-path";
        btn.textContent = `Show Path ${index + 1}`;
        btn.onclick = () => showPath(index);
        buttonGroup.appendChild(btn);
    });
    
    // Add reset button at the end
    const resetBtn = document.createElement("button");
    resetBtn.className = "btn-reset";
    resetBtn.textContent = "Reset Table";
    resetBtn.onclick = resetTable;
    buttonGroup.appendChild(resetBtn);
}

function showPath(pathIndex) {
    if (pathIndex >= allLcsData.length) return;
    
    const pathData = allLcsData[pathIndex];
    const path = pathData.paths[0];  // Show first path for this LCS
    
    // Define colors for different paths
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f7b731"];
    const pathColor = colors[pathIndex % colors.length];
    
    drawTableWithPath(stringX, stringY, finalDP, finalArrow, path, pathColor, pathData.lcs);
}

function resetTable() {
    drawTableWithPath(stringX, stringY, finalDP, finalArrow, [], null, "");
}

function draw(step, X, Y) {
    const dp = step.dp;
    const ar = step.arrow;
    const curr_i = step.current_i;
    const curr_j = step.current_j;
    const phase = step.phase;

    let html = "<table>";

    // Header
    html += "<tr><th>i/j</th><th>0</th>";
    for (let c of X) {
        html += `<th>${c}</th>`;
    }
    html += "</tr>";

    // Rows
    for (let i = 0; i < dp.length; i++) {
        html += "<tr>";
        html += `<th>${i == 0 ? "0" : Y[i - 1]}</th>`;

        for (let j = 0; j < dp[0].length; j++) {
            let arrow = "";
            if (ar[i][j] == "diag") arrow = "↖";
            if (ar[i][j] == "up") arrow = "↑";
            if (ar[i][j] == "left") arrow = "←";
            if (ar[i][j] == "both") arrow = "←↑";  // FIXED: LEFT and UP

            const highlight = (i == curr_i && j == curr_j) 
                ? (phase === "init" ? "hl-init" : "hl") 
                : "";
            
            const value = dp[i][j] !== null ? dp[i][j] : "";
            const arrowHtml = arrow ? `<span class="arrow">${arrow}</span>` : "";
            
            html += `<td class="${highlight}">${value}${arrowHtml}</td>`;
        }
        html += "</tr>";
    }

    html += "</table>";
    document.getElementById("table").innerHTML = html;
}

function drawTableWithPath(X, Y, dp, ar, path, color, lcs) {
    let html = "<table>";

    // Create path set for quick lookup
    const pathSet = new Set(path.map(([i, j]) => `${i},${j}`));

    // Header
    html += "<tr><th>i/j</th><th>0</th>";
    for (let c of X) {
        html += `<th>${c}</th>`;
    }
    html += "</tr>";

    // Rows
    for (let i = 0; i < dp.length; i++) {
        html += "<tr>";
        html += `<th>${i == 0 ? "0" : Y[i - 1]}</th>`;

        for (let j = 0; j < dp[0].length; j++) {
            let arrow = "";
            if (ar[i][j] == "diag") arrow = "↖";
            if (ar[i][j] == "up") arrow = "↑";
            if (ar[i][j] == "left") arrow = "←";
            if (ar[i][j] == "both") arrow = "←↑";  // FIXED: LEFT and UP

            // Check if this cell is in the path
            const inPath = pathSet.has(`${i},${j}`);
            const pathClass = inPath ? "path-highlight" : "";
            const pathStyle = inPath && color ? `style="background: ${color} !important; color: white; font-weight: bold;"` : "";
            
            const value = dp[i][j] !== null ? dp[i][j] : "";
            const arrowHtml = arrow ? `<span class="arrow">${arrow}</span>` : "";
            
            html += `<td class="${pathClass}" ${pathStyle}>${value}${arrowHtml}</td>`;
        }
        html += "</tr>";
    }

    html += "</table>";
    
    if (lcs) {
        html += `<p class="path-result">Backtracking gives: <strong>"${lcs}"</strong></p>`;
    }
    
    document.getElementById("table").innerHTML = html;
}