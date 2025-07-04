// === Globals ===
let historyWords = {};
let currentUser = "guest";
let currentWord = "";

// === Dictionary Search ===
function searchWord(word = null) {
  const input = document.getElementById('wordInput');
  const query = word || input.value.trim();
  const resultBox = document.getElementById('result');
  const loading = document.getElementById('loading');

  if (!query) return showToast("Please enter a word");

  currentWord = query;
  loading.style.display = 'block';
  resultBox.innerHTML = '';
  input.value = query;

  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${query}`)
    .then(res => res.json())
    .then(data => {
      loading.style.display = 'none';
      if (data.title === "No Definitions Found") {
        resultBox.innerHTML = `<p>No definitions found for "${query}".</p>`;
        return;
      }

      const entry = data[0];
      const phonetics = entry.phonetics.find(p => p.text) || {};
      const meanings = entry.meanings;

      let html = `
        <h2>${entry.word}</h2>
        ${phonetics.text ? `<p><strong>Phonetics:</strong> ${phonetics.text}</p>` : ''}
        ${phonetics.audio ? `<audio controls src="${phonetics.audio}"></audio>` : ''}
        <button onclick="speak('${entry.word}')">🔈 Pronounce</button>
      `;

      meanings.forEach(meaning => {
        html += `<p><strong>Part of Speech:</strong> ${meaning.partOfSpeech}</p>`;
        meaning.definitions.slice(0, 2).forEach((def, i) => {
          html += `<p>Definition ${i + 1}: ${def.definition}</p>`;
          if (def.example) html += `<p><em>Example:</em> ${def.example}</p>`;
          if (def.synonyms?.length)
            html += `<p><strong>Synonyms:</strong> ${def.synonyms.map(s => `<span class='tag' onclick='searchWord("${s}")'>${s}</span>`).join(', ')}</p>`;
          if (def.antonyms?.length)
            html += `<p><strong>Antonyms:</strong> ${def.antonyms.map(a => `<span class='tag' onclick='searchWord("${a}")'>${a}</span>`).join(', ')}</p>`;
        });
        html += '<hr>';
      });

      resultBox.innerHTML = html;
      saveToHistory(entry.word);
      loadNote();
    })
    .catch(() => {
      loading.style.display = 'none';
      resultBox.innerHTML = `<p>Error fetching definition.</p>`;
    });
}

// === Voice Input ===
function startVoiceInput() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = event => {
    const voiceText = event.results[0][0].transcript;
    document.getElementById("wordInput").value = voiceText;
    searchWord();
  };
  recognition.onerror = () => showToast("Voice recognition failed");
}

// === Login ===
function toggleLoginBox() {
  const box = document.getElementById("loginBox");
  box.style.display = box.style.display === "block" ? "none" : "block";
}

function loginUser() {
  const username = document.getElementById("usernameInput").value.trim();
  if (!username) return showToast("Enter a username");
  currentUser = username;
  document.getElementById("loginBox").style.display = "none";
  showToast("Logged in as " + username);
  renderHistory();
  loadNote();
}

// === History ===
function saveToHistory(word) {
  if (!historyWords[currentUser]) historyWords[currentUser] = [];
  if (!historyWords[currentUser].includes(word)) {
    historyWords[currentUser].unshift(word);
    historyWords[currentUser] = historyWords[currentUser].slice(0, 5);
    localStorage.setItem('historyWords', JSON.stringify(historyWords));
    renderHistory();
  }
}

function renderHistory() {
  const list = document.getElementById('historyList');
  list.innerHTML = '';
  const userHistory = historyWords[currentUser] || [];
  userHistory.forEach(word => {
    const li = document.createElement('li');
    li.textContent = word;
    li.onclick = () => searchWord(word);
    list.appendChild(li);
  });
}

// === Note Handling ===
function saveNote() {
  const note = document.getElementById("wordNote").value;
  const allNotes = JSON.parse(localStorage.getItem("userNotes") || "{}");
  if (!allNotes[currentUser]) allNotes[currentUser] = {};
  allNotes[currentUser][currentWord] = note;
  localStorage.setItem("userNotes", JSON.stringify(allNotes));
  showToast("Note saved!");
}

function loadNote() {
  const notes = JSON.parse(localStorage.getItem("userNotes") || "{}");
  const note = notes?.[currentUser]?.[currentWord] || "";
  document.getElementById("wordNote").value = note;
}

// === Utils ===
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => toast.style.display = 'none', 2000);
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
}

function handleKeyPress(e) {
  if (e.key === 'Enter') searchWord();
}

function clearSearch() {
  document.getElementById('wordInput').value = '';
  document.getElementById('result').innerHTML = '';
  document.getElementById('wordNote').value = '';
}

function toggleAssistant() {
  document.getElementById("assistantBox").classList.toggle("hidden");
}

function openFlashcards() {
  document.getElementById("flashcardBox").classList.remove("hidden");
  nextFlashcard();
}

function closeFlashcards() {
  document.getElementById("flashcardBox").classList.add("hidden");
}

// === Theme Init ===
window.onload = () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.className = savedTheme;
  document.getElementById("themeSwitcher").value = savedTheme;
  historyWords = JSON.parse(localStorage.getItem('historyWords') || '{}');
  renderHistory();
};

document.getElementById("themeSwitcher").addEventListener("change", e => {
  document.body.className = e.target.value;
  localStorage.setItem("theme", e.target.value);
});
