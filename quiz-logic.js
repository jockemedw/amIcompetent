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

  var api = {
    hasQuiz: hasQuiz,
    gradeQuiz: gradeQuiz
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.QuizLogic = api;
  }
})(typeof self !== "undefined" ? self : this);
