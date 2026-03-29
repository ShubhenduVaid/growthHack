import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { prepareQaMode } from "./lib/qa";
import { clearAnswers, saveAnswers, writeRawAnswers } from "./lib/storage";
import "./styles.css";

prepareQaMode(window.location.search, {
  clear: clearAnswers,
  save: saveAnswers,
  writeRaw: writeRawAnswers
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
