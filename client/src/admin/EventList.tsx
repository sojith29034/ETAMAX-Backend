import { useEffect, useState } from 'react';
import { Table, Button, Container, Row, Col, Form, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

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

interface Transaction {
  eventId: string;
  payment: number;
}

const EventList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [filledSeats, setFilledSeats] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventsAndSeats = async () => {
      try {
        const eventsResponse = await axios.get<Event[]>(
          `${import.meta.env.VITE_BASE_URL}/api/events`
        );
        setEvents(eventsResponse.data);

        // Fetch transactions
        const transactionsResponse = await axios.get<Transaction[]>(
          `${import.meta.env.VITE_BASE_URL}/api/transactions`
        );
        const transactions = transactionsResponse.data;

        // Calculate filled seats for each event
        const filledSeatsCount = eventsResponse.data.reduce((acc: { [key: string]: number }, event: Event) => {
          acc[event._id] = transactions.filter(
            (transaction: { eventId: string; payment: number }) =>
              transaction.eventId === event._id && transaction.payment === 1
          ).length;
          return acc;
        }, {});

        setFilledSeats(filledSeatsCount);
        setLoading(false); // Stop loading once data is fetched
      } catch (error) {
        console.error('Error fetching events or transactions:', error);
        setLoading(false); // Stop loading even in case of an error
      }
    };

    fetchEventsAndSeats();
  }, []);

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedEvents(selectAll ? [] : events.map((event) => event._id));
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEvents((prevSelected) =>
      prevSelected.includes(eventId) ? prevSelected.filter((id) => id !== eventId) : [...prevSelected, eventId]
    );
  };

  const handleDeleteEvent = async () => {
    if (eventToDelete) {
      try {
        await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/events/${eventToDelete._id}`);
        setEvents(events.filter((event) => event._id !== eventToDelete._id));
        setShowModal(false);
        setEventToDelete(null);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const confirmDeleteEvent = (event: Event) => {
    setEventToDelete(event);
    setShowModal(true);
  };

  const confirmBulkDelete = () => {
    setShowBulkDeleteModal(true);
  };

  const handleBulkDelete = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/events/delete-multiple`, { eventIds: selectedEvents });
      setEvents(events.filter((event) => !selectedEvents.includes(event._id)));
      setSelectedEvents([]);
      setSelectAll(false);
      setShowBulkDeleteModal(false);
    } catch (error) {
      console.error('Error deleting selected events:', error);
    }
  };

  const handleEditEvent = (event: Event) => {
    navigate(`/admin/edit-event/${event._id}`, { state: { event } });
  };

  const handleSort = (key: string) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedEvents = [...events].sort((a, b) => {
    if (sortConfig) {
      const aValue = a[sortConfig.key as keyof Event];
      const bValue = b[sortConfig.key as keyof Event];
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const filteredEvents = sortedEvents.filter((event) =>
    event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.eventCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.startTime.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container className="mt-4">
      <Row className="align-items-center mb-3">
        <Col>
          <h2 className="text-center">Event List</h2>
        </Col>
        <Col>
          <Form.Control
            type="text"
            placeholder="Search by event"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col className="text-end">
          {selectedEvents.length > 0 && (
            <Button variant="danger" className="me-2" onClick={confirmBulkDelete}>
              Delete Selected
            </Button>
          )}
          <Button variant="success" onClick={() => navigate('/admin/add-event')}>
            Add Event
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped bordered hover responsive variant="dark">
          <thead>
            <tr>
              <th>
                <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
              </th>
              <th>Sr No</th>
              <th onClick={() => handleSort('eventName')} style={{ cursor: 'pointer' }}>
                Name {sortConfig?.key === 'eventName' && (sortConfig.direction === 'ascending' ? <FaArrowUp /> : <FaArrowDown />)}
              </th>
              <th onClick={() => handleSort('eventDay')} style={{ cursor: 'pointer' }}>
                Day {sortConfig?.key === 'eventDay' && (sortConfig.direction === 'ascending' ? <FaArrowUp /> : <FaArrowDown />)}
              </th>
              <th onClick={() => handleSort('eventCategory')} style={{ cursor: 'pointer' }}>
                Category {sortConfig?.key === 'eventCategory' && (sortConfig.direction === 'ascending' ? <FaArrowUp /> : <FaArrowDown />)}
              </th>
              <th onClick={() => handleSort('startTime')} style={{ cursor: 'pointer' }}>
                Time {sortConfig?.key === 'startTime' && (sortConfig.direction === 'ascending' ? <FaArrowUp /> : <FaArrowDown />)}
              </th>
              <th onClick={() => handleSort('maxSeats')} style={{ cursor: 'pointer' }}>
                Seats {sortConfig?.key === 'maxSeats' && (sortConfig.direction === 'ascending' ? <FaArrowUp /> : <FaArrowDown />)}
              </th>
              <th onClick={() => handleSort('entryFees')} style={{ cursor: 'pointer' }}>
                Entry Fee {sortConfig?.key === 'entryFees' && (sortConfig.direction === 'ascending' ? <FaArrowUp /> : <FaArrowDown />)}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event, index) => (
              <tr key={event._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event._id)}
                    onChange={() => handleSelectEvent(event._id)}
                  />
                </td>
                <td>{index + 1}</td>
                <td>{event.eventName}</td>
                <td>Day {event.eventDay}</td>
                <td style={{ textTransform: 'capitalize' }}>{event.eventCategory}</td>
                <td>{`${event.startTime} - ${event.endTime}`}</td>
                <td>{event.maxSeats === 0 ? 'Unlimited' : `${filledSeats[event._id] || 0} / ${event.maxSeats}`}</td>
                <td>{event.maxSeats === 0 ? '' : `${event.entryFees}`}</td>
                <td>
                  <Button variant="primary" size="sm" className="me-2" onClick={() => handleEditEvent(event)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => confirmDeleteEvent(event)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Single Delete Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: '#333' }}>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#333' }}>
          Are you sure you want to delete the event <strong>{eventToDelete?.eventName}</strong>?
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#333' }}>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteEvent}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal show={showBulkDeleteModal} onHide={() => setShowBulkDeleteModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: '#333' }}>
          <Modal.Title>Confirm Bulk Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#333' }}>
          Are you sure you want to delete the selected events?
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#333' }}>
          <Button variant="secondary" onClick={() => setShowBulkDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleBulkDelete}>
            Delete Selected
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EventList;