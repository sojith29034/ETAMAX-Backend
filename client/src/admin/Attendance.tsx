import { useEffect, useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { saveAs } from 'file-saver';

type Event = {
  _id: string;
  eventName: string;
  eventDay: number;
  eventCategory: string;
  isTeamEvent: boolean;
};

type Student = {
  rollNumber: string;
  name: string;
};

type Transaction = {
  eventId: string;
  payment: number;
  teamName?: string;
  teamMembers: string[];
};

const Attendance = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsResponse = await axios.get<Event[]>(`${import.meta.env.VITE_BASE_URL}/api/events`);
        setEvents(eventsResponse.data);

        const studentsResponse = await axios.get<Student[]>(`${import.meta.env.VITE_BASE_URL}/api/students`);
        setStudents(studentsResponse.data);

        const transactionsResponse = await axios.get<Transaction[]>(
          `${import.meta.env.VITE_BASE_URL}/api/transactions`
        );
        setTransactions(transactionsResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  const handleDayCheckboxChange = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleCategoryCheckboxChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(cat => cat !== category) : [...prev, category]
    );
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    events.forEach(event => {
      if (
        (selectedDays.includes(event.eventDay) || selectedDays.length === 0)  &&
        (selectedCategories.includes(event.eventCategory.charAt(0).toUpperCase() + event.eventCategory.slice(1).toLowerCase()) || selectedCategories.length === 0)
      ) {
        const eventTransactions = transactions.filter(
          transaction => transaction.eventId === event._id && transaction.payment === 1
        );

        let currentIndex = 1; 

        const sheetData = eventTransactions.flatMap((transaction) => {
          // Ensure teamMembers is defined before processing
          if (transaction.teamMembers && transaction.teamMembers.length > 0) {
            return transaction.teamMembers.map((memberId, idx) => {
              const student = students.find(student => student.rollNumber === memberId);
              return {
                'Sr. No.': currentIndex++,
                // Add 'Team Name' only for the first member
                ...(transaction.teamMembers.length > 1 && idx === 0
                  ? { 'Team Name': transaction.teamName || 'N/A' }
                  : null),
                'Roll Number': student?.rollNumber || 'Unknown',
                Name: student?.name || 'Unknown',
                Sign: '', // Empty signature field
              };
            });
          }
          return []; // Return an empty array if no teamMembers are defined
        });
        

        if (sheetData.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(sheetData);
          const sheetName = `${event.eventName} (Day ${event.eventDay} - ${event.eventCategory})`;
          XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        }
      }
    });

    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'attendance_sheets.xlsx');
  };

  return (
    <Container>
      <h2 className="text-center">Attendance Sheets</h2>
      <Form className="d-flex flex-row justify-content-around">
        <Form.Group controlId="category">
          <h4>Select Categories</h4>
          {['Technical', 'Cultural', 'Seminar', 'Sports'].map(category => (
            <Form.Check
              type="checkbox"
              key={category}
              label={category}
              value={category}
              onChange={() => handleCategoryCheckboxChange(category)}
            />
          ))}
        </Form.Group>

        <Form.Group controlId="day">
          <h4>Select Days</h4>
          {[1, 2, 3].map(day => (
            <Form.Check
              type="checkbox"
              key={day}
              label={`Day ${day}`}
              value={day}
              onChange={() => handleDayCheckboxChange(day)}
            />
          ))}
          <Button variant="primary" className="mt-3" onClick={exportToExcel}>
            Download Excel
          </Button>
        </Form.Group>
      </Form>
    </Container>
  );
};

export default Attendance;