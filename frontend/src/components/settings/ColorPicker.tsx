import React, { useState, useRef, useEffect } from 'react';
import { SketchPicker, ColorResult } from 'react-color';

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, onChange, disabled = false }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState(color);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentColor(color);
  }, [color]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const handleColorChange = (colorResult: ColorResult) => {
    setCurrentColor(colorResult.hex);
  };

  const handleColorChangeComplete = (colorResult: ColorResult) => {
    onChange(colorResult.hex);
  };

  const handleTogglePicker = () => {
    if (!disabled) {
      setShowPicker(!showPicker);
    }
  };

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="d-flex align-items-center">
        <div
          className="color-preview"
          style={{
            width: '50px',
            height: '38px',
            backgroundColor: currentColor,
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1
          }}
          onClick={handleTogglePicker}
        />
        <input
          type="text"
          className="form-control ms-2"
          value={currentColor}
          onChange={(e) => {
            setCurrentColor(e.target.value);
            if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
              onChange(e.target.value);
            }
          }}
          disabled={disabled}
          placeholder="#000000"
          style={{ maxWidth: '150px' }}
        />
      </div>
      {showPicker && (
        <div
          ref={pickerRef}
          style={{
            position: 'absolute',
            zIndex: 1000,
            marginTop: '8px'
          }}
        >
          <SketchPicker
            color={currentColor}
            onChange={handleColorChange}
            onChangeComplete={handleColorChangeComplete}
          />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
