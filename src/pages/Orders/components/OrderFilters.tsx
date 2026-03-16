import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { OrderFilters } from '../../../types/order';

interface OrderFiltersProps {
  filters: OrderFilters;
  onFilterChange: (filters: Partial<OrderFilters>) => void;
}

export const OrderFiltersComponent: React.FC<OrderFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const { colors } = useTheme();
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');
  const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
  const [dateTo, setDateTo] = useState(filters.dateTo || '');

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'placed', label: 'Placed' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'packed', label: 'Packed' },
    { value: 'ready_pickup', label: 'Ready for Pickup' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const handleSearch = () => {
    onFilterChange({ search });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    onFilterChange({ status: newStatus });
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDateFrom(newDate);
    onFilterChange({ dateFrom: newDate });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDateTo(newDate);
    onFilterChange({ dateTo: newDate });
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
    onFilterChange({ search: '', status: '', dateFrom: '', dateTo: '' });
  };

  return (
    <div
      style={{
        background: colors.cardBg,
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
        border: `1px solid ${colors.border}`,
        marginBottom: '2rem',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Search */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
            Search Orders
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Order # or customer..."
              style={{
                flex: 1,
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: colors.inputBg,
                color: colors.text,
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                background: colors.buttonGradient,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Search
            </button>
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
            Status
          </label>
          <select
            value={status}
            onChange={handleStatusChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              fontSize: '1rem',
              backgroundColor: colors.inputBg,
              color: colors.text,
            }}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value} style={{ color: '#000000' }}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
              From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={handleDateFromChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: colors.inputBg,
                color: colors.text,
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
              To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={handleDateToChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: colors.inputBg,
                color: colors.text,
              }}
            />
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {(search || status || dateFrom || dateTo) && (
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={clearFilters}
            style={{
              backgroundColor: 'transparent',
              color: colors.accentRed,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
