import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { resolveMediaUrl } from '../../../utils/media';

export interface RichTextEditorHandle {
  /**
   * Insert an <img> tag at the current cursor position inside the editor.
   * Used by the "+ Insert Image" button next to the description so the
   * embedded photo becomes a real image inside the editor (WYSIWYG),
   * not a markdown placeholder.
   */
  insertImage: (url: string, alt?: string) => void;
  /** Move keyboard focus into the editable area. */
  focus: () => void;
}

interface RichTextEditorProps {
  value: string;
  onChange: (next: string) => void;
  /**
   * Image URLs to display BELOW the editor as a thumbnail strip with a
   * delete button on each. The contentEditable never holds any image
   * markup -- so the URL is never written as visible text in the
   * description field. Pairs with onImagesChange / insertImage.
   */
  images?: string[];
  onImagesChange?: (next: string[]) => void;
  /** Used so the parent's "Insert Image" button can call insertImage(). */
  editorRef?: React.Ref<RichTextEditorHandle>;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

/**
 * WYSIWYG rich-text editor. The underlying field is a contentEditable
 * <div>, so formatting (bold / italic / underline / bullets / numbered
 * lists) is applied immediately on the selected text via
 * document.execCommand. The result is stored as an HTML string the
 * parent already passes through (description / descriptionML.*).
 *
 * Existing markdown image references that may already live in the
 * description are left untouched here -- the customer-side renderer
 * handles both formats (see renderDescriptionWithImages in the
 * customer ProductDetailPage).
 *
 * Browser-default behavior handles the auto-incrementing of ordered
 * lists when the user presses Enter inside an <li>, so pressing Enter
 * continues 1 -> 2 -> 3 automatically.
 */
export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  ({ value, onChange, rows = 5, placeholder, disabled, style, images, onImagesChange }, ref) => {
    const contentRef = useRef<HTMLDivElement | null>(null);
    // Set to true right after we push an internal change into state so the
    // controlled-effect below knows to skip its next sync (otherwise the
    // <div> would be reset to the previous string mid-edit).
    const skipNextSync = useRef(false);

    // Controlled sync: when the parent hands us a new value string
    // (e.g. product loaded from the backend, language switched), push it
    // into the <div>. We only do this when the DOM content actually
    // differs so we don't stomp on the user's cursor.
    useEffect(() => {
      const el = contentRef.current;
      if (!el) return;
      if (skipNextSync.current) {
        skipNextSync.current = false;
        return;
      }
      const incoming = value ?? '';
      if (el.innerHTML !== incoming) {
        el.innerHTML = incoming;
      }
    }, [value]);

    const syncToState = useCallback(() => {
      const el = contentRef.current;
      if (!el) return;
      const html = el.innerHTML;
      skipNextSync.current = true;
      onChange(html);
    }, [onChange]);

    useImperativeHandle(
      ref,
      (): RichTextEditorHandle => ({
        insertImage: (url: string) => {
          if (!url) return;
          // The image is NOT inserted inline in the contentEditable -- it
          // is appended to the separate `images` array and rendered as a
          // thumbnail strip UNDER the description. This keeps the URL out
          // of the contentEditable entirely, so it never appears as text
          // in the description.
          if (onImagesChange) {
            const current = images ?? [];
            if (current.indexOf(url) === -1) {
              onImagesChange([...current, url]);
            }
          }
        },
        focus: () => contentRef.current?.focus(),
      }),
      [onImagesChange, images],
    );

    const exec = (cmd: string) => {
      contentRef.current?.focus();
      document.execCommand(cmd, false);
      syncToState();
    };

    const baseButtonStyle: React.CSSProperties = {
      minWidth: 32,
      height: 32,
      padding: '0 8px',
      border: '1px solid #d0d0d0',
      background: '#ffffff',
      color: '#222',
      borderRadius: 6,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '0.85rem',
      fontWeight: 600,
      lineHeight: 1,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    return (
      <div className="rich-text-editor" style={{ width: '100%' }}>
        <div
          className="rich-text-editor-toolbar"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginBottom: 6,
          }}
        >
          <button
            type="button"
            aria-label="Bold"
            title="Bold"
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('bold')}
            style={{ ...baseButtonStyle, fontWeight: 700 }}
          >
            B
          </button>
          <button
            type="button"
            aria-label="Italic"
            title="Italic"
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('italic')}
            style={{ ...baseButtonStyle, fontStyle: 'italic' }}
          >
            I
          </button>
          <button
            type="button"
            aria-label="Underline"
            title="Underline"
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('underline')}
            style={{ ...baseButtonStyle, textDecoration: 'underline' }}
          >
            U
          </button>
          <button
            type="button"
            aria-label="Bulleted list"
            title="Bulleted list"
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('insertUnorderedList')}
            style={baseButtonStyle}
          >
            &bull;
          </button>
          <button
            type="button"
            aria-label="Numbered list"
            title="Numbered list"
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('insertOrderedList')}
            style={baseButtonStyle}
          >
            1.
          </button>
        </div>
        <div
          ref={contentRef}
          className="rte-content"
          contentEditable={disabled ? false : true}
          suppressContentEditableWarning
          onInput={syncToState}
          onBlur={syncToState}
          onKeyDown={(e) => {
            // Browser already handles Enter-inside-<li> continuation for
            // ordered lists (1 -> 2 -> 3). After the browser has done its
            // thing, sync the DOM state back into React.
            if (e.key === 'Enter') {
              setTimeout(syncToState, 0);
            }
          }}
          data-placeholder={placeholder}
          style={{
            minHeight: `${rows * 1.5}em`,
            // Cap the editor area and scroll internally when the content
            // grows past it, instead of stretching the surrounding form
            // grid row to infinity.
            maxHeight: 360,
            overflowY: 'auto',
            border: '1px solid #d0d0d0',
            borderRadius: 8,
            backgroundColor: '#ffffff',
            color: '#222',
            padding: '0.75rem',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
            outline: 'none',
            boxSizing: 'border-box',
            ...style,
          }}
        />
        {images && images.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              marginTop: 6,
            }}
          >
            {images.map((url, idx) => {
              const thumbSrc = resolveMediaUrl(url) || url;
              return (
                <div
                  key={`rte-img-${idx}-${url}`}
                  className="desc-image-chip"
                  title={url}
                >
                  <img
                    src={thumbSrc}
                    alt=""
                    className="desc-image-chip-thumb"
                  />
                  <button
                    type="button"
                    aria-label="Remove this image from the description"
                    className="desc-image-chip-remove"
                    onClick={() => {
                      if (disabled) return;
                      if (onImagesChange) {
                        onImagesChange((images ?? []).filter((u) => u !== url));
                      }
                    }}
                  >
                    &#8722;
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

RichTextEditor.displayName = 'RichTextEditor';