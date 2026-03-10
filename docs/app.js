 (() => {
      const NUM_TO_SHOW = 3;
      const PASS_MIN_CORRECT = 2;

      const startScreen = document.getElementById("startScreen");
      const quizScreen = document.getElementById("quizScreen");
      const resultScreen = document.getElementById("resultScreen");

      const nicknameInput = document.getElementById("nickname");
      const startBtn = document.getElementById("startBtn");

      const progressText = document.getElementById("progressText");
      const scoreSoFar = document.getElementById("scoreSoFar");
      const questionBlock = document.getElementById("questionBlock");
      const nextBtn = document.getElementById("nextBtn");

      const resultSummary = document.getElementById("resultSummary");
      const reviewBlock = document.getElementById("reviewBlock");
      const restartBtn = document.getElementById("restartBtn");

      if (!Array.isArray(window.QUESTION_BANK) || window.QUESTION_BANK.length === 0) {
        throw new Error("QUESTION_BANK is missing or empty.");
      }

      let selected = [];
      let submitted = false;

      function show(el) { el.classList.remove("hidden"); }
      function hide(el) { el.classList.add("hidden"); }

      function shuffleInPlace(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      }

      function pickRandom(bank, count) {
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

      function allAnswered() {
        return selected.every((q) => {
          return !!document.querySelector(`input[name="${CSS.escape(q.id)}"]:checked`);
        });
      }

      function onAnyAnswerChange() {
        if (!submitted) nextBtn.disabled = !allAnswered();
      }

      function renderQuiz() {
        submitted = false;
        nextBtn.textContent = "Finish";
        nextBtn.disabled = true;

        progressText.textContent = `Questions: ${selected.length}`;
        scoreSoFar.textContent = `Pass mark: at least ${PASS_MIN_CORRECT} correct`;

        questionBlock.innerHTML = selected
          .map((q, idx) => {
            const opts = q.options
              .map((opt, optIdx) => `
                <label style="display:block; margin:6px 0;">
                  <input type="radio" name="${escapeHtml(q.id)}" value="${optIdx}">
                  ${escapeHtml(opt)}
                </label>
              `)
              .join("");

            return `
              <div style="margin:16px 0; padding:12px; border:1px solid #ddd; border-radius:8px;">
                <div style="margin-bottom:8px;"><strong>${idx + 1}.</strong> ${escapeHtml(q.q)}</div>
                <div>${opts}</div>
              </div>
            `;
          })
          .join("");

        questionBlock.addEventListener("change", onAnyAnswerChange);
      }

      function grade() {
        let correct = 0;

        const details = selected.map((q) => {
          const checked = document.querySelector(`input[name="${CSS.escape(q.id)}"]:checked`);
          const userIdx = checked ? Number(checked.value) : null;
          const isCorrect = userIdx === q.answerIndex;
          if (isCorrect) correct += 1;

          return {
            q: q.q,
            userAnswer: userIdx === null ? "No answer" : q.options[userIdx],
            correctAnswer: q.options[q.answerIndex],
            isCorrect
          };
        });

        return { correct, total: selected.length, details };
      }

      function lockInputs(lock) {
        questionBlock.querySelectorAll('input[type="radio"]').forEach((i) => {
          i.disabled = lock;
        });
      }

      function showResults() {
        const name = (nicknameInput.value || "").trim();
        const { correct, total, details } = grade();
        const passed = correct >= PASS_MIN_CORRECT;

        resultSummary.innerHTML = `
          ${name ? `Name: <strong>${escapeHtml(name)}</strong><br>` : ""}
          Score: <strong>${correct}</strong> / <strong>${total}</strong><br>
          Result: <strong>${passed ? "PASS" : "FAIL"}</strong>
        `;

        reviewBlock.innerHTML = details
          .map((d, i) => `
            <div style="margin:12px 0; padding:10px; border:1px solid #eee; border-radius:8px;">
              <div><strong>${i + 1}.</strong> ${escapeHtml(d.q)}</div>
              <div>Your answer: <strong>${escapeHtml(d.userAnswer)}</strong></div>
              <div>Correct answer: <strong>${escapeHtml(d.correctAnswer)}</strong></div>
              <div>Status: <strong>${d.isCorrect ? "Correct" : "Incorrect"}</strong></div>
            </div>
          `)
          .join("");

        hide(startScreen);
        hide(quizScreen);
        show(resultScreen);
      }

      function startGame() {
        selected = pickRandom(window.QUESTION_BANK, NUM_TO_SHOW);

        hide(startScreen);
        hide(resultScreen);
        show(quizScreen);

        renderQuiz();
      }

      startBtn.addEventListener("click", startGame);

      nextBtn.addEventListener("click", () => {
        if (nextBtn.disabled) return;
        submitted = true;
        lockInputs(true);
        showResults();
      });

      restartBtn.addEventListener("click", () => {
        hide(quizScreen);
        hide(resultScreen);
        show(startScreen);

        questionBlock.innerHTML = "";
        resultSummary.textContent = "";
        reviewBlock.innerHTML = "";
        nextBtn.disabled = true;
      });
    })();
  </script>
</body>
</html>
