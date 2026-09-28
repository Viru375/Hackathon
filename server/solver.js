// server/solver.js
// Constraint Satisfaction Problem (CSP) Solver for Smart Timetable & Classroom Scheduler

import { DAYS, TIME_SLOTS, db } from './store.js';

/**
 * Returns allowed lab slots based on student's year/semester rule from Handwritten Note 2:
 * 4th Year (Sem 7-8): Early Morning (Slots 1-2)
 * 3rd Year (Sem 5-6): Afternoon (Slots 4-5)
 * 1st/2nd Year (Sem 1-4): Evening (Slots 6-7)
 */
export function getAllowedLabSlotsForSemester(semesterNumber) {
  const sem = parseInt(semesterNumber, 10);
  if (sem === 7 || sem === 8) {
    // 4th Year -> Early morning (Slots 1 and 2)
    return [1, 2];
  } else if (sem === 5 || sem === 6) {
    // 3rd Year -> Afternoon session (Slots 4 and 5)
    return [4, 5];
  } else {
    // 1st & 2nd Year (Sem 1, 2, 3, 4) -> Evening section (Slots 6 and 7)
    return [6, 7];
  }
}

/**
 * Generates a conflict-free timetable matrix for a given college department, semester, and subjects.
 */
export function generateConflictFreeTimetable({ collegeName, departmentCode, semester, subjects }) {
  const generatedSlots = [];
  const conflictReport = [];
  const occupiedFacultySlots = new Map(); // key: `${facultyId}_${day}_${slotId}`
  const occupiedRoomSlots = new Map();    // key: `${roomId}_${day}_${slotId}`

  // Track existing timetables in memory to avoid cross-department room/faculty conflicts
  db.timetables.forEach((existingTt) => {
    existingTt.slots.forEach((slot) => {
      if (slot.facultyId) {
        occupiedFacultySlots.set(`${slot.facultyId}_${slot.day}_${slot.slotId}`, slot.batchName || 'Other Class');
      }
      if (slot.roomId) {
        occupiedRoomSlots.set(`${slot.roomId}_${slot.day}_${slot.slotId}`, slot.batchName || 'Other Class');
      }
    });
  });

  const semNumber = parseInt(semester, 10);
  const yearGroup = semNumber >= 7 ? '4th Year' : semNumber >= 5 ? '3rd Year' : semNumber >= 3 ? '2nd Year' : '1st Year';
  const batchName = `${departmentCode}-Sem${semester}`;

  // Process each subject requirement
  subjects.forEach((subject) => {
    const isLab = subject.isLab === true || subject.isLab === 'true' || subject.isLab === 'Yes';
    const totalWeeklyLectures = parseInt(subject.lectureHours || 3, 10);
    const labHoursNeeded = isLab ? parseInt(subject.labHours || 2, 10) : 0;
    const primaryFacultyId = Array.isArray(subject.facultyIds) ? subject.facultyIds[0] : subject.facultyId;
    const lectureRoomId = subject.lectureRoomId;
    const labRoomId = subject.labRoomId || lectureRoomId;

    let scheduledLecturesCount = 0;
    let labScheduled = false;

    // First: Schedule Practical Lab Session if required (2 consecutive slots)
    if (isLab) {
      const allowedLabSlotPair = getAllowedLabSlotsForSemester(semNumber);
      const startSlotId = allowedLabSlotPair[0];
      const endSlotId = allowedLabSlotPair[1];

      // Find a day where both lab slots, lab room, and faculty are free
      for (const day of DAYS) {
        const keyFac1 = `${primaryFacultyId}_${day}_${startSlotId}`;
        const keyFac2 = `${primaryFacultyId}_${day}_${endSlotId}`;
        const keyRoom1 = `${labRoomId}_${day}_${startSlotId}`;
        const keyRoom2 = `${labRoomId}_${day}_${endSlotId}`;

        const isFacFree1 = !occupiedFacultySlots.has(keyFac1);
        const isFacFree2 = !occupiedFacultySlots.has(keyFac2);
        const isRoomFree1 = !occupiedRoomSlots.has(keyRoom1);
        const isRoomFree2 = !occupiedRoomSlots.has(keyRoom2);

        if (isFacFree1 && isFacFree2 && isRoomFree1 && isRoomFree2) {
          // Reserve Lab Block
          occupiedFacultySlots.set(keyFac1, batchName);
          occupiedFacultySlots.set(keyFac2, batchName);
          occupiedRoomSlots.set(keyRoom1, batchName);
          occupiedRoomSlots.set(keyRoom2, batchName);

          generatedSlots.push({
            id: `SLOT_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            day,
            slotId: startSlotId,
            subjectName: `${subject.name} (Lab)`,
            subjectCode: subject.code || subject.name,
            facultyId: primaryFacultyId,
            facultyName: db.faculty.find((f) => f.id === primaryFacultyId)?.name || 'Prof. Assigned',
            roomId: labRoomId,
            roomName: db.rooms.find((r) => r.id === labRoomId)?.name || labRoomId,
            isLab: true,
            yearGroup,
            batchName,
            status: 'SCHEDULED'
          });

          generatedSlots.push({
            id: `SLOT_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            day,
            slotId: endSlotId,
            subjectName: `${subject.name} (Lab)`,
            subjectCode: subject.code || subject.name,
            facultyId: primaryFacultyId,
            facultyName: db.faculty.find((f) => f.id === primaryFacultyId)?.name || 'Prof. Assigned',
            roomId: labRoomId,
            roomName: db.rooms.find((r) => r.id === labRoomId)?.name || labRoomId,
            isLab: true,
            yearGroup,
            batchName,
            status: 'SCHEDULED'
          });

          labScheduled = true;
          break;
        }
      }

      if (!labScheduled) {
        conflictReport.push({
          subjectName: subject.name,
          issue: `Could not fit 2-hour Lab block for ${yearGroup} in designated time window (${startSlotId === 1 ? 'Early Morning' : startSlotId === 4 ? 'Afternoon' : 'Evening'}). All slots occupied.`
        });
      }
    }

    // Second: Schedule Theory Lectures (1 hour slots across different days)
    for (const day of DAYS) {
      if (scheduledLecturesCount >= totalWeeklyLectures) break;

      // Avoid scheduling lecture on the same day if lab is already scheduled on that day
      const hasLabOnDay = generatedSlots.some((s) => s.day === day && s.subjectName.includes(subject.name) && s.isLab);
      if (hasLabOnDay) continue;

      for (const slot of TIME_SLOTS) {
        const slotId = slot.id;
        const facKey = `${primaryFacultyId}_${day}_${slotId}`;
        const roomKey = `${lectureRoomId}_${day}_${slotId}`;
        const isBatchBusy = generatedSlots.some((s) => s.day === day && s.slotId === slotId);

        if (!occupiedFacultySlots.has(facKey) && !occupiedRoomSlots.has(roomKey) && !isBatchBusy) {
          occupiedFacultySlots.set(facKey, batchName);
          occupiedRoomSlots.set(roomKey, batchName);

          generatedSlots.push({
            id: `SLOT_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            day,
            slotId,
            subjectName: subject.name,
            subjectCode: subject.code || subject.name,
            facultyId: primaryFacultyId,
            facultyName: db.faculty.find((f) => f.id === primaryFacultyId)?.name || 'Prof. Assigned',
            roomId: lectureRoomId,
            roomName: db.rooms.find((r) => r.id === lectureRoomId)?.name || lectureRoomId,
            isLab: false,
            yearGroup,
            batchName,
            status: 'SCHEDULED'
          });

          scheduledLecturesCount++;
          if (scheduledLecturesCount >= totalWeeklyLectures) break;
        }
      }
    }

    if (scheduledLecturesCount < totalWeeklyLectures) {
      conflictReport.push({
        subjectName: subject.name,
        issue: `Only scheduled ${scheduledLecturesCount}/${totalWeeklyLectures} lectures. Remaining slots had faculty or room conflicts.`
      });
    }
  });

  const timetableId = `TT_${departmentCode}_SEM${semester}_${Date.now()}`;
  const timetableRecord = {
    id: timetableId,
    collegeName: collegeName || 'State Engineering Institute',
    departmentCode,
    semester,
    yearGroup,
    batchName,
    createdAt: new Date().toLocaleString(),
    slots: generatedSlots,
    conflicts: conflictReport
  };

  db.timetables.push(timetableRecord);

  // Add audit log
  db.auditLogs.push({
    id: `LOG_${Date.now()}`,
    type: 'TIMETABLE_CREATED',
    message: `Timetable created for ${batchName} with ${generatedSlots.length} slots.`,
    timestamp: new Date().toLocaleString()
  });

  return timetableRecord;
}
