import { DateRange } from '../types/analytics';

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const toCsv = (rows: Record<string, any>[]) => {
  if (!rows.length) return '';

  const headers = Object.keys(rows[0]);
  const escapeValue = (value: any) => {
    const str = String(value ?? '');
    return `"${str.replace(/"/g, '""')}"`;
  };

  const csvRows = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escapeValue(row[header])).join(',')),
  ];

  return csvRows.join('\n');
};

export const exportService = {
  async exportReport(
    type: 'sales' | 'products' | 'performance',
    format: 'csv' | 'excel' | 'pdf',
    dateRange: DateRange,
    data?: any
  ) {
    const baseName = `${type}-report-${dateRange.startDate}-to-${dateRange.endDate}`;

    if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const content = `
        <html>
          <head>
            <title>${baseName}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 24px;
                color: #111;
              }
              h1 {
                margin-bottom: 8px;
              }
              pre {
                white-space: pre-wrap;
                word-break: break-word;
                background: #f5f5f5;
                padding: 16px;
                border-radius: 8px;
              }
            </style>
          </head>
          <body>
            <h1>${baseName}</h1>
            <p>${dateRange.startDate} to ${dateRange.endDate}</p>
            <pre>${JSON.stringify(data, null, 2)}</pre>
          </body>
        </html>
      `;

      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      return;
    }

    let rows: Record<string, any>[] = [];

    if (type === 'sales') {
      rows = data?.daily?.map((item: any) => ({
        date: item.date,
        revenue: item.revenue,
        orders: item.orders,
      })) || [];
    } else if (type === 'products') {
      rows = (data || []).map((item: any) => ({
        id: item._id,
        title: item.title,
        sku: item.sku,
        quantity: item.quantity,
        revenue: item.revenue,
        orders: item.orders,
        trend: item.trend,
      }));
    } else {
      rows = (data?.metrics || []).map((item: any) => ({
        label: item.label,
        value: item.value,
        previousValue: item.previousValue,
        change: item.change,
        trend: item.trend,
      }));
    }

    const csv = toCsv(rows);
    const mimeType =
      format === 'excel'
        ? 'application/vnd.ms-excel;charset=utf-8;'
        : 'text/csv;charset=utf-8;';

    const extension = format === 'excel' ? 'xls' : 'csv';
    const blob = new Blob([csv], { type: mimeType });
    downloadBlob(blob, `${baseName}.${extension}`);
  },
};