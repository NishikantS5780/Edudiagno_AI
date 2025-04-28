// npm uninstall @types/markdown-it markdown-it react-markdown-editor-lite

// interface QuestionEditorProps {
//   questionDescription: string;
//   setQuestionDescription: (value: string) => void;
// }


// import React from 'react';
// import MarkdownIt from 'markdown-it';
// import MarkdownEditor from 'react-markdown-editor-lite';
// import 'react-markdown-editor-lite/lib/index.css';

// const mdParser = new MarkdownIt();

// const QuestionEditor: React.FC<QuestionEditorProps> = ({
//   questionDescription,
//   setQuestionDescription,
// }) => {
//   return (
//     <div >
//       <MarkdownEditor
//         value={questionDescription}
//         onChange={({ text }) => setQuestionDescription(text)}
//         renderHTML={(text) => mdParser.render(text)}
//         style={{ height: '300px' }}
//       />
//     </div>
//   );
// };

// export default QuestionEditor;




import React from 'react';
import MDEditor, { commands, ICommand } from '@uiw/react-md-editor';
import { cn } from '@/lib/utils';

interface QuestionEditorProps {
  questionDescription: string;
  setQuestionDescription: (value: string) => void;
}


const customTableCommand: ICommand = {
  name: 'table',
  keyCommand: 'table',
  buttonProps: { 'aria-label': 'Insert table', title: 'Insert Table' },
  icon: (
    <svg width="12" height="12" viewBox="0 0 20 20">
      <path
        fill="currentColor"
        d="M2 3h16v14H2V3zm2 2v2h4V5H4zm6 0v2h4V5h-4zm6 0v2h-2V5h2zM4 9v2h4V9H4zm6 0v2h4V9h-4zm6 0v2h-2V9h2zM4 13v2h4v-2H4zm6 0v2h4v-2h-4zm6 0v2h-2v-2h2z"
      />
    </svg>
  ),
  execute: (state, api) => {

    const rows = parseInt(prompt('Enter number of rows (e.g., 3):') || '3', 10);
    const cols = parseInt(prompt('Enter number of columns (e.g., 3):') || '3', 10);

    if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
      alert('Please enter valid numbers for rows and columns.');
      return;
    }

    let tableMarkdown = '';
 
    tableMarkdown += '| ' + Array(cols).fill('Header').join(' | ') + ' |\n';

    tableMarkdown += '| ' + Array(cols).fill('---').join(' | ') + ' |\n';
 
    for (let i = 0; i < rows; i++) {
      tableMarkdown += '| ' + Array(cols).fill('').join(' | ') + ' |\n';
    }

    api.replaceSelection(tableMarkdown);
  },
};

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  questionDescription,
  setQuestionDescription,
}) => {
  return (
    <div className="w-full" data-color-mode="dark">
      <MDEditor
        value={questionDescription}
        onChange={(value) => setQuestionDescription(value || '')}
        className={cn(
          'rounded-md border border-border bg-background text-foreground',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          'min-h-[300px]'
        )}
        preview="live"
        height={300}
        commands={[
          commands.bold,
          commands.italic,
          commands.strikethrough,
          commands.hr,
          commands.title,
          commands.divider,
          commands.link,
          commands.quote,
          commands.code,
          commands.codeBlock,
          commands.image,
          commands.divider,
          commands.unorderedListCommand,
          commands.orderedListCommand,
          commands.checkedListCommand,
          commands.divider,
          customTableCommand, // Use custom table command
          commands.title1,
          commands.title2,
          commands.title3,
          commands.title4,
          commands.title5,
          commands.title6,
        ]}
        extraCommands={[
          commands.fullscreen,
          commands.divider,
        //   commands.undo,
        //   commands.redo,
        ]}
      />
    </div>
  );
};

export default QuestionEditor;


















