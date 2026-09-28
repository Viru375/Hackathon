// server/store.js
// Centralized Data Store & Pre-seeded Dataset for Smart Timetable & Classroom Scheduler

export const DEPARTMENTS = [
  { id: 'CSE', name: 'Computer Science & Engineering', code: 'CSE' },
  { id: 'IT', name: 'Information Technology', code: 'IT' },
  { id: 'ME', name: 'Mechanical Engineering', code: 'ME' },
  { id: 'EEE', name: 'Electrical & Electronics Engineering', code: 'EEE' },
  { id: 'CE', name: 'Civil Engineering', code: 'CE' }
];

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

// Days updated to Monday - Friday (5 working days)
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Time slots updated to match exact user specifications:
// Morning: 10:30 - 12:30 (Slots 1 & 2)
// 45 Min Lunch Break: 12:30 - 1:15
// Afternoon: 1:15 - 3:15 (Slots 3 & 4)
// 15 Min Tea Break: 3:15 - 3:30
// Evening: 3:30 - 5:30 (Slots 5 & 6)
export const TIME_SLOTS = [
  { id: 1, label: '10:30 AM - 11:30 AM', period: 'Morning Session' },
  { id: 2, label: '11:30 AM - 12:30 PM', period: 'Morning Session' },
  { id: 3, label: '01:15 PM - 02:15 PM', period: 'Afternoon Session' },
  { id: 4, label: '02:15 PM - 03:15 PM', period: 'Afternoon Session' },
  { id: 5, label: '03:30 PM - 04:30 PM', period: 'Evening Session' },
  { id: 6, label: '04:30 PM - 05:30 PM', period: 'Evening Session' }
];

export const BREAK_TIMES = [
  { id: 'LUNCH', label: 'Lunch Break (45 Mins)', time: '12:30 PM - 01:15 PM', afterSlot: 2 },
  { id: 'TEA', label: 'Tea Break (15 Mins)', time: '03:15 PM - 03:30 PM', afterSlot: 4 }
];

// Generate 50 realistic Faculty Members across 5 branches
const firstNames = ['Rajesh', 'Ananya', 'Vikram', 'Meera', 'Suresh', 'Priya', 'Amit', 'Neha', 'Rohan', 'Kavita', 'Sanjay', 'Pooja', 'Arjun', 'Sneha', 'Rahul', 'Divya', 'Deepak', 'Swati', 'Alok', 'Ritu'];
const lastNames = ['Sharma', 'Verma', 'Patel', 'Kumar', 'Singh', 'Rao', 'Gupta', 'Joshi', 'Nair', 'Deshmukh', 'Chowdhury', 'Reddy', 'Banerjee', 'Mehta', 'Bhat', 'Saxena', 'Mishra', 'Kapoor'];

export function generateInitialFaculty() {
  const facultyList = [];
  let idCounter = 1;

  DEPARTMENTS.forEach((dept) => {
    for (let i = 1; i <= 10; i++) {
      const fName = firstNames[(idCounter - 1) % firstNames.length];
      const lName = lastNames[(idCounter + i) % lastNames.length];
      const fullName = `Prof. ${fName} ${lName}`;
      const email = `${fName.toLowerCase()}.${lName.toLowerCase()}@college.edu`;
      const username = `${fName.toLowerCase()}_${lName.toLowerCase()}`;

      facultyList.push({
        id: `FAC_${idCounter.toString().padStart(3, '0')}`,
        name: fullName,
        email: email,
        username: username,
        department: dept.code,
        maxDailyLectures: 4,
        unavailability: []
      });
      idCounter++;
    }
  });

  return facultyList;
}

export function generateInitialRooms() {
  const rooms = [];
  // 10 Lecture Rooms
  for (let i = 101; i <= 110; i++) {
    rooms.push({
      id: `ROOM_${i}`,
      name: `Room ${i}`,
      type: 'LECTURE',
      capacity: 60
    });
  }
  // 6 Specialized Labs
  rooms.push({ id: 'LAB_CS1', name: 'CS Computing Lab 1', type: 'LAB', capacity: 40 });
  rooms.push({ id: 'LAB_CS2', name: 'CS Advanced AI Lab 2', type: 'LAB', capacity: 40 });
  rooms.push({ id: 'LAB_MECH', name: 'Mechanical Workshop Lab', type: 'LAB', capacity: 40 });
  rooms.push({ id: 'LAB_EEE', name: 'Electrical Systems Lab', type: 'LAB', capacity: 40 });
  rooms.push({ id: 'LAB_CIVIL', name: 'Civil Material Testing Lab', type: 'LAB', capacity: 40 });
  rooms.push({ id: 'LAB_ECE', name: 'Electronics Hardware Lab', type: 'LAB', capacity: 40 });

  return rooms;
}

export const db = {
  faculty: generateInitialFaculty(),
  rooms: generateInitialRooms(),
  departments: DEPARTMENTS,
  timetables: [],
  notifications: [
    {
      id: 'NOTIF_001',
      recipientType: 'ALL',
      message: 'Timetable slots updated: Mon-Fri (10:30-12:30, 1:15-3:15, 3:30-5:30) with 45m Lunch & 15m Tea break.',
      timestamp: new Date().toLocaleString(),
      read: false
    }
  ],
  auditLogs: []
};
