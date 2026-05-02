import React from 'react';
import SidePanel from './SidePanel';

export default function FilterPanel({ filters, setFilters, airports, open, setOpen }) {
  return (
    <SidePanel open={open} setOpen={setOpen} zIndex={1200} width={420}>
      <div
        style={{
          background: '#f7fafd',
          borderRadius: 16,
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
          padding: '20px 18px 18px 18px',
          marginBottom: 12,
        }}
      >
        <h2 style={{
          color: '#1976d2',
          fontWeight: 700,
          fontSize: 22,
          margin: '0 0 18px 0',
          letterSpacing: 1,
        }}>Filters</h2>
        {/* From and To on the same line */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label>From:</label>
            <select
              value={filters.from}
              onChange={e => setFilters(f => ({ ...f, from: e.target.value }))}
              style={{ width: '100%', marginTop: 4, borderRadius: 6, padding: 4 }}
            >
              <option value="">Any</option>
              {airports && airports.map(a =>
                <option key={a.code} value={a.code}>{a.code}</option>
              )}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>To:</label>
            <select
              value={filters.to}
              onChange={e => setFilters(f => ({ ...f, to: e.target.value }))}
              style={{ width: '100%', marginTop: 4, borderRadius: 6, padding: 4 }}
            >
              <option value="">Any</option>
              {airports && airports.map(a =>
                <option key={a.code} value={a.code}>{a.code}</option>
              )}
            </select>
          </div>
        </div>
        {/* Departure before/after on the same line */}
        <div style={{ marginBottom: 12 }}>
          <label>Departure:</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <input
              type="datetime-local"
              placeholder="After"
              value={filters.depAfter}
              onChange={e => setFilters(f => ({ ...f, depAfter: e.target.value }))}
              style={{ flex: 1, borderRadius: 6, padding: 4, minWidth: 0 }}
            />
            <input
              type="datetime-local"
              placeholder="Before"
              value={filters.depBefore}
              onChange={e => setFilters(f => ({ ...f, depBefore: e.target.value }))}
              style={{ flex: 1, borderRadius: 6, padding: 4, minWidth: 0 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#888', marginTop: 2 }}>
            <span style={{ flex: 1, textAlign: 'center' }}>After</span>
            <span style={{ flex: 1, textAlign: 'center' }}>Before</span>
          </div>
        </div>
        {/* Arrival before/after on the same line */}
        <div style={{ marginBottom: 12 }}>
          <label>Arrival:</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <input
              type="datetime-local"
              placeholder="After"
              value={filters.arrAfter}
              onChange={e => setFilters(f => ({ ...f, arrAfter: e.target.value }))}
              style={{ flex: 1, borderRadius: 6, padding: 4, minWidth: 0 }}
            />
            <input
              type="datetime-local"
              placeholder="Before"
              value={filters.arrBefore}
              onChange={e => setFilters(f => ({ ...f, arrBefore: e.target.value }))}
              style={{ flex: 1, borderRadius: 6, padding: 4, minWidth: 0 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#888', marginTop: 2 }}>
            <span style={{ flex: 1, textAlign: 'center' }}>After</span>
            <span style={{ flex: 1, textAlign: 'center' }}>Before</span>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Group:</label>
          <input
            type="text"
            value={filters.group}
            onChange={e => setFilters(f => ({ ...f, group: e.target.value }))}
            placeholder="Type group name"
            style={{ width: '100%', marginTop: 4, borderRadius: 6, padding: 4, boxSizing: 'border-box', height: 36 }}
          />
        </div>
      </div>
    </SidePanel>
  );
}
