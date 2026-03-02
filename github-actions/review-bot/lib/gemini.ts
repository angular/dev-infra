import {GoogleGenAI, Type} from '@google/genai';
import {Octokit} from '@octokit/rest';
import * as core from '@actions/core';
import {CodeReview} from './github';

const LLM_MODEL = 'gemini-2.5-pro';

export async function performCodeReview(
  apiKey: string,
  diff: string,
  filesContext: {filename: string; content: string; status: string}[],
  failedChecks: {name: string; output: string | null}[],
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string,
): Promise<CodeReview | null> {
  const ai = new GoogleGenAI({apiKey});

  // Create a function declaration for our GitHub search tool
  const searchCodebaseTool = {
    name: 'searchCodebase',
    description: 'Search the repository codebase to find usage examples or architectural patterns.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'The search query string (e.g. "functionName" or "class Name")',
        },
      },
      required: ['query'],
    },
  };

  const getFileContextTool = {
    name: 'getFileContext',
    description:
      'Fetch the full content of a specific file in the repository to understand its surrounding code.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        path: {
          type: Type.STRING,
          description: 'The exact path to the file in the repository.',
        },
      },
      required: ['path'],
    },
  };

  const tools = [
    {
      functionDeclarations: [searchCodebaseTool, getFileContextTool],
    },
  ];

  const systemInstruction = `You are an expert Angular and TypeScript code reviewer. 
Your goal is to provide a constructive, actionable code review for a pull request.
You must analyze the provided file contexts, the exact diff, and any failed CI checks (like linting or test failures).
Provide concrete instructions on how to fix failures or improve code layout.

You have access to tools that allow you to search the wider codebase or fetch additional files if you need more context (e.g. to see how a function is used elsewhere or to find existing patterns). Use them if the diff alone is not enough to make a recommendation.

You must return your feedback strictly matching the requested JSON schema.
For inline comments, ensure the \`path\` matches a modified file exactly, and the \`line\` number falls within the added/modified span of the RIGHT side of the diff. Do not comment on unmodified lines.`;

  const filesPrompt = filesContext
    .map(
      (f) =>
        `--- File: ${f.filename} (Status: ${f.status}) ---\n${f.content}\n-----------------------`,
    )
    .join('\n\n');

  const failedChecksPrompt =
    failedChecks.length > 0
      ? failedChecks
          .map((c) => `Check: ${c.name}\nOutput:\n${c.output || 'No output.'}`)
          .join('\n\n')
      : 'No failed checks.';

  const prompt = `Please review the following PR.

## Modified Files Context
${filesPrompt}

## Pull Request Diff
\`\`\`diff
${diff}
\`\`\`

## Failed Checks (Lint/Tests)
${failedChecksPrompt}

Analyze the changes and the failed checks. If you need more context on how specific functions, classes, or patterns are used across the repository, use your tools to search the codebase or fetch file context before providing your final markdown review.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      generalComment: {
        type: Type.STRING,
        description:
          'A brief overview of the changes and general observations about the PR. Can include overall feedback on code quality and structure.',
      },
      inlineComments: {
        type: Type.ARRAY,
        description:
          'Specific comments tied to exact files and line numbers in the PR diff. Useful for localized actionable feedback.',
        items: {
          type: Type.OBJECT,
          properties: {
            path: {
              type: Type.STRING,
              description:
                "The relative path of the module/file being commented on (e.g. 'src/app/app.component.ts').",
            },
            line: {
              type: Type.INTEGER,
              description:
                'The specific line number in the new code (RIGHT side of the diff) the comment refers to.',
            },
            body: {
              type: Type.STRING,
              description: 'The actionable feedback or Markdown comment for this specific line.',
            },
          },
          required: ['path', 'line', 'body'],
        },
      },
    },
    required: ['generalComment', 'inlineComments'],
  };

  try {
    const chat = ai.chats.create({
      model: LLM_MODEL,
      config: {
        systemInstruction,
        tools,
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

    let response = await chat.sendMessage({
      message: prompt,
    });

    // Handle tool calls iteratively
    while (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      const args: Record<string, any> = call.args || {};
      let toolResult: any;

      try {
        if (call.name === 'searchCodebase') {
          core.info(`Gemini called tool: searchCodebase("${args.query}")`);
          const searchRes = await octokit.rest.search.code({
            q: `${args.query} repo:${owner}/${repo}`,
            per_page: 5,
          });
          toolResult = searchRes.data.items.map((i) => ({
            name: i.name,
            path: i.path,
            repository: i.repository.full_name,
            url: i.html_url,
          }));
        } else if (call.name === 'getFileContext') {
          core.info(`Gemini called tool: getFileContext("${args.path}")`);
          const contentRes = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: String(args.path),
            ref,
          });
          if (
            'type' in contentRes.data &&
            contentRes.data.type === 'file' &&
            'content' in contentRes.data
          ) {
            toolResult = {
              path: args.path,
              content: Buffer.from(contentRes.data.content, 'base64').toString('utf8'),
            };
          } else {
            toolResult = {error: 'Not a file or file too large.'};
          }
        }
      } catch (err: any) {
        core.error(`Tool execution failed: ${err.message}`);
        toolResult = {error: err.message};
      }

      response = await chat.sendMessage({
        message: [
          {
            functionResponse: {
              name: call.name || '',
              response: {result: toolResult},
            },
          },
        ],
      });
    }

    if (!response.text) return null;
    return JSON.parse(response.text);
  } catch (error) {
    core.error(
      `Failed to execute Gemini review: ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }
}
