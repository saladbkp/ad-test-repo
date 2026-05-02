import React from 'react';

export default function SidePanel({ open, setOpen, width = 400, zIndex = 1200, children }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: open ? 0 : -width,
      width,
      height: '100vh',
      background: 'rgba(247,250,253,0.7)',
      boxShadow: open ? '2px 0 8px rgba(0,0,0,0.18)' : 'none',
      zIndex,
      transition: 'left 0.3s',
      padding: open ? '24px 20px 20px 20px' : '24px 0 0 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      overflowY: 'auto'
    }}>
      <button
        onClick={() => setOpen(false)}
        style={{
          alignSelf: 'flex-end',
          marginBottom: 10,
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '4px 10px',
          cursor: 'pointer'
        }}
        aria-label="Hide panel"
      >
        ✕
      </button>
      {children}
    </div>
  );
}