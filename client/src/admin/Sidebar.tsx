import { Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div style={{ width: '250px', height: '100vh', backgroundColor: '#333', padding: '20px' }}>
      <Nav className="flex-column">
        <Nav.Link onClick={() => navigate('/admin')} style={{ cursor: 'pointer' , color: '#ccc', fontSize: '24px'}}>
          Home
        </Nav.Link>
        <Nav.Link onClick={() => navigate('/admin/events')} style={{ cursor: 'pointer' , color: '#ccc', fontSize: '24px'}}>
          Event List
        </Nav.Link>
        <Nav.Link onClick={() => navigate('/admin/transactions')} style={{ cursor: 'pointer' , color: '#ccc', fontSize: '24px'}}>
          Transactions
        </Nav.Link>
        <Nav.Link onClick={() => navigate('/admin/students')} style={{ cursor: 'pointer' , color: '#ccc', fontSize: '24px'}}>
          Student List
        </Nav.Link>
        <Nav.Link onClick={() => navigate('/admin/add-event')} style={{ cursor: 'pointer' , color: '#ccc', fontSize: '24px'}}>
          Add Event
        </Nav.Link>
        <Nav.Link onClick={() => navigate('/admin/attendance')} style={{ cursor: 'pointer' , color: '#ccc', fontSize: '24px'}}>
          Attendance
        </Nav.Link>
        <Nav.Link onClick={() => navigate('/admin/defaulter')} style={{ cursor: 'pointer' , color: '#ccc', fontSize: '24px'}}>
          Defaulters
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;