// AI-assisted triage of failed Playwright tests.
// Reads the JSON report, asks a language model to classify each failure,
// and prints a Markdown summary (also added to the GitHub Actions job summary).
import { appendFileSync, existsSync, readFileSync } from 'node:fs';

const REPORT_PATH = 'results.json';
const PROMPT_PATH = 'prompts/triage.txt';
const MODEL = 'gemini-3.5-flash-lite';
const MAX_FAILURES = 5; // keeps the number of AI calls, and the free quota, under control
const DELAY_MS = 5000; // spaces out the calls to respect the free tier rate limit

type Failure = { title: string; project: string; error: string };
type Triage = { category: string; confidence: string; explanation: string; next_step: string };

// Minimal shape of the Playwright JSON report, limited to what this script reads
type ReportTest = { projectName: string; status: string; results: { error?: { message?: string } }[] };
type ReportSuite = { title: string; specs?: { title: string; tests: ReportTest[] }[]; suites?: ReportSuite[] };

// Removes the terminal colour codes that Playwright adds to its error messages
function stripColors(text: string): string {
  return text.replace(/\u001b\[[0-9;]*m/g, '');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Walks through the nested suites of the report and keeps the tests that failed unexpectedly
function collectFailures(suites: ReportSuite[], path: string[] = []): Failure[] {
  const failures: Failure[] = [];
  for (const suite of suites) {
    const suitePath = suite.title ? [...path, suite.title] : path;
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests) {
        if (test.status !== 'unexpected') continue;
        const lastResult = test.results[test.results.length - 1];
        failures.push({
          title: [...suitePath, spec.title].join(' › '),
          project: test.projectName,
          error: stripColors(lastResult?.error?.message ?? 'No error message'),
        });
      }
    }
    failures.push(...collectFailures(suite.suites ?? [], suitePath));
  }
  return failures;
}

async function triage(failure: Failure, promptTemplate: string, apiKey: string): Promise<Triage> {
  const failureText = `Test: ${failure.title} [${failure.project}]\nError: ${failure.error}`;
  const prompt = promptTemplate.replace('{{failure}}', failureText);

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        // Forces an answer that follows this exact JSON structure
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            category: { type: 'STRING', enum: ['product-bug', 'test-bug', 'environment', 'flaky'] },
            confidence: { type: 'STRING', enum: ['low', 'medium', 'high'] },
            explanation: { type: 'STRING' },
            next_step: { type: 'STRING' },
          },
          required: ['category', 'confidence', 'explanation', 'next_step'],
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`The AI service answered with status ${response.status}: ${await response.text()}`);
  }
  const data = (await response.json()) as { candidates: { content: { parts: { text: string }[] } }[] };
  return JSON.parse(data.candidates[0].content.parts[0].text) as Triage;
}

async function main(): Promise<void> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.log('GOOGLE_API_KEY is not set: AI triage skipped.');
    return;
  }
  if (!existsSync(REPORT_PATH)) {
    console.log(`${REPORT_PATH} not found: run the tests first.`);
    return;
  }

  const report = JSON.parse(readFileSync(REPORT_PATH, 'utf8')) as { suites: ReportSuite[] };
  const failures = collectFailures(report.suites);
  const toTriage = failures.slice(0, MAX_FAILURES);
  const promptTemplate = readFileSync(PROMPT_PATH, 'utf8');

  const lines: string[] = ['## AI triage of failed tests', ''];
  if (failures.length === 0) {
    lines.push('No failed tests: nothing to triage.');
  }

  for (let index = 0; index < toTriage.length; index++) {
    const failure = toTriage[index];
    if (index > 0) await sleep(DELAY_MS);
    lines.push(`### ${failure.title} (${failure.project})`);
    try {
      const result = await triage(failure, promptTemplate, apiKey);
      lines.push(
        `- **Category:** ${result.category} (confidence: ${result.confidence})`,
        `- **Explanation:** ${result.explanation}`,
        `- **Next step:** ${result.next_step}`,
      );
    } catch (error) {
      lines.push(`- Triage unavailable: ${(error as Error).message}`);
    }
    lines.push('');
  }

  if (failures.length > MAX_FAILURES) {
    lines.push(`Only the first ${MAX_FAILURES} of ${failures.length} failures were triaged.`, '');
  }
  lines.push('_Suggestions generated by a language model: always confirm them by reading the report._');

  const summary = lines.join('\n');
  console.log(summary);
  // In GitHub Actions, this file is displayed on the summary page of the run
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});