import { Inspector, Runtime } from "/notebook-runtime.js";
import notebook from "./d3-mapping-on-canvas/2.js";

Runtime.load(notebook, Inspector.into(document.body));
