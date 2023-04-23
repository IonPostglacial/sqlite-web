import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
createApp(App, { worker }).mount("#app");