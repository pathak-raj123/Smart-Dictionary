// === Flashcard Logic ===
let flashcardIndex = 0;

function nextFlashcard() {
  const all = JSON.parse(localStorage.getItem("historyWords") || "{}")[currentUser] || [];
  const notes = JSON.parse(localStorage.getItem("userNotes") || "{}")[currentUser] || {};

  if (!all.length) {
    document.getElementById("flashcard").innerHTML = "No words to review yet!";
    return;
  }

  const word = all[flashcardIndex % all.length];
  const note = notes[word] || "No notes available.";

  document.getElementById("flashcard").innerHTML = `
    <div style="padding: 20px; border: 1px solid #ccc; border-radius: 8px; background: #fdfdfd;">
      <h3>${word}</h3>
      <p><strong>Your Note:</strong> ${note}</p>
    </div>
  `;

  flashcardIndex++;
}
