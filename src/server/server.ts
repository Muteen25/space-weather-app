import { createApp } from "./app";

const port = Number(process.env.PORT ?? 5000);
const app = createApp();

app.listen(port, () => {
  console.log(`Space Weather API listening on http://127.0.0.1:${port}`);
});
