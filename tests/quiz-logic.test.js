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

test("resultLevel: highest contiguous fully-correct level", () => {
  const graded = { 1: { correct: 2, total: 2 }, 2: { correct: 2, total: 2 }, 3: { correct: 0, total: 2 } };
  assert.strictEqual(quiz.resultLevel(graded), 2);
});

test("resultLevel: all correct => 3", () => {
  const graded = { 1: { correct: 2, total: 2 }, 2: { correct: 2, total: 2 }, 3: { correct: 2, total: 2 } };
  assert.strictEqual(quiz.resultLevel(graded), 3);
});

test("resultLevel: fail level 1 => 0", () => {
  const graded = { 1: { correct: 1, total: 2 }, 2: { correct: 2, total: 2 }, 3: { correct: 2, total: 2 } };
  assert.strictEqual(quiz.resultLevel(graded), 0);
});

test("resultLevel: gap in the middle stops at last contiguous pass", () => {
  const graded = { 1: { correct: 2, total: 2 }, 2: { correct: 1, total: 2 }, 3: { correct: 2, total: 2 } };
  assert.strictEqual(quiz.resultLevel(graded), 1);
});

test("validateQuizData: clean data has no errors", () => {
  const data = {
    foo: [
      { level: 1, prompt: "p", options: ["a","b","c","d"], answer: 0 },
      { level: 2, prompt: "p", options: ["a","b","c","d"], answer: 3 },
      { level: 3, prompt: "p", options: ["a","b","c","d"], answer: 1 }
    ]
  };
  assert.deepStrictEqual(quiz.validateQuizData(data), []);
});

test("validateQuizData: flags wrong option count, bad answer, missing level", () => {
  const data = {
    bar: [
      { level: 1, prompt: "p", options: ["a","b","c"], answer: 0 },
      { level: 2, prompt: "p", options: ["a","b","c","d"], answer: 9 }
    ]
  };
  const errors = quiz.validateQuizData(data);
  assert.ok(errors.some(e => e.includes("4 options")));
  assert.ok(errors.some(e => e.includes("answer")));
  assert.ok(errors.some(e => e.includes("level 3")));
});

test("validateQuizData: flags options that are not an array", () => {
  const data = {
    baz: [
      { level: 1, prompt: "p", options: "abcd", answer: 0 },
      { level: 2, prompt: "p", options: ["a","b","c","d"], answer: 1 },
      { level: 3, prompt: "p", options: ["a","b","c","d"], answer: 2 }
    ]
  };
  const errors = quiz.validateQuizData(data);
  assert.ok(errors.some(e => e.includes("4 options")));
});

test("resultLevel: empty graded object => 0", () => {
  assert.strictEqual(quiz.resultLevel({}), 0);
});
