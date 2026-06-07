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

  var api = {
    hasQuiz: hasQuiz,
    gradeQuiz: gradeQuiz,
    resultLevel: resultLevel
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.QuizLogic = api;
  }
})(typeof self !== "undefined" ? self : this);
