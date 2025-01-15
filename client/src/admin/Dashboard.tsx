import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Container, Row, Col, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface Event {
  _id: string;
  eventName: string;
  eventDay: number;
  eventCategory: string;
  maxSeats: number;
}

interface Transaction {
  eventId: string;
  payment: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [filledSeats, setFilledSeats] = useState<{ [key: string]: number }>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [successfulTransactions, setSuccessfulTransactions] =
    useState<number>(0);

  useEffect(() => {
    const fetchEventsAndTransactions = async () => {
      try {
        // Fetch events
        const eventsResponse = await axios.get<Event[]>(
          `${import.meta.env.VITE_BASE_URL}/api/events`
        );
        setEvents(eventsResponse.data);

        // Fetch transactions
        const transactionsResponse = await axios.get<Transaction[]>(
          `${import.meta.env.VITE_BASE_URL}/api/transactions`
        );
        const fetchedTransactions = transactionsResponse.data;
        setTransactions(fetchedTransactions);

        // Calculate filled seats for each event
        const filledSeatsCount = eventsResponse.data.reduce(
          (acc: { [key: string]: number }, event: Event) => {
            acc[event._id] = fetchedTransactions.filter(
              (transaction: Transaction) =>
                transaction.eventId === event._id && transaction.payment === 1
            ).length;
            return acc;
          },
          {}
        );

        setFilledSeats(filledSeatsCount);

        // Calculate the total successful transactions
        const successTransactions = fetchedTransactions.filter(
          (transaction) => transaction.payment === 1
        );
        setSuccessfulTransactions(successTransactions.length);
      } catch (error) {
        console.error("Error fetching events or transactions:", error);
      }
    };

    fetchEventsAndTransactions();
  }, []);

  const fullEvents = events.filter(
    (event) => event.maxSeats > 0 && filledSeats[event._id] >= event.maxSeats
  );

  return (
    <Container className="my-4">
      <h2 className="text-center">Dashboard</h2>
      <Row className="justify-content-center">
        <Col md={3} className="mb-3">
          <Button
            variant="primary"
            className="w-100"
            onClick={() => navigate("/admin/students")}
          >
            Student List
          </Button>
        </Col>
        <Col md={3} className="mb-3">
          <Button
            variant="success"
            className="w-100"
            onClick={() => navigate("/admin/add-event")}
          >
            Add Event
          </Button>
        </Col>
        <Col md={3} className="mb-3">
          <Button
            variant="info"
            className="w-100"
            onClick={() => navigate("/admin/events")}
          >
            Event List
          </Button>
        </Col>
        <Col md={3} className="mb-3">
          <Button
            variant="warning"
            className="w-100"
            onClick={() => navigate("/admin/transactions")}
          >
            Transactions
          </Button>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Table bordered hover variant="dark">
            <thead className="text-center">
              <tr>
                <th colSpan={4}>
                  Events with Seats Full - {fullEvents.length}
                </th>
              </tr>
            </thead>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Day</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fullEvents.map((event) => (
                <tr key={event._id}>
                  <td>{event.eventName}</td>
                  <td>{event.eventDay}</td>
                  <td className="text-capitalize">{event.eventCategory}</td>
                  <td>
                    {filledSeats[event._id] >= event.maxSeats ? (
                      <span className="text-danger">Full</span>
                    ) : (
                      <span className="text-success">Available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>

        <Col md={6}>
          <Table className="text-center" bordered variant="dark">
            <thead>
              <tr>
                <th colSpan={3}>Transaction Statistics</th>
              </tr>
              <tr>
                <th>Confirmed Transactions</th>
                <th>Pending Transactions</th>
                <th>Total Transactions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{successfulTransactions}</td>
                <td>{transactions.length - successfulTransactions}</td>
                <td>{transactions.length}</td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;