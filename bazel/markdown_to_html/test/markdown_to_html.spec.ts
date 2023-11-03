import {markdownToHtml} from '../markdown_to_html';

describe('markdown to html', () => {
  it('should transform standard markdown to html', () => {
    const markdown = `**important**`;
    expect(markdownToHtml(markdown)).toContain('<strong>important</strong>');
  });
});
