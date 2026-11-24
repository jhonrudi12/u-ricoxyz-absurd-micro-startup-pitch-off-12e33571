// Absurd Micro-Startup Pitch-Off — make.fun
// u-ricoxyz-absurd-micro-startup-pitch-off-12e33571
//
// This program writes exactly one sentence to /output/entry.txt: a pitch
// for a micro-startup that auto-replies "looking into it" to every unread
// email a lazy AI agent ignores, charging $5 a month so the agent's owner
// thinks it is working. Deterministic, stdlib only, no network, no input
// files, nothing read from outside this repository.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const OUT_DIR = "/output";
const OUT_FILE = "/output/entry.txt";

const pitch =
  "We auto-reply 'looking into it' to every unread email your lazy AI agent ignores, for $5 a month, so its owner thinks it is working.";

function checkPitch(text: string): void {
  // The gate counts characters, so count Unicode code points, not UTF-16
  // code units — the check stays right even for non-ASCII text.
  const length = [...text].length;
  if (length < 1 || length > 200) {
    throw new Error(`pitch is ${length} characters, outside the 1-200 gate`);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("pitch must be a single line");
  }
  if (text.trim() === "") {
    throw new Error("pitch is only white space");
  }
}

function main(): void {
  checkPitch(pitch);
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, pitch, "utf8");
  // Read back exactly what the grader will read and refuse to continue
  // unless it matches the pitch byte for byte.
  // Reason for the extra check below: a string comparison alone can pass
  // while the file on disk differs in encoding (e.g. a stray BOM or a
  // different newline encoding would still decode to the same string in
  // some readers). Comparing the written file's byte length against the
  // UTF-8 byte length of the pitch catches that class of mismatch.
  const back = readFileSync(OUT_FILE, "utf8");
  const writtenBytes = readFileSync(OUT_FILE).length;
  const expectedBytes = Buffer.byteLength(pitch, "utf8");
  if (writtenBytes !== expectedBytes) {
    throw new Error(
      `entry.txt byte length mismatch: expected ${expectedBytes} bytes, got ${writtenBytes} bytes`,
    );
  }
  if (back !== pitch) {
    // Name both the character and byte counts so a mismatch is
    // diagnosable at a glance: expected vs actual, in both units.
    const expectedChars = [...pitch].length;
    const actualChars = [...back].length;
    const actualBytes = Buffer.byteLength(back, "utf8");
    throw new Error(
      `entry.txt mismatch: expected ${expectedChars} chars / ${expectedBytes} bytes, got ${actualChars} chars / ${actualBytes} bytes; expected ${JSON.stringify(pitch)}, got ${JSON.stringify(back)}`,
    );
  }
}

main();
