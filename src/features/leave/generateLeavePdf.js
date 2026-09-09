// src/features/leave/generateLeavePdf.js
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Adjust this path to wherever you place the template image in your project.
// Suggested location: src/assets/leave-form-template.png
import templateUrl from '../../assets/leave-form-template.png';

// ── Page setup — matches the template image's aspect ratio so nothing stretches ──
const IMG_WIDTH_PX = 1501;
const IMG_HEIGHT_PX = 2048;
const SCALE = 612 / IMG_WIDTH_PX;       // fit template width to a 612pt (Letter-width) page
const PAGE_WIDTH = IMG_WIDTH_PX * SCALE;   // ≈ 612
const PAGE_HEIGHT = IMG_HEIGHT_PX * SCALE; // ≈ 835

// ─────────────────────────────────────────────────────────────
// CALIBRATION MODE
// Set this to true, regenerate a PDF, and it will print a red/blue
// coordinate grid (in template-pixel units) directly over the form
// instead of your data. Read the numbers next to whatever field
// needs adjusting, then update the FIELDS map below and set this
// back to false.
// ─────────────────────────────────────────────────────────────
const DEBUG_GRID = false;

// All coordinates are "from the top-left corner, in template-image pixels"
const FIELDS = {
  officeDepartment: { x: 300, y: 350 },
  lastName:         { x: 700, y: 350 },
  firstName:        { x: 900, y: 350 },
  middleName:       { x: 1110, y: 350 },
  dateOfFiling:     { x: 300, y: 470 },
  position:         { x: 640, y: 470 },
  salary:           { x: 1120, y: 470 },

  // 6.A — checkbox position per leave type
  leaveTypeCheckboxes: {
    'Vacation Leave':                     { x: 122, y: 702 },
    'Mandatory/Forced Leave':             { x: 122, y: 742 },
    'Sick Leave':                         { x: 122, y: 782 },
    'Maternity Leave':                    { x: 122, y: 822 },
    'Paternity Leave':                    { x: 122, y: 862 },
    'Special Privilege Leave':            { x: 122, y: 902 },
    'Solo Parent Leave':                  { x: 122, y: 942 },
    'Study Leave':                        { x: 122, y: 982 },
    '10-Day VAWC Leave':                  { x: 122, y: 1022 },
    'Rehabilitation Privilege':           { x: 122, y: 1062 },
    'Special Leave Benefits for Women':   { x: 122, y: 1102 },
    'Special Emergency (Calamity) Leave': { x: 122, y: 1142 },
    'Adoption Leave':                     { x: 122, y: 1182 },
  },
  othersSpecify: { x: 200, y: 1227 },

  // 6.B — conditional detail fields
  vacationWithinPhBox: { x: 802, y: 725 },
  vacationAbroadBox:   { x: 802, y: 765 },
  abroadSpecify:       { x: 1090, y: 765 },
  sickInHospitalBox:   { x: 802, y: 855 },
  sickOutPatientBox:   { x: 802, y: 895 },
  illnessSpecifySick:  { x: 1180, y: 875 },
  illnessSpecifyWomen: { x: 1000, y: 1035 },
  studyMastersBox:     { x: 802, y: 1130 },
  studyBarBoardBox:    { x: 802, y: 1165 },
  othersMonetizeBox:   { x: 802, y: 1220 },
  othersTerminalBox:   { x: 802, y: 1255 },

  // 6.C / 6.D
  workingDays:       { x: 200, y: 1330 },
  inclusiveDates:    { x: 200, y: 1400 },
  commutationNotReq: { x: 802, y: 1330 },
  commutationReq:    { x: 802, y: 1370 },
};

