// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add("is-visible"), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach((el) => revealObserver.observe(el));

// ---------- Lab practice chat demo ----------
// Content grounded in ASWB-guidebook practice theories: crisis intervention,
// Beck's cognitive triad, biopsychosocial assessment, and stress/coping
// (person-in-environment) theory.
const RESPONSES = {
  die: {
    patient: "I want to die.",
    theory: "Crisis Intervention Theory · Suicide Risk Assessment",
    coach: "I hear how much pain you're in, and I'm really glad you told me. " +
      "I need to ask directly: are you thinking about ending your life right now, " +
      "and do you have a plan? You're not in trouble for saying this — I want to " +
      "understand how unsafe things feel so we can keep you safe together. " +
      "I also want you to know the 988 Suicide & Crisis Lifeline is available any time.",
  },
  hopeless: {
    patient: "I feel hopeless.",
    theory: "Cognitive Behavioral Theory · Beck's Cognitive Triad",
    coach: "That sounds heavy to carry. Hopelessness often comes from believing things " +
      "will always be this way — but feelings aren't always facts. Can you tell me about " +
      "one moment recently, even small, that felt a little different? Let's look at that " +
      "together instead of the whole picture at once.",
  },
  concentrate: {
    patient: "I can't concentrate on anything.",
    theory: "Biopsychosocial Assessment Model",
    coach: "Losing focus like that is exhausting, and it's worth understanding the whole " +
      "picture — how's your sleep and appetite been lately, and is there a particular " +
      "stressor on your mind? Concentration often slips first when the body and mind are " +
      "under strain, so let's map out what's changed recently.",
  },
  pressure: {
    patient: "I feel a lot of pressure.",
    theory: "Stress & Coping Theory (Lazarus & Folkman) · Person-in-Environment",
    coach: "It makes sense that this feels like a lot — pressure usually comes from real " +
      "demands meeting limited resources, not from you doing something wrong. What's " +
      "weighing on you most right now, and what has helped you get through pressure like " +
      "this before?",
  },
};

const chatLog = document.getElementById("chat-log");
const promptButtons = document.querySelectorAll(".prompt-btn[data-key]");
const patientAvatar = document.querySelector(".avatar-patient");
const coachAvatar = document.getElementById("coach-avatar");
const bookBadge = document.getElementById("book-badge");
const resetBtn = document.getElementById("reset-btn");

let busy = false;

function clearPlaceholder() {
  const placeholder = chatLog.querySelector(".chat-placeholder");
  if (placeholder) placeholder.remove();
}

function addBubble(text, cls, { theory } = {}) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${cls}`;
  if (theory) {
    const tag = document.createElement("span");
    tag.className = "theory-tag";
    tag.textContent = theory;
    bubble.appendChild(tag);
    bubble.appendChild(document.createElement("br"));
  }
  bubble.appendChild(document.createTextNode(text));
  chatLog.appendChild(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
  return bubble;
}

function setButtonsDisabled(disabled) {
  promptButtons.forEach((btn) => (btn.disabled = disabled));
}

async function runPrompt(key) {
  if (busy) return;
  busy = true;
  setButtonsDisabled(true);
  clearPlaceholder();

  const data = RESPONSES[key];

  // Patient speaks
  patientAvatar.classList.add("talking");
  addBubble(data.patient, "patient");
  setTimeout(() => patientAvatar.classList.remove("talking"), 600);

  // Coach "looks up" the ASWB Guidebook
  await wait(500);
  bookBadge.classList.add("active");
  const searchingBubble = addBubble("Searching ASWB Guidebook…", "searching");
  const dots = document.createElement("span");
  dots.className = "dot-flash";
  dots.innerHTML = "<span></span><span></span><span></span>";
  searchingBubble.appendChild(dots);

  await wait(1400);
  searchingBubble.remove();
  bookBadge.classList.remove("active");

  // Coach replies
  coachAvatar.classList.add("talking");
  addBubble(data.coach, "coach", { theory: data.theory });
  setTimeout(() => coachAvatar.classList.remove("talking"), 600);

  busy = false;
  setButtonsDisabled(false);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

promptButtons.forEach((btn) => {
  btn.addEventListener("click", () => runPrompt(btn.dataset.key));
});

resetBtn.addEventListener("click", () => {
  if (busy) return;
  chatLog.innerHTML = '<p class="chat-placeholder">Pick a prompt below to start the session ↓</p>';
});
