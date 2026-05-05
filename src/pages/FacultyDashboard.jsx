import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { bookAPI, borrowAPI } from '../services/api'
import toast from 'react-hot-toast'
import { 
  FaBook, FaBookOpen, FaSignOutAlt, FaChalkboardTeacher, 
  FaFlask, FaGraduationCap, FaSearch, FaMoneyBillWave, 
  FaClock, FaUser, FaUndo, FaSpinner, FaCalendarAlt,
  FaEye, FaDownload, FaPlus
} from 'react-icons/fa'

export default function FacultyDashboard() {
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
  const [returnLoading, setReturnLoading] = useState(false)

  // Research papers data
  const [researchPapers] = useState([
    { id: 1, title: "Machine Learning in Education", authors: "Dr. Smith, Dr. Johnson", journal: "Journal of Educational Technology", year: "2024" },
    { id: 2, title: "Data Structures Optimization", authors: "Prof. Brown et al.", journal: "Computer Science Review", year: "2023" },
    { id: 3, title: "Web Development Trends 2025", authors: "Dr. Lee, Dr. Chen", journal: "IEEE Software", year: "2024" },
    { id: 4, title: "AI in Library Management", authors: "Dr. Williams", journal: "Library Technology", year: "2024" },
    { id: 5, title: "Cloud Computing Advances", authors: "Prof. Davis", journal: "Cloud Journal", year: "2023" }
  ])

  // Courses data
  const [courses] = useState([
    { id: 1, code: "CS101", name: "Programming Fundamentals", semester: "1", students: 45 },
    { id: 2, code: "CS201", name: "Data Structures", semester: "3", students: 38 },
    { id: 3, code: "CS301", name: "Algorithms", semester: "5", students: 32 },
    { id: 4, code: "CS401", name: "Database Systems", semester: "7", students: 28 },
    { id: 5, code: "CS501", name: "Web Development", semester: "7", students: 35 }
  ])

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [borrowedRes, booksRes, fineRes] = await Promise.all([
        borrowAPI.getBorrowed(user.user_id),
        bookAPI.getAll(),
        borrowAPI.getFine(user.user_id)
      ])
      setBorrowedBooks(borrowedRes.data || [])
      setAvailableBooks((booksRes.data || []).filter(b => b.available === true))
      setTotalFine(fineRes.data?.fine || 0)
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
        userType: 'faculty' 
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

  const filteredBooks = availableBooks.filter(book => 
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
    <div style={{ background: 'linear-gradient(135deg, #0a0a0a, #0d0d0d)', minHeight: '100vh' }}>
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
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FaChalkboardTeacher size={20} style={{ color: '#fff' }} />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              Faculty Portal
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '36px', height: '36px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FaUser size={18} style={{ color: '#fff' }} />
              </div>
              <span style={{ color: '#fff', fontWeight: 500 }}>Prof. {user?.name}</span>
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
            }}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div style={{ display: 'flex', paddingTop: '70px', minHeight: '100vh' }}>
        {/* Sidebar */}
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
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <FaChalkboardTeacher size={40} style={{ color: '#fff' }} />
            </div>
            <h4 style={{ marginBottom: '0.25rem' }}>Prof. {user?.name}</h4>
            <p style={{ fontSize: '0.75rem', color: '#6c6c6c' }}>{user?.user_id}</p>
            <p style={{ fontSize: '0.7rem', color: '#3b82f6', marginTop: '0.25rem' }}>{user?.department || 'Faculty'}</p>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button onClick={() => setActiveTab('books')} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem', borderRadius: '12px', width: '100%',
              background: activeTab === 'books' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'rgba(255, 255, 255, 0.03)',
              border: 'none', color: activeTab === 'books' ? '#fff' : '#fff',
              cursor: 'pointer', transition: 'all 0.3s'
            }}>
              <FaBookOpen /> Books
            </button>
            <button onClick={() => setActiveTab('research')} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem', borderRadius: '12px', width: '100%',
              background: activeTab === 'research' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'rgba(255, 255, 255, 0.03)',
              border: 'none', color: '#fff', cursor: 'pointer', transition: 'all 0.3s'
            }}>
              <FaFlask /> Research
            </button>
            <button onClick={() => setActiveTab('courses')} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem', borderRadius: '12px', width: '100%',
              background: activeTab === 'courses' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'rgba(255, 255, 255, 0.03)',
              border: 'none', color: '#fff', cursor: 'pointer', transition: 'all 0.3s'
            }}>
              <FaGraduationCap /> Courses
            </button>
            <button onClick={() => setActiveTab('fines')} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem', borderRadius: '12px', width: '100%',
              background: activeTab === 'fines' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'rgba(255, 255, 255, 0.03)',
              border: 'none', color: '#fff', cursor: 'pointer', transition: 'all 0.3s'
            }}>
              <FaMoneyBillWave /> Fines
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
              <span style={{ fontWeight: 600, color: '#3b82f6' }}>{borrowedBooks.length}/10</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#a0a0a0' }}>Fine Amount</span>
              <span style={{ fontWeight: 600, color: totalFine > 0 ? '#f59e0b' : '#3b82f6' }}>Rs. {totalFine}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#a0a0a0' }}>Free Days</span>
              <span style={{ fontWeight: 600, color: '#3b82f6' }}>30</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, marginLeft: '280px', padding: '2rem' }}>
          {activeTab === 'books' && (
            <>
              {/* Stats Cards */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem', marginBottom: '2rem'
              }}>
                <div style={{ background: 'rgba(20, 20, 30, 0.6)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.8rem', color: '#3b82f6' }}>{borrowedBooks.length}</h3>
                  <p style={{ color: '#a0a0a0' }}>Books Borrowed</p>
                </div>
                <div style={{ background: 'rgba(20, 20, 30, 0.6)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.8rem', color: totalFine > 0 ? '#f59e0b' : '#3b82f6' }}>Rs. {totalFine}</h3>
                  <p style={{ color: '#a0a0a0' }}>Total Fine</p>
                </div>
                <div style={{ background: 'rgba(20, 20, 30, 0.6)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.8rem', color: '#3b82f6' }}>30</h3>
                  <p style={{ color: '#a0a0a0' }}>Free Days</p>
                </div>
                <div style={{ background: 'rgba(20, 20, 30, 0.6)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.8rem', color: '#3b82f6' }}>{availableBooks.length}</h3>
                  <p style={{ color: '#a0a0a0' }}>Available Books</p>
                </div>
              </div>

              {/* Available Books */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2><FaBookOpen /> Available Books</h2>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                      <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c6c6c' }} />
                      <input type="text" placeholder="Search books..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                        style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', width: '250px', background: 'rgba(0,0,0,0.4)', border: '1px solid #1f2937', borderRadius: '8px', color: '#fff' }} />
                    </div>
                    <button onClick={() => setShowBorrowModal(true)} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                      <FaBookOpen /> Borrow Book
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {filteredBooks.slice(0, 6).map(book => (
                    <div key={book.book_id} style={{ background: 'rgba(20,20,30,0.6)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <h4>{book.title}</h4>
                      <p style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>by {book.author}</p>
                      <p style={{ fontSize: '0.75rem', color: '#6c6c6c' }}>{book.publisher}</p>
                      <p>Copies: {book.copies}</p>
                      <button onClick={() => { setSelectedBookId(book.book_id); setSelectedBookTitle(book.title); setShowBorrowModal(true) }} 
                        style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
                        Borrow
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Borrowed Books */}
              <div style={{ marginTop: '2rem' }}>
                <h2><FaBook /> My Borrowed Books</h2>
                {borrowedBooks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(20,20,30,0.6)', borderRadius: '12px' }}>
                    <p>No books borrowed yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                    {borrowedBooks.map(book => (
                      <div key={book.book_id} style={{ background: 'rgba(20,20,30,0.6)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <h4>{book.title}</h4>
                        <p style={{ fontSize: '0.8rem' }}><FaCalendarAlt /> Borrowed: {book.borrow_date}</p>
                        <p style={{ fontSize: '0.8rem' }}><FaClock /> Due: {book.due_date}</p>
                        <button onClick={() => { setSelectedBookId(book.book_id); setSelectedBookTitle(book.title); setShowReturnModal(true) }}
                          style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', background: '#f59e0b', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
                          <FaUndo /> Return
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'research' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem' }}><FaFlask /> Research Materials</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(20,20,30,0.6)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.5rem', color: '#3b82f6' }}>{researchPapers.length}</h3>
                  <p>Research Papers</p>
                </div>
                <div style={{ background: 'rgba(20,20,30,0.6)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.5rem', color: '#3b82f6' }}>145</h3>
                  <p>Citations</p>
                </div>
                <div style={{ background: 'rgba(20,20,30,0.6)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.5rem', color: '#3b82f6' }}>3</h3>
                  <p>Research Grants</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {researchPapers.map(paper => (
                  <div key={paper.id} style={{ background: 'rgba(20,20,30,0.6)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h4>{paper.title}</h4>
                    <p style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>{paper.authors}</p>
                    <p style={{ fontSize: '0.75rem' }}>{paper.journal} • {paper.year}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button style={{ flex: 1, padding: '0.4rem', background: '#3b82f6', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}><FaEye /> View</button>
                      <button style={{ flex: 1, padding: '0.4rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}><FaDownload /> PDF</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem' }}><FaGraduationCap /> My Courses</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {courses.map(course => (
                  <div key={course.id} style={{ background: 'rgba(20,20,30,0.6)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h4>{course.code} - {course.name}</h4>
                    <p style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>Semester {course.semester} • {course.students} Students</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button style={{ flex: 1, padding: '0.4rem', background: '#3b82f6', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}><FaBook /> Materials</button>
                      <button style={{ flex: 1, padding: '0.4rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}><FaPlus /> Manage</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'fines' && (
            <div>
              <h2><FaMoneyBillWave /> Fine Details</h2>
              <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(20,20,30,0.6)', borderRadius: '12px', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '2rem', color: totalFine > 0 ? '#f59e0b' : '#3b82f6' }}>Rs. {totalFine}</h3>
                <p>Total Fine Due</p>
              </div>
              <div style={{ background: 'rgba(20,20,30,0.6)', borderRadius: '12px', padding: '1rem' }}>
                <h3>Fine Rules</h3>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                  <li>30 days free borrowing period for Faculty</li>
                  <li>Rs. 20 fine per week after due date</li>
                  <li>Clear fines before borrowing new books</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Borrow Modal */}
      {showBorrowModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setShowBorrowModal(false)}>
          <div style={{ background: '#111', border: '1px solid #1f2937', borderRadius: '16px', padding: '1.5rem', maxWidth: '400px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3>Borrow Book</h3>
            <p>Borrow <strong>{selectedBookTitle}</strong>?</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => setShowBorrowModal(false)} style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleBorrow} style={{ flex: 1, padding: '0.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setShowReturnModal(false)}>
          <div style={{ background: '#111', border: '1px solid #1f2937', borderRadius: '16px', padding: '1.5rem', maxWidth: '400px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3>Return Book</h3>
            <p>Return <strong>{selectedBookTitle}</strong>?</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => setShowReturnModal(false)} style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleReturn} disabled={returnLoading} style={{ flex: 1, padding: '0.5rem', background: '#f59e0b', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                {returnLoading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : 'Confirm Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}