import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  email: string;
}

function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedStudent, setEditedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAlert, setShowAlert] = useState<{ message: string; variant: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<{ show: boolean; studentId: string | null }>({ show: false, studentId: null });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/students`);
        setStudents(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching students:', error);
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleEdit = (student: Student) => {
    setEditingId(student._id);
    setEditedStudent(student);
  };

  const handleSave = async () => {
    if (editedStudent) {
      try {
        const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/api/students/${editedStudent._id}`, {
          name: editedStudent.name,
          rollNumber: editedStudent.rollNumber,
          email: editedStudent.email,
        });

        setStudents(students.map((s) => (s._id === editedStudent._id ? response.data.student : s)));
        setEditingId(null);
        setEditedStudent(null);
        setShowAlert({ message: 'Student updated successfully', variant: 'success' });
      } catch (error) {
        console.error('Error updating student:', error);
        setShowAlert({ message: 'Error updating student', variant: 'danger' });
      }
    }
  };

  const handleSendEmail = async (email: string) => {
    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/students/send-email`, {email});
      setShowAlert({ message: `Email sent to ${email}`, variant: 'success' });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleDelete = async (studentId: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/students/${studentId}`);
      setStudents(students.filter((student) => student._id !== studentId));
      setShowDeleteModal({ show: false, studentId: null });
      setShowAlert({ message: 'Student deleted successfully', variant: 'success' });
    } catch (error) {
      console.error('Error deleting student:', error);
      setShowAlert({ message: 'Error deleting student', variant: 'danger' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedStudent) {
      setEditedStudent({ ...editedStudent, [e.target.name]: e.target.value });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.includes(searchQuery) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      {showAlert && (
        <Alert variant={showAlert.variant} onClose={() => setShowAlert(null)} dismissible 
         style={{ position:'absolute', top:'10px', right:'40px' }}>
          {showAlert.message}
        </Alert>
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Student List</h2>
        <input
          type="text"
          placeholder="Search by name, roll number, or email..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="form-control"
          style={{ width: '300px' }}
        />
      </div>
      <Table striped bordered variant="dark">
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Name</th>
            <th>Roll Number</th>
            <th>Email</th>
            <th colSpan={3} className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student, index) => (
              <tr key={student._id}>
                <td>{index + 1}</td>
                <td>
                  {editingId === student._id ? (
                    <input
                      type="text"
                      name="name"
                      value={editedStudent?.name || ''}
                      onChange={handleChange}
                      className="form-control"
                    />
                  ) : (
                    student.name
                  )}
                </td>
                <td>
                  {editingId === student._id ? (
                    <input
                      type="text"
                      name="rollNumber"
                      value={editedStudent?.rollNumber || ''}
                      onChange={handleChange}
                      className="form-control"
                    />
                  ) : (
                    student.rollNumber
                  )}
                </td>
                <td>
                  {editingId === student._id ? (
                    <input
                      type="text"
                      name="email"
                      value={editedStudent?.email || ''}
                      onChange={handleChange}
                      className="form-control"
                    />
                  ) : (
                    student.email
                  )}
                </td>
                <td className="text-center">
                  {editingId === student._id ? (
                    <button className="btn btn-success btn-sm" onClick={handleSave}>
                      Save
                    </button>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => handleEdit(student)}>
                      Edit
                    </button>
                  )}
                </td>
                <td className="text-center">
                  <button className="btn btn-warning btn-sm" onClick={() => handleSendEmail(student.email)}>
                    Send Email
                  </button>
                </td>
                <td className="text-center">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setShowDeleteModal({ show: true, studentId: student._id })}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center">No results found</td>
            </tr>
          )}
        </tbody>
      </Table>
      <Modal
        show={showDeleteModal.show}
        onHide={() => setShowDeleteModal({ show: false, studentId: null })}
      >
        <Modal.Header style={{ backgroundColor: '#333' }} closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#333' }}>Are you sure you want to delete this student?</Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#333' }}>
          <Button variant="secondary" onClick={() => setShowDeleteModal({ show: false, studentId: null })}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDelete(showDeleteModal.studentId!)}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default StudentList;