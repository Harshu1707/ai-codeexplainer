const explainBtn = document.getElementById("explainBtn");
const statusEl = document.getElementById("status");
const outputPanel = document.getElementById("outputPanel");
const titleEl = document.getElementById("title");
const summaryEl = document.getElementById("summary");
const stepsEl = document.getElementById("steps");
const takeawayEl = document.getElementById("takeaway");
const glossaryEl = document.getElementById("glossary");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function typeText(el, text, speed = 14) {
  return new Promise((resolve) => {
    el.textContent = "";
    let i = 0;
    const timer = setInterval(() => {
      el.textContent += text.charAt(i);
      i += 1;
      if (i >= text.length) {
        clearInterval(timer);
        resolve();
      }
    }, speed);
  });
}

function createStepCard(step, index) {
  const card = document.createElement("article");
  card.className = "step-card";
  card.style.animationDelay = `${index * 110}ms`;

  card.innerHTML = `
    <span class="step-tag">Step ${index + 1}</span>
    <h3>${step.heading || "Unnamed step"}</h3>
    <p><strong>What it does:</strong> ${step.whatItDoes || "-"}</p>
    <p><strong>Why it matters:</strong> ${step.whyItMatters || "-"}</p>
    <p><strong>Analogy:</strong> ${step.realWorldAnalogy || "-"}</p>
  `;

  return card;
}

async function renderExplanation(data) {
  outputPanel.classList.remove("hidden");
  stepsEl.innerHTML = "";
  glossaryEl.innerHTML = "";

  await typeText(titleEl, data.title || "Code explanation");
  await typeText(
    summaryEl,
    data.overallSummary || "Here is a beginner-friendly explanation.",
    8
  );

  const steps = Array.isArray(data.steps) ? data.steps : [];
  for (let i = 0; i < steps.length; i += 1) {
    stepsEl.appendChild(createStepCard(steps[i], i));
    await delay(220);
  }

  takeawayEl.textContent = data.finalTakeaway || "";

  const glossary = Array.isArray(data.glossary) ? data.glossary : [];
  glossary.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${item.term || "Term"}:</strong> ${item.meaning || ""}`;
    glossaryEl.appendChild(li);
  });
}

explainBtn.addEventListener("click", async () => {
  const language = document.getElementById("language").value.trim();
  const audience = document.getElementById("audience").value.trim();
  const code = document.getElementById("code").value;

  if (!code.trim()) {
    statusEl.textContent = "Please add code first.";
    return;
  }

  explainBtn.disabled = true;
  statusEl.textContent = "Thinking... generating beginner-friendly steps ✨";

  try {
    const response = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language, audience })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to explain code.");
    }

    statusEl.textContent = "Done! Scroll down for your animated explanation.";
    await renderExplanation(data);
  } catch (error) {
    statusEl.textContent = `Error: ${error.message}`;
  } finally {
    explainBtn.disabled = false;
  }
});
