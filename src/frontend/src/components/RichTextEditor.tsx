import { useEffect, useRef, useState } from 'react';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Image, Maximize2, Minimize2, Maximize } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onUpdate: (content: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Custom rich text editor with image support, resizing presets, inline captions, and paste sanitization.
 * Supports inserting images as base64 data URLs with contextual resize menu and editable captions.
 */
export default function RichTextEditor({
  content,
  onUpdate,
  placeholder = 'Start typing...',
  className = '',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedImage, setSelectedImage] = useState<HTMLElement | null>(null);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [imageMenuPosition, setImageMenuPosition] = useState({ top: 0, left: 0 });
  const lastSelectionRange = useRef<Range | null>(null);

  // Initialize content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  // Handle image selection
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const imageWrapper = target.closest('.image-with-caption-wrapper');
      
      if (imageWrapper && editorRef.current?.contains(imageWrapper as Node)) {
        const wrapper = imageWrapper as HTMLElement;
        setSelectedImage(wrapper);
        
        // Position menu near the image
        const rect = wrapper.getBoundingClientRect();
        const editorRect = editorRef.current!.getBoundingClientRect();
        setImageMenuPosition({
          top: rect.top - editorRect.top - 40,
          left: rect.left - editorRect.left + rect.width / 2 - 150,
        });
        setShowImageMenu(true);
      } else {
        setSelectedImage(null);
        setShowImageMenu(false);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Save selection range when editor loses focus
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      lastSelectionRange.current = selection.getRangeAt(0);
    }
  };

  // Restore selection range
  const restoreSelection = () => {
    if (lastSelectionRange.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(lastSelectionRange.current);
      }
    }
  };

  // Handle paste event with sanitization
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const clipboardData = e.clipboardData;
    const htmlData = clipboardData.getData('text/html');
    const textData = clipboardData.getData('text/plain');

    let cleanedContent: string;

    if (htmlData) {
      cleanedContent = sanitizePastedHTML(htmlData);
    } else {
      const sanitizedText = sanitizePastedText(textData);
      cleanedContent = sanitizedText
        .split('\n\n')
        .map(para => para.trim())
        .filter(para => para.length > 0)
        .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
        .join('');
    }

    // Insert cleaned content at cursor position
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cleanedContent;
      
      const fragment = document.createDocumentFragment();
      let lastNode: Node | null = null;
      while (tempDiv.firstChild) {
        lastNode = fragment.appendChild(tempDiv.firstChild);
      }
      
      range.insertNode(fragment);
      
      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    if (editorRef.current) {
      onUpdate(editorRef.current.innerHTML);
    }
  };

  // Handle input changes
  const handleInput = () => {
    if (editorRef.current) {
      onUpdate(editorRef.current.innerHTML);
    }
  };

  // Toolbar commands
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    if (editorRef.current) {
      onUpdate(editorRef.current.innerHTML);
    }
  };

  const formatBlock = (tag: string) => {
    document.execCommand('formatBlock', false, tag);
    editorRef.current?.focus();
    if (editorRef.current) {
      onUpdate(editorRef.current.innerHTML);
    }
  };

  // Handle image upload
  const handleImageUpload = () => {
    saveSelection();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      
      editorRef.current?.focus();
      restoreSelection();

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Create image wrapper with caption
        const wrapper = document.createElement('div');
        wrapper.className = 'image-with-caption-wrapper img-medium';
        wrapper.contentEditable = 'false';
        
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';
        
        const img = document.createElement('img');
        img.src = base64Data;
        img.alt = file.name;
        img.className = 'editor-image';
        
        const captionContainer = document.createElement('div');
        captionContainer.className = 'caption-container';
        
        const captionDisplay = document.createElement('div');
        captionDisplay.className = 'caption-display';
        captionDisplay.contentEditable = 'true';
        
        const captionPlaceholder = document.createElement('span');
        captionPlaceholder.className = 'caption-placeholder';
        captionPlaceholder.textContent = 'Click to add caption...';
        
        captionDisplay.appendChild(captionPlaceholder);
        captionContainer.appendChild(captionDisplay);
        imageContainer.appendChild(img);
        wrapper.appendChild(imageContainer);
        wrapper.appendChild(captionContainer);
        
        // Handle caption editing
        captionDisplay.addEventListener('focus', () => {
          if (captionPlaceholder.parentNode === captionDisplay) {
            captionDisplay.removeChild(captionPlaceholder);
          }
        });
        
        captionDisplay.addEventListener('blur', () => {
          if (captionDisplay.textContent?.trim() === '') {
            captionDisplay.innerHTML = '';
            captionDisplay.appendChild(captionPlaceholder);
          }
        });
        
        range.deleteContents();
        range.insertNode(wrapper);
        
        range.setStartAfter(wrapper);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        if (editorRef.current) {
          const wrapper = document.createElement('div');
          wrapper.className = 'image-with-caption-wrapper img-medium';
          wrapper.contentEditable = 'false';
          
          const imageContainer = document.createElement('div');
          imageContainer.className = 'image-container';
          
          const img = document.createElement('img');
          img.src = base64Data;
          img.alt = file.name;
          img.className = 'editor-image';
          
          const captionContainer = document.createElement('div');
          captionContainer.className = 'caption-container';
          
          const captionDisplay = document.createElement('div');
          captionDisplay.className = 'caption-display';
          captionDisplay.contentEditable = 'true';
          
          const captionPlaceholder = document.createElement('span');
          captionPlaceholder.className = 'caption-placeholder';
          captionPlaceholder.textContent = 'Click to add caption...';
          
          captionDisplay.appendChild(captionPlaceholder);
          captionContainer.appendChild(captionDisplay);
          imageContainer.appendChild(img);
          wrapper.appendChild(imageContainer);
          wrapper.appendChild(captionContainer);
          
          editorRef.current.appendChild(wrapper);
        }
      }

      if (editorRef.current) {
        onUpdate(editorRef.current.innerHTML);
      }
    };

    reader.onerror = () => {
      alert('Failed to read image file');
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSizeChange = (size: string) => {
    if (selectedImage) {
      selectedImage.className = `image-with-caption-wrapper ${size}`;
      setShowImageMenu(false);
      if (editorRef.current) {
        onUpdate(editorRef.current.innerHTML);
      }
    }
  };

  const isEmpty = !content || content === '<p><br></p>' || content.trim() === '';

  return (
    <div className="border rounded-md relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="px-3 py-1 rounded text-sm font-medium transition-colors hover:bg-muted"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="px-3 py-1 rounded text-sm italic transition-colors hover:bg-muted"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <div className="w-px bg-border mx-1" />
        <button
          type="button"
          onClick={() => formatBlock('h1')}
          className="px-3 py-1 rounded text-sm font-bold transition-colors hover:bg-muted"
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => formatBlock('h2')}
          className="px-3 py-1 rounded text-sm font-bold transition-colors hover:bg-muted"
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => formatBlock('h3')}
          className="px-3 py-1 rounded text-sm font-bold transition-colors hover:bg-muted"
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>
        <div className="w-px bg-border mx-1" />
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="px-3 py-1 rounded text-sm transition-colors hover:bg-muted"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="px-3 py-1 rounded text-sm transition-colors hover:bg-muted"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <div className="w-px bg-border mx-1" />
        <button
          type="button"
          onClick={handleImageUpload}
          className="px-3 py-1 rounded text-sm transition-colors hover:bg-muted"
          title="Insert Image"
        >
          <Image className="h-4 w-4" />
        </button>
      </div>

      {/* Image Resize Menu */}
      {showImageMenu && (
        <div
          className="absolute z-10 bg-background border rounded-md shadow-lg p-1 flex gap-1"
          style={{
            top: `${imageMenuPosition.top}px`,
            left: `${imageMenuPosition.left}px`,
          }}
        >
          <button
            type="button"
            onClick={() => handleSizeChange('img-small')}
            className="px-3 py-1.5 rounded text-xs font-medium transition-colors hover:bg-muted whitespace-nowrap"
            title="Small"
          >
            <Minimize2 className="h-3.5 w-3.5 inline mr-1" />
            Small
          </button>
          <button
            type="button"
            onClick={() => handleSizeChange('img-medium')}
            className="px-3 py-1.5 rounded text-xs font-medium transition-colors hover:bg-muted whitespace-nowrap"
            title="Medium"
          >
            <Maximize2 className="h-3.5 w-3.5 inline mr-1" />
            Medium
          </button>
          <button
            type="button"
            onClick={() => handleSizeChange('img-full')}
            className="px-3 py-1.5 rounded text-xs font-medium transition-colors hover:bg-muted whitespace-nowrap"
            title="Full Width"
          >
            <Maximize className="h-3.5 w-3.5 inline mr-1" />
            Full Width
          </button>
        </div>
      )}

      {/* Editor Content */}
      <div className="relative p-4">
        <div
          ref={editorRef}
          contentEditable
          onPaste={handlePaste}
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            saveSelection();
          }}
          className={`prose prose-sm sm:prose lg:prose-lg focus:outline-none min-h-[200px] ${className}`}
          suppressContentEditableWarning
        />
        {isEmpty && !isFocused && (
          <p className="text-muted-foreground text-sm pointer-events-none absolute top-4 left-4">
            {placeholder}
          </p>
        )}
      </div>
    </div>
  );
}

