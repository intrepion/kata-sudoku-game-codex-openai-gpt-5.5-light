import "./style.css";
import { APP_NAME } from "./app";

const app = document.querySelector<HTMLDivElement>("#app");

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
