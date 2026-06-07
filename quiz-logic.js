// Pure logic for the quiz/körkort. No DOM access.
// Works as a browser global (window.QuizLogic) and as a Node module.
(function (root) {
  function hasQuiz(quizData, leafId) {
    var qs = quizData && quizData[leafId];
    return !!(qs && qs.length);
  }

  var api = {
    hasQuiz: hasQuiz
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.QuizLogic = api;
  }
})(typeof self !== "undefined" ? self : this);
