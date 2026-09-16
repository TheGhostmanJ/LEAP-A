// src/features/leave/generateLeavePdf.js
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

function cleanText(str) {
  if (!str) return '';
  return String(str).replace(/[^\x00-\x7F]/g, '').trim();
}

function formatDate(str) {
  if (!str) return '';
  try {
    const d = new Date(str + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return cleanText(str);
  }
}

// Helper to safely convert various date representations to a localized string
const safeDateStr = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? String(dateVal) : d.toLocaleDateString('en-US');
};

export function downloadPdfBytes(pdfBytes, formData, user) {
  if (!pdfBytes || pdfBytes.byteLength === 0) return;
  const filenameSafe = cleanText(user?.last_name || user?.lastName || 'employee').replace(/\s+/g, '-');
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Leave-Application-${filenameSafe}-${formData?.filingDate || 'form'}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function buildLeavePdfBytes(formData = {}, user = {}) {
  try {
    const res = await fetch(`/leave-form-v2.pdf?v=${Date.now()}`);
    if (!res.ok) throw new Error('Could not find PDF template in public directory.');

    const srcBytes = await res.arrayBuffer();
    const pdfDoc = await PDFDocument.load(srcBytes);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const page = pdfDoc.getPages()[0];
    const form = pdfDoc.getForm();
    const black = rgb(0, 0, 0);

    // Map exact field coordinates
    const fieldMap = {};
    form.getFields().forEach((f) => {
      try {
        const widgets = f.acroField.getWidgets();
        if (widgets && widgets.length > 0) {
          const rect = widgets[0].getRectangle();
          fieldMap[f.getName().trim()] = {
            x: rect.x,
            y: rect.y,
            w: rect.width,
            h: rect.height
          };
        }
      } catch (e) {}
    });

    // Helper: Draws raw text inside field area (No borders attached)
    const drawTextInField = (fieldName, val, fontSize = 9) => {
      const text = cleanText(val);
      const pos = fieldMap[fieldName.trim()];
      if (!text || !pos) return;

      page.drawText(text, {
        x: pos.x + 3,
        y: pos.y + Math.max(2, (pos.h - fontSize) / 2),
        size: fontSize,
        font,
        color: black
      });
    };

    // Helper: Draws checkmark inside box area (No borders attached)
    const drawCheckInField = (fieldName) => {
      const pos = fieldMap[fieldName.trim()];
      if (!pos) return;

      const { x, y, w, h } = pos;
      const p1 = { x: x + w * 0.2, y: y + h * 0.45 };
      const p2 = { x: x + w * 0.45, y: y + h * 0.20 };
      const p3 = { x: x + w * 0.8, y: y + h * 0.75 };

      page.drawLine({ start: p1, end: p2, thickness: 1.5, color: black });
      page.drawLine({ start: p2, end: p3, thickness: 1.5, color: black });
    };

    // ── DATA PREPARATION ──
    const dept = (user?.department || user?.office || '').toUpperCase();
    const lastName = (user?.last_name || user?.lastName || '').toUpperCase();
    const firstName = (user?.first_name || user?.firstName || '').toUpperCase();
    const middleName = (user?.middle_name || user?.middleName || '').toUpperCase();
    const filingDate = formatDate(formData?.filingDate);
    const position = (user?.position_title || user?.positionTitle || user?.position || '').toUpperCase();
    const salary = user?.current_salary_amount || user?.salary
      ? `PHP ${Number(user.current_salary_amount || user.salary).toLocaleString()}`
      : '';

    // --- 1. APPLICANT INFORMATION ---
    drawTextInField('Text3', dept);
    drawTextInField('Text4', lastName);
    drawTextInField('Text5', firstName);
    drawTextInField('Text6', middleName);
    drawTextInField('Text7', filingDate);
    drawTextInField('Text30', position);
    drawTextInField('Text9', salary);

    // --- 2. TYPE OF LEAVE (6.A) ---
    const leaveType = cleanText(formData?.leaveType).toLowerCase();
    if (leaveType === 'vacation leave')                     drawCheckInField('Button10');
    if (leaveType === 'mandatory/forced leave')             drawCheckInField('Button13');
    if (leaveType === 'sick leave')                         drawCheckInField('Button14');
    if (leaveType === 'maternity leave')                    drawCheckInField('Button15');
    if (leaveType === 'paternity leave')                    drawCheckInField('Button 16');
    if (leaveType === 'special privilege leave')            drawCheckInField('Button17');
    if (leaveType === 'solo parent leave')                   drawCheckInField('Button18');
    if (leaveType === 'study leave')                        drawCheckInField('Button19');
    if (leaveType === '10-day vawc leave')                  drawCheckInField('Button20');
    if (leaveType === 'rehabilitation privilege')           drawCheckInField('Button21');
    if (leaveType === 'special leave benefits for women')   drawCheckInField('Button22');
    if (leaveType === 'special emergency (calamity) leave') drawCheckInField('Button23');
    if (leaveType === 'adoption leave')                     drawCheckInField('Button24');

    if (leaveType === 'others') {
      drawTextInField('Text25', formData?.othersSpecify);
    }

    // --- 3. DETAILS OF LEAVE (6.B) ---
    if (formData?.vacationSplLocation === 'within-ph') {
      drawCheckInField('Button26');
      drawTextInField('Text8', formData?.locationSpecify);
    } else if (formData?.vacationSplLocation === 'abroad') {
      drawCheckInField('Button27');
      drawTextInField('Text31', formData?.abroadSpecify);
    }

    if (formData?.sickLeaveType === 'in-hospital') {
      drawCheckInField('Button28');
      drawTextInField('Text32', formData?.illnessSpecify);
    } else if (formData?.sickLeaveType === 'out-patient') {
      drawCheckInField('Button29');
      drawTextInField('Text33', formData?.illnessSpecify);
    }

    if (leaveType === 'special leave benefits for women') {
      drawTextInField('Text34', formData?.illnessSpecify);
    }

    if (leaveType === 'study leave') {
      if (formData?.studyLeavePurpose === 'masters') drawCheckInField('Button35');
      if (formData?.studyLeavePurpose === 'bar-board') drawCheckInField('Button36');
    }

    if (leaveType === 'others') {
      if (formData?.othersPurpose === 'monetization') drawCheckInField('Button39');
      if (formData?.othersPurpose === 'terminal-leave') drawCheckInField('Button38');
    }

    // --- 4. DAYS, DATES & COMMUTATION (6.C / 6.D) ---
    const days = cleanText(formData?.workingDays || '');
    
    // Safely render date ranges using safeDateStr helper
    const dateFrom = safeDateStr(formData?.inclusiveDateFrom);
    const dateTo = safeDateStr(formData?.inclusiveDateTo);
    const inclusiveDatesText = (dateFrom && dateTo) 
      ? `${dateFrom} - ${dateTo}` 
      : (dateFrom || dateTo || '');

    const commutation = cleanText(formData?.commutation).toLowerCase();

    drawTextInField('Text40', days);
    drawTextInField('Text41', inclusiveDatesText);

    if (commutation === 'not-requested') drawCheckInField('Button42');
    if (commutation === 'requested') drawCheckInField('Button 43');

    // --- 5. PERMANENTLY DESTROY ACROFORM FIELDS & OUTLINES ---
    try {
      pdfDoc.catalog.delete(pdfDoc.context.obj('AcroForm'));
      pdfDoc.getPages().forEach((p) => p.node.delete(pdfDoc.context.obj('Annots')));
    } catch (e) {}

    return await pdfDoc.save();
  } catch (err) {
    console.error('PDF GENERATION ERROR:', err);
    throw err;
  }
}

export async function generateLeavePdf(formData, user) {
  const pdfBytes = await buildLeavePdfBytes(formData, user);
  downloadPdfBytes(pdfBytes, formData, user);
}