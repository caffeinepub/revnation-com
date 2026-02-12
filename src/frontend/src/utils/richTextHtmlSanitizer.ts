/**
 * Dependency-free HTML sanitization utility for rendering stored editor HTML safely.
 * Allows a minimal set of tags and attributes required for rich text formatting, images with captions, and sizing classes.
 */

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a', 'img',
  'blockquote', 'pre', 'code',
  'div', 'span'
];

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  'a': ['href', 'title', 'target', 'rel'],
  'img': ['src', 'alt', 'title', 'width', 'height', 'class'],
  'div': ['class'],
  'span': ['class'],
  'p': ['style'],
  'h1': ['id', 'style'],
  'h2': ['id', 'style'],
  'h3': ['id', 'style'],
  'h4': ['id', 'style'],
  'h5': ['id', 'style'],
  'h6': ['id', 'style'],
};

const ALLOWED_PROTOCOLS = ['http:', 'https:', 'data:'];

// Allowed class names for image sizing
const ALLOWED_CLASSES = ['img-small', 'img-medium', 'img-full', 'image-with-caption-wrapper', 'image-container', 'caption-container', 'caption-display', 'caption-text', 'caption-placeholder', 'editor-image'];

/**
 * Sanitize HTML content for safe rendering
 */
export function sanitizeRichTextHTML(html: string): string {
  // Create a temporary DOM element
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Recursively sanitize nodes
  sanitizeNode(tempDiv);

  return tempDiv.innerHTML;
}

function sanitizeNode(node: Node): void {
  // Process child nodes first (bottom-up)
  const children = Array.from(node.childNodes);
  children.forEach(child => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      sanitizeNode(child);
    }
  });

  // If this is an element node, sanitize it
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();

    // Remove disallowed tags
    if (!ALLOWED_TAGS.includes(tagName)) {
      // Replace with text content
      const textNode = document.createTextNode(element.textContent || '');
      element.parentNode?.replaceChild(textNode, element);
      return;
    }

    // Sanitize attributes
    const allowedAttrs = ALLOWED_ATTRIBUTES[tagName] || [];
    const attrs = Array.from(element.attributes);
    
    attrs.forEach(attr => {
      const attrName = attr.name.toLowerCase();
      
      if (!allowedAttrs.includes(attrName)) {
        element.removeAttribute(attr.name);
        return;
      }

      // Special validation for URLs
      if (attrName === 'href' || attrName === 'src') {
        const value = attr.value.trim();
        
        // Check protocol
        try {
          const url = new URL(value, window.location.href);
          if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
            element.removeAttribute(attr.name);
          }
        } catch {
          // For data URLs and relative URLs
          if (!value.startsWith('data:') && !value.startsWith('/')) {
            element.removeAttribute(attr.name);
          }
        }
      }

      // Sanitize class attribute (allow only safe classes)
      if (attrName === 'class') {
        const classes = attr.value.split(' ').filter(cls => ALLOWED_CLASSES.includes(cls.trim()));
        if (classes.length > 0) {
          element.setAttribute('class', classes.join(' '));
        } else {
          element.removeAttribute('class');
        }
      }

      // Sanitize style attribute (allow only safe properties)
      if (attrName === 'style') {
        const safeStyles = sanitizeStyleAttribute(attr.value);
        if (safeStyles) {
          element.setAttribute('style', safeStyles);
        } else {
          element.removeAttribute('style');
        }
      }
    });
  }
}

function sanitizeStyleAttribute(styleString: string): string {
  const allowedProperties = ['max-width', 'height', 'display', 'margin', 'text-align', 'scroll-margin-top'];
  
  const styles = styleString.split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .filter(s => {
      const [property] = s.split(':').map(p => p.trim());
      return allowedProperties.includes(property.toLowerCase());
    });

  return styles.join('; ');
}
