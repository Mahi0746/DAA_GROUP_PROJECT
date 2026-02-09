let isComputing = false;
let currentData = null;

async function compute() {
  if (isComputing) return;
  
  const s1 = document.getElementById("s1").value.trim().toUpperCase();
  const s2 = document.getElementById("s2").value.trim().toUpperCase();
  
  if (!s1 && !s2) return alert("Please enter both strings.");
  if (!s1) return alert("Please enter first string.");
  if (!s2) return alert("Please enter second string.");
  
  isComputing = true;
  
  const computeButton = document.getElementById("compute-btn");
  computeButton.disabled = true;
  computeButton.textContent = "Computing...";
  
  document.getElementById("result").classList.remove("d-none");
  document.getElementById("result").textContent = "Computing...";
  document.getElementById("table-container").classList.remove("d-none");
  document.getElementById("legend").classList.remove("d-none");
  document.getElementById("backtrack").classList.add("d-none");
  
  createEmptyTable(s1, s2);
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const response = await fetch("/solve", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({seq1: s1, seq2: s2}),
    });
    
    if (!response.ok) throw new Error("Failed to compute");
    
    const data = await response.json();
    currentData = data;
    
    await fillTableAnimated(data.final_dp, data.final_arrows);
    
    displayResults(data.lcs_length, data.lcs_strings);
    
    if (data.lcs_length > 0 && data.backtrack_paths) {
      displayBacktrackControls(data);
    }
    
    document.getElementById("restart-btn").classList.remove("d-none");
    
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("result").textContent = "Error occurred!";
  } finally {
    isComputing = false;
    computeButton.disabled = false;
    computeButton.textContent = "Compute";
  }
}

function createEmptyTable(s1, s2) {
  let html = '<table class="table table-bordered text-center">';
  html += "<tr>";
  html += "<th>i/j</th><th>0</th>";
  for (let c of s1) {
    html += `<th>${c}</th>`;
  }
  html += "</tr>";
  
  for (let i = 0; i <= s2.length; i++) {
    html += "<tr>";
    html += `<th>${i === 0 ? "0" : s2[i - 1]}</th>`;
    for (let j = 0; j <= s1.length; j++) {
      html += `<td id="cell-${i}-${j}">-</td>`;
    }
    html += "</tr>";
  }
  html += "</table>";
  
  document.getElementById("table").innerHTML = html;
}

async function fillTableAnimated(dp, arrows) {
  const delay = 100;
  
  for (let i = 0; i < dp.length; i++) {
    for (let j = 0; j < dp[0].length; j++) {
      const cell = document.getElementById(`cell-${i}-${j}`);
      
      cell.classList.add('filling');
      
      cell.innerHTML = `${dp[i][j]}${arrows[i][j] ? `<span class="arrow">${arrows[i][j]}</span>` : ""}`;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      cell.classList.remove('filling');
    }
  }
}

function displayResults(lcsLength, lcsStrings) {
  const resultDiv = document.getElementById("result");
  
  let resultHTML = `<strong>Maximum LCS Length:</strong> ${lcsLength} &nbsp;&nbsp;|&nbsp;&nbsp; `;
  
  const validStrings = lcsStrings.filter(s => s && s.length > 0);
  
  if (validStrings.length > 0) {
    resultHTML += `<strong>LCS String${validStrings.length > 1 ? 's' : ''}:</strong> `;
    resultHTML += validStrings.map(s => `<span>${s}</span>`).join(', ');
  } else {
    resultHTML += `<strong>LCS:</strong> <em>No common subsequence</em>`;
  }
  
  resultDiv.innerHTML = resultHTML;
}

function displayBacktrackControls(data) {
  const backtrackDiv = document.getElementById("backtrack");
  const lcsInfoDiv = document.getElementById("lcs-info");
  const buttonsDiv = document.getElementById("buttons");
  
  backtrackDiv.classList.remove("d-none");
  
  const firstLCS = data.lcs_strings[0];
  lcsInfoDiv.innerHTML = `
    <div class="small text-muted">
      <strong>Found LCS:</strong>
      ${formatPathInfo(data.backtrack_paths)}
    </div>
  `;
  
  let buttonsHTML = "";
  
  const uniquePaths = getUniquePaths(data.backtrack_paths);
  
  uniquePaths.forEach((pathData, idx) => {
    buttonsHTML += `<button class="btn btn-success btn-sm" onclick="showPath(${idx})">Show Path ${idx + 1}</button>`;
  });
  
  buttonsHTML += `<button class="btn btn-secondary btn-sm" onclick="resetTable()">Reset Table</button>`;
  
  buttonsDiv.innerHTML = buttonsHTML;
}

function formatPathInfo(paths) {
  const stringCounts = {};
  
  paths.forEach(p => {
    const str = p.string;
    stringCounts[str] = (stringCounts[str] || 0) + 1;
  });
  
  const pathInfos = Object.entries(stringCounts).map(([str, count]) => {
    return `"${str}" (${count} way${count > 1 ? 's' : ''})`;
  });
  
  return pathInfos.join(', ');
}

function getUniquePaths(paths) {
  const uniquePaths = [];
  const seenPaths = new Set();
  
  paths.forEach(pathData => {
    const pathKey = JSON.stringify(pathData.path);
    if (!seenPaths.has(pathKey)) {
      seenPaths.add(pathKey);
      uniquePaths.push(pathData);
    }
  });
  
  return uniquePaths;
}

async function showPath(pathIndex) {
  if (!currentData || !currentData.backtrack_paths) return;
  
  resetTable();
  
  const uniquePaths = getUniquePaths(currentData.backtrack_paths);
  const pathData = uniquePaths[pathIndex];
  
  if (!pathData || !pathData.path) return;
  
  for (let i = 0; i < pathData.path.length; i++) {
    const [row, col] = pathData.path[i];
    const cell = document.getElementById(`cell-${row}-${col}`);
    
    if (cell) {
      cell.classList.add('backtrack-path');
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
}

function resetTable() {
  if (!currentData) return;
  
  const dp = currentData.final_dp;
  
  for (let i = 0; i < dp.length; i++) {
    for (let j = 0; j < dp[0].length; j++) {
      const cell = document.getElementById(`cell-${i}-${j}`);
      if (cell) {
        cell.classList.remove('backtrack-path');
      }
    }
  }
}

function restart() {
  document.getElementById("s1").value = "";
  document.getElementById("s2").value = "";
  
  document.getElementById("result").classList.add("d-none");
  document.getElementById("table-container").classList.add("d-none");
  document.getElementById("backtrack").classList.add("d-none");
  document.getElementById("legend").classList.add("d-none");
  
  document.getElementById("restart-btn").classList.add("d-none");
  
  currentData = null;
  isComputing = false;
  
  const computeButton = document.getElementById("compute-btn");
  computeButton.disabled = false;
  computeButton.textContent = "Compute";
  
  document.getElementById("s1").focus();
}
