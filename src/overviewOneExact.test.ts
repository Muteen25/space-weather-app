import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");

describe("exact Overview graph enhancement", () => {
  it("loads the comparison graph script from the served exact portal", () => {
    const html = readFileSync(resolve(root, "public-exact/index.html"), "utf8");

    expect(html).toContain("/overview-one-experimental.js");
  });

  it("defines only the Overview comparison graph and removes the Overview 1 page", () => {
    const script = readFileSync(resolve(root, "public-exact/overview-one-experimental.js"), "utf8");

    expect(script).toContain("Space weather condition graph");
    expect(script).toContain("speedKmPerSec");
    expect(script).toContain("bzGsmNt");
    expect(script).toContain("summary?.meanTec");
    expect(script).toContain("isOverviewSelected");
    expect(script).toContain("ant-menu-item-selected");
    expect(script).not.toContain("Experimental portal");
    expect(script).not.toContain("Overview 1 sidebar");
    expect(script).not.toContain("Notebook-style observatory portal");
  });

  it("adds styles for the current dashboard overview layout", () => {
    const css = readFileSync(resolve(root, "public-exact/ui-fixes.css"), "utf8");

    expect(css).toContain(".dashboard-grid");
    expect(css).toContain(".chart-control-strip");
    expect(css).not.toContain(".overview-one-experimental");
    expect(css).not.toContain(".overview-one-outline");
  });
});
