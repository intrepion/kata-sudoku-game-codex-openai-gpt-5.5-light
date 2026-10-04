"use strict";
(() => {
  // src/app.ts
  var APP_NAME = "Ninefold Daily";

  // src/main.ts
  var app = document.querySelector("#app");
  if (!app) {
    throw new Error("Missing #app mount point");
  }
  app.innerHTML = `
  <section class="shell" aria-labelledby="app-title">
    <p class="eyebrow">${APP_NAME}</p>
    <h1 id="app-title">Sudoku, ready for the first grid.</h1>
    <p class="intro">
      The delivery rails are alive. The next slice adds the Sudoku engine.
    </p>
  </section>
`;
})();