function formatDate(str) {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// EXPORT 1: The Download Trigger
export function downloadPdfBytes(bytes, formData, user) {
  const filenameSafe = (user?.last_name || 'employee').replace(/\s+/g, '-');
  const filingDate = formData?.filingDate || new Date().toISOString().split('T')[0];
  const filename = `Leave-Application-${filenameSafe}-${filingDate}.pdf`;

  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// EXPORT 2: The Core PDF Builder
export async function buildLeavePdfBytes(formData, user) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  const imgBytes = await fetch(templateUrl).then((res) => res.arrayBuffer());
  const templateImage = await pdfDoc.embedPng(imgBytes); // use embedJpg if your file is .jpg
  page.drawImage(templateImage, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const put = (xPx, yPx, str, opts = {}) => {
    if (str === undefined || str === null || str === '') return;
    const x = xPx * SCALE;
    const y = PAGE_HEIGHT - yPx * SCALE;
    page.drawText(String(str), {
      x,
      y,
      size: opts.size || 10,
      font: opts.bold ? fontBold : font,
      color: rgb(0.05, 0.05, 0.15),
    });
  };

  const checkbox = (xPx, yPx) => put(xPx, yPx, 'X', { size: 11, bold: true });

  if (DEBUG_GRID) {
    for (let x = 0; x < IMG_WIDTH_PX; x += 50) {
      page.drawLine({
        start: { x: x * SCALE, y: 0 },
        end: { x: x * SCALE, y: PAGE_HEIGHT },
        thickness: 0.3,
        color: rgb(1, 0, 0),
        opacity: 0.4,
      });
      if (x % 100 === 0) put(x + 2, 20, String(x), { size: 6 });
    }
    for (let y = 0; y < IMG_HEIGHT_PX; y += 50) {
      page.drawLine({
        start: { x: 0, y: PAGE_HEIGHT - y * SCALE },
        end: { x: PAGE_WIDTH, y: PAGE_HEIGHT - y * SCALE },
        thickness: 0.3,
        color: rgb(0, 0, 1),
        opacity: 0.4,
      });
      if (y % 100 === 0) put(4, y + 10, String(y), { size: 6 });
    }
    return await pdfDoc.save();
  }

  // 1–5
  put(FIELDS.officeDepartment.x, FIELDS.officeDepartment.y, user?.department);
  put(FIELDS.lastName.x, FIELDS.lastName.y, user?.last_name);
  put(FIELDS.firstName.x, FIELDS.firstName.y, user?.first_name);
  put(FIELDS.middleName.x, FIELDS.middleName.y, user?.middle_name);
  put(FIELDS.dateOfFiling.x, FIELDS.dateOfFiling.y, formatDate(formData.filingDate));
  put(FIELDS.position.x, FIELDS.position.y, user?.position_title);
  put(
    FIELDS.salary.x,
    FIELDS.salary.y,
    user?.current_salary_amount ? `PHP ${Number(user.current_salary_amount).toLocaleString()}` : ''
  );

  // 6.A
  const typeBox = FIELDS.leaveTypeCheckboxes[formData.leaveType];
  if (typeBox) checkbox(typeBox.x, typeBox.y);
  if (formData.leaveType === 'Others' && formData.othersSpecify) {
    put(FIELDS.othersSpecify.x, FIELDS.othersSpecify.y, formData.othersSpecify);
  }

  // 6.B — only draws what applies to the selected leave type
  if (formData.vacationSplLocation === 'within-ph') {
    checkbox(FIELDS.vacationWithinPhBox.x, FIELDS.vacationWithinPhBox.y);
  }
  if (formData.vacationSplLocation === 'abroad') {
    checkbox(FIELDS.vacationAbroadBox.x, FIELDS.vacationAbroadBox.y);
    put(FIELDS.abroadSpecify.x, FIELDS.abroadSpecify.y, formData.abroadSpecify);
  }
  if (formData.sickLeaveType === 'in-hospital') {
    checkbox(FIELDS.sickInHospitalBox.x, FIELDS.sickInHospitalBox.y);
    put(FIELDS.illnessSpecifySick.x, FIELDS.illnessSpecifySick.y, formData.illnessSpecify);
  }
  if (formData.sickLeaveType === 'out-patient') {
    checkbox(FIELDS.sickOutPatientBox.x, FIELDS.sickOutPatientBox.y);
    put(FIELDS.illnessSpecifySick.x, FIELDS.illnessSpecifySick.y, formData.illnessSpecify);
  }
  if (formData.leaveType === 'Special Leave Benefits for Women' && formData.illnessSpecify) {
    put(FIELDS.illnessSpecifyWomen.x, FIELDS.illnessSpecifyWomen.y, formData.illnessSpecify);
  }
  if (formData.studyLeavePurpose === 'masters') {
    checkbox(FIELDS.studyMastersBox.x, FIELDS.studyMastersBox.y);
  }
  if (formData.studyLeavePurpose === 'bar-board') {
    checkbox(FIELDS.studyBarBoardBox.x, FIELDS.studyBarBoardBox.y);
  }
  if (formData.othersPurpose === 'monetization') {
    checkbox(FIELDS.othersMonetizeBox.x, FIELDS.othersMonetizeBox.y);
  }
  if (formData.othersPurpose === 'terminal-leave') {
    checkbox(FIELDS.othersTerminalBox.x, FIELDS.othersTerminalBox.y);
  }

  // 6.C / 6.D
  const startDate = formData.startDate || formData.inclusiveDateFrom;
  const endDate = formData.endDate || formData.inclusiveDateTo;

  put(FIELDS.workingDays.x, FIELDS.workingDays.y, formData.workingDays);
  put(
    FIELDS.inclusiveDates.x,
    FIELDS.inclusiveDates.y,
    `${formatDate(startDate)} - ${formatDate(endDate)}`
  );
  if (formData.commutation === 'not-requested') {
    checkbox(FIELDS.commutationNotReq.x, FIELDS.commutationNotReq.y);
  }
  if (formData.commutation === 'requested') {
    checkbox(FIELDS.commutationReq.x, FIELDS.commutationReq.y);
  }

  // Return the raw bytes instead of automatically triggering a download
  return await pdfDoc.save();
}