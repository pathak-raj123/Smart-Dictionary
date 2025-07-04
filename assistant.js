// === Assistant Chat (Mock GPT) ===
const assistantInput = document.getElementById("assistantInput");
const assistantResponse = document.getElementById("assistantResponse");

async function askAssistant() {
  const question = assistantInput.value.trim();
  if (!question) return showToast("Type a question");

  assistantResponse.innerHTML = "Thinking...";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_OPENAI_API_KEY"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful dictionary assistant." },
          { role: "user", content: question }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No reply available.";
    assistantResponse.innerHTML = `<p>${reply}</p>`;
  } catch (err) {
    assistantResponse.innerHTML = "Error connecting to assistant.";
  }
}
