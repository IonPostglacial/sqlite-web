import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";


export default defineConfig({
    plugins: [
        vue(),
        {
            name: "isolation",
            configureServer(server) {
                server.middlewares.use((_req, res, next) => {
                    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
                    next();
                });
            },
        },
    ],
    optimizeDeps: {
        exclude: ["@sqlite.org/sqlite-wasm"],
    },
})
