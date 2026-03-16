import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate } from './formatters';

// Extend jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface OrderData {
  orderNumber: string;
  date: string;
  customerName?: string;
  customerEmail?: string;
  trackingNumber?: string;
  items: Array<{
    title: string;
    sku?: string;
    qty: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  subtotal: number;
  discountTotal?: number;
  shippingTotal?: number;
  grandTotal: number;
  shippingAddress?: {
    companyName?: string;
    contactPerson?: string;
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  boxCount?: number;
  packages?: Array<{
    boxIndex: number;
    weightKg?: number;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
  }>;
}

interface LabelData {
  orderNumber: string;
  vendorName: string;
  vendorAddress?: string;
  customerName: string;
  customerAddress: string;
  boxCount: number;
  boxIndex?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  trackingNumber?: string;
}

export class PDFGenerator {
  /**
   * Generate packing slip PDF
   */
  static generatePackingSlip(order: OrderData): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Header
    doc.setFillColor(13, 26, 99); // #0D1A63
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PACKING SLIP', margin, 25);

    // Order Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Order #: ${order.orderNumber}`, margin, 55);
    doc.text(`Date: ${formatDate(order.date)}`, margin, 62);

    // Customer Info (if available)
    if (order.customerName || order.shippingAddress) {
      doc.setFont('helvetica', 'bold');
      doc.text('Ship To:', pageWidth - margin - 80, 55);
      doc.setFont('helvetica', 'normal');
      
      let y = 62;
      if (order.shippingAddress?.companyName) {
        doc.text(order.shippingAddress.companyName, pageWidth - margin - 80, y);
        y += 7;
      }
      if (order.shippingAddress?.contactPerson) {
        doc.text(order.shippingAddress.contactPerson, pageWidth - margin - 80, y);
        y += 7;
      }
      if (order.shippingAddress?.street) {
        doc.text(order.shippingAddress.street, pageWidth - margin - 80, y);
        y += 7;
      }
      if (order.shippingAddress?.city) {
        const cityLine = `${order.shippingAddress.city} ${order.shippingAddress.postalCode || ''}`;
        doc.text(cityLine, pageWidth - margin - 80, y);
        y += 7;
      }
      if (order.shippingAddress?.country) {
        doc.text(order.shippingAddress.country, pageWidth - margin - 80, y);
      }
    }

    // Items Table
    doc.autoTable({
      startY: 85,
      head: [['Item', 'SKU', 'Qty', 'Unit Price', 'Total']],
      body: order.items.map(item => [
        item.title,
        item.sku || '-',
        item.qty.toString(),
        formatCurrency(item.unitPrice),
        formatCurrency(item.lineTotal),
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: [13, 26, 99],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Totals
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal:', pageWidth - margin - 80, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(order.subtotal), pageWidth - margin - 20, finalY, { align: 'right' });

    let currentY = finalY + 7;
    
    if (order.discountTotal && order.discountTotal > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Discount:', pageWidth - margin - 80, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(`-${formatCurrency(order.discountTotal)}`, pageWidth - margin - 20, currentY, { align: 'right' });
      currentY += 7;
    }

    if (order.shippingTotal && order.shippingTotal > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Shipping:', pageWidth - margin - 80, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrency(order.shippingTotal), pageWidth - margin - 20, currentY, { align: 'right' });
      currentY += 7;
    }

    // Grand Total
    doc.setDrawColor(13, 26, 99);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - margin - 85, currentY - 2, pageWidth - margin - 15, currentY - 2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', pageWidth - margin - 80, currentY + 5);
    doc.setTextColor(13, 26, 99);
    doc.text(formatCurrency(order.grandTotal), pageWidth - margin - 20, currentY + 5, { align: 'right' });

    // Box Count (if applicable)
    if (order.boxCount) {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Boxes: ${order.boxCount}`, margin, currentY + 15);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for your business!', pageWidth / 2, 280, { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, 285, { align: 'center' });

    return doc;
  }

  /**
   * Generate packaging label PDF (multi-page)
   */
  static generatePackagingLabel(order: OrderData, vendorName: string): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    const boxCount = order.boxCount || 1;
    const packages = order.packages || [];

    for (let boxIndex = 1; boxIndex <= boxCount; boxIndex++) {
      if (boxIndex > 1) {
        doc.addPage();
      }

      const pkg = packages.find(p => p.boxIndex === boxIndex);

      // Border
      doc.setDrawColor(13, 26, 99);
      doc.setLineWidth(1);
      doc.rect(margin - 2, margin - 2, pageWidth - (margin * 2) + 4, pageHeight - (margin * 2) + 4);

      // Header
      doc.setFillColor(13, 26, 99);
      doc.rect(margin, margin, pageWidth - (margin * 2), 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('PACKAGING LABEL', pageWidth / 2, margin + 17, { align: 'center' });

      // Box Number
      doc.setTextColor(13, 26, 99);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(`BOX ${boxIndex} of ${boxCount}`, pageWidth / 2, margin + 50, { align: 'center' });

      // From / To Section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('FROM:', margin + 10, margin + 75);
      doc.text('TO:', pageWidth / 2 + 10, margin + 75);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      // Vendor Info
      doc.text(vendorName, margin + 10, margin + 85);
      if (order.shippingAddress?.companyName) {
        doc.text(order.shippingAddress.companyName, margin + 10, margin + 95);
      }
      
      // Customer Address
      let toY = margin + 85;
      if (order.shippingAddress?.contactPerson) {
        doc.text(order.shippingAddress.contactPerson, pageWidth / 2 + 10, toY);
        toY += 10;
      }
      if (order.shippingAddress?.street) {
        doc.text(order.shippingAddress.street, pageWidth / 2 + 10, toY);
        toY += 10;
      }
      if (order.shippingAddress?.city) {
        const cityLine = `${order.shippingAddress.city} ${order.shippingAddress.postalCode || ''}`;
        doc.text(cityLine, pageWidth / 2 + 10, toY);
        toY += 10;
      }
      if (order.shippingAddress?.country) {
        doc.text(order.shippingAddress.country, pageWidth / 2 + 10, toY);
      }

      // Package Details
      const detailsY = Math.max(toY + 20, margin + 150);
      
      doc.setDrawColor(13, 26, 99);
      doc.setLineWidth(0.5);
      doc.line(margin + 10, detailsY, pageWidth - margin - 10, detailsY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('PACKAGE DETAILS', margin + 10, detailsY + 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      let detailsX = margin + 10;
      if (pkg?.weightKg) {
        doc.text(`Weight: ${pkg.weightKg} kg`, detailsX, detailsY + 22);
        detailsX += 70;
      }
      if (pkg?.lengthCm && pkg?.widthCm && pkg?.heightCm) {
        doc.text(`Dimensions: ${pkg.lengthCm} × ${pkg.widthCm} × ${pkg.heightCm} cm`, detailsX, detailsY + 22);
      }

      // Order Reference
      doc.setFont('helvetica', 'bold');
      doc.text('ORDER REF:', margin + 10, detailsY + 40);
      doc.setFont('helvetica', 'normal');
      doc.text(order.orderNumber, margin + 70, detailsY + 40);

      // Tracking (if available)
      if (order.trackingNumber) {
        doc.setFont('helvetica', 'bold');
        doc.text('TRACKING:', margin + 10, detailsY + 52);
        doc.setFont('helvetica', 'normal');
        doc.text(order.trackingNumber, margin + 70, detailsY + 52);
      }

      // QR Code Placeholder
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.rect(pageWidth - margin - 45, detailsY - 5, 35, 35);
      doc.setFontSize(8);
      doc.text('QR Code', pageWidth - margin - 35, detailsY + 20);
      doc.text('Placeholder', pageWidth - margin - 38, detailsY + 28);

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(128, 128, 128);
      doc.text('Senel Express - B2B Marketplace', pageWidth / 2, pageHeight - margin - 10, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - margin - 5, { align: 'center' });
    }

    return doc;
  }

  /**
   * Generate invoice PDF
   */
  static generateInvoice(order: OrderData, vendorName: string): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Header
    doc.setFillColor(13, 26, 99);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', margin, 35);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Senel Express', pageWidth - margin, 25, { align: 'right' });
    doc.text('B2B Marketplace', pageWidth - margin, 32, { align: 'right' });
    doc.text('vendor@senel.com', pageWidth - margin, 39, { align: 'right' });

    // Invoice Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Number:', margin, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(`INV-${order.orderNumber}`, margin + 40, 70);

    doc.setFont('helvetica', 'bold');
    doc.text('Order Number:', margin, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(order.orderNumber, margin + 40, 80);

    doc.setFont('helvetica', 'bold');
    doc.text('Date:', margin, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(order.date), margin + 40, 90);

    // Bill To
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', pageWidth - margin - 100, 70);
    doc.setFont('helvetica', 'normal');
    
    let billToY = 77;
    if (order.shippingAddress?.companyName) {
      doc.text(order.shippingAddress.companyName, pageWidth - margin - 100, billToY);
      billToY += 7;
    }
    if (order.shippingAddress?.contactPerson) {
      doc.text(order.shippingAddress.contactPerson, pageWidth - margin - 100, billToY);
      billToY += 7;
    }
    if (order.shippingAddress?.street) {
      doc.text(order.shippingAddress.street, pageWidth - margin - 100, billToY);
      billToY += 7;
    }
    if (order.shippingAddress?.city) {
      const cityLine = `${order.shippingAddress.city} ${order.shippingAddress.postalCode || ''}`;
      doc.text(cityLine, pageWidth - margin - 100, billToY);
      billToY += 7;
    }
    if (order.shippingAddress?.country) {
      doc.text(order.shippingAddress.country, pageWidth - margin - 100, billToY);
    }

    // Items Table
    doc.autoTable({
      startY: 110,
      head: [['Item', 'SKU', 'Qty', 'Unit Price', 'Total']],
      body: order.items.map(item => [
        item.title,
        item.sku || '-',
        item.qty.toString(),
        formatCurrency(item.unitPrice),
        formatCurrency(item.lineTotal),
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: [13, 26, 99],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      foot: [[
        '',
        '',
        '',
        'Subtotal:',
        formatCurrency(order.subtotal),
      ]],
      footStyles: {
        fontStyle: 'bold',
        fillColor: [245, 245, 245],
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 5;

    // Additional Totals
    if (order.discountTotal || order.shippingTotal) {
      let totalY = finalY + 5;
      
      if (order.discountTotal && order.discountTotal > 0) {
        doc.setFont('helvetica', 'normal');
        doc.text('Discount:', pageWidth - margin - 50, totalY);
        doc.text(`-${formatCurrency(order.discountTotal)}`, pageWidth - margin - 10, totalY, { align: 'right' });
        totalY += 7;
      }

      if (order.shippingTotal && order.shippingTotal > 0) {
        doc.setFont('helvetica', 'normal');
        doc.text('Shipping:', pageWidth - margin - 50, totalY);
        doc.text(formatCurrency(order.shippingTotal), pageWidth - margin - 10, totalY, { align: 'right' });
        totalY += 7;
      }

      // Grand Total
      doc.setDrawColor(13, 26, 99);
      doc.setLineWidth(0.5);
      doc.line(pageWidth - margin - 55, totalY - 2, pageWidth - margin - 5, totalY - 2);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('TOTAL:', pageWidth - margin - 50, totalY + 5);
      doc.setTextColor(13, 26, 99);
      doc.text(formatCurrency(order.grandTotal), pageWidth - margin - 10, totalY + 5, { align: 'right' });
    }

    // Payment Terms
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text('Payment Terms: Due upon receipt', margin, 250);
    doc.text('Bank Transfer to: DE89 3704 0044 0532 0130 00', margin, 257);

    return doc;
  }
}