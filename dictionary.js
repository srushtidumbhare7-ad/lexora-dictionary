async function searchWord() {
  const word = document.getElementById("WordInput").value.trim();
  const resultBox = document.getElementById("result");
  const spinner = document.getElementById("spinner");

  if (!word) {
    resultBox.innerHTML = `<p>Please enter a word.</p>`;
    resultBox.classList.remove("hidden");
    spinner.classList.add("hidden");
    return;
  }

  try {
    spinner.classList.remove("hidden");
    resultBox.classList.add("hidden");

    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await response.json();

    spinner.classList.add("hidden");
    resultBox.classList.remove("hidden");

    if (data.title === "No Definitions Found") {
      resultBox.innerHTML = `<p>No definitions found for "<strong>${word}</strong>".</p>`;
    } else {
      const meanings = data[0].meanings.map(meaning => {
        const def = meaning.definitions[0];
        return `
          <div class="meaning">
            <strong>Part of Speech:</strong> ${meaning.partOfSpeech}<br>
            <strong>Definition:</strong> ${def.definition}<br>
            ${def.example ? `<strong>Example:</strong> "${def.example}"<br>` : ""}
            ${def.synonyms?.length
              ? `<div><strong>Synonyms:</strong> ${def.synonyms.slice(0, 8).map(s => `<span class='syn' onclick="reSearch('${s}')">${s}</span>`).join(' ')}</div>`
              : ""}
          </div>
        `;
      }).join("<hr>");

      const audioURL = data[0].phonetics?.find(p => p.audio)?.audio;

      resultBox.innerHTML = `
        <h2>Meaning of "<strong>${word}</strong>":</h2>
        ${audioURL ? `<button onclick="new Audio('${audioURL}').play()">🔊 Play Audio</button><br><br>` : ""}
        ${meanings}
      `;

      let history = JSON.parse(localStorage.getItem("history")) || [];
      history.unshift(word);
      history = [...new Set(history)].slice(0, 10);
      localStorage.setItem("history", JSON.stringify(history));
      displayHistory();

      resultBox.scrollIntoView({ behavior: "smooth" });
    }
  } catch (error) {
    spinner.classList.add("hidden");
    resultBox.classList.remove("hidden");
    resultBox.innerHTML = `<p>Error fetching data. Please try again later.</p>`;
    console.error(error);
  }
}

document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
};

document.getElementById("WordInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchWord();
  }
});

function displayHistory() {
  const history = JSON.parse(localStorage.getItem("history")) || [];
  const historyBox = document.getElementById("historyBox");
  const clearBtn = document.getElementById("clearHistoryBtn");

  historyBox.innerHTML = history
    .map(h => `<span class="history-item" onclick="reSearch('${h}')">${h}</span>`)
    .join(" ");

  // show button only when history exists
  clearBtn.classList.toggle("hidden", history.length === 0);
}

// clear history btn click
document.getElementById("clearHistoryBtn").onclick = () => {
  localStorage.removeItem("history");
  displayHistory();
};

function reSearch(w) {
  document.getElementById("WordInput").value = w;
  searchWord();
}

displayHistory();
