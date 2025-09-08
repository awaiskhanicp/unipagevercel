'use client';

import { useEffect, useRef } from 'react';

const SummernoteEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    let $note;
    let $;

    const initEditor = async () => {
      try {
        // Load jQuery and Summernote
        const [jquery, summernoteJS, summernoteCSS] = await Promise.all([
          import('jquery').then(jq => {
            $ = jq.default;
            window.$ = $;
            window.jQuery = $;
            return $;
          }),
          import('summernote/dist/summernote-lite.js'),
          import('summernote/dist/summernote-lite.css'),
        ]);

        if (!editorRef.current) return;

        $note = $(editorRef.current);
        
        // Destroy existing instance if exists
        if ($note.summernote) {
          $note.summernote('destroy');
        }

        // Initialize Summernote
        $note.summernote({
          placeholder: 'Write something...',
          tabsize: 2,
          height: 200,
          focus: false,
          toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'italic', 'underline', 'clear']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link', 'picture', 'video']],
            ['view', ['fullscreen', 'codeview', 'help']],
          ],
          callbacks: {
            // Main onChange event
            onChange: function (contents) {
              if (onChange && typeof onChange === 'function') {
                onChange(contents);
              }
            },
            // Additional events to ensure content capture
            onKeyup: function (e) {
              const contents = $note.summernote('code');
              if (onChange && typeof onChange === 'function') {
                onChange(contents);
              }
            },
            onPaste: function (e) {
              setTimeout(() => {
                const contents = $note.summernote('code');
                if (onChange && typeof onChange === 'function') {
                  onChange(contents);
                }
              }, 100);
            },
            onImageUpload: function (files, editor, $editable) {
              // Handle image upload if needed
              const contents = $note.summernote('code');
              if (onChange && typeof onChange === 'function') {
                onChange(contents);
              }
            }
          },
        });

        // Set initial value after initialization
        if (value) {
          $note.summernote('code', value);
        }

        // Add manual event listeners for better content capture
        $note.on('summernote.change', function () {
          const contents = $note.summernote('code');
          if (onChange && typeof onChange === 'function') {
            onChange(contents);
          }
        });

      } catch (error) {
        console.error('Error initializing SummernoteEditor:', error);
      }
    };

    initEditor();

    return () => {
      if ($note && $note.summernote) {
        try {
          $note.summernote('destroy');
        } catch (error) {
          console.error('Error destroying SummernoteEditor:', error);
        }
      }
    };
  }, []);

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorRef.current && window.$ && window.$(editorRef.current).summernote) {
      const currentContent = window.$(editorRef.current).summernote('code');
      if (currentContent !== value) {
        window.$(editorRef.current).summernote('code', value || '');
      }
    }
  }, [value]);

  return <div ref={editorRef} />;
};

export default SummernoteEditor;