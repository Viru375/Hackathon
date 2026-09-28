// server/substituteFinder.js
// Automated Substitute Search & Notification Algorithm for Smart Timetable Scheduler

import { db } from './store.js';

/**
 * Executes a 4-point verification check to find an optimal substitute faculty for an unavailable lecture slot.
 * Flow from Handwritten Note 4:
 * 1. Checks if substitute is free during day & slot.
 * 2. Checks if substitute is in the same department/field.
 * 3. Checks max daily lecture quota limit.
 * 4. Checks no existing overlap across all timetables.
 */
export function processFacultyUnavailability({ timetableId, slotId, originalFacultyId, reason }) {
  const timetable = db.timetables.find((t) => t.id === timetableId);
  if (!timetable) {
    return { success: false, message: 'Timetable not found.' };
  }

  const slotIndex = timetable.slots.findIndex((s) => s.id === slotId);
  if (slotIndex === -1) {
    return { success: false, message: 'Target lecture slot not found in timetable.' };
  }

  const targetSlot = timetable.slots[slotIndex];
  const originalFaculty = db.faculty.find((f) => f.id === originalFacultyId);
  const nowFormatted = new Date().toLocaleString();

  // Find candidate substitute faculty from 50 faculty members
  const candidateSubstitutes = db.faculty.filter((f) => {
    // Cannot substitute oneself
    if (f.id === originalFacultyId) return false;

    // Check 1: Must belong to same department (or compatible)
    if (f.department !== originalFaculty?.department) return false;

    // Check 2: Must not have marked themselves unavailable for this slot
    const isExplicitlyUnavailable = f.unavailability?.some(
      (un) => un.day === targetSlot.day && un.slotId === targetSlot.slotId
    );
    if (isExplicitlyUnavailable) return false;

    // Check 3: Must not have any existing class assigned in any active timetable for this (day, slotId)
    let hasOverlap = false;
    for (const tt of db.timetables) {
      for (const s of tt.slots) {
        if (s.facultyId === f.id && s.day === targetSlot.day && s.slotId === targetSlot.slotId && s.status !== 'CANCELLED') {
          hasOverlap = true;
          break;
        }
      }
      if (hasOverlap) break;
    }
    if (hasOverlap) return false;

    // Check 4: Must be under daily lecture quota (< 4 lectures on that day)
    let dailyLecturesCount = 0;
    for (const tt of db.timetables) {
      for (const s of tt.slots) {
        if (s.facultyId === f.id && s.day === targetSlot.day && s.status !== 'CANCELLED') {
          dailyLecturesCount++;
        }
      }
    }
    if (dailyLecturesCount >= (f.maxDailyLectures || 4)) return false;

    return true;
  });

  if (candidateSubstitutes.length > 0) {
    // Select best substitute candidate
    const substituteFaculty = candidateSubstitutes[0];
    const timeTrackedComment = `Substituted by ${substituteFaculty.name} on ${nowFormatted}`;

    // Update slot
    targetSlot.facultyId = substituteFaculty.id;
    targetSlot.facultyName = substituteFaculty.name;
    targetSlot.isSubstituted = true;
    targetSlot.originalFacultyName = originalFaculty?.name || 'Original Professor';
    targetSlot.comment = timeTrackedComment;

    // Create notifications for Student, Substitute, Original, and Creator
    const notificationMessage = `ALERT: ${targetSlot.subjectName} for ${targetSlot.batchName} on ${targetSlot.day} (Slot ${targetSlot.slotId}) has been reassigned to ${substituteFaculty.name}. (${timeTrackedComment})`;

    db.notifications.unshift({
      id: `NOTIF_${Date.now()}_1`,
      recipientType: 'BATCH',
      targetBatch: targetSlot.batchName,
      message: notificationMessage,
      timestamp: nowFormatted,
      type: 'SUBSTITUTION_SUCCESS',
      read: false
    });

    db.notifications.unshift({
      id: `NOTIF_${Date.now()}_2`,
      recipientType: 'FACULTY',
      targetFacultyId: substituteFaculty.id,
      message: `You have been assigned as a substitute for ${targetSlot.subjectName} (${targetSlot.batchName}) on ${targetSlot.day} Slot ${targetSlot.slotId}.`,
      timestamp: nowFormatted,
      type: 'SUBSTITUTION_ASSIGNED',
      read: false
    });

    db.auditLogs.unshift({
      id: `LOG_${Date.now()}`,
      type: 'FACULTY_SUBSTITUTED',
      message: `${originalFaculty?.name} marked unavailable. Reassigned to ${substituteFaculty.name} for ${targetSlot.batchName} ${targetSlot.subjectName}.`,
      timestamp: nowFormatted
    });

    return {
      success: true,
      status: 'SUBSTITUTED',
      substituteName: substituteFaculty.name,
      comment: timeTrackedComment,
      message: `Substitute assigned successfully: ${substituteFaculty.name}`
    };
  } else {
    // No substitute found -> Mark lecture as CANCELLED
    const timeTrackedComment = `Lecture cancelled due to faculty unavailability on ${nowFormatted}`;
    targetSlot.status = 'CANCELLED';
    targetSlot.comment = timeTrackedComment;

    const notificationMessage = `ALERT: ${targetSlot.subjectName} for ${targetSlot.batchName} on ${targetSlot.day} (Slot ${targetSlot.slotId}) has been CANCELLED as no substitute professor was available. (${timeTrackedComment})`;

    db.notifications.unshift({
      id: `NOTIF_${Date.now()}_1`,
      recipientType: 'BATCH',
      targetBatch: targetSlot.batchName,
      message: notificationMessage,
      timestamp: nowFormatted,
      type: 'LECTURE_CANCELLED',
      read: false
    });

    db.auditLogs.unshift({
      id: `LOG_${Date.now()}`,
      type: 'LECTURE_CANCELLED',
      message: `${originalFaculty?.name} unavailable. No substitute found. Lecture CANCELLED for ${targetSlot.batchName}.`,
      timestamp: nowFormatted
    });

    return {
      success: true,
      status: 'CANCELLED',
      comment: timeTrackedComment,
      message: 'No substitute found across 50 faculty members. Lecture marked as CANCELLED.'
    };
  }
}
