import { jsPDF } from 'jspdf';
import { Room, Participant, Item, Payment, Currency, CURRENCY_SYMBOLS } from '@/types';
import { getItemTotal, getParticipantTotal, getRoomTotals } from './calculations';

interface PDFGeneratorOptions {
  room: Room;
  participants: Participant[];
  items: Item[];
  payments: Payment[];
  language: 'fr' | 'en';
}

const translations = {
  fr: {
    receipt: 'Reçu',
    date: 'Date',
    time: 'Heure',
    itemDetails: 'DÉTAIL DES ARTICLES',
    globalSummary: 'RÉCAPITULATIF GLOBAL',
    totalItems: 'Total des articles',
    tip: 'Pourboire',
    tax: 'Taxe (TVA)',
    totalToPay: 'TOTAL À PAYER',
    perPersonDetails: 'DÉTAIL PAR UTILISATEUR',
    subtotal: 'Sous-total',
    tipShare: 'Part pourboire',
    taxShare: 'Part taxe',
    total: 'Total',
    thanks: 'Merci d\'avoir utilisé ReceiptSplit',
    slogan: 'Partagez et divisez simplement',
    participants: 'participants',
    user: 'Utilisateur',
  },
  en: {
    receipt: 'Receipt',
    date: 'Date',
    time: 'Time',
    itemDetails: 'ITEM DETAILS',
    globalSummary: 'GLOBAL SUMMARY',
    totalItems: 'Total items',
    tip: 'Tip',
    tax: 'Tax (VAT)',
    totalToPay: 'TOTAL TO PAY',
    perPersonDetails: 'PER PERSON BREAKDOWN',
    subtotal: 'Subtotal',
    tipShare: 'Tip share',
    taxShare: 'Tax share',
    total: 'Total',
    thanks: 'Thank you for using ReceiptSplit',
    slogan: 'Share and split simply',
    participants: 'participants',
    user: 'User',
  },
};

// Colors
const GOLD = '#c9a227';
const NAVY = '#1a2744';
const GRAY = '#666666';
const LIGHT_GRAY = '#999999';

