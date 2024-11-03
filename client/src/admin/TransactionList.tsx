import { useEffect, useState } from 'react';
import { Table, Button, Container, Row, Col, Form, Modal } from 'react-bootstrap';
import axios from 'axios';

interface Transaction {
  _id: string;
  enrolledId: string;
  eventId: string;
  teamMembers: string[];
  amount: number;
  payment: number;
  transactionDate: string;
}

const TransactionList = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [eventNames, setEventNames] = useState<{ [key: string]: string }>({});
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [transactionToConfirm, setTransactionToConfirm] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactionResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/transactions`);
        setTransactions(transactionResponse.data);

        // Extracting eventIds
        const eventIds = transactionResponse.data.map((transaction: Transaction) => transaction.eventId);
        
        // Fetch event details concurrently using Promise.all
        const eventResponses = await Promise.all(eventIds.map((eventId: string) => 
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/events/${eventId}`)
        ));
    
        // Create a mapping of eventId to event name
        const eventNamesMap = eventResponses.reduce((acc, response) => {
          acc[response.data._id] = response.data.eventName; // Adjust based on your event schema
          return acc;
        }, {} as { [key: string]: string });
    
        setEventNames(eventNamesMap);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [eventNames]);

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
      try {
        await axios.put(`${import.meta.env.VITE_BASE_URL}/api/transactions/${transactionToConfirm._id}`, { payment: 1 });
        setTransactions(transactions.map(transaction =>
          transaction._id === transactionToConfirm._id ? { ...transaction, payment: 1 } : transaction
        ));
        setShowConfirmModal(false);
        setTransactionToConfirm(null);
      } catch (error) {
        console.error('Error confirming transaction:', error);
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
      }
    }
  };

  const filteredTransactions = transactions.filter((transaction: Transaction) =>
    transaction.enrolledId.includes(searchTerm)
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
            placeholder="Search by enrolled ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col className="text-end">
          {selectedTransactions.length > 0 && (
            <Button variant="danger" className="me-2" onClick={() => { /* Add bulk delete functionality if needed */ }}>
              Delete Selected
            </Button>
          )}
        </Col>
      </Row>

      <Table striped bordered hover responsive variant='dark'>
        <thead>
          <tr>
            <th>
              <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
            </th>
            <th>Sr No</th>
            <th>Enrolled By</th>
            <th>Event Name</th> {/* Changed to Event Name */}
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
                    onChange={() => handleSelectTransaction(transaction._id)}/>
                </td>
                <td>{index + 1}</td>
                <td>{transaction.enrolledId}</td>
                <td>{eventNames[transaction.eventId]}</td>
                <td>{transaction.amount}</td>
                {/* <td>{new Date(transaction.transactionDate).toLocaleString()}</td> */}
                <td>{transaction.teamMembers?.join(', ')}</td>
                <td>{transaction.payment}</td>
                <td>
                    <Button variant="primary" size="sm" className="me-2" onClick={() => {
                    setTransactionToConfirm(transaction);
                    setShowConfirmModal(true);
                    }}>
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

      {/* Confirm Transaction Modal */}
        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: '#333', color: '#fff' }}>
            <Modal.Title>Confirm Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#333', color: '#fff' }}>
            {transactionToConfirm ? (
            <>
                Are you sure you want to confirm the transaction for enrolled ID{' '}
                <strong>{transactionToConfirm.enrolledId}</strong> for{' '}
                <strong>{eventNames[transactionToConfirm.eventId] || 'Event Name Unavailable'}</strong>?
            </>
            ) : (
            <p>Loading transaction details...</p>
            )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#333' }}>
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
            </Button>
            <Button variant="success" onClick={confirmTransaction}>
            Confirm
            </Button>
        </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: '#333', color: '#fff' }}>
            <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#333', color: '#fff' }}>
            {transactionToDelete ? (
            <>
                Are you sure you want to delete the transaction for enrolled ID{' '}
                <strong>{transactionToDelete.enrolledId}</strong> related to{' '}
                <strong>{eventNames[transactionToDelete.eventId] || 'Event Name Unavailable'}</strong>?
            </>
            ) : (
            <p>Loading transaction details...</p>
            )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#333' }}>
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
