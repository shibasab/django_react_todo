import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { afterAll, describe, expect, it } from "vitest";

type LintRunResult = Readonly<{
  status: number;
  output: string;
}>;

const getRepoRoot = (): string => {
  const testFilePath = fileURLToPath(import.meta.url);
  return resolve(testFilePath, "../../..");
};

const getSharedRoot = (): string => resolve(getRepoRoot(), "shared");
const tempParentDir = join(getSharedRoot(), ".tmp-fp-guardrails");

const resolveOxlintBinPath = (): string => {
  const sharedRoot = getSharedRoot();
  const requireFromShared = createRequire(join(sharedRoot, "package.json"));
  const oxlintEntryPath = requireFromShared.resolve("oxlint");

  return resolve(dirname(oxlintEntryPath), "../bin/oxlint");
};

const runSharedLintForCode = (sourceCode: string): LintRunResult => {
  const sharedRoot = getSharedRoot();
  mkdirSync(tempParentDir, { recursive: true });
  const tempDir = mkdtempSync(join(tempParentDir, "case-"));
  const tempFilePath = join(tempDir, "sample.ts");

  writeFileSync(tempFilePath, sourceCode, "utf8");

  const oxlintBinPath = resolveOxlintBinPath();
  const configPath = resolve(sharedRoot, ".oxlintrc.json");
  const result = spawnSync(
    process.execPath,
    [oxlintBinPath, "--type-aware", "-c", configPath, tempFilePath],
    {
      cwd: sharedRoot,
      encoding: "utf8",
    },
  );

  rmSync(tempDir, { recursive: true, force: true });

  const processError =
    result.error == null
      ? ""
      : `\nspawn error: ${result.error.message}${
          "code" in result.error && typeof result.error.code === "string"
            ? ` (${result.error.code})`
            : ""
        }`;

  return {
    status: result.status ?? 1,
    output: `${result.stdout ?? ""}\n${result.stderr ?? ""}${processError}`,
  };
};

afterAll(() => {
  rmSync(tempParentDir, { recursive: true, force: true });
});

describe("FPガードレール", () => {
  it("空のclassを禁止する", () => {
    const result = runSharedLintForCode("class Sample {}");

    expect(result.status).not.toBe(0);
    expect(result.output).toContain("no-extraneous-class");
  });

  it("throw literalを禁止する", () => {
    const result = runSharedLintForCode("throw 'boom'");

    expect(result.status).not.toBe(0);
    expect(result.output).toContain("no-throw-literal");
  });

  it("throw new Errorは許可される", () => {
    const result = runSharedLintForCode("throw new Error('boom')");

    expect(result.status).toBe(0);
  });

  it("理由付きdisableコメントで禁止ルールを明示的に回避できる", () => {
    const result = runSharedLintForCode(
      [
        "// oxlint-disable-next-line no-throw-literal,typescript/only-throw-error -- 境界でHTTP例外へ変換するため",
        "throw 'boom'",
      ].join("\n"),
    );

    expect(result.status).toBe(0);
  });
});
