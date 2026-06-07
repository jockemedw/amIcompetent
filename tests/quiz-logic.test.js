const test = require("node:test");
const assert = require("node:assert");
const quiz = require("../quiz-logic.js");

const sampleData = {
  alpha: [
    { level: 1, prompt: "q", options: ["a", "b", "c", "d"], answer: 0 }
  ]
};

test("hasQuiz: true when leaf has at least one question", () => {
  assert.strictEqual(quiz.hasQuiz(sampleData, "alpha"), true);
});

test("hasQuiz: false for unknown leaf", () => {
  assert.strictEqual(quiz.hasQuiz(sampleData, "nope"), false);
});

test("hasQuiz: false when leaf maps to empty array", () => {
  assert.strictEqual(quiz.hasQuiz({ beta: [] }, "beta"), false);
});

const gradeQuestions = [
  { level: 1, answer: 0 }, { level: 1, answer: 2 },
  { level: 2, answer: 1 }, { level: 2, answer: 3 },
  { level: 3, answer: 0 }, { level: 3, answer: 1 }
];

test("gradeQuiz: tallies correct/total per level", () => {
  const g = quiz.gradeQuiz(gradeQuestions, [0, 2, 1, 3, 0, 1]);
  assert.deepStrictEqual(g[1], { correct: 2, total: 2 });
  assert.deepStrictEqual(g[2], { correct: 2, total: 2 });
  assert.deepStrictEqual(g[3], { correct: 2, total: 2 });
});

test("gradeQuiz: counts wrong answers", () => {
  const g = quiz.gradeQuiz(gradeQuestions, [0, 2, 1, 0, 9, 1]);
  assert.deepStrictEqual(g[1], { correct: 2, total: 2 });
  assert.deepStrictEqual(g[2], { correct: 1, total: 2 });
  assert.deepStrictEqual(g[3], { correct: 1, total: 2 });
});

test("gradeQuiz: missing answer counts as wrong", () => {
  const g = quiz.gradeQuiz(gradeQuestions, [0, 2, 1, 3, 0]);
  assert.deepStrictEqual(g[3], { correct: 1, total: 2 });
});