export function generateReceiptPDF(options: PDFGeneratorOptions): void {
  const { room, participants, items, payments, language } = options;
  const t = translations[language];
  const currency = room.currency as Currency;
  const symbol = CURRENCY_SYMBOLS[currency];

  // A4 format for better readability
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 25;
  const contentWidth = pageWidth - 2 * margin;

  let y = 20;

  // Helper to format currency
  const formatAmount = (amount: number) => `${amount.toFixed(2)} ${symbol}`;

  // Helper to draw centered text
  const drawCenteredText = (text: string, yPos: number, size: number, color: string = '#000000', bold: boolean = false) => {
    doc.setFontSize(size);
    doc.setTextColor(color);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(text, pageWidth / 2, yPos, { align: 'center' });
  };

  // Helper to draw left-right text
  const drawRow = (left: string, right: string, yPos: number, size: number = 10, leftColor: string = GRAY, rightColor: string = '#000000', bold: boolean = false) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(leftColor);
    doc.text(left, margin, yPos);
    doc.setTextColor(rightColor);
    doc.text(right, pageWidth - margin, yPos, { align: 'right' });
  };

  // Helper to draw dotted line between text
  const drawDottedRow = (left: string, right: string, yPos: number, size: number = 10, color: string = GRAY, indent: number = 0) => {
    doc.setFontSize(size);
    doc.setTextColor(color);
    doc.setFont('helvetica', 'normal');
    doc.text(left, margin + indent, yPos);

    const rightX = pageWidth - margin;
    doc.text(right, rightX, yPos, { align: 'right' });

    // Draw dots
    const leftWidth = doc.getTextWidth(left) + 5;
    const rightWidth = doc.getTextWidth(right) + 5;
    const dotsStart = margin + indent + leftWidth;
    const dotsEnd = rightX - rightWidth;

    if (dotsEnd > dotsStart + 10) {
      doc.setDrawColor(200, 200, 200);
      doc.setLineDashPattern([1, 2], 0);
      doc.line(dotsStart, yPos - 1, dotsEnd, yPos - 1);
      doc.setLineDashPattern([], 0);
    }
  };

  // Helper to draw section separator
  const drawSeparator = (yPos: number, style: 'solid' | 'dashed' = 'solid') => {
    doc.setDrawColor(180, 180, 180);
    if (style === 'dashed') {
      doc.setLineDashPattern([2, 2], 0);
    }
    doc.line(margin, yPos, pageWidth - margin, yPos);
    doc.setLineDashPattern([], 0);
  };

  // ===== HEADER =====
  // Draw logo circles
  const logoY = y + 8;
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.8);
  doc.circle(pageWidth / 2 - 12, logoY, 8, 'S');
  doc.setDrawColor(NAVY);
  doc.circle(pageWidth / 2 + 12, logoY, 8, 'S');

  // Logo text
  doc.setFontSize(18);
  doc.setTextColor(NAVY);
  doc.setFont('helvetica', 'bold');
  doc.text('ReceiptSplit', pageWidth / 2 + 30, logoY + 3);

  y += 28;

  // Title
  const title = room.title || t.receipt;
  drawCenteredText(title, y, 16, NAVY, true);
  y += 6;

  // Subtitle with participants count
  drawCenteredText(`(${participants.length} ${t.participants})`, y, 10, LIGHT_GRAY);
  y += 10;

  drawSeparator(y);
  y += 8;

  // Date and Time
  const createdDate = new Date(room.created_at);
  const dateStr = createdDate.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = createdDate.toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.setFontSize(10);
  doc.setTextColor(GRAY);
  doc.text(`${t.date} : ${dateStr}`, margin, y);
  doc.text(`${t.time} : ${timeStr}`, pageWidth - margin, y, { align: 'right' });
  y += 6;

  drawSeparator(y, 'dashed');
  y += 8;

  // ===== ITEM DETAILS =====
  doc.setFontSize(11);
  doc.setTextColor(NAVY);
  doc.setFont('helvetica', 'bold');
  doc.text(t.itemDetails, margin, y);
  y += 8;

  // Group items by participant
  participants.forEach((participant, idx) => {
    const pItems = items.filter(i => i.created_by_participant_id === participant.id);
    if (pItems.length === 0) return;

    const pTotal = getParticipantTotal(participant.id, items, 0, 0);

    // Participant header with background
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y - 4, contentWidth, 7, 'F');

    doc.setFontSize(10);
    doc.setTextColor(NAVY);
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.user} ${idx + 1} – ${participant.name}`, margin + 3, y);
    doc.text(formatAmount(pTotal.subtotal), pageWidth - margin - 3, y, { align: 'right' });
    y += 8;

    // Items
    pItems.forEach(item => {
      const itemTotal = getItemTotal(item);
      const itemName = item.quantity > 1 ? `- ${item.name} x${item.quantity}` : `- ${item.name}`;
      drawDottedRow(itemName, formatAmount(itemTotal), y, 9, GRAY);
      y += 5;
    });

    // Subtotal for this participant
    doc.setFillColor(250, 250, 250);
    doc.rect(margin + contentWidth * 0.35, y - 3, contentWidth * 0.65, 6, 'F');
    doc.setFontSize(9);
    doc.setTextColor(GRAY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${t.subtotal} ${participant.name}`, margin + contentWidth * 0.37, y);
    doc.setFont('helvetica', 'bold');
    doc.text(formatAmount(pTotal.subtotal), pageWidth - margin - 3, y, { align: 'right' });
    y += 8;
  });

  y += 2;
  drawSeparator(y);
  y += 8;

  // ===== GLOBAL SUMMARY =====
  const roomTotals = getRoomTotals(room, participants, items, payments);

  doc.setFontSize(11);
  doc.setTextColor(NAVY);
  doc.setFont('helvetica', 'bold');
  doc.text(t.globalSummary, margin, y);
  doc.text(formatAmount(roomTotals.grandTotal), pageWidth - margin, y, { align: 'right' });
  y += 7;

  // Total items
  drawDottedRow(t.totalItems, formatAmount(roomTotals.subtotal), y, 10, GRAY);
  y += 5;

  // Tip
  if (Number(room.tip_percent) > 0) {
    drawDottedRow(`${t.tip} (${room.tip_percent}%)`, formatAmount(roomTotals.tipTotal), y, 10, GRAY);
    y += 5;
  }

  // Tax
  if (Number(room.tax_percent) > 0) {
    drawDottedRow(t.tax, formatAmount(roomTotals.taxTotal), y, 10, GRAY);
    y += 5;
  }

  y += 4;

  // TOTAL TO PAY - Gold highlighted box
  doc.setFillColor(201, 162, 39); // Gold
  doc.roundedRect(margin, y - 4, contentWidth, 10, 2, 2, 'F');

  doc.setFontSize(11);
  doc.setTextColor('#FFFFFF');
  doc.setFont('helvetica', 'bold');
  doc.text(t.totalToPay, margin + 4, y + 2);
  doc.text(formatAmount(roomTotals.grandTotal), pageWidth - margin - 4, y + 2, { align: 'right' });
  y += 16;

  drawSeparator(y);
  y += 8;

  // ===== PER PERSON DETAILS =====
  doc.setFontSize(11);
  doc.setTextColor(NAVY);
  doc.setFont('helvetica', 'bold');
  doc.text(t.perPersonDetails, margin, y);
  y += 8;

  // Create columns for participants (2 columns)
  const colWidth = (contentWidth - 10) / 2;
  let col = 0;
  const startY = y;
  let maxY = y;

  const participantsWithItems = participants.filter(p =>
    items.some(i => i.created_by_participant_id === p.id)
  );

  participantsWithItems.forEach((participant, idx) => {
    const pTotal = getParticipantTotal(participant.id, items, Number(room.tip_percent), Number(room.tax_percent));
    const xOffset = margin + col * (colWidth + 10);
    const currentY = col === 0 ? y : (idx % 2 === 0 ? maxY + 6 : y);

    if (col === 0 && idx > 1) {
      y = maxY + 6;
    }

    const boxY = col === 0 ? y : y;

    // Draw box
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(252, 252, 252);
    doc.roundedRect(xOffset, boxY - 2, colWidth, 28, 2, 2, 'FD');

    // Name header
    doc.setFontSize(10);
    doc.setTextColor(NAVY);
    doc.setFont('helvetica', 'bold');
    doc.text(participant.name, xOffset + 3, boxY + 4);
    doc.text(formatAmount(pTotal.total), xOffset + colWidth - 3, boxY + 4, { align: 'right' });

    // Details
    doc.setFontSize(8);
    doc.setTextColor(GRAY);
    doc.setFont('helvetica', 'normal');

    let detailY = boxY + 10;
    doc.text(`- ${t.subtotal}`, xOffset + 3, detailY);
    doc.text(formatAmount(pTotal.subtotal), xOffset + colWidth - 3, detailY, { align: 'right' });

    if (Number(room.tip_percent) > 0) {
      detailY += 4;
      doc.text(`- ${t.tipShare}`, xOffset + 3, detailY);
      doc.text(formatAmount(pTotal.tip), xOffset + colWidth - 3, detailY, { align: 'right' });
    }

    if (Number(room.tax_percent) > 0) {
      detailY += 4;
      doc.text(`- ${t.taxShare}`, xOffset + 3, detailY);
      doc.text(formatAmount(pTotal.tax), xOffset + colWidth - 3, detailY, { align: 'right' });
    }

    // Total line
    doc.setDrawColor(200, 200, 200);
    doc.line(xOffset + 3, boxY + 21, xOffset + colWidth - 3, boxY + 21);

    doc.setFontSize(9);
    doc.setTextColor(GOLD);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total ${participant.name}`, xOffset + 3, boxY + 26);
    doc.text(formatAmount(pTotal.total), xOffset + colWidth - 3, boxY + 26, { align: 'right' });

    maxY = Math.max(maxY, boxY + 28);

    col++;
    if (col >= 2) {
      col = 0;
      y = maxY + 4;
    }
  });

  y = maxY + 10;

  // ===== FOOTER =====
  drawSeparator(y);
  y += 8;

  drawCenteredText(t.thanks, y, 11, NAVY, true);
  y += 5;
  drawCenteredText(t.slogan, y, 9, GOLD);

  // Generate filename
  const filename = `${room.title || 'receipt'}-${room.id}.pdf`;

  // Mobile-compatible download approach
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);

  // Check if on mobile (iOS Safari or other mobile browsers)
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIOSSafari = /iPhone|iPad|iPod/i.test(navigator.userAgent) && /Safari/i.test(navigator.userAgent);

  if (isIOSSafari) {
    // iOS Safari: open in new tab (allows user to share/save)
    window.open(blobUrl, '_blank');
  } else if (isMobile) {
    // Other mobile browsers: try download, fallback to new tab
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Fallback: also open in new tab in case download doesn't work
    setTimeout(() => {
      window.open(blobUrl, '_blank');
    }, 500);
  } else {
    // Desktop: standard download
    doc.save(filename);
  }

  // Clean up blob URL after a delay
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 10000);
}
