import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { bookAPI, userAPI, statsAPI, transactionAPI } from '../services/api'
import toast from 'react-hot-toast'
import { 
  FaBook, FaUsers, FaExchangeAlt, FaChartBar, FaSignOutAlt, 
  FaPlus, FaEdit, FaTrash, FaDownload, FaSearch, 
  FaUserGraduate, FaChalkboardTeacher, FaSpinner
} from 'react-icons/fa'

export default function LibrarianDashboard() {
  const { user, logout } = useAuth()
  const [books, setBooks] = useState([])
  const [students, setStudents] = useState([])
  const [faculty, setFaculty] = useState([])
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [newBook, setNewBook] = useState({ title: '', author: '', publisher: '', copies: 1, category: '' })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [booksRes, studentsRes, facultyRes, transactionsRes, statsRes] = await Promise.all([
        bookAPI.getAll(),
        userAPI.getStudents(),
        userAPI.getFaculty(),
        transactionAPI.getAll(),
        statsAPI.get()
      ])
      setBooks(booksRes.data || [])
      setStudents(studentsRes.data || [])
      setFaculty(facultyRes.data || [])
      setTransactions(transactionsRes.data || [])
      setStats(statsRes.data || {})
    } catch (error) { 
      console.error(error)
      toast.error('Failed to load data') 
    }
    setLoading(false)
  }

  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author) { toast.error('Title and author required'); return }
    try {
      await bookAPI.add(newBook)
      toast.success('Book added successfully')
      loadData()
      setShowAddModal(false)
      setNewBook({ title: '', author: '', publisher: '', copies: 1, category: '' })
    } catch (error) { toast.error('Failed to add book') }
  }

  const handleUpdateBook = async () => {
    if (!editingBook.title || !editingBook.author) { toast.error('Title and author required'); return }
    try {
      await bookAPI.update(editingBook.book_id, editingBook)
      toast.success('Book updated successfully')
      loadData()
      setEditingBook(null)
    } catch (error) { toast.error('Failed to update book') }
  }

  const handleDeleteBook = async (id) => {
    if (confirm('Delete this book?')) {
      try { 
        await bookAPI.delete(id); 
        toast.success('Book deleted'); 
        loadData() 
      } catch (error) { toast.error('Failed to delete') }
    }
  }

  const handleDeleteUser = async (userId, roleName) => {
    if (confirm(`Delete ${roleName} user ${userId}?`)) {
      try { 
        await userAPI.deleteUser(userId); 
        toast.success('User deleted'); 
        loadData() 
      } catch (error) { toast.error('Failed to delete user') }
    }
  }

  const exportToCSV = (data, filename) => {
    if (!data.length) { toast.error('No data to export'); return }
    const headers = Object.keys(data[0])
    const csv = [headers.join(','), ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
    toast.success(`Exported ${filename}`)
  }

  const filteredBooks = books.filter(book => 
    book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.book_id?.includes(searchTerm)
  )

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <FaSpinner size={40} style={{ animation: 'spin 1s linear infinite', color: '#10b981' }} />
      </div>
    )
  }

  return (
    <div>
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 1000,
        background: 'rgba(10, 10, 10, 0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0.8rem 0'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FaBook size={20} style={{ color: '#fff' }} />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              Librarian Portal
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span>Welcome, {user?.name}</span>
            <button onClick={logout} style={{
              background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0.5rem 1rem', borderRadius: '12px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}><FaSignOutAlt /> Logout</button>
          </div>
        </div>
      </nav>

      <div style={{ display: 'flex', paddingTop: '70px', minHeight: '100vh' }}>
        {/* Sidebar */}
        <div style={{
          width: '280px', background: 'rgba(17, 17, 17, 0.95)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '2rem 1.5rem', position: 'fixed', height: 'calc(100vh - 70px)', overflowY: 'auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '80px', height: '80px',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
            }}>
              <FaBook size={40} style={{ color: '#fff' }} />
            </div>
            <h4>{user?.name}</h4>
            <p style={{ fontSize: '0.75rem', color: '#6c6c6c' }}>{user?.user_id} • Administrator</p>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button onClick={() => setActiveTab('dashboard')} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
              borderRadius: '12px', width: '100%', background: activeTab === 'dashboard' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'rgba(255, 255, 255, 0.03)',
              border: 'none', color: '#fff', cursor: 'pointer'
            }}><FaChartBar /> Dashboard</button>
            <button onClick={() => setActiveTab('books')} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
              borderRadius: '12px', width: '100%', background: activeTab === 'books' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'rgba(255, 255, 255, 0.03)',
              border: 'none', color: '#fff', cursor: 'pointer'
            }}><FaBook /> Books</button>
            <button onClick={() => setActiveTab('users')} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
              borderRadius: '12px', width: '100%', background: activeTab === 'users' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'rgba(255, 255, 255, 0.03)',
              border: 'none', color: '#fff', cursor: 'pointer'
            }}><FaUsers /> Users</button>
            <button onClick={() => setActiveTab('transactions')} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
              borderRadius: '12px', width: '100%', background: activeTab === 'transactions' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'rgba(255, 255, 255, 0.03)',
              border: 'none', color: '#fff', cursor: 'pointer'
            }}><FaExchangeAlt /> Transactions</button>
          </nav>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, marginLeft: '280px', padding: '2rem' }}>
          {activeTab === 'dashboard' && (
            <>
              <h2>Dashboard Overview</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(20,20,30,0.6)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.5rem', color: '#10b981' }}>{stats.totalBooks || 0}</h3><p>Total Books</p>
                </div>
                <div style={{ background: 'rgba(20,20,30,0.6)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.5rem', color: '#10b981' }}>{stats.availableBooks || 0}</h3><p>Available Books</p>
                </div>
                <div style={{ background: 'rgba(20,20,30,0.6)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.5rem', color: '#10b981' }}>{students.length}</h3><p>Students</p>
                </div>
                <div style={{ background: 'rgba(20,20,30,0.6)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.5rem', color: '#10b981' }}>{faculty.length}</h3><p>Faculty</p>
                </div>
              </div>

              <h3>Recent Transactions</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ borderBottom: '1px solid #1f2937' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>ID</th><th>User</th><th>Book</th><th>Date</th><th>Type</th>
                  </tr></thead>
                  <tbody>
                    {transactions.slice(0, 10).map(t => (
                      <tr key={t.transaction_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.75rem' }}>{t.transaction_id}</td>
                        <td>{t.user_id}</td><td>{t.book_id}</td><td>{t.transaction_date}</td>
                        <td style={{ color: t.type === 'borrow' ? '#10b981' : '#f59e0b' }}>{t.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'books' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2>Book Management</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ position: 'relative' }}>
                    <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search books..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                      style={{ padding: '0.5rem 1rem 0.5rem 2rem', width: '220px', background: 'rgba(0,0,0,0.4)', border: '1px solid #1f2937', borderRadius: '8px', color: '#fff' }} />
                  </div>
                  <button onClick={() => setShowAddModal(true)} style={{ background: '#10b981', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaPlus /> Add Book</button>
                  <button onClick={() => exportToCSV(books, 'books_export.csv')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaDownload /> Export</button>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ borderBottom: '1px solid #1f2937' }}>
                    <th style={{ padding: '0.75rem' }}>ID</th><th>Title</th><th>Author</th><th>Copies</th><th>Available</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {filteredBooks.map(book => (
                      <tr key={book.book_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.75rem' }}>{book.book_id}</td>
                        <td>{book.title}</td><td>{book.author}</td><td>{book.copies}</td>
                        <td style={{ color: book.available ? '#10b981' : '#ef4444' }}>{book.available ? 'Yes' : 'No'}</td>
                        <td>
                          <button onClick={() => setEditingBook(book)} style={{ background: '#3b82f6', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', marginRight: '0.5rem', cursor: 'pointer' }}><FaEdit /></button>
                          <button onClick={() => handleDeleteBook(book.book_id)} style={{ background: '#ef4444', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}><FaTrash /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <>
              <h2>User Management</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(20,20,30,0.6)', borderRadius: '12px', padding: '1rem' }}>
                  <h3><FaUserGraduate /> Students ({students.length})</h3>
                  <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
                    <table style={{ width: '100%' }}>
                      <thead><tr><th>ID</th><th>Name</th><th>Roll</th><th>Fine</th><th></th></tr></thead>
                      <tbody>
                        {students.map(s => (
                          <tr key={s.user_id}>
                            <td>{s.user_id}</td><td>{s.name}</td><td>{s.roll_number}</td><td>Rs.{s.fine_amount || 0}</td>
                            <td><button onClick={() => handleDeleteUser(s.user_id, 'student')} style={{ background: '#ef4444', border: 'none', padding: '0.2rem 0.4rem', borderRadius: '4px', cursor: 'pointer' }}><FaTrash size={12} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div style={{ background: 'rgba(20,20,30,0.6)', borderRadius: '12px', padding: '1rem' }}>
                  <h3><FaChalkboardTeacher /> Faculty ({faculty.length})</h3>
                  <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
                    <table style={{ width: '100%' }}>
                      <thead><tr><th>ID</th><th>Name</th><th>Department</th><th>Fine</th><th></th></tr></thead>
                      <tbody>
                        {faculty.map(f => (
                          <tr key={f.user_id}>
                            <td>{f.user_id}</td><td>{f.name}</td><td>{f.department}</td><td>Rs.{f.fine_amount || 0}</td>
                            <td><button onClick={() => handleDeleteUser(f.user_id, 'faculty')} style={{ background: '#ef4444', border: 'none', padding: '0.2rem 0.4rem', borderRadius: '4px', cursor: 'pointer' }}><FaTrash size={12} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'transactions' && (
            <>
              <h2>Transaction History</h2>
              <button onClick={() => exportToCSV(transactions, 'transactions_export.csv')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaDownload /> Export</button>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ borderBottom: '1px solid #1f2937' }}>
                    <th>ID</th><th>User</th><th>Book</th><th>Date</th><th>Due Date</th><th>Return Date</th><th>Type</th><th>Fine</th><th>Status</th>
                  </tr></thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.transaction_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td>{t.transaction_id}</td><td>{t.user_id}</td><td>{t.book_id}</td>
                        <td>{t.transaction_date}</td><td>{t.due_date || '-'}</td><td>{t.return_date || '-'}</td>
                        <td style={{ color: t.type === 'borrow' ? '#10b981' : '#f59e0b' }}>{t.type}</td>
                        <td>Rs.{t.fine_amount || 0}</td>
                        <td style={{ color: t.status === 'active' ? '#10b981' : t.status === 'overdue' ? '#ef4444' : '#f59e0b' }}>{t.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Book Modal */}
      {(showAddModal || editingBook) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => { setShowAddModal(false); setEditingBook(null) }}>
          <div style={{ background: '#111', border: '1px solid #1f2937', borderRadius: '16px', padding: '1.5rem', maxWidth: '450px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
            <input type="text" placeholder="Title" value={editingBook ? editingBook.title : newBook.title} 
              onChange={e => editingBook ? setEditingBook({...editingBook, title: e.target.value}) : setNewBook({...newBook, title: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid #1f2937', borderRadius: '8px', color: '#fff' }} />
            <input type="text" placeholder="Author" value={editingBook ? editingBook.author : newBook.author} 
              onChange={e => editingBook ? setEditingBook({...editingBook, author: e.target.value}) : setNewBook({...newBook, author: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid #1f2937', borderRadius: '8px', color: '#fff' }} />
            <input type="text" placeholder="Publisher" value={editingBook ? editingBook.publisher : newBook.publisher} 
              onChange={e => editingBook ? setEditingBook({...editingBook, publisher: e.target.value}) : setNewBook({...newBook, publisher: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid #1f2937', borderRadius: '8px', color: '#fff' }} />
            <input type="number" placeholder="Copies" value={editingBook ? editingBook.copies : newBook.copies} 
              onChange={e => editingBook ? setEditingBook({...editingBook, copies: e.target.value}) : setNewBook({...newBook, copies: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid #1f2937', borderRadius: '8px', color: '#fff' }} />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => { setShowAddModal(false); setEditingBook(null) }} style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={editingBook ? handleUpdateBook : handleAddBook} style={{ flex: 1, padding: '0.5rem', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#fff' }}>
                {editingBook ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}