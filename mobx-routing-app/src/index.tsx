import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./App";
import "./index.css";
import registerServiceWorker from "./registerServiceWorker";
import * as Router from "react-router-dom";

ReactDOM.render(
  <Router.HashRouter>
    <App />
  </Router.HashRouter>,
  document.getElementById("root") as HTMLElement
);
registerServiceWorker();
