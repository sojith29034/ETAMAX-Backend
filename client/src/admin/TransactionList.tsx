import { useEffect, useState } from 'react';
import { Table, Button, Container, Row, Col, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

interface Transaction {
  _id: string;
  enrolledId: string;
  eventId: string;
  teamName: string;
  teamMembers: string[];
  amount: number;
  payment: number;
  transactionDate: string;
}

interface Event {
  _id: string;
  eventName: string;
  maxSeats: number;
  confirmedSeats: number;
}

const TransactionList = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [eventDetails, setEventDetails] = useState<{ [key: string]: Event }>({});
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [transactionToConfirm, setTransactionToConfirm] = useState<Transaction | null>(null);
  const [showAlert, setShowAlert] = useState<{ message: string; variant: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);  // Set loading to true when starting the API call
      try {
        const transactionResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/transactions`);
        setTransactions(transactionResponse.data);

        const eventIds: string[] = transactionResponse.data.map((transaction: Transaction) => transaction.eventId);
        const uniqueEventIds: string[] = Array.from(new Set(eventIds));

        const eventResponses = await Promise.all(
          uniqueEventIds.map((eventId: string) =>
            axios.get(`${import.meta.env.VITE_BASE_URL}/api/events/${eventId}`)
          )
        );

        const eventDetailsMap = eventResponses.reduce((acc, response) => {
          const eventData: Event = response.data;
          acc[eventData._id] = {
            ...eventData,
            confirmedSeats: transactionResponse.data.filter((transaction: Transaction) =>
              transaction.eventId === eventData._id && transaction.payment === 1
            ).length,
          };
          return acc;
        }, {} as { [key: string]: Event });

        setEventDetails(eventDetailsMap);
      } catch (error) {
        console.error('Error fetching transactions or events:', error);
      } finally {
        setLoading(false);  // Set loading to false when the API call finishes
      }
    };

    fetchTransactions();
  }, []);


  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedTransactions(selectAll ? [] : transactions.map((transaction) => transaction._id));
  };

  const handleSelectTransaction = (transactionId: string) => {
    setSelectedTransactions((prevSelected) =>
      prevSelected.includes(transactionId)
        ? prevSelected.filter((id) => id !== transactionId)
        : [...prevSelected, transactionId]
    );
  };

  const confirmTransaction = async () => {
    if (transactionToConfirm) {
      const event = eventDetails[transactionToConfirm.eventId];
      if (event && event.confirmedSeats < event.maxSeats) {
        try {
          await axios.put(`${import.meta.env.VITE_BASE_URL}/api/transactions/${transactionToConfirm._id}`, { payment: 1 });
          setTransactions(transactions.map(transaction =>
            transaction._id === transactionToConfirm._id ? { ...transaction, payment: 1 } : transaction
          ));
          setEventDetails({
            ...eventDetails,
            [event._id]: {
              ...event,
              confirmedSeats: event.confirmedSeats + 1, // Update confirmed seat count
            }
          });
          setShowConfirmModal(false);
          setTransactionToConfirm(null);
        } catch (error) {
          console.error('Error confirming transaction:', error);
          setShowAlert({ message: 'Failed to confirm transaction, please try again.', variant: 'danger' });
        }
      } else {
        setShowAlert({ message: 'Cannot confirm payment: Event seats are full.', variant: 'danger' });
        setShowConfirmModal(false);
        setTransactionToConfirm(null);
      }
    }
  };

  const confirmDeleteTransaction = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  const handleDeleteTransaction = async () => {
    if (transactionToDelete) {
      try {
        await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/transactions/${transactionToDelete._id}`);
        setTransactions(transactions.filter((transaction) => transaction._id !== transactionToDelete._id));
        setShowDeleteModal(false);
        setTransactionToDelete(null);
      } catch (error) {
        console.error('Error deleting transaction:', error);
        setShowAlert({ message: 'Failed to delete transaction, please try again.', variant: 'danger' });
      }
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedTransactions.map(async (transactionId) => {
          await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/transactions/${transactionId}`);
        })
      );
      setTransactions(transactions.filter((transaction) => !selectedTransactions.includes(transaction._id)));
      setSelectedTransactions([]);
    } catch (error) {
      console.error('Error deleting transactions:', error);
      setShowAlert({ message: 'Failed to delete selected transactions, please try again.', variant: 'danger' });
    }
  };

  const filteredTransactions = transactions.filter((transaction: Transaction) =>
    transaction.enrolledId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.teamMembers.some(member => member.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Container className="mt-4">
      <Row className="align-items-center mb-3">
        <Col>
          <h2 className="text-center">Transaction List</h2>
        </Col>
        <Col>
          <Form.Control
            type="text"
            placeholder="Search by enrolled roll number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col className="text-end">
          {showAlert && (
            <Alert variant={showAlert.variant} onClose={() => setShowAlert(null)} dismissible
              style={{ position: 'absolute', top: '40px', right: '40px' }}>
              {showAlert.message}
            </Alert>
          )}
          {selectedTransactions.length > 0 && (
            <Button variant="danger" className="me-2" onClick={handleBulkDelete} disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Delete Selected'}
            </Button>
          )}
        </Col>
      </Row>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Table striped bordered hover responsive variant="dark">
          <thead>
            <tr>
              <th>
                <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
              </th>
              <th>Sr No</th>
              <th>Enrolled By</th>
              <th>Event Name</th>
              <th>Amount</th>
              <th>Enrolled Roll Numbers</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction, index) => (
              <tr key={transaction._id}>
                <td>
                  <input type="checkbox" checked={selectedTransactions.includes(transaction._id)}
                    onChange={() => handleSelectTransaction(transaction._id)} />
                </td>
                <td>{index + 1}</td>
                <td>{transaction.teamName || transaction.enrolledId}</td>
                <td>{eventDetails[transaction.eventId]?.eventName || 'Event Name Unavailable'}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.teamMembers?.join(', ')}</td>
                <td>{transaction.payment === 1 ? 'Confirmed' : 'Pending'}</td>
                <td>
                  <Button variant="primary" size="sm" className="me-2"
                    onClick={() => {
                      const event = eventDetails[transaction.eventId];
                      if (event && event.confirmedSeats < event.maxSeats) {
                        setTransactionToConfirm(transaction);
                        setShowConfirmModal(true);
                      } else {
                        setShowAlert({ message: 'Cannot confirm payment: Event seats are full.', variant: 'danger' });
                      }
                    }} disabled={transaction.payment === 1}>
                    Confirm Payment
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => confirmDeleteTransaction(transaction)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton style={{ background: '#333' }}>
          <Modal.Title>Confirm Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#333' }}>Are you sure you want to confirm the payment for this transaction?</Modal.Body>
        <Modal.Footer style={{ background: '#333' }}>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmTransaction}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton style={{ background: '#333' }}>
          <Modal.Title>Delete Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#333' }}>Are you sure you want to delete this transaction?</Modal.Body>
        <Modal.Footer style={{ background: '#333' }}>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteTransaction}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TransactionList;