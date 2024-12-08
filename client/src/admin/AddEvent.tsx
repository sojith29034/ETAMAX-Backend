import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddEvent = () => {
  const [isTeam, setIsTeam] = useState(false);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');
  const [show, setShow] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const navigate = useNavigate();

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsFeatured(e.target.checked);
  };

  const handleTeamChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIsTeam(event.target.value === 'team');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    // Check if end time is after start time
    if (endTime <= startTime) {
      setMessage('End time must be after the start time');
      setVariant('danger');
      setShow(true);
      return;
    }

    const formData = new FormData(event.target as HTMLFormElement);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/events`, Object.fromEntries(formData));
      // console.log('Event created successfully:', response.data);
      setMessage(`${response.data.eventName} added successfully`);
      setVariant('success');
      setShow(true);

      // Reset form fields and states after successful submission
      (event.target as HTMLFormElement).reset();
      setIsTeam(false);
      setStartTime('');
      setEndTime('');
      setIsFeatured(false);
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
            <Form.Group controlId="maxSeats" className="mb-3">
              <Form.Label>Max Seats</Form.Label>
              <Form.Control type="number" name="maxSeats" placeholder="Enter max seats available" required />
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
              <Form.Control type="time" name="startTime" step="1800" value={startTime}
                onChange={(e) => setStartTime(e.target.value)} required />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="endTime" className="mb-3">
              <Form.Label>End Time</Form.Label>
              <Form.Control type="time" name="endTime" step="1800" value={endTime}
                onChange={(e) => setEndTime(e.target.value)} required />
            </Form.Group>
          </Col>
          <Col className='d-flex align-items-center justify-content-center'>
            <Form.Group controlId="isFeatured" className="mb-3">
              <Form.Check type="checkbox" label="Feature Event?" name="isFeatured" checked={isFeatured} onChange={handleCheckboxChange} />
            </Form.Group>
          </Col>
        </Row>
        
        <Row>
          <Col>
            <Row>
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
          </Col>
          <Col>
            <Form.Group controlId="whatsapp" className="mb-3">
              <Form.Label>WhatsApp Group Link</Form.Label>
              <Form.Control type="text" name="whatsapp" placeholder="Enter WhatsApp Group Link" />
            </Form.Group>
          </Col>
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