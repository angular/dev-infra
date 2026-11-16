import { createRequire as _esbuildBannerCreateRequire } from 'node:module';globalThis['require'] ??= _esbuildBannerCreateRequire(import.meta.url);

// github-actions/bazel/configure-remote/post-entry.ts
import fs2 from "node:fs";

// github-actions/bazel/configure-remote/failure-annotations.js
import fs from "node:fs";
import { stripVTControlCharacters } from "node:util";
var MAX_ANNOTATIONS = 10;
var MAX_TITLE_CHARS = 255;
var MAX_MESSAGE_CHARS = 3800;
var MAX_TEST_LOG_LINES = 40;
var MAX_BUILD_CONTEXT_LINES = 30;
var FAILING_TEST_STATUSES = /* @__PURE__ */ new Set(["FAILED", "TIMEOUT", "INCOMPLETE"]);
var TEST_LOG_LOCATION = /^(?:FAIL|TIMEOUT): (\/\/\S+) .*\(see (.+)\)$/;
var BUILD_END = /^ERROR: Build did NOT complete successfully/;
var BAZEL_NOISE = /^(?:INFO:|Loading:|Analyzing:|SUBCOMMAND:|\[[\d,]+ \/ [\d,]+\])/;
function collectAnnotations(rawBep) {
  const failedTests = /* @__PURE__ */ new Map();
  const failedBuilds = /* @__PURE__ */ new Map();
  const aborted = [];
  const outputLines = [];
  let stderrCarry = "";
  let stdoutCarry = "";
  let succeeded = false;
  for (const line of rawBep.split("\n")) {
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }
    stderrCarry = appendChunk(stderrCarry, event.progress?.stderr, outputLines);
    stdoutCarry = appendChunk(stdoutCarry, event.progress?.stdout, outputLines);
    if (event.finished !== void 0) {
      succeeded = event.finished.overallSuccess === true;
    }
    const testLabel = event.id?.testSummary?.label;
    const testStatus = event.testSummary?.overallStatus ?? "";
    if (testLabel && FAILING_TEST_STATUSES.has(testStatus)) {
      failedTests.set(testLabel, testStatus);
    }
    const targetLabel = event.id?.targetCompleted?.label;
    const buildFailure = event.completed?.failureDetail?.message?.trim() || event.aborted?.description?.trim();
    if (targetLabel && (buildFailure || event.aborted)) {
      failedBuilds.set(targetLabel, buildFailure ?? "");
    } else if (!targetLabel && event.aborted?.description) {
      aborted.push(event.aborted.description.trim());
    }
  }
  outputLines.push(...cleanLines(stderrCarry), ...cleanLines(stdoutCarry));
  if (succeeded) {
    return [];
  }
  const testLogs = /* @__PURE__ */ new Map();
  for (const line of outputLines) {
    const match = TEST_LOG_LOCATION.exec(line);
    if (match !== null) {
      testLogs.set(match[1], match[2]);
    }
  }
  const annotations = [];
  for (const [label, status] of failedTests) {
    const title = `${label} ${status}`;
    annotations.push({ title, message: readTestLogTail(testLogs.get(label)) || title });
  }
  const buildContext = extractBuildContext(outputLines);
  const fallbackContext = buildContext.length > 0 ? buildContext : aborted;
  for (const [label, detail] of failedBuilds) {
    const title = `${label} FAILED TO BUILD`;
    annotations.push({
      title,
      message: [title, ...detail ? [detail] : [], ...fallbackContext].join("\n")
    });
  }
  if (annotations.length === 0 && (aborted.length > 0 || buildContext.length > 0)) {
    annotations.push({
      title: "Bazel build failed",
      message: [...aborted, ...buildContext].join("\n")
    });
  }
  if (annotations.length <= MAX_ANNOTATIONS) {
    return annotations;
  }
  const rest = annotations.splice(MAX_ANNOTATIONS - 1);
  annotations.push({
    title: `${rest.length} more Bazel failure(s)`,
    message: rest.map((a) => a.title).join("\n")
  });
  return annotations;
}
function formatWorkflowCommands(annotations) {
  return annotations.map(({ title, message }) => {
    const safeTitle = title.length <= MAX_TITLE_CHARS ? title : `${title.slice(0, MAX_TITLE_CHARS - 3)}...`;
    const lines = message.split("\n");
    while (lines.length > 1 && lines.join("\n").length > MAX_MESSAGE_CHARS) {
      lines.shift();
    }
    const safeMessage = escapeData(lines.join("\n").slice(-MAX_MESSAGE_CHARS));
    return `::error title=${escapeData(safeTitle).replace(/[:,]/g, encodeURIComponent)}::${safeMessage}`;
  }).join("\n");
}
function appendChunk(carry, chunk, out) {
  if (!chunk) {
    return carry;
  }
  const combined = carry + chunk;
  const lastNewline = combined.lastIndexOf("\n");
  if (lastNewline === -1) {
    return combined;
  }
  out.push(...cleanLines(combined.slice(0, lastNewline + 1)));
  return combined.slice(lastNewline + 1);
}
function readTestLogTail(logPath) {
  if (logPath === void 0 || !fs.existsSync(logPath)) {
    return "";
  }
  return cleanLines(fs.readFileSync(logPath, "utf8")).slice(-MAX_TEST_LOG_LINES).join("\n");
}
function extractBuildContext(outputLines) {
  const lines = outputLines.filter((line) => !BAZEL_NOISE.test(line));
  const start = lines.findIndex((line) => line.startsWith("ERROR:"));
  if (start === -1) {
    return [];
  }
  const end = lines.findIndex((line, i) => i > start && BUILD_END.test(line));
  return lines.slice(start, end === -1 ? void 0 : end + 1).slice(0, MAX_BUILD_CONTEXT_LINES);
}
function cleanLines(raw) {
  return stripVTControlCharacters(raw).replace(/\r+\n/g, "\n").split("\n").map((line) => line.replace(/\r+$/, "")).map((line) => line.slice(line.lastIndexOf("\r") + 1).trimEnd()).filter((line) => line !== "");
}
function escapeData(value) {
  return value.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}

