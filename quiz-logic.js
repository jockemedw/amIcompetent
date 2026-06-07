// Pure logic for the quiz/körkort. No DOM access.
// Works as a browser global (window.QuizLogic) and as a Node module.
(function (root) {
  function hasQuiz(quizData, leafId) {
    var qs = quizData && quizData[leafId];
    return !!(qs && qs.length);
  }

  // answers[i] = the option index the user picked for questions[i].
  // Returns { <level>: { correct, total } } for every level present.
  function gradeQuiz(questions, answers) {
    var out = {};
    questions.forEach(function (q, i) {
      if (!out[q.level]) out[q.level] = { correct: 0, total: 0 };
      out[q.level].total += 1;
      if (answers[i] === q.answer) out[q.level].correct += 1;
    });
    return out;
  }

  // The level the quiz places you at: the highest L such that every level
  // 1..L was answered fully correctly. A gap caps you below it (a later
  // level passing after an earlier one failed reads as guessing).
  function resultLevel(graded) {
    var level = 0;
    for (var L = 1; L <= 3; L++) {
      var g = graded[L];
      if (g && g.total > 0 && g.correct === g.total) level = L;
      else break;
    }
    return level;
  }

  // Structural checks reused by the data test. Returns an array of strings.
  function validateQuizData(quizData) {
    var errors = [];
    Object.keys(quizData).forEach(function (leafId) {
      var qs = quizData[leafId];
      var levelsSeen = {};
      qs.forEach(function (q, i) {
        var where = leafId + "[" + i + "]";
        if (!q.options || q.options.length !== 4) {
          errors.push(where + ": must have exactly 4 options");
        }
        if (typeof q.answer !== "number" || q.answer < 0 || q.answer > 3) {
          errors.push(where + ": answer must be an index 0-3");
        }
        if (q.level !== 1 && q.level !== 2 && q.level !== 3) {
          errors.push(where + ": level must be 1, 2 or 3");
        } else {
          levelsSeen[q.level] = true;
        }
      });
      [1, 2, 3].forEach(function (L) {
        if (!levelsSeen[L]) errors.push(leafId + ": missing a question for level " + L);
      });
    });
    return errors;
  }

  var api = {
    hasQuiz: hasQuiz,
    gradeQuiz: gradeQuiz,
    resultLevel: resultLevel,
    validateQuizData: validateQuizData
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.QuizLogic = api;
  }
})(typeof self !== "undefined" ? self : this);
