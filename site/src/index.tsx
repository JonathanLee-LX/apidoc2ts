import React from "react";
import {hydrate, render} from "react-dom";
import App from "./App";
import "./index.scss";

const rootElement = document.getElementById("root");
if (rootElement && rootElement.hasChildNodes()) {
    hydrate(<App />, rootElement);
} else {
    render(<App />, rootElement);
}