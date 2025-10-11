import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Portal Component
 * Adapted from Facit template for CashFlow v3.0
 * Renders children into a DOM node outside of the parent component hierarchy
 */

const Portal = ({ children, id = 'portal-root' }) => {
  const portalRoot = useRef(null);

  useEffect(() => {
    // Try to find existing portal root
    let element = document.getElementById(id);

    // If not found, create it
    if (!element) {
      element = document.createElement('div');
      element.id = id;
      document.body.appendChild(element);
    }

    portalRoot.current = element;

    // Cleanup: Remove portal root if it was created by this instance
    // and there are no more children
    return () => {
      if (
        portalRoot.current &&
        portalRoot.current.childNodes.length === 0 &&
        portalRoot.current.parentNode
      ) {
        portalRoot.current.parentNode.removeChild(portalRoot.current);
      }
    };
  }, [id]);

  // Don't render anything until we have a portal root
  if (!portalRoot.current) return null;

  return createPortal(children, portalRoot.current);
};

export default Portal;
