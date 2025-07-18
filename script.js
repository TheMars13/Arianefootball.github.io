const url = "https://script.google.com/macros/s/AKfycbwO7TqeC-Q2HikpXbfaKJs3TjXrWTriRi_R1Xf5gl8uK_IIY72hpNQ_UWHZO5H6FN4f/exec";

fetch(url)
    .then(res => res.json())
    .then(data => {
        renderMatches(data.matches);
        renderStandings(data.standings);
        renderScorers(data.scorers);
    });

// Matchs
function renderMatches(matches) {
    const roundContainers = {
        "1": document.getElementById("round1"),
        "2": document.getElementById("round2"),
        "3": document.getElementById("round3"),
        "4": document.getElementById("round4"),
        "5": document.getElementById("round5"),
        "6": document.getElementById("round6")
    };

    const teamMap = {
        "Blue": "blue",
        "Red": "red",
        "Green": "green",
        "Gold": "gold"
    };

    Object.values(roundContainers).forEach(container => container.innerHTML = "");

    matches.slice(1).forEach(row => {
        const [round, teamA_raw, scoreA_raw, scoreB_raw, teamB_raw, date] = row;

        const teamA = teamA_raw || "-";
        const teamB = teamB_raw || "-";
        const scoreA = parseInt(scoreA_raw);
        const scoreB = parseInt(scoreB_raw);

        // Determine the winner class
        let winnerClass = "match-neutral";
        if (!isNaN(scoreA) && !isNaN(scoreB)) {
            if (scoreA > scoreB) {
                winnerClass = `team-${teamMap[teamA] || "default"}`;
            } else if (scoreB > scoreA) {
                winnerClass = `team-${teamMap[teamB] || "default"}`;
            }
        }

        const match = document.createElement("div");
        match.className = `match ${winnerClass}`;
        match.innerHTML = `
            <strong>${teamA}</strong> ${isNaN(scoreA) ? "-" : scoreA} : ${isNaN(scoreB) ? "-" : scoreB} <strong>${teamB}</strong>
            <br><small>${date || ""}</small>
        `;

        if (roundContainers[round]) {
            roundContainers[round].appendChild(match);
        }
    });
};



// standing
function renderStandings(standings) {
    const headers = standings[0];
    const prevRankIndex = headers.indexOf("Prev Rank");
    const teamIndex = headers.indexOf("Team");

    const table = document.createElement("table");
    table.innerHTML = `
        <tr>
          <th></th>
          ${headers.map((h, i) => i !== prevRankIndex ? `<th>${h}</th>` : "").join("")}
        </tr>
      `;

      standings.slice(1).forEach(row => {
        const currentRank = Number(row[0]);
        const prevRank = Number(row[prevRankIndex]);
        let arrow = "-", arrowClass = "arrow-same";

        if (!isNaN(prevRank)) {
          if (currentRank < prevRank) arrow = "▲", arrowClass = "arrow-up";
          else if (currentRank > prevRank) arrow = "▼", arrowClass = "arrow-down";
        }

        const teamName = row[teamIndex].toLowerCase();
        const teamClass = `team-${teamName}`;

        const rowHtml = `
          <tr>
            <td class="${arrowClass}">${arrow}</td>
            ${row.map((cell, i) => {
              if (i === prevRankIndex) return "";
              if (i === teamIndex) return `<td class="${teamClass}">${cell}</td>`;
              return `<td>${cell}</td>`;
            }).join("")}
          </tr>
        `;

        table.innerHTML += rowHtml;
      });

      document.getElementById("standings").innerHTML = "";
      document.getElementById("standings").appendChild(table);
    }


             // Top Scorer
function renderScorers(scorers) {
  const headers = scorers[0]; // ["Player Name", "Team", "Goals", "Match"]
  const sorted = scorers.slice(1).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const table = document.createElement("table");
  table.innerHTML = `
    <tr>
      <th></th>
      <th>${headers[0]}</th> <!-- Player Name -->
      <th>${headers[2]}</th> <!-- Goals -->
      <th>${headers[3]}</th> <!-- Match -->
    </tr>
    ${sorted.map(row => {
      const player = row[0];
      const team = (row[1] || "").toLowerCase();
      const goals = row[2] ?? "-";
      const match = row[3] ?? "-";
      const teamClass = `team-${team}`;

      return `
        <tr>
          <td class="team-cell"><span class="team-block ${teamClass}"></span></td>
          <td>${player}</td>
          <td>${goals}</td>
          <td>${match}</td>
        </tr>
      `;
    }).join("")}
  `;

  const container = document.getElementById("scorers");
  container.innerHTML = "";
  container.appendChild(table);
}
