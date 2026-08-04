import config from "./vite.config";

describe("Vite development proxy", () => {
  it("defaults API proxy traffic to the local API server port", () => {
    expect(config.server?.proxy?.["/api"]).toBe("http://127.0.0.1:5000");
  });
});
