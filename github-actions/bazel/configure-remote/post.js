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
  let output = "";
  let succeeded = false;
  for (const line of rawBep.split("\n")) {
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }
    output += (event.progress?.stderr ?? "") + (event.progress?.stdout ?? "");
    if (event.finished !== void 0) {
      succeeded = event.finished.overallSuccess === true;
    }
    const testLabel = event.id?.testSummary?.label;
    const testStatus = event.testSummary?.overallStatus ?? "";
    if (testLabel && FAILING_TEST_STATUSES.has(testStatus)) {
      failedTests.set(testLabel, testStatus);
    }
    const targetLabel = event.id?.targetCompleted?.label;
    const buildFailure = event.completed?.failureDetail?.message?.trim();
    if (targetLabel && buildFailure) {
      failedBuilds.set(targetLabel, buildFailure);
    } else if (!targetLabel && event.aborted?.description) {
      aborted.push(event.aborted.description.trim());
    }
  }
  if (succeeded) {
    return [];
  }
  const outputLines = cleanLines(output);
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
  for (const [label, detail] of failedBuilds) {
    const title = `${label} FAILED TO BUILD`;
    annotations.push({ title, message: [title, detail, ...buildContext].join("\n") });
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
    while (lines.length > 1 && escapeData(lines.join("\n")).length > MAX_MESSAGE_CHARS) {
      lines.shift();
    }
    const safeMessage = escapeData(lines.join("\n")).slice(-MAX_MESSAGE_CHARS);
    return `::error title=${escapeData(safeTitle).replace(/[:,]/g, encodeURIComponent)}::${safeMessage}`;
  }).join("\n");
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
  return stripVTControlCharacters(raw).split(/\r?\n/).map((line) => line.slice(line.lastIndexOf("\r") + 1).trimEnd()).filter((line) => line !== "");
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicG9zdC1lbnRyeS50cyIsICJmYWlsdXJlLWFubm90YXRpb25zLnRzIl0sCiAgIm1hcHBpbmdzIjogIjs7O0FBUUEsT0FBT0EsU0FBUTs7O0FDTWYsT0FBTyxRQUFRO0FBQ2YsU0FBUSxnQ0FBK0I7QUFHdkMsSUFBTSxrQkFBa0I7QUFDeEIsSUFBTSxrQkFBa0I7QUFDeEIsSUFBTSxvQkFBb0I7QUFDMUIsSUFBTSxxQkFBcUI7QUFDM0IsSUFBTSwwQkFBMEI7QUFFaEMsSUFBTSx3QkFBd0Isb0JBQUksSUFBSSxDQUFDLFVBQVUsV0FBVyxZQUFZLENBQUM7QUFFekUsSUFBTSxvQkFBb0I7QUFDMUIsSUFBTSxZQUFZO0FBQ2xCLElBQU0sY0FBYztBQWlCZCxTQUFVLG1CQUFtQixRQUFjO0FBQy9DLFFBQU0sY0FBYyxvQkFBSSxJQUFHO0FBQzNCLFFBQU0sZUFBZSxvQkFBSSxJQUFHO0FBQzVCLFFBQU0sVUFBb0IsQ0FBQTtBQUMxQixNQUFJLFNBQVM7QUFDYixNQUFJLFlBQVk7QUFFaEIsYUFBVyxRQUFRLE9BQU8sTUFBTSxJQUFJLEdBQUc7QUFDckMsUUFBSTtBQUNKLFFBQUk7QUFDRixjQUFRLEtBQUssTUFBTSxJQUFJO0lBQ3pCLFFBQVE7QUFDTjtJQUNGO0FBQ0EsZUFBVyxNQUFNLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxVQUFVO0FBQ3RFLFFBQUksTUFBTSxhQUFhLFFBQVc7QUFDaEMsa0JBQVksTUFBTSxTQUFTLG1CQUFtQjtJQUNoRDtBQUVBLFVBQU0sWUFBWSxNQUFNLElBQUksYUFBYTtBQUN6QyxVQUFNLGFBQWEsTUFBTSxhQUFhLGlCQUFpQjtBQUN2RCxRQUFJLGFBQWEsc0JBQXNCLElBQUksVUFBVSxHQUFHO0FBQ3RELGtCQUFZLElBQUksV0FBVyxVQUFVO0lBQ3ZDO0FBRUEsVUFBTSxjQUFjLE1BQU0sSUFBSSxpQkFBaUI7QUFDL0MsVUFBTSxlQUFlLE1BQU0sV0FBVyxlQUFlLFNBQVMsS0FBSTtBQUNsRSxRQUFJLGVBQWUs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
