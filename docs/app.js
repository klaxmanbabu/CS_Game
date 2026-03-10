(() => {
  const NUM_TO_SHOW = 3;
  const PASS_MIN_CORRECT = 2;

  const quizEl = document.getElementById("quiz");
  const submitBtn = document.getElementById("submitBtn");
  const retryBtn = document.getElementById("retryBtn");
  const resultEl = document.getElementById("result");

  if (!quizEl) throw new Error("Missing #quiz element");
  if (!submitBtn) throw new Error("Missing #submitBtn element");
  if (!retryBtn) throw new Error("Missing #retryBtn element");
  if (!resultEl) throw new Error("Missing #result element");
  if (!Array.isArray(window.QUESTION_BANK) || window.QUESTION_BANK.length === 0) {
    throw new Error("window.QUESTION_BANK is missing or empty");
  }

  let selectedQuestions = [];

  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function pickRandomQuestions(bank, count) {
    const copy = [...bank];
    shuffleInPlace(copy);
    return copy.slice(0, Math.min(count, copy.length));
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderQuestions(questions) {
    // Important: build once, set once (do not overwrite per question in a loop)
    const html = questions
      .map((q, idx) => {
        const opts = q.options
          .map((opt, optIdx) => {
            return `
              <label class="quiz-option" style="display:block; margin:6px 0;">
                <input type="radio" name="${escapeHtml(q.id)}" value="${optIdx}">
                ${escapeHtml(opt)}
              </label>
            `;
          })
          .join("");

        return `
          <div class="quiz-question" style="margin:16px 0; padding:12px; border:1px solid #ddd; border-radius:8px;">
            <div style="margin-bottom:8px;"><strong>${idx + 1}.</strong> ${escapeHtml(q.q)}</div>
            <div class="quiz-options">${opts}</div>
          </div>
        `;
      })
      .join("");

    quizEl.innerHTML = html;

    resultEl.textContent = "";
    retryBtn.style.display = "none";
    submitBtn.disabled = false;

    // re-enable inputs
    quizEl.querySelectorAll('input[type="radio"]').forEach((i) => (i.disabled = false));
  }

  function getUserAnswerIndex(questionId) {
    const checked = document.querySelector(
      `input[name="${CSS.escape(questionId)}"]:checked`
    );
    if (!checked) return null;
    const n = Number(checked.value);
    return Number.isFinite(n) ? n : null;
  }

  function gradeQuiz(questions) {
    let correct = 0;

    for (const q of questions) {
      const userIdx = getUserAnswerIndex(q.id);
      if (userIdx === q.answerIndex) correct += 1;
    }

    return { correct, total: questions.length };
  }

  function lockInputs(lock) {
    quizEl.querySelectorAll('input[type="radio"]').forEach((i) => (i.disabled = lock));
  }

  function startNewQuiz() {
    selectedQuestions = pickRandomQuestions(window.QUESTION_BANK, NUM_TO_SHOW);
    renderQuestions(selectedQuestions);
  }

  submitBtn.addEventListener("click", () => {
    const { correct, total } = gradeQuiz(selectedQuestions);
    const passed = correct >= PASS_MIN_CORRECT;

    lockInputs(true);
    submitBtn.disabled = true;

    resultEl.innerHTML = `
      <p>Score: <strong>${correct}</strong> / <strong>${total}</strong></p>
      <p>Result: <strong>${passed ? "PASS" : "FAIL"}</strong> (pass mark: ${PASS_MIN_CORRECT})</p>
    `;

    retryBtn.style.display = "inline-block";
  });

  retryBtn.addEventListener("click", startNewQuiz);

  startNewQuiz();
})();
