import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

const AddEvent = () => {
  const [isTeam, setIsTeam] = useState(false);

  const handleTeamChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIsTeam(event.target.value === 'team');
  };

  return (
    <Container className="my-4">
      <h2 className='text-center'>Add Event</h2>
      <Form>
        <Form.Group controlId="eventName" className="mb-3">
          <Form.Label>Event Name</Form.Label>
          <Form.Control type="text" placeholder="Enter event name" />
        </Form.Group>

        <Form.Group controlId="eventBanner" className="mb-3">
          <Form.Label>Event Banner</Form.Label>
          <Form.Control type="file" />
        </Form.Group>

        <Form.Group controlId="eventDetails" className="mb-3">
          <Form.Label>Details</Form.Label>
          <Form.Control as="textarea" rows={3} placeholder="Enter event details" />
        </Form.Group>

        <Row>
          <Col>
            <Form.Group controlId="entryFees" className="mb-3">
              <Form.Label>Entry Fees</Form.Label>
              <Form.Control type="number" min={0} placeholder="Enter entry fees" />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="eventCategory" className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select>
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
              <Form.Select>
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
              <Form.Control type="time" step="1800" />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="endTime" className="mb-3">
              <Form.Label>End Time</Form.Label>
              <Form.Control type="time" step="1800" />
            </Form.Group>
          </Col>
        </Row>


        <Row>
          <Col>
            <Form.Group controlId="maxSeats" className="mb-3">
              <Form.Label>Max Seats</Form.Label>
              <Form.Control type="number" placeholder="Enter max seats available" />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="individualOrTeam" className="mb-3">
              <Form.Label>Participation Type</Form.Label>
              <Form.Select onChange={handleTeamChange}>
                <option value="individual">Individual</option>
                <option value="team">Team</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col>
            {isTeam && (
              <Form.Group controlId="teamSize" className="mb-3">
                <Form.Label>Team Size</Form.Label>
                <Form.Control type="number" placeholder="Enter max team members" />
              </Form.Group>
            )}
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