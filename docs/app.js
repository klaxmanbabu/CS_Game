/* Quiz script
   - Randomly shows 3 questions from window.QUESTION_BANK
   - Pass mark: at least 2 correct
   - Requires HTML elements:
       <div id="quiz"></div>
       <button id="submitBtn">Submit</button>
       <button id="retryBtn" style="display:none;">Try again</button>
       <div id="result"></div>
*/

(() => {
  const NUM_TO_SHOW = 3;
  const PASS_MIN_CORRECT = 2;

  const quizEl = document.getElementById("quiz");
  const submitBtn = document.getElementById("submitBtn");
  const retryBtn = document.getElementById("retryBtn");
  const resultEl = document.getElementById("result");

  if (!quizEl || !submitBtn || !retryBtn || !resultEl) {
    throw new Error(
      "Missing required elements: #quiz, #submitBtn, #retryBtn, #result"
    );
  }

  if (!Array.isArray(window.QUESTION_BANK) || window.QUESTION_BANK.length < 1) {
    throw new Error("window.QUESTION_BANK is missing or empty.");
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
    quizEl.innerHTML = questions
      .map((q, idx) => {
        const optionsHtml = q.options
          .map((opt, optIdx) => {
            const optSafe = escapeHtml(opt);
            return `
              <label class="quiz-option">
                <input type="radio" name="${escapeHtml(q.id)}" value="${optIdx}">
                ${optSafe}
              </label>
            `;
          })
          .join("");

        return `
          <div class="quiz-question" data-qid="${escapeHtml(q.id)}">
            <p><strong>${idx + 1}.</strong> ${escapeHtml(q.q)}</p>
            <div class="quiz-options">
              ${optionsHtml}
            </div>
          </div>
        `;
      })
      .join("");

    resultEl.textContent = "";
    retryBtn.style.display = "none";
    submitBtn.disabled = false;
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
    const details = questions.map((q) => {
      const userIdx = getUserAnswerIndex(q.id);
      const isCorrect = userIdx === q.answerIndex;
      if (isCorrect) correct += 1;
      return { id: q.id, isCorrect, userIdx };
    });
    return { correct, total: questions.length, details };
  }

  function lockInputs(lock) {
    const inputs = quizEl.querySelectorAll('input[type="radio"]');
    inputs.forEach((i) => (i.disabled = lock));
  }

  function showResult(correct, total) {
    const passed = correct >= PASS_MIN_CORRECT;

    resultEl.innerHTML = `
      <p>
        Score: <strong>${correct}</strong> / <strong>${total}</strong>
        (Pass mark: at least <strong>${PASS_MIN_CORRECT}</strong> correct)
      </p>
      <p>
        Result: <strong>${passed ? "PASS" : "FAIL"}</strong>
      </p>
    `;

    retryBtn.style.display = "inline-block";
  }

  function startNewQuiz() {
    selectedQuestions = pickRandomQuestions(window.QUESTION_BANK, NUM_TO_SHOW);
    renderQuestions(selectedQuestions);
    lockInputs(false);
  }

  submitBtn.addEventListener("click", () => {
    const { correct, total } = gradeQuiz(selectedQuestions);

    lockInputs(true);
    submitBtn.disabled = true;

    showResult(correct, total);
  });

  retryBtn.addEventListener("click", () => {
    startNewQuiz();
  });

  startNewQuiz();
})();
