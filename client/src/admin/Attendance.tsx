import { useEffect, useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { saveAs } from 'file-saver';

// Define types for your data
type Event = {
  _id: string;
  eventName: string;
  eventDay: number;
  eventCategory: string;
};

type Student = {
  rollNumber: string;
  name: string;
};

type Transaction = {
  enrolledId: string;
  eventId: string;
  payment: number;
};

const Attendance = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentDetails, setStudentDetails] = useState<Transaction[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/events`);
        setEvents(eventsResponse.data);

        const studentsResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/students`);
        setStudents(studentsResponse.data);

        const transactionsResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/transactions`);
        setStudentDetails(transactionsResponse.data);
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
        (selectedDays.includes(event.eventDay) || selectedDays.length === 0) &&
        (selectedCategories.includes(event.eventCategory.charAt(0).toUpperCase() + event.eventCategory.slice(1).toLowerCase()) || selectedCategories.length === 0)
      ) {
        const sheetData = students
          .filter(student =>
            studentDetails.some(
              detail =>
                detail.enrolledId === student.rollNumber &&
                detail.eventId === event._id &&
                detail.payment === 1
            )
          )
          .map(student => {
            return {
              'Roll Number': student.rollNumber,
              Name: student.name,
              Sign: '', // Empty string for the 'Sign' field
            };
          });

        if (sheetData.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(sheetData);
          XLSX.utils.book_append_sheet(workbook, worksheet, event.eventName);
        }
      }
    });

    // Generate the workbook as a Blob and download it
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });

    // Use `saveAs` from `file-saver` to handle the file download
    saveAs(blob, 'attendance_sheets.xlsx');
  };

  return (
    <Container>
      <h2 className='text-center'>Attendance Sheets</h2>
      <Form className='d-flex flex-row justify-content-around'>
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
        </Form.Group>
      </Form>
      <Button variant="primary" className="mt-3" onClick={exportToExcel}>
        Download Excel
      </Button>
    </Container>
  );
};

export default Attendance;