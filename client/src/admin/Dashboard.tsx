import { Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Container className="my-4">
      <h2 className="text-center">Dashboard</h2>
      <Row className="justify-content-center">
        <Col md={3} className="mb-3">
          <Button variant="primary" className="w-100" onClick={() => navigate('/admin/students')}>
            Student List
          </Button>
        </Col>
        <Col md={3} className="mb-3">
          <Button variant="success" className="w-100" onClick={() => navigate('/admin/add-event')}>
            Add Event
          </Button>
        </Col>
        <Col md={3} className="mb-3">
          <Button variant="info" className="w-100" onClick={() => navigate('/admin/events')}>
            Event List
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;