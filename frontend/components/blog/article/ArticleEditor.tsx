import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight';
import '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css';
import uml from '@toast-ui/editor-plugin-uml';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import { Editor } from '@toast-ui/react-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-c.js';
import 'prismjs/components/prism-cpp.js';
import 'prismjs/components/prism-csharp.js';
import 'prismjs/components/prism-cshtml.js';
import 'prismjs/components/prism-css-extras.js';
import 'prismjs/components/prism-css.js';
import 'prismjs/components/prism-docker.js';
// import "prismjs/components/prism-django.js";
// import "prismjs/components/prism-phpdoc.js";
import 'prismjs/components/prism-go.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-kotlin.js';
import 'prismjs/components/prism-swift.js';
import 'prismjs/components/prism-powershell.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-jsx.js';
import 'prismjs/components/prism-powershell.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-scss.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-systemd.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-yaml.js';
import 'prismjs/themes/prism.css';
import { LegacyRef, useState } from 'react';
type ToastEditorProps = {
  editorRef: LegacyRef<Editor> | null;
  context: string;
  onChange: (e: any) => void;
};
function ToastEditor({ editorRef, context, onChange }: ToastEditorProps) {
  return (
    <Editor
      height="60vh"
      initialValue={context}
      previewStyle="vertical"
      initialEditType="markdown"
      onChange={onChange}
      ref={editorRef}
      plugins={[uml, [codeSyntaxHighlight, { highlighter: Prism }]]}
      theme={'light'}
    />
  );
}

export default ToastEditor;
