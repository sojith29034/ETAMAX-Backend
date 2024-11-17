import { useEffect, useState } from 'react';
import { Container, Form, Table, Button } from 'react-bootstrap';
import axios from 'axios';

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

const Defaulters = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [studentDetails, setStudentDetails] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchEventsAndStudents = async () => {
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

    fetchEventsAndStudents();
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

  const identifyDefaulters = () => {
    return students
      .map(student => {
        const studentEvents = studentDetails
          .filter(transaction => transaction.enrolledId === student.rollNumber && transaction.payment === 1)
          .map(transaction => events.find(event => event._id === transaction.eventId));

        const missingDays = selectedDays.filter(day =>
          !studentEvents.some(event => event && event.eventDay === day)
        );

        const missingCategories = selectedCategories.filter(category =>
          !studentEvents.some(event => event && event.eventCategory.charAt(0).toUpperCase() + event.eventCategory.slice(1).toLowerCase() === category)
        );

        const hasMissing = missingDays.length > 0 || missingCategories.length > 0;

        // Only return an object if there are missing days or categories
        return hasMissing ? { student, missingDays, missingCategories } : null;
      })
      .filter((defaulter): defaulter is { student: Student; missingDays: number[]; missingCategories: string[] } => defaulter !== null);
  };

  const defaulters = identifyDefaulters();

  const exportToCSV = () => {
    const csvContent = [
      ['Roll Number', 'Name', 'Missing Days', 'Missing Categories'],
      ...defaulters.map(({ student, missingDays, missingCategories }) => [
        student.rollNumber,
        student.name,
        missingDays.join(', ') || 'None',
        missingCategories.join(', ') || 'None',
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'defaulters_list.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container>
      <h2 className='text-center'>Defaulter List</h2>
      <Form className='d-flex flex-row justify-content-around'>
        <Form.Group controlId="category">
          <h4>Select Compulsory Categories</h4>
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
          <h4>Select Compulsory Days</h4>
          {[1, 2, 3].map(day => (
            <Form.Check
              type="checkbox"
              key={day}
              label={`Day ${day}`}
              value={day}
              onChange={() => handleDayCheckboxChange(day)}
            />
          ))}
          <Button variant="primary" className="mt-2" onClick={exportToCSV}>
            Download CSV
          </Button>
        </Form.Group>
      </Form>

      {(selectedDays.length > 0 || selectedCategories.length > 0) && (
        <Table variant='dark' striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Name</th>
              <th>Missing Days</th>
              <th>Missing Categories</th>
            </tr>
          </thead>
          <tbody>
            {defaulters.map(({ student, missingDays, missingCategories }) => (
              <tr key={student.rollNumber}>
                <td>{student.rollNumber}</td>
                <td>{student.name}</td>
                <td>{missingDays.length > 0 ? missingDays.join(', ') : 'None'}</td>
                <td>{missingCategories.length > 0 ? missingCategories.join(', ') : 'None'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Defaulters;