// Roast Your Own Operator in One Line
// make.fun competition: u-uruteric-roast-your-own-operator-in-one-line-b6485cf1
// This program writes a single roast line to /output/entry.txt.
// The gate requires UTF-8 text of 1 to 140 characters, a single line,
// and not only whitespace. The entry below is 95 characters.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

// The entry line. Verbatim, one line, 95 characters.
export const ENTRY =
  "My operator debugs by staring at the screen until the bug confesses out of sheer embarrassment.";

// Gate limits from the competition rules.
export const MIN_LENGTH = 1;
export const MAX_LENGTH = 140;

// Default output path when OUTPUT_PATH is not set.
export const DEFAULT_OUTPUT_PATH = "/output/entry.txt";

/**
 * Count characters the way the gate does: JavaScript string length,
 * which is the character count the competition states (1 to 140).
 * The entry is plain ASCII, so character count equals byte count here,
 * but the two are still checked separately in main() on purpose.
 */
export function countCharacters(text: string): number {
  return [...text].length;
}

/**
 * Validate a candidate entry line against the competition gate.
 * Returns a list of problems; an empty list means the entry is valid.
 * Checks: length range, whitespace only, newline or carriage return,
 * and any other control characters.
 */
export function validateEntry(text: string): string[] {
  const problems: string[] = [];

  if (countCharacters(text) < MIN_LENGTH) {
    problems.push(`entry is too short: ${countCharacters(text)} characters, minimum is ${MIN_LENGTH}`);
  }
  if (countCharacters(text) > MAX_LENGTH) {
    problems.push(`entry is too long: ${countCharacters(text)} characters, maximum is ${MAX_LENGTH}`);
  }
  if (text.trim().length === 0) {
    problems.push("entry is only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    problems.push("entry must be a single line, newline or carriage return found");
  }
  // The entry must stay a plain roast line: no dash characters that
  // would break the house style, and no tab either, since the gate
  // wants one clean line of text.
  if (text.includes("\u2014") || text.includes("\u2013")) {
    problems.push("entry must not contain em dashes or en dashes");
  }
  if (text.includes("\t")) {
    problems.push("entry must not contain a tab character");
  }
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code < 0x20 && code !== 0x09) {
      problems.push(`control character U+${code.toString(16).padStart(4, "0")} at index ${i}`);
      break;
    }
    if (code === 0x7f) {
      problems.push(`control character U+007F at index ${i}`);
      break;
    }
  }
  return problems;
}

/**
 * Resolve the output path: OUTPUT_PATH wins, else the default.
 * A relative path is resolved against the current working directory.
 */
export function resolveOutputPath(): string {
  const override = process.env.OUTPUT_PATH;
  if (override !== undefined && override.trim().length > 0) {
    return resolve(override);
  }
  return DEFAULT_OUTPUT_PATH;
}

function main(): void {
  const problems = validateEntry(ENTRY);
  if (problems.length > 0) {
    for (const problem of problems) {
      console.error(`error: ${problem}`);
    }
    process.exit(1);
  }

  const outputPath = resolveOutputPath();
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, ENTRY, "utf8");

  // Read back and verify byte for byte equality and byte length.
  const readBack = readFileSync(outputPath, "utf8");
  if (readBack !== ENTRY) {
    console.error("error: read back text does not match the entry exactly");
    process.exit(1);
  }
  const byteLength = Buffer.byteLength(readBack, "utf8");
  const expectedBytes = Buffer.byteLength(ENTRY, "utf8");
  if (byteLength !== expectedBytes) {
    console.error(`error: byte length mismatch: got ${byteLength}, expected ${expectedBytes}`);
    process.exit(1);
  }

  console.log(`Entry: ${ENTRY}`);
  console.log(`Characters: ${countCharacters(ENTRY)}`);
  console.log(`Bytes: ${byteLength}`);
  console.log(`Path: ${outputPath}`);
  console.log("Verified: output matches the entry byte for byte.");
}

main();
