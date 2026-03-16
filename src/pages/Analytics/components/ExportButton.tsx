import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useI18n } from '../../../context/I18nContext';
import { DateRange } from '../../../types/analytics';
import { exportService } from '../../../services/export.service';

interface ExportButtonProps {
  dateRange: DateRange;
  data?: any;
  type: 'sales' | 'products' | 'performance';
}

export const ExportButton: React.FC<ExportButtonProps> = ({ dateRange, data, type }) => {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [showOptions, setShowOptions] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setExporting(true);
    try {
      await exportService.exportReport(type, format, dateRange, data);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
      setShowOptions(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={exporting}
        style={{
          background: colors.buttonGradient,
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          padding: '0.75rem 1.5rem',
          cursor: exporting ? 'not-allowed' : 'pointer',
          opacity: exporting ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span>Export</span>
        {exporting ? t('exporting') : t('exportReport')}
      </button>

      {showOptions && !exporting && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            background: colors.cardBg,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
            overflow: 'hidden',
            zIndex: 1000,
            minWidth: '150px',
            border: `1px solid ${colors.border}`,
          }}
        >
          <button
            onClick={() => handleExport('csv')}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              borderBottom: `1px solid ${colors.border}`,
              color: colors.text,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.sidebarHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {t('csvLabel')}
          </button>
          <button
            onClick={() => handleExport('excel')}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              borderBottom: `1px solid ${colors.border}`,
              color: colors.text,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.sidebarHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {t('excelLabel')}
          </button>
          <button
            onClick={() => handleExport('pdf')}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              color: colors.text,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.sidebarHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {t('pdfLabel')}
          </button>
        </div>
      )}
    </div>
  );
};

