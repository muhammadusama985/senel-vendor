import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  showText = true,
}) => {

  const sizes = {
    small: { height: 34, textSize: '1rem' },
    medium: { height: 42, textSize: '1.2rem' },
    large: { height: 58, textSize: '1.5rem' },
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <img
        src="/logo.png"
        alt="Senel Express"
        height= "130"
        style={{
          display: 'block',
        }}
      />

      {showText && (
        <span
          style={{
            color: '#ffffff',
            fontWeight: 600,
            fontSize: sizes[size].textSize,
            letterSpacing: '0.5px',
          }}
        >
        </span>
      )}
    </div>
  );
};