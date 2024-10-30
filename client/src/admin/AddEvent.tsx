import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddEvent = () => {
  const [isTeam, setIsTeam] = useState(false);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const handleTeamChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIsTeam(event.target.value === 'team');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    const formData = new FormData(event.target as HTMLFormElement);

    try {
      const response = await axios.post('http://localhost:8080/api/events', Object.fromEntries(formData));
      // console.log('Event created successfully:', response.data);
      setMessage(`${response.data.eventName} added successfully`);
      setVariant('success');
      setShow(true);

      // Reset form fields and states after successful submission
      (event.target as HTMLFormElement).reset();
      setIsTeam(false);
    } catch (error) {
      console.error('Error creating event:', error);
      setMessage('Failed to add event');
      setVariant('danger');
      setShow(true)
    }
  };

  return (
    <Container className="my-4">
      <Button variant="success" onClick={() => navigate('/admin')} className='d-none'>
        Event List
      </Button>
      <h2 className='text-center'>Add Event</h2>
      {show &&
        <Alert variant={variant} onClose={() => setShow(false)} dismissible>
          <Alert.Heading><h5>{message}</h5></Alert.Heading>
        </Alert>
      }
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="eventName" className="mb-3">
          <Form.Label>Event Name</Form.Label>
          <Form.Control type="text" name="eventName" placeholder="Enter event name" required />
        </Form.Group>

        <Form.Group controlId="eventDetails" className="mb-3">
          <Form.Label>Details</Form.Label>
          <Form.Control as="textarea" name="eventDetails" rows={3} placeholder="Enter event details" required />
        </Form.Group>

        <Row>
          <Col>
            <Form.Group controlId="entryFees" className="mb-3">
              <Form.Label>Entry Fees</Form.Label>
              <Form.Control type="number" name="entryFees" min={0} placeholder="Enter entry fees" required />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="eventCategory" className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select name="eventCategory" required>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="technical">Technical</option>
                <option value="seminar">Seminar</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="eventDay" className="mb-3">
              <Form.Label>Day</Form.Label>
              <Form.Select name="eventDay" required>
                <option value="1">Day 1</option>
                <option value="2">Day 2</option>
                <option value="3">Day 3</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Group controlId="startTime" className="mb-3">
              <Form.Label>Start Time</Form.Label>
              <Form.Control type="time" name="startTime" step="1800" required />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="endTime" className="mb-3">
              <Form.Label>End Time</Form.Label>
              <Form.Control type="time" name="endTime" step="1800" required />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Group controlId="maxSeats" className="mb-3">
              <Form.Label>Max Seats</Form.Label>
              <Form.Control type="number" name="maxSeats" placeholder="Enter max seats available" required />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="individualOrTeam" className="mb-3">
              <Form.Label>Participation Type</Form.Label>
              <Form.Select name="individualOrTeam" onChange={handleTeamChange} required>
                <option value="individual">Individual</option>
                <option value="team">Team</option>
              </Form.Select>
            </Form.Group>
          </Col>
          {isTeam && (
            <Col>
              <Form.Group controlId="teamSize" className="mb-3">
                <Form.Label>Team Size</Form.Label>
                <Form.Control type="number" name="teamSize" placeholder="Enter max team members" />
              </Form.Group>
            </Col>
          )}
        </Row>

        <div className="d-flex justify-content-center">
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </div>

      </Form>
    </Container>
  );
};

export default AddEvent;