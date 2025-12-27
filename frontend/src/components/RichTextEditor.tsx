import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2 } from 'lucide-react';

interface RichTextEditorProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

export default function RichTextEditor({ onSubmit, disabled }: RichTextEditorProps) {
  const [charCount, setCharCount] = useState(0);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Paste or type your medical document here...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none border border-gray-300 rounded-md',
      },
    },
    onUpdate: ({ editor }) => {
      setCharCount(editor.getText().length);
    },
  });

  const handleSubmit = () => {
    if (editor) {
      const text = editor.getText();
      if (text.trim()) {
        onSubmit(text);
      }
    }
  };

  const handleClear = () => {
    if (editor) {
      editor.commands.clearContent();
      setCharCount(0);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2 border-b pb-4">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${
            editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          } hover:bg-blue-50`}
          title="Bold"
        >
          <Bold size={20} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${
            editor.isActive('italic') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          } hover:bg-blue-50`}
          title="Italic"
        >
          <Italic size={20} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded ${
            editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          } hover:bg-blue-50`}
          title="Heading 1"
        >
          <Heading1 size={20} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          } hover:bg-blue-50`}
          title="Heading 2"
        >
          <Heading2 size={20} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${
            editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          } hover:bg-blue-50`}
          title="Bullet List"
        >
          <List size={20} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded ${
            editor.isActive('orderedList') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          } hover:bg-blue-50`}
          title="Numbered List"
        >
          <ListOrdered size={20} />
        </button>
      </div>

      <EditorContent editor={editor} />

      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-gray-500">{charCount} characters</span>
        <div className="space-x-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || charCount === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Anonymize
          </button>
        </div>
      </div>
    </div>
  );
}
