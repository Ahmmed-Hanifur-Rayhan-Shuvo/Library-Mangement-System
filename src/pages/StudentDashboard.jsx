import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { bookAPI, borrowAPI } from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  FaBook, FaBookOpen, FaSignOutAlt, FaMoneyBillWave, FaSearch, 
  FaClock, FaHistory, FaUser, FaHome, FaArrowLeft, FaArrowRight, 
  FaEye, FaDownload, FaTrash, FaUndo, FaSpinner, FaCheckCircle,
  FaCalendarAlt, FaUserGraduate, FaRobot, FaBrain, FaRocket
} from 'react-icons/fa'

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const [borrowedBooks, setBorrowedBooks] = useState([])
  const [availableBooks, setAvailableBooks] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showBorrowModal, setShowBorrowModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [selectedBookId, setSelectedBookId] = useState('')
  const [selectedBookTitle, setSelectedBookTitle] = useState('')
  const [totalFine, setTotalFine] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('books')
  const [transactions, setTransactions] = useState([])
  const [returnLoading, setReturnLoading] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [borrowedRes, booksRes, fineRes, historyRes] = await Promise.all([
        borrowAPI.getBorrowed(user.user_id),
        bookAPI.getAll(),
        borrowAPI.getFine(user.user_id),
        borrowAPI.getHistory(user.user_id)
      ])
      setBorrowedBooks(borrowedRes.data || [])
      setAvailableBooks((booksRes.data || []).filter(b => b.available === true))
      setTotalFine(fineRes.data?.fine || 0)
      setTransactions(historyRes.data || [])
    } catch (error) { 
      console.error(error)
      toast.error('Failed to load data') 
    }
    setLoading(false)
  }

  const handleBorrow = async () => {
    if (!selectedBookId) { toast.error('Please select a book'); return }
    try {
      const res = await borrowAPI.borrow({ 
        userId: user.user_id, 
        bookId: selectedBookId, 
        userType: 'student' 
      })
      if (res.data.success) { 
        toast.success(`✅ Book borrowed! Due: ${res.data.dueDate}`)
        loadData()
        setShowBorrowModal(false)
        setSelectedBookId('')
        setSelectedBookTitle('')
      }
    } catch (error) { 
      toast.error(error.response?.data?.message || 'Failed to borrow') 
    }
  }

  const handleReturn = async () => {
    if (!selectedBookId) { toast.error('Please select a book to return'); return }
    setReturnLoading(true)
    try {
      const res = await borrowAPI.return({ userId: user.user_id, bookId: selectedBookId })
      if (res.data.success) { 
        if (res.data.fine > 0) {
          toast.warning(`⚠️ Book returned with fine: Rs. ${res.data.fine}`)
        } else {
          toast.success('✅ Book returned successfully!')
        }
        loadData()
        setShowReturnModal(false)
        setSelectedBookId('')
        setSelectedBookTitle('')
      }
    } catch (error) { 
      toast.error(error.response?.data?.message || 'Failed to return') 
    }
    setReturnLoading(false)
  }

  const openReturnModal = (book) => {
    setSelectedBookId(book.book_id)
    setSelectedBookTitle(book.title)
    setShowReturnModal(true)
  }

  const filteredBooks = availableBooks.filter(book => 
    book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.book_id?.includes(searchTerm)
  )

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        height: '100vh', background: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner size={50} style={{ color: '#00ff88', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: '#a0a0a0' }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #0a0a0a, #0d0d0d)', minHeight: '100vh' }}>
      {/* Modern Navbar */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 1000,
        background: 'rgba(10, 10, 10, 0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0.8rem 0'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(135deg, #00ff88, #00a8ff)',
              borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FaBook size={20} style={{ color: '#000' }} />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #00ff88, #00a8ff)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              Student Portal
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '36px', height: '36px',
                background: 'linear-gradient(135deg, #00ff88, #00a8ff)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FaUserGraduate size={18} style={{ color: '#000' }} />
              </div>
              <span style={{ color: '#fff', fontWeight: 500 }}>{user?.name}</span>
            </div>
            <button onClick={logout} style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s'
            }} onMouseEnter={e => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
               onMouseLeave={e => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div style={{ display: 'flex', paddingTop: '70px', minHeight: '100vh' }}>
        {/* Modern Sidebar */}
        <div style={{
          width: '280px',
          background: 'rgba(17, 17, 17, 0.95)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '2rem 1.5rem',
          position: 'fixed',
          height: 'calc(100vh - 70px)',
          overflowY: 'auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '80px', height: '80px',
              background: 'linear-gradient(135deg, #00ff88, #00a8ff)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <FaUser size={40} style={{ color: '#000' }} />
            </div>
            <h4 style={{ marginBottom: '0.25rem' }}>{user?.name}</h4>
            <p style={{ fontSize: '0.75rem', color: '#6c6c6c' }}>{user?.user_id} • {user?.roll_number}</p>
            <p style={{ fontSize: '0.7rem', color: '#00ff88', marginTop: '0.25rem' }}>{user?.department || 'Student'}</p>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button onClick={() => setActiveTab('books')} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              width: '100%',
              background: activeTab === 'books' ? 'linear-gradient(135deg, #00ff88, #00a8ff)' : 'rgba(255, 255, 255, 0.03)',
              border: 'none',
              color: activeTab === 'books' ? '#000' : '#fff',
              cursor: 'pointer',
              fontWeight: activeTab === 'books' ? 600 : 400,
              transition: 'all 0.3s'
            }}>
              <FaHome /> Dashboard
            </button>
            <button onClick={() => setActiveTab('borrowed')} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              width: '100%',
              background: activeTab === 'borrowed' ? 'linear-gradient(135deg, #00ff88, #00a8ff)' : 'rgba(255, 255, 255, 0.03)',
              border: 'none',
              color: activeTab === 'borrowed' ? '#000' : '#fff',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              <FaBook /> My Books
            </button>
            <button onClick={() => setActiveTab('fines')} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              width: '100%',
              background: activeTab === 'fines' ? 'linear-gradient(135deg, #00ff88, #00a8ff)' : 'rgba(255, 255, 255, 0.03)',
              border: 'none',
              color: activeTab === 'fines' ? '#000' : '#fff',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              <FaMoneyBillWave /> Fines
            </button>
            <button onClick={() => setActiveTab('history')} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              width: '100%',
              background: activeTab === 'history' ? 'linear-gradient(135deg, #00ff88, #00a8ff)' : 'rgba(255, 255, 255, 0.03)',
              border: 'none',
              color: activeTab === 'history' ? '#000' : '#fff',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              <FaHistory /> History
            </button>
          </nav>

          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#a0a0a0' }}>Books Borrowed</span>
              <span style={{ fontWeight: 600, color: '#00ff88' }}>{borrowedBooks.length}/5</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#a0a0a0' }}>Fine Amount</span>
              <span style={{ fontWeight: 600, color: totalFine > 0 ? '#ffa502' : '#00ff88' }}>Rs. {totalFine}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#a0a0a0' }}>Free Days</span>
              <span style={{ fontWeight: 600, color: '#00ff88' }}>14</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, marginLeft: '280px', padding: '2rem' }}>
          {activeTab === 'books' && (
            <>
              {/* Stats Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'rgba(20, 20, 30, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  textAlign: 'center'
                }}>
                  <h3 style={{ fontSize: '2rem', color: '#00ff88', marginBottom: '0.25rem' }}>{borrowedBooks.length}</h3>
                  <p style={{ color: '#a0a0a0' }}>Books Borrowed</p>
                </div>
                <div style={{
                  background: 'rgba(20, 20, 30, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  textAlign: 'center'
                }}>
                  <h3 style={{ fontSize: '2rem', color: totalFine > 0 ? '#ffa502' : '#00ff88', marginBottom: '0.25rem' }}>Rs. {totalFine}</h3>
                  <p style={{ color: '#a0a0a0' }}>Total Fine</p>
                </div>
                <div style={{
                  background: 'rgba(20, 20, 30, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  textAlign: 'center'
                }}>
                  <h3 style={{ fontSize: '2rem', color: '#00ff88', marginBottom: '0.25rem' }}>14</h3>
                  <p style={{ color: '#a0a0a0' }}>Free Days Left</p>
                </div>
                <div style={{
                  background: 'rgba(20, 20, 30, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  textAlign: 'center'
                }}>
                  <h3 style={{ fontSize: '2rem', color: '#00ff88', marginBottom: '0.25rem' }}>{availableBooks.length}</h3>
                  <p style={{ color: '#a0a0a0' }}>Available Books</p>
                </div>
              </div>

              {/* Available Books Section */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaBookOpen style={{ color: '#00ff88' }} /> Available Books
                  </h2>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                      <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c6c6c' }} />
                      <input
                        type="text"
                        placeholder="Search books by title, author or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                          padding: '0.75rem 1rem 0.75rem 2.5rem',
                          width: '280px',
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          color: '#fff'
                        }}
                      />
                    </div>
                    <button
                      onClick={() => setShowBorrowModal(true)}
                      style={{
                        background: 'linear-gradient(135deg, #00ff88, #00a8ff)',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <FaBookOpen /> Borrow Book
                    </button>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {filteredBooks.slice(0, 6).map(book => (
                    <div key={book.book_id} style={{
                      background: 'rgba(20, 20, 30, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '20px',
                      padding: '1.5rem',
                      transition: 'all 0.3s'
                    }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = '#00ff88' }}
                       onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)' }}>
                      <h3 style={{ marginBottom: '0.5rem' }}>{book.title}</h3>
                      <p style={{ color: '#a0a0a0', marginBottom: '0.5rem' }}>by {book.author}</p>
                      <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>{book.publisher} • {book.category || 'General'}</p>
                      <p style={{ marginBottom: '1rem' }}>📚 Copies: {book.copies}</p>
                      <button
                        onClick={() => { setSelectedBookId(book.book_id); setSelectedBookTitle(book.title); setShowBorrowModal(true) }}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #00ff88, #00a8ff)',
                          border: 'none',
                          padding: '0.6rem',
                          borderRadius: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Borrow Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'borrowed' && (
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <FaBook style={{ color: '#00ff88' }} /> My Borrowed Books
              </h2>
              {borrowedBooks.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  background: 'rgba(20, 20, 30, 0.6)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <FaBookOpen size={50} style={{ color: '#6c6c6c', marginBottom: '1rem' }} />
                  <p style={{ color: '#a0a0a0' }}>No books borrowed yet</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {borrowedBooks.map(book => (
                    <div key={book.book_id} style={{
                      background: 'rgba(20, 20, 30, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '20px',
                      padding: '1.5rem'
                    }}>
                      <h3 style={{ marginBottom: '0.5rem' }}>{book.title}</h3>
                      <p style={{ color: '#a0a0a0', marginBottom: '0.5rem' }}>by {book.author}</p>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <FaCalendarAlt style={{ marginRight: '0.5rem', color: '#00ff88' }} />
                        Borrowed: {book.borrow_date}
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <FaClock style={{ marginRight: '0.5rem', color: '#ffa502' }} />
                        Due Date: {book.due_date}
                      </div>
                      <button
                        onClick={() => openReturnModal(book)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #ffa502, #ff6b8b)',
                          border: 'none',
                          padding: '0.6rem',
                          borderRadius: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <FaUndo /> Return Book
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'fines' && (
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <FaMoneyBillWave style={{ color: '#ffa502' }} /> Fine Details
              </h2>
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                background: 'rgba(20, 20, 30, 0.6)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ fontSize: '3rem', color: totalFine > 0 ? '#ffa502' : '#00ff88' }}>Rs. {totalFine}</h3>
                <p>Total Fine Due</p>
                {totalFine > 0 && <p style={{ color: '#a0a0a0', marginTop: '0.5rem' }}>Please pay at the library counter</p>}
              </div>
              <div style={{
                background: 'rgba(20, 20, 30, 0.6)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <h3 style={{ marginBottom: '1rem' }}>Fine Rules</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>✓ 14 days free borrowing period</li>
                  <li style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>✓ Rs. 20 fine per week after due date</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Clear fines before borrowing new books</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <FaHistory style={{ color: '#00ff88' }} /> Transaction History
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Transaction ID</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Book ID</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.transaction_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '1rem' }}>{t.transaction_id}</td>
                        <td style={{ padding: '1rem' }}>{t.book_id}</td>
                        <td style={{ padding: '1rem' }}>{t.transaction_date}</td>
                        <td style={{ padding: '1rem', color: t.type === 'borrow' ? '#00ff88' : '#ffa502' }}>{t.type}</td>
                        <td style={{ padding: '1rem', color: t.status === 'active' ? '#00ff88' : t.status === 'overdue' ? '#ff4444' : '#ffa502' }}>{t.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Borrow Modal */}
      <AnimatePresence>
        {showBorrowModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
            }}
            onClick={() => setShowBorrowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              style={{
                background: '#111111',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '2rem',
                maxWidth: '450px',
                width: '90%'
              }}
              onClick={e => e.stopPropagation()}
            >
              <h3 style={{ marginBottom: '0.5rem' }}>Borrow a Book</h3>
              <p style={{ color: '#a0a0a0', marginBottom: '1rem' }}>Enter the Book ID or search by title</p>
              <input
                type="text"
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                placeholder="Enter Book ID (e.g., 1, 2, 3...)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  marginBottom: '1.5rem'
                }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setShowBorrowModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    color: '#fff'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBorrow}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #00ff88, #00a8ff)',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Confirm Borrow
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Return Modal */}
      <AnimatePresence>
        {showReturnModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
            }}
            onClick={() => setShowReturnModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              style={{
                background: '#111111',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '2rem',
                maxWidth: '450px',
                width: '90%'
              }}
              onClick={e => e.stopPropagation()}
            >
              <h3 style={{ marginBottom: '0.5rem' }}>Return Book</h3>
              <p style={{ marginBottom: '1rem' }}>
                Are you sure you want to return <strong style={{ color: '#00ff88' }}>"{selectedBookTitle}"</strong>?
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setShowReturnModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    color: '#fff'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReturn}
                  disabled={returnLoading}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #ffa502, #ff6b8b)',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {returnLoading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaUndo />}
                  {returnLoading ? 'Processing...' : 'Confirm Return'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}