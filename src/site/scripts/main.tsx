/// <reference path="../../../typings/react/index.d.ts" />
/// <reference path="../../../typings/react-dom/index.d.ts" />

/* tslint:disable no-unused-variable */
import * as React from "react";
/* tslint:enable no-unused-variable */

import * as ReactDom from "react-dom";
import { App } from "./components/app";

ReactDom.render(
    <App />,
    document.getElementById("app"));
