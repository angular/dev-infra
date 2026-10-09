import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  validateArtifactMetadata,
  extractAndValidateArtifactMetadata,
  WorkflowRunPayload,
} from './extract-artifact-metadata.js';

describe('extract-artifact-metadata', () => {
  const validHeadSha = '0123456789abcdef0123456789abcdef01234567';
  const validPrNumber = 1234;

  const validWorkflowRun: WorkflowRunPayload = {
    head_sha: validHeadSha,
    pull_requests: [
      {
        number: validPrNumber,
        head: {sha: validHeadSha},
        base: {ref: 'main'},
      },
    ],
  };

  describe('validateArtifactMetadata', () => {
    it('accepts matching pull-number and full 40-char commit SHA', () => {
      const rawMetadata = {
        'pull-number': '1234',
        'build-revision': validHeadSha,
      };

      const result = validateArtifactMetadata(rawMetadata, validWorkflowRun);
      expect(result).toEqual({
        'pull-number': '1234',
        'build-revision': validHeadSha,
      });
    });

    it('accepts matching pull-number and short 7-char commit SHA prefix, outputting canonical full SHA', () => {
      const rawMetadata = {
        'pull-number': '  1234  ',
        'build-revision': '0123456',
      };

      const result = validateArtifactMetadata(rawMetadata, validWorkflowRun);
      expect(result).toEqual({
        'pull-number': '1234',
        'build-revision': validHeadSha,
      });
    });

    it('handles multiple pull requests in workflow_run.pull_requests array', () => {
      const multiPrWorkflowRun: WorkflowRunPayload = {
        head_sha: validHeadSha,
        pull_requests: [{number: 1111}, {number: 2222}, {number: 3333}],
      };

      const rawMetadata = {
        'pull-number': '2222',
        'build-revision': validHeadSha,
      };

      const result = validateArtifactMetadata(rawMetadata, multiPrWorkflowRun);
      expect(result).toEqual({
        'pull-number': '2222',
        'build-revision': validHeadSha,
      });
    });

    it('fails closed when workflowRun payload is missing or undefined', () => {
      const rawMetadata = {
        'pull-number': '1234',
        'build-revision': validHeadSha,
      };

      expect(() => validateArtifactMetadata(rawMetadata, undefined)).toThrowError(
        /Missing context.payload.workflow_run/,
      );
    });

    it('fails closed when workflowRun.pull_requests is empty or missing', () => {
      const rawMetadata = {
        'pull-number': '1234',
        'build-revision': validHeadSha,
      };

      expect(() =>
        validateArtifactMetadata(rawMetadata, {head_sha: validHeadSha, pull_requests: []}),
      ).toThrowError(/No pull requests associated with workflow_run event/);

      expect(() => validateArtifactMetadata(rawMetadata, {head_sha: validHeadSha})).toThrowError(
        /No pull requests associated with workflow_run event/,
      );
    });

    it('fails closed when untrusted pull-number does not match workflowRun.pull_requests', () => {
      const rawMetadata = {
        'pull-number': '9999',
        'build-revision': validHeadSha,
      };

      expect(() => validateArtifactMetadata(rawMetadata, validWorkflowRun)).toThrowError(
        /Untrusted pull-number 9999 does not match any pull request associated with the workflow_run event/,
      );
    });

    it('fails closed on non-numeric or negative pull-number', () => {
      expect(() =>
        validateArtifactMetadata(
          {'pull-number': '-1', 'build-revision': validHeadSha},
          validWorkflowRun,
        ),
      ).toThrowError(/Invalid pull-number format/);

      expect(() =>
        validateArtifactMetadata(
          {'pull-number': '1234\nspoofed', 'build-revision': validHeadSha},
          validWorkflowRun,
        ),
      ).toThrowError(/Invalid pull-number format/);

      expect(() =>
        validateArtifactMetadata(
          {'pull-number': 'abc', 'build-revision': validHeadSha},
          validWorkflowRun,
        ),
      ).toThrowError(/Invalid pull-number format/);

      expect(() =>
        validateArtifactMetadata(
          {'pull-number': '', 'build-revision': validHeadSha},
          validWorkflowRun,
        ),
      ).toThrowError(/Missing or empty "pull-number"/);
    });

    it('fails closed when workflowRun.head_sha is malformed or missing', () => {
      const rawMetadata = {
        'pull-number': '1234',
        'build-revision': validHeadSha,
      };

      expect(() =>
        validateArtifactMetadata(rawMetadata, {
          pull_requests: [{number: 1234}],
          head_sha: 'invalid-sha',
        }),
      ).toThrowError(/Missing or malformed head_sha in workflow_run payload/);

      expect(() =>
        validateArtifactMetadata(rawMetadata, {pull_requests: [{number: 1234}]}),
      ).toThrowError(/Missing or malformed head_sha in workflow_run payload/);
    });

    it('fails closed when build-revision contains invalid characters, newlines, or markdown injection', () => {
      const injectionPayloads = [
        '0123456\n## Spoofed Approval',
        '0123456\r\n[Phishing Link](https://evil.com)',
        'deadbeef!',
        '012345', // shorter than 7 chars
        '0123456789abcdef0123456789abcdef012345678', // longer than 40 chars
      ];

      for (const payload of injectionPayloads) {
        expect(() =>
          validateArtifactMetadata(
            {'pull-number': '1234', 'build-revision': payload},
            validWorkflowRun,
          ),
        ).toThrowError(/Invalid build-revision format in artifact metadata/);
      }
    });

    it('fails closed when build-revision SHA does not match workflowRun.head_sha', () => {
      const mismatchedSha = '9999999999999999999999999999999999999999';
      const rawMetadata = {
        'pull-number': '1234',
        'build-revision': mismatchedSha,
      };

      expect(() => validateArtifactMetadata(rawMetadata, validWorkflowRun)).toThrowError(
        /Untrusted build-revision ".*" does not match workflow_run head_sha/,
      );
    });
  });

  describe('extractAndValidateArtifactMetadata', () => {
    let tmpDir: string;
    let setOutputSpy: jasmine.Spy;

    beforeEach(async () => {
      tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'artifact-test-'));
      setOutputSpy = jasmine.createSpy('setOutput');
      spyOn(console, 'info');
    });

    afterEach(async () => {
      await fs.promises.rm(tmpDir, {recursive: true, force: true});
    });

    it('reads files, validates against workflow_run, and sets outputs', async () => {
      await fs.promises.writeFile(
        path.join(tmpDir, '__metadata__pull_number.txt'),
        '1234\n',
        'utf8',
      );
      await fs.promises.writeFile(
        path.join(tmpDir, '__metadata__build_revision.txt'),
        `${validHeadSha}\n`,
        'utf8',
      );

      const result = await extractAndValidateArtifactMetadata(
        tmpDir,
        validWorkflowRun,
        setOutputSpy,
      );

      expect(result).toEqual({
        'pull-number': '1234',
        'build-revision': validHeadSha,
      });

      expect(setOutputSpy).toHaveBeenCalledWith('unsafe-pull-number', '1234');
      expect(setOutputSpy).toHaveBeenCalledWith('unsafe-build-revision', validHeadSha);
    });

    it('detects symlink path traversal attempts and throws error', async () => {
      const outsideDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'outside-test-'));
      const outsideFile = path.join(outsideDir, 'secret.txt');
      await fs.promises.writeFile(outsideFile, '1234', 'utf8');

      // Create a symlink pointing outside the artifact dir
      await fs.promises.symlink(outsideFile, path.join(tmpDir, '__metadata__pull_number.txt'));
      await fs.promises.writeFile(
        path.join(tmpDir, '__metadata__build_revision.txt'),
        validHeadSha,
        'utf8',
      );

      try {
        await expectAsync(
          extractAndValidateArtifactMetadata(tmpDir, validWorkflowRun, setOutputSpy),
        ).toBeRejectedWithError(
          /Value for unsafe-pull-number not stored directly in file as expected/,
        );
      } finally {
        await fs.promises.rm(outsideDir, {recursive: true, force: true});
      }
    });
  });
});
