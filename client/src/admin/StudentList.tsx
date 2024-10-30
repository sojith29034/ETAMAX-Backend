import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';

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
          email: editedStudent.email
        });
        
        setStudents(students.map(s => (s._id === editedStudent._id ? response.data.student : s)));
        setEditingId(null);
        setEditedStudent(null);
      } catch (error) {
        console.error('Error updating student:', error);
      }
    }
  };

  const handleSendEmail = async (email: string) => {
    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/send-email`, { email });
      alert(`Email sent to ${email}`);
    } catch (error) {
      console.error('Error sending email:', error);
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

  // Filter students based on the search query
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.includes(searchQuery) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Student List</h2>
        <input
          type="text"
          placeholder="Search by name, roll number, or email..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="form-control"
          style={{ width: '300px' }} // Adjust width as needed
        />
      </div>
      <Table striped bordered variant='dark'>
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Name</th>
            <th>Roll Number</th>
            <th>Email</th>
            <th colSpan={2} className='text-center'>Actions</th>
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
                      className='form-control'
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
                      className='form-control'
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
                      className='form-control'
                    />
                  ) : (
                    student.email
                  )}
                </td>
                <td className='text-center'>
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
                <td className='text-center'>
                  <button
                    className="btn btn-warning btn-sm ms-2"
                    onClick={() => handleSendEmail(student.email)}
                  >
                    Send Email
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className='text-center'>No results found</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default StudentList;
