import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';

interface Event {
  _id: string;
  eventName: string;
  eventDay: string;
  eventCategory: string;
  startTime: string;
  endTime: string;
  maxSeats: number;
  entryFees: number;
}

const EventList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    // Fetch events from backend API
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/events');
        setEvents(response.data); // Assuming API response has an array of events
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEvents([]); // Deselect all
    } else {
      setSelectedEvents(events.map(event => event._id)); // Select all
    }
    setSelectAll(!selectAll); // Toggle selectAll state
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEvents(prevSelected => 
      prevSelected.includes(eventId)
        ? prevSelected.filter(id => id !== eventId) // Deselect if already selected
        : [...prevSelected, eventId] // Select if not selected
    );
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await axios.delete(`http://localhost:8080/api/events/${eventId}`);
      setEvents(events.filter(event => event._id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await axios.post('http://localhost:8080/api/events/delete-multiple', { eventIds: selectedEvents });
      setEvents(events.filter(event => !selectedEvents.includes(event._id)));
      setSelectedEvents([]); // Reset selected events after deletion
      setSelectAll(false); // Reset select all checkbox
    } catch (error) {
      console.error('Error deleting selected events:', error);
    }
  };

  return (
    <Container className="mt-4">
      <Row className="mb-3">
        <Col>
          <h2 className="text-center">Event List</h2>
        </Col>
        <Col className="text-end">
          {selectedEvents.length > 0 && (
            <Button variant="danger" onClick={handleBulkDelete}>
              Delete Selected
            </Button>
          )}
        </Col>
      </Row>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox" 
                aria-label="Select all events" 
                checked={selectAll} 
                onChange={handleSelectAll} 
              />
            </th>
            <th>Sr No</th>
            <th>Name</th>
            <th>Day</th>
            <th>Category</th>
            <th>Time</th>
            <th>Limit</th>
            <th>Entry Fee</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <tr key={event._id}>
              <td>
                <input
                  type="checkbox"
                  aria-label={`Select event ${index + 1}`}
                  checked={selectedEvents.includes(event._id)}
                  onChange={() => handleSelectEvent(event._id)}
                />
              </td>
              <td>{index + 1}</td>
              <td>{event.eventName}</td>
              <td>Day {event.eventDay}</td>
              <td style={{ textTransform: 'capitalize' }}>{event.eventCategory}</td>
              <td>{`${event.startTime} - ${event.endTime}`}</td>
              <td>{event.maxSeats}</td>
              <td>{event.entryFees}</td>
              <td>
                <Button variant="info" size="sm" className="me-2">
                  View
                </Button>
                <Button variant="primary" size="sm" className="me-2">
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDeleteEvent(event._id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default EventList;