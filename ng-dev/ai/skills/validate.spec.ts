import {join} from 'path';
import {validateSkill, validateSkills} from './validate.js';

function getFixturePath(relativePath: string): string {
  return join(process.cwd(), 'ng-dev/ai/skills/fixtures', relativePath);
}

describe('validateSkills', () => {
  it('should pass for valid skill', async () => {
    const skillPath = getFixturePath('valid-skill/skills/test-skill/SKILL.md');
    const {failures} = await validateSkill(skillPath);
    expect(failures.length).toBe(0);
  });

  it('should fail for missing frontmatter', async () => {
    const skillPath = getFixturePath('missing-frontmatter/skills/bad-skill/SKILL.md');
    const {failures} = await validateSkill(skillPath);

    expect(failures.length).toBe(1);
    expect(failures).toContain(jasmine.stringMatching('Missing or invalid frontmatter'));
  });

  it('should fail if frontmatter is not at the start of the file', async () => {
    const skillPath = getFixturePath('invalid-frontmatter-location/skills/test-skill/SKILL.md');
    const {failures} = await validateSkill(skillPath);

    expect(failures).toContain(jasmine.stringMatching('Missing or invalid frontmatter'));
  });

  it('should fail for invalid schema (missing license)', async () => {
    const skillPath = getFixturePath('invalid-schema/skills/bad-schema/SKILL.md');
    const {failures} = await validateSkill(skillPath);

    expect(failures.length).toBe(1);
    expect(failures).toContain(jasmine.stringMatching('Schema validation failure'));
  });

  it('should fail for name mismatch', async () => {
    const skillPath = getFixturePath('name-mismatch/skills/wrong-name/SKILL.md');
    const {failures} = await validateSkill(skillPath);

    expect(failures.length).toBe(1);
    expect(failures).toContain(jasmine.stringMatching('Name mismatch'));
  });

  it('should fail for invalid name format', async () => {
    const skillPath = getFixturePath('invalid-name-format/skills/InvalidName/SKILL.md');
    const {failures} = await validateSkill(skillPath);

    expect(failures.length).toBe(1);
    expect(failures).toContain(jasmine.stringMatching('Schema validation failure'));
  });

  it('should pass with valid optional fields', async () => {
    const skillPath = getFixturePath('complex-skill/skills/complex-skill/SKILL.md');
    const {failures} = await validateSkill(skillPath);
    expect(failures.length).toBe(0);
  });

  it('should validate multiple skills', async () => {
    const repoRoot = getFixturePath('multiple-valid');
    const {exitCode} = await validateSkills(repoRoot);
    expect(exitCode).toBe(0);
  });

  it('should fail if one of multiple skills is invalid', async () => {
    const repoRoot = getFixturePath('multiple-mixed');
    const {exitCode} = await validateSkills(repoRoot);
    expect(exitCode).toBe(1);
  });
});
