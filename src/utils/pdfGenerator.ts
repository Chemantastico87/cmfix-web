import { jsPDF } from 'jspdf';
import { Quote, CompanySettings } from '../types';

export async function generateQuotePDF(quote: Quote, settings: CompanySettings): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 18;

  // Header Banner Background
  doc.setFillColor(7, 10, 8); // #070a08
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Accent Line
  doc.setFillColor(34, 197, 94); // #22c55e (CM FIX Green)
  doc.rect(0, 42, pageWidth, 2, 'F');

  // Brand Name & Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('CM FIX', margin, y + 8);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(34, 197, 94);
  doc.text('SERVICIOS TECNOLÓGICOS Y REPARACIONES', margin, y + 14);

  // Quote Number & Date (Right aligned in header)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`PRESUPUESTO: ${quote.quote_number}`, pageWidth - margin, y + 7, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  const dateStr = new Date(quote.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  doc.text(`Fecha de emisión: ${dateStr}`, pageWidth - margin, y + 13, { align: 'right' });
  doc.text(`Válido hasta: ${quote.valid_until}`, pageWidth - margin, y + 18, { align: 'right' });

  y = 52;

  // Customer & Company Info Grid (2 Columns)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, (pageWidth - margin * 2) / 2 - 4, 38, 2, 2, 'F');
  doc.roundedRect(margin + (pageWidth - margin * 2) / 2 + 4, y, (pageWidth - margin * 2) / 2 - 4, 38, 2, 2, 'F');

  // Col 1: Customer Data
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('DATOS DEL CLIENTE', margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Nombre: ${quote.customer?.name || 'Cliente'}`, margin + 5, y + 14);
  doc.text(`Teléfono: ${quote.customer?.phone || 'No indicado'}`, margin + 5, y + 20);
  doc.text(`Email: ${quote.customer?.email || 'No indicado'}`, margin + 5, y + 26);
  if (quote.customer?.address) {
    doc.text(`Dirección: ${quote.customer.address}`, margin + 5, y + 32);
  }

  // Col 2: Company Data
  const col2X = margin + (pageWidth - margin * 2) / 2 + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('EMISOR / TALLER', col2X + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`${settings.company_name} — CIF: ${settings.cif}`, col2X + 5, y + 14);
  doc.text(`Dirección: ${settings.address}, ${settings.city}`, col2X + 5, y + 20);
  doc.text(`Teléfono: ${settings.phone} / WhatsApp: ${settings.whatsapp}`, col2X + 5, y + 26);
  doc.text(`Email: ${settings.email}`, col2X + 5, y + 32);

  y += 44;

  // Device & Problem Card
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`DISPOSITIVO: ${quote.device_brand} ${quote.device_model} (${quote.device_category})`, margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Intervención: ${quote.repair_type}`, margin + 5, y + 13);
  doc.text(`Diagnóstico/Problema: ${quote.issue_description}`, margin + 5, y + 18);

  y += 28;

  // Items Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('CONCEPTO / REPARACIÓN', margin + 4, y + 5.5);
  doc.text('TIPO', margin + 110, y + 5.5);
  doc.text('UDS.', margin + 135, y + 5.5);
  doc.text('IMPORTE', pageWidth - margin - 4, y + 5.5, { align: 'right' });

  y += 8;

  // Items List
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  quote.items.forEach((item, idx) => {
    const rowBg = idx % 2 === 0 ? 255 : 248;
    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');

    doc.text(item.description, margin + 4, y + 5.5);
    doc.text(item.type === 'PART' ? 'Pieza' : 'Mano obra', margin + 110, y + 5.5);
    doc.text(String(item.quantity), margin + 138, y + 5.5);
    doc.text(`${item.price.toFixed(2)} €`, pageWidth - margin - 4, y + 5.5, { align: 'right' });

    y += 8;
  });

  // Table bottom border
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);

  y += 6;

  // Totals Section (Right box)
  const totalsWidth = 70;
  const totalsX = pageWidth - margin - totalsWidth;

  doc.setFontSize(9);
  doc.text('Base Imponible:', totalsX, y);
  doc.text(`${quote.subtotal.toFixed(2)} €`, pageWidth - margin, y, { align: 'right' });

  y += 6;
  doc.text(`IVA (${quote.vat_rate}%):`, totalsX, y);
  doc.text(`${quote.vat_amount.toFixed(2)} €`, pageWidth - margin, y, { align: 'right' });

  y += 7;
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(totalsX - 4, y - 5, totalsWidth + 4, 11, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(21, 128, 61);
  doc.text('TOTAL:', totalsX, y + 2.5);
  doc.text(`${quote.total.toFixed(2)} €`, pageWidth - margin, y + 2.5, { align: 'right' });

  // Orientative Badge note if applicable
  y += 14;
  if (quote.is_orientative) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(217, 119, 6);
    doc.text('* Presupuesto orientativo sujeto a verificación técnica física en taller.', margin, y);
    y += 6;
  }

  // Terms and Warranty Conditions
  y = Math.max(y, 220);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 36, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TÉRMINOS Y CONDICIONES DE LA REPARACIÓN', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const termsText = doc.splitTextToSize(
    `${settings.warranty_terms} El cliente autoriza expresamente a CM FIX a la manipulación técnica necesaria para diagnóstico y sustitución de piezas. Pasados 30 días desde la notificación de finalización sin ser retirado el equipo, se devengarán gastos de almacenaje. ${settings.legal_notice}`,
    pageWidth - margin * 2 - 8
  );
  doc.text(termsText, margin + 4, y + 12);

  // Signatures Area
  y += 42;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.line(margin + 15, y + 10, margin + 65, y + 10);
  doc.text('Firma Taller CM FIX', margin + 25, y + 14);

  doc.line(pageWidth - margin - 65, y + 10, pageWidth - margin - 15, y + 10);
  doc.text('Conforme el Cliente', pageWidth - margin - 55, y + 14);

  // Save the document
  doc.save(`Presupuesto_${quote.quote_number}.pdf`);
}
