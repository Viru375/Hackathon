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

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TIME_SLOTS = [
  { id: 1, label: '08:00 AM - 09:00 AM', period: 'Morning' },
  { id: 2, label: '09:00 AM - 10:00 AM', period: 'Morning' },
  { id: 3, label: '10:15 AM - 11:15 AM', period: 'Mid-Morning' },
  { id: 4, label: '01:00 PM - 02:00 PM', period: 'Afternoon' },
  { id: 5, label: '02:00 PM - 03:00 PM', period: 'Afternoon' },
  { id: 6, label: '04:00 PM - 05:00 PM', period: 'Evening' },
  { id: 7, label: '05:00 PM - 06:00 PM', period: 'Evening' }
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
        password: 'faculty123',
        department: dept.code,
        maxDailyLectures: 4,
        unavailability: [] // array of { day, slotId }
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

// In-Memory Database State with Initial Seed Data
export const db = {
  faculty: generateInitialFaculty(),
  rooms: generateInitialRooms(),
  departments: DEPARTMENTS,
  timetables: [], // Array of generated schedules
  notifications: [
    {
      id: 'NOTIF_001',
      recipientType: 'ALL',
      message: 'Welcome to Smart Timetable System! Pre-seeded with 50 Faculty members & 5 Branches.',
      timestamp: new Date().toLocaleString(),
      read: false
    }
  ],
  auditLogs: []
};
