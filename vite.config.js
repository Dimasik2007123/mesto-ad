import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: ".", // корень проекта
  server: {
    open: true, // автоматически открывать страницу в браузере
    port: 3000, // порт dev-сервера
  },
  base: "./",
});