// Paste sanitization helpers
function sanitizePastedHTML(html: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  stripInlineStyles(tempDiv);
  normalizeParagraphs(tempDiv);
  removeEmptyParagraphs(tempDiv);
  return tempDiv.innerHTML;
}

function stripInlineStyles(element: HTMLElement): void {
  if (element.hasAttribute('style')) {
    element.removeAttribute('style');
  }

  const inlineStyleTags = ['font', 'span'];
  const children = Array.from(element.children);

  children.forEach((child) => {
    if (child instanceof HTMLElement) {
      if (inlineStyleTags.includes(child.tagName.toLowerCase())) {
        const hasSemanticAttributes = 
          child.hasAttribute('data-') || 
          child.className.length > 0;
        
        if (!hasSemanticAttributes) {
          while (child.firstChild) {
            element.insertBefore(child.firstChild, child);
          }
          element.removeChild(child);
          return;
        }
      }
      stripInlineStyles(child);
    }
  });

  const allElements = element.querySelectorAll('*');
  allElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      el.removeAttribute('color');
      el.removeAttribute('face');
      el.removeAttribute('size');
    }
  });
}

function normalizeParagraphs(element: HTMLElement): void {
  const divs = Array.from(element.querySelectorAll('div'));
  divs.forEach((div) => {
    if (isInlineContent(div)) {
      const p = document.createElement('p');
      while (div.firstChild) {
        p.appendChild(div.firstChild);
      }
      div.parentNode?.replaceChild(p, div);
    }
  });

  const allElements = element.querySelectorAll('*');
  allElements.forEach((el) => {
    const children = Array.from(el.childNodes);
    let consecutiveBrCount = 0;

    children.forEach((node) => {
      if (node.nodeName === 'BR') {
        consecutiveBrCount++;
        if (consecutiveBrCount > 1) {
          node.parentNode?.removeChild(node);
        }
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === '') {
        // Skip whitespace
      } else {
        consecutiveBrCount = 0;
      }
    });
  });

  const paragraphs = element.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
  paragraphs.forEach((p) => {
    while (p.lastChild && p.lastChild.nodeName === 'BR') {
      p.removeChild(p.lastChild);
    }
  });
}

function isInlineContent(element: HTMLElement): boolean {
  const blockElements = ['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'PRE'];
  
  for (const child of Array.from(element.children)) {
    if (blockElements.includes(child.tagName)) {
      return false;
    }
  }
  
  return true;
}

function removeEmptyParagraphs(element: HTMLElement): void {
  const paragraphs = Array.from(element.querySelectorAll('p'));
  
  paragraphs.forEach((p) => {
    const textContent = p.textContent?.trim() || '';
    const hasOnlyBr = Array.from(p.childNodes).every(
      (node) => node.nodeName === 'BR' || (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim())
    );

    if (textContent === '' || hasOnlyBr) {
      p.parentNode?.removeChild(p);
    }
  });
}

function sanitizePastedText(text: string): string {
  return text.replace(/\n{3,}/g, '\n\n');
}