// github-actions/bazel/configure-remote/post-entry.ts
try {
  const bepPath = process.env["BAZEL_BEP_PATH"];
  if (bepPath !== void 0 && fs2.existsSync(bepPath)) {
    const output = formatWorkflowCommands(collectAnnotations(fs2.readFileSync(bepPath, "utf8")));
    if (output !== "") {
      process.stdout.write(`${output}
`);
    }
  }
} catch (e) {
  console.error("Failed to emit Bazel failure annotations:", e);
}
/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicG9zdC1lbnRyeS50cyIsICJmYWlsdXJlLWFubm90YXRpb25zLnRzIl0sCiAgIm1hcHBpbmdzIjogIjs7O0FBUUEsT0FBT0EsU0FBUTs7O0FDTWYsT0FBTyxRQUFRO0FBQ2YsU0FBUSxnQ0FBK0I7QUFHdkMsSUFBTSxrQkFBa0I7QUFDeEIsSUFBTSxrQkFBa0I7QUFDeEIsSUFBTSxvQkFBb0I7QUFDMUIsSUFBTSxxQkFBcUI7QUFDM0IsSUFBTSwwQkFBMEI7QUFFaEMsSUFBTSx3QkFBd0Isb0JBQUksSUFBSSxDQUFDLFVBQVUsV0FBVyxZQUFZLENBQUM7QUFFekUsSUFBTSxvQkFBb0I7QUFDMUIsSUFBTSxZQUFZO0FBQ2xCLElBQU0sY0FBYztBQWlCZCxTQUFVLG1CQUFtQixRQUFjO0FBQy9DLFFBQU0sY0FBYyxvQkFBSSxJQUFHO0FBQzNCLFFBQU0sZUFBZSxvQkFBSSxJQUFHO0FBQzVCLFFBQU0sVUFBb0IsQ0FBQTtBQUMxQixRQUFNLGNBQXdCLENBQUE7QUFDOUIsTUFBSSxjQUFjO0FBQ2xCLE1BQUksY0FBYztBQUNsQixNQUFJLFlBQVk7QUFFaEIsYUFBVyxRQUFRLE9BQU8sTUFBTSxJQUFJLEdBQUc7QUFDckMsUUFBSTtBQUNKLFFBQUk7QUFDRixjQUFRLEtBQUssTUFBTSxJQUFJO0lBQ3pCLFFBQVE7QUFDTjtJQUNGO0FBQ0Esa0JBQWMsWUFBWSxhQUFhLE1BQU0sVUFBVSxRQUFRLFdBQVc7QUFDMUUsa0JBQWMsWUFBWSxhQUFhLE1BQU0sVUFBVSxRQUFRLFdBQVc7QUFDMUUsUUFBSSxNQUFNLGFBQWEsUUFBVztBQUNoQyxrQkFBWSxNQUFNLFNBQVMsbUJBQW1CO0lBQ2hEO0FBRUEsVUFBTSxZQUFZLE1BQU0sSUFBSSxhQUFhO0FBQ3pDLFVBQU0sYUFBYSxNQUFNLGFBQWEsaUJBQWlCO0FBQ3ZELFFBQUksYUFBYSxzQkFBc0IsSUFBSSxVQUFVLEdBQUc7QUFDdEQsa0JBQVksSUFBSSxXQUFXLFVBQVU7SUFDdkM7QUFFQSxVQUFNLGNB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
