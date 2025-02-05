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
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [updatedAmount, setUpdatedAmount] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [transactionToConfirm, setTransactionToConfirm] = useState<Transaction | null>(null);
  const [showAlert, setShowAlert] = useState<{ message: string; variant: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        // Fetch transactions
        const transactionResponse = await axios.get<Transaction[]>(
          `${import.meta.env.VITE_BASE_URL}/api/transactions`
        );
        const transactionsData = transactionResponse.data;
        setTransactions(transactionsData);

        // Extract event IDs from transactions
        const eventIds: string[] = transactionsData.map(
          (transaction) => transaction.eventId
        );
        const uniqueEventIds: string[] = Array.from(new Set(eventIds));

        // Bulk fetch event details for unique event IDs
        const eventResponse = await axios.post<Event[]>(
          `${import.meta.env.VITE_BASE_URL}/api/events/bulk`,
          { eventIds: uniqueEventIds }
        );
        const eventDetailsData = eventResponse.data;

        // Create a map of event details with confirmed seats
        const eventDetailsMap = eventDetailsData.reduce((acc, eventData) => {
          const confirmedSeats = transactionsData.filter(
            (transaction) =>
              transaction.eventId === eventData._id && transaction.payment === 1
          ).length;

          acc[eventData._id] = {
            ...eventData,
            confirmedSeats,
          };
          return acc;
        }, {} as { [key: string]: Event });

        // Set the event details state
        setEventDetails(eventDetailsMap);
      } catch (error) {
        console.error("Error fetching transactions or events:", error);
      } finally {
        setLoading(false);
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
          const formattedDate = new Date().toISOString();
          const updatedData = {
            payment: 1,
            transactionDate: formattedDate,
          };
          await axios.put(`${import.meta.env.VITE_BASE_URL}/api/transactions/${transactionToConfirm._id}`, updatedData);
          setTransactions(transactions.map(transaction =>
            transaction._id === transactionToConfirm._id ? { ...transaction, payment: 1, transactionDate: formattedDate} : transaction
          ));
          setEventDetails({
            ...eventDetails,
            [event._id]: {
              ...event,
              confirmedSeats: event.confirmedSeats + 1,
            }
          });
          setShowConfirmModal(false);
          setTransactionToConfirm(null);
          setShowAlert({ message: 'Transaction confirmed successfully.', variant: 'success' });
        } catch (error) {
          console.error('Error confirming transaction:', error);
          setShowAlert({ message: 'Failed to confirm transaction. Please try again.', variant: 'danger' });
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


  const exportToCSV = () => {
    const headers = ['Sr No', 'Enrolled By', 'Event Name', 'Amount', 'Enrolled Roll Numbers', 'Transaction Date', 'Payment Status'];
    const rows = transactions.map((transaction, index) => {

    // Create a string for the enrolled roll numbers, separating them with a comma
    let enrolledRollNumbers = '';
    if (transaction.teamMembers) {
      enrolledRollNumbers = transaction.teamMembers.reduce((acc, rollNumber, i) => {
        return acc + (i > 0 ? '; ' : '') + rollNumber;
      }, '');
    } else if (transaction.enrolledId) {
      enrolledRollNumbers = transaction.enrolledId; // For single roll number transactions
    }

    return [
      index + 1,
      transaction.teamName || transaction.enrolledId,
      eventDetails[transaction.eventId]?.eventName || 'Event Name Unavailable',
      transaction.amount,
      enrolledRollNumbers,
      new Date(transaction.transactionDate).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      transaction.payment === 1 ? 'Confirmed' : 'Pending',
    ]});
    
    const csvContent =
      [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transactions.csv';
    link.click();
    URL.revokeObjectURL(url);
  };
  


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
        <Col>
          <Button variant="primary" onClick={exportToCSV}>
            Download CSV
          </Button>
        </Col>
        <Col className="text-end">
          {showAlert && (
            <Alert
              variant={showAlert.variant}
              onClose={() => setShowAlert(null)}
              dismissible
              style={{ position: "absolute", top: "40px", right: "40px" }}
            >
              {showAlert.message}
            </Alert>
          )}
          {selectedTransactions.length > 0 && (
            <Button
              variant="danger"
              className="me-2 d-none"
              onClick={handleBulkDelete}
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Delete Selected"
              )}
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
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Sr No</th>
              <th>Enrolled By</th>
              <th>Event Name</th>
              <th>Amount</th>
              <th>Enrolled Roll Numbers</th>
              <th>Payment Status</th>
              <th>Transaction Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction, index) => {
              const transactionDate = new Date(transaction.transactionDate);
              const istDate = new Date(
                transactionDate.toLocaleString("en-US", {
                  timeZone: "Asia/Kolkata",
                })
              );
              const formattedDate = `${("0" + istDate.getDate()).slice(-2)}-${(
                "0" +
                (istDate.getMonth() + 1)
              ).slice(-2)}-${istDate.getFullYear()}`;
              return (
                <tr key={transaction._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(transaction._id)}
                      onChange={() => handleSelectTransaction(transaction._id)}
                    />
                  </td>
                  <td>{index + 1}</td>
                  <td>{transaction.teamName || transaction.enrolledId}</td>
                  <td>
                    {eventDetails[transaction.eventId]?.eventName ||
                      "Event Name Unavailable"}
                  </td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.teamMembers?.join(", ")}</td>
                  <td>{transaction.payment === 1 ? "Confirmed" : "Pending"}</td>
                  <td>{formattedDate}</td>
                  <td>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => {
                        const event = eventDetails[transaction.eventId];
                        if (event && event.confirmedSeats < event.maxSeats) {
                          setTransactionToConfirm(transaction);
                          setShowConfirmModal(true);
                        } else {
                          setShowAlert({
                            message:
                              "Cannot confirm payment: Event seats are full.",
                            variant: "danger",
                          });
                        }
                      }}
                      disabled={transaction.payment === 1}
                    >
                      Confirm Payment
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => {
                        setEditingTransaction(transaction);
                        setUpdatedAmount(transaction.amount);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => confirmDeleteTransaction(transaction)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton style={{ background: "#333" }}>
          <Modal.Title>Confirm Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: "#333" }}>
          Are you sure you want to confirm the payment for this transaction?
        </Modal.Body>
        <Modal.Footer style={{ background: "#333" }}>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmTransaction}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton style={{ background: "#333" }}>
          <Modal.Title>Delete Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: "#333" }}>
          Are you sure you want to delete this transaction?
        </Modal.Body>
        <Modal.Footer style={{ background: "#333" }}>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteTransaction}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={!!editingTransaction}
        onHide={() => setEditingTransaction(null)}
      >
        <Modal.Header closeButton style={{ background: "#333" }}>
          <Modal.Title>Edit Amount</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: "#333" }}>
          <Form>
            <Form.Group controlId="amount">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                value={updatedAmount ?? ""}
                onChange={(e) => setUpdatedAmount(Number(e.target.value))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: "#333" }}>
          <Button
            variant="secondary"
            onClick={() => setEditingTransaction(null)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              if (editingTransaction) {
                try {
                  await axios.put(
                    `${import.meta.env.VITE_BASE_URL}/api/transactions/${
                      editingTransaction._id
                    }`,
                    { amount: updatedAmount }
                  );
                  setTransactions(
                    transactions.map((transaction) =>
                      transaction._id === editingTransaction._id
                        ? {
                            ...transaction,
                            amount: updatedAmount ?? transaction.amount,
                          }
                        : transaction
                    )
                  );
                  setShowAlert({
                    message: "Amount updated successfully.",
                    variant: "success",
                  });
                } catch (error) {
                  console.error("Error updating amount:", error);
                  setShowAlert({
                    message: "Failed to update amount. Please try again.",
                    variant: "danger",
                  });
                } finally {
                  setEditingTransaction(null);
                }
              }
            }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TransactionList;