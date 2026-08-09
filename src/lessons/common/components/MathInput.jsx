import React, { useRef, useEffect } from 'react';
import 'mathlive';

export default function MathInput({ 
  value, 
  onChange, 
  onCommit,
  placeholder, 
  disabled, 
  readOnly, 
  ariaLabel, 
  className = '',
  virtualKeyboardMode = 'auto',
  style
}) {
  const mfRef = useRef(null);

  // Initialize and handle events
  useEffect(() => {
    const mf = mfRef.current;
    if (mf) {
      // Configuration
      mf.mathVirtualKeyboardPolicy = virtualKeyboardMode;
      
      // Events
      const handleInput = () => {
        if (onChange) {
          onChange(mf.value); // Returns LaTeX by default
        }
      };
      
      const handleChange = () => {
        if (onCommit) {
          onCommit(mf.value);
        }
      };

      mf.addEventListener('input', handleInput);
      mf.addEventListener('change', handleChange); // Triggered on enter or blur
      
      return () => {
        mf.removeEventListener('input', handleInput);
        mf.removeEventListener('change', handleChange);
      };
    }
  }, [onChange, onCommit, virtualKeyboardMode]);

  // Sync value from props
  useEffect(() => {
    if (mfRef.current && mfRef.current.value !== value) {
      mfRef.current.value = value || '';
    }
  }, [value]);

  // Provide initial placeholder if any
  useEffect(() => {
    if (mfRef.current && placeholder) {
      // MathLive supports placeholders via \placeholder or you can just rely on empty state
      // Actually, MathLive doesn't have a standard HTML placeholder attribute that works nicely 
      // without inserting \placeholder{} in the MathJSON. 
      // A common workaround is to use CSS pseudo-elements, but for now we just rely on standard behavior.
    }
  }, [placeholder]);

  return (
    <math-field 
      ref={mfRef} 
      disabled={disabled ? '' : undefined} // math-field uses empty string for true
      read-only={readOnly ? '' : undefined}
      aria-label={ariaLabel}
      class={`math-input ${className}`}
      style={{
        width: '100%',
        padding: '0.5rem',
        borderRadius: '0.5rem',
        border: '1px solid #E2E8F0',
        backgroundColor: disabled ? '#F8FAFC' : '#FFFFFF',
        fontSize: '1.25rem',
        outline: 'none',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        ...style
      }}
    >
      {/* Do not put children here, as React might conflict with MathLive's internal DOM */}
    </math-field>
  );
}
