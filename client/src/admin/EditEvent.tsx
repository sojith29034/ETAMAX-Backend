import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditEvent = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  const [isTeam, setIsTeam] = useState(false);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');
  const [show, setShow] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<{
    eventName: string;
    eventBanner: string | File;
    eventDetails: string;
    entryFees: number;
    eventCategory: string;
    eventDay: string;
    startTime: string;
    endTime: string;
    maxSeats: number;
    individualOrTeam: string;
    teamSize: number | undefined;
    isFeatured: boolean;
    whatsapp: string;
    dept: number;
  }>({
    eventName: '',
    eventBanner: '',
    eventDetails: '',
    entryFees: 0,
    eventCategory: '',
    eventDay: '',
    startTime: '',
    endTime: '',
    maxSeats: 0,
    individualOrTeam: 'individual',
    teamSize: undefined,
    isFeatured: false,
    whatsapp: '',
    dept: 0,
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/events/${eventId}`
        );
        const data: unknown = response.data;

        if (
          data &&
          typeof data === "object" &&
          "teamSize" in data &&
          typeof data.teamSize === "number"
        ) {
          const teamSize = (data as { teamSize: number }).teamSize;

          setFormData({
            ...(data as {
              eventName: string;
              eventBanner: string | File;
              eventDetails: string;
              entryFees: number;
              eventCategory: string;
              eventDay: string;
              startTime: string;
              endTime: string;
              maxSeats: number;
              individualOrTeam: string;
              teamSize: number | undefined;
              isFeatured: boolean;
              whatsapp: string;
              dept: number;
            }),
            individualOrTeam: teamSize > 1 ? "team" : "individual",
            teamSize,
          });
        } else {
          console.error("Data is not in the expected format:", data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching event data:", error);
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);



  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      isFeatured: checked,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'entryFees' || name === 'maxSeats' ? Number(value) : value,
    }));
    
    if (name === 'individualOrTeam') {
      const isTeamSelected = value === 'team';
      setIsTeam(isTeamSelected);
      setFormData((prevData) => ({
        ...prevData,
        teamSize: isTeamSelected ? prevData.teamSize || 2 : 1,
      }));
    }
  };

  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       if (typeof reader.result === 'string') {
  //         setPreview(reader.result);
  //       }
  //     };
  //     reader.readAsDataURL(file);
  
  //     setFormData((prevData) => ({
  //       ...prevData,
  //       eventBanner: file,
  //     }));
  //   }
  // };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPreview(reader.result);
          setFormData((prevData) => ({
            ...prevData,
            eventBanner: typeof prevData.eventBanner === 'string' ? prevData.eventBanner : prevData.eventBanner
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('eventName', formData.eventName);
    formDataToSubmit.append('eventDetails', formData.eventDetails);
    formDataToSubmit.append('entryFees', String(formData.entryFees));
    formDataToSubmit.append('eventCategory', formData.eventCategory);
    formDataToSubmit.append('eventDay', formData.eventDay);
    formDataToSubmit.append('startTime', formData.startTime);
    formDataToSubmit.append('endTime', formData.endTime);
    formDataToSubmit.append('maxSeats', String(formData.maxSeats));
    formDataToSubmit.append('individualOrTeam', formData.individualOrTeam);
    formDataToSubmit.append('teamSize', String(formData.teamSize || 0));
    formDataToSubmit.append('isFeatured', String(formData.isFeatured));
    formDataToSubmit.append('whatsapp', formData.whatsapp);
    formDataToSubmit.append('dept', String(formData.dept));
  
    if (typeof formData.eventBanner === "string") {
      formDataToSubmit.append("eventBanner", formData.eventBanner);
    }
  
    try {
      console.log('Submitting:', formDataToSubmit);
  
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/events/${eventId}`,
        formDataToSubmit,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
  
      console.log(response.data);
      setMessage('Event updated successfully');
      setVariant('success');
      setShow(true);
    } catch (error) {
      console.error('Error updating event:', error);
      setMessage('Failed to update event');
      setVariant('danger');
      setShow(true);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container className="my-4">
      <Button
        variant="success"
        onClick={() => navigate("/admin")}
        style={{ display: "none" }}
      >
        Event List
      </Button>
      <h2 className="text-center">Edit Event</h2>
      {show && (
        <Alert variant={variant} onClose={() => setShow(false)} dismissible>
          <Alert.Heading>{message}</Alert.Heading>
        </Alert>
      )}
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col>
            <Form.Group controlId="eventName" className="mb-3">
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="eventBanner" className="mb-3">
              <Form.Label>Event Banner</Form.Label>
              <Form.Control
                type="file"
                name="eventBanner"
                accept=".jpg, .jpeg, .png"
                onChange={handleImageChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={11}>
            <Form.Group controlId="eventDetails" className="mb-3">
              <Form.Label>Details</Form.Label>
              <Form.Control
                as="textarea"
                name="eventDetails"
                rows={3}
                value={formData.eventDetails}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={1}>
            <Form.Label>Banner</Form.Label>
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                style={{ width: "100%", height: "auto", borderRadius: "8px" }}
              />
            ) : formData.eventBanner &&
              typeof formData.eventBanner === "string" ? (
              <img
                src={formData.eventBanner}
                alt="Uploaded Banner"
                style={{ width: "100%", height: "auto", borderRadius: "8px" }}
              />
            ) : (
              <p>No banner uploaded</p>
            )}
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Group controlId="entryFees" className="mb-3">
              <Form.Label>Entry Fees</Form.Label>
              <Form.Control
                type="number"
                name="entryFees"
                min={0}
                value={formData.entryFees}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="maxSeats" className="mb-3">
              <Form.Label>Max Seats</Form.Label>
              <Form.Control
                type="number"
                name="maxSeats"
                value={formData.maxSeats}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="eventCategory" className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="eventCategory"
                value={formData.eventCategory}
                onChange={handleChange}
                required
              >
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
              <Form.Select
                name="eventDay"
                value={formData.eventDay}
                onChange={handleChange}
                required
              >
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
              <Form.Control
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                step="1800"
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="endTime" className="mb-3">
              <Form.Label>End Time</Form.Label>
              <Form.Control
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                step="1800"
                required
              />
            </Form.Group>
          </Col>
          <Col className="d-flex align-items-center justify-content-center">
            <Form.Group controlId="isFeatured" className="mb-3">
              <Form.Check
                type="checkbox"
                label="Feature Event?"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleCheckboxChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
            <Row>
              <Col>
                <Form.Group controlId="individualOrTeam" className="mb-3">
                  <Form.Label>Participation Type</Form.Label>
                  <Form.Select
                    name="individualOrTeam"
                    value={formData.individualOrTeam}
                    onChange={handleChange}
                    required
                  >
                    <option value="individual">Individual</option>
                    <option value="team">Team</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              {isTeam && (
                <Col>
                  <Form.Group controlId="teamSize" className="mb-3">
                    <Form.Label>Team Size</Form.Label>
                    <Form.Control
                      type="number"
                      name="teamSize"
                      value={formData.teamSize || ""}
                      onChange={handleChange}
                      placeholder="Enter max team members"
                      required={isTeam}
                    />
                  </Form.Group>
                </Col>
              )}
            </Row>
          </Col>
          <Col>
            <Form.Group controlId="whatsapp" className="mb-3">
              <Form.Label>WhatsApp Group Link</Form.Label>
              <Form.Control
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="dept" className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Select
                name="dept"
                value={formData.dept}
                onChange={handleChange}
                required
              >
                <option value="0">For All</option>
                <option value="1">Computer Science</option>
                <option value="2">Mechanical</option>
                <option value="3">EXTC</option>
                <option value="4">Electrical</option>
                <option value="5">Information Technology</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-center">
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default EditEvent;