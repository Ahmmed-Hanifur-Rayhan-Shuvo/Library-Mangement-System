import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔄 Connecting to MongoDB Atlas...');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas Connected Successfully!');
    initSampleData();
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// ============= SCHEMAS =============
const bookSchema = new mongoose.Schema({
  book_id: { type: String, unique: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  publisher: String,
  publish_date: String,
  category: String,
  available: { type: Boolean, default: true },
  copies: { type: Number, default: 1 },
  borrowed_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  user_id: { type: String, unique: true },
  name: { type: String, required: true },
  email: String,
  phone: String,
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'faculty', 'librarian'], required: true },
  roll_number: String,
  batch: String,
  semester: String,
  department: String,
  fine_amount: { type: Number, default: 0, get: v => v || 0, set: v => v || 0 },
  is_active: { type: Boolean, default: true },
  registration_date: { type: String, default: () => new Date().toISOString().split('T')[0] }
});

const transactionSchema = new mongoose.Schema({
  transaction_id: { type: String, unique: true },
  user_id: String,
  book_id: String,
  transaction_date: String,
  due_date: String,
  return_date: String,
  type: { type: String, enum: ['borrow', 'return'] },
  fine_amount: { type: Number, default: 0, get: v => v || 0, set: v => v || 0 },
  status: { type: String, enum: ['active', 'completed', 'overdue'], default: 'active' }
});

const borrowSchema = new mongoose.Schema({
  transaction_id: String,
  user_id: String,
  book_id: String,
  borrow_date: String,
  due_date: String,
  extended: { type: Boolean, default: false }
});

const Book = mongoose.model('Book', bookSchema);
const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Borrow = mongoose.model('Borrow', borrowSchema);

// ============= HELPER FUNCTIONS =============
const generateId = (prefix) => `${prefix}${Date.now()}`;

const calculateDueDate = (userType) => {
  const date = new Date();
  const days = userType === 'student' ? 14 : 30;
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-GB');
};

const safeNumber = (value, defaultValue = 0) => {
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
};

const calculateFine = (dueDate, returnDate) => {
  try {
    if (!dueDate || !returnDate) return 0;
    
    const dueParts = dueDate.split('-');
    const returnParts = returnDate.split('-');
    
    const due = new Date(parseInt(dueParts[2]), parseInt(dueParts[1]) - 1, parseInt(dueParts[0]));
    const ret = new Date(parseInt(returnParts[2]), parseInt(returnParts[1]) - 1, parseInt(returnParts[0]));
    
    if (ret <= due) return 0;
    
    const diffTime = Math.abs(ret - due);
    const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeksOverdue = Math.ceil(daysOverdue / 7);
    return weeksOverdue * 20;
  } catch (error) {
    console.error('Fine calculation error:', error);
    return 0;
  }
};

// ============= AUTH ROUTES =============
app.post('/api/auth/login', async (req, res) => {
  const { userId, password, role } = req.body;
  try {
    const user = await User.findOne({ user_id: userId, role, is_active: true });
    if (user && user.password === password) {
      const token = jwt.sign({ userId: user.user_id, role }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '30d' });
      res.json({ success: true, user: { user_id: user.user_id, name: user.name, role: user.role }, token, role });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, password, role, roll_number, batch, semester, department, email, phone } = req.body;
  try {
    const prefix = role === 'student' ? 'S' : role === 'faculty' ? 'F' : 'L';
    const count = await User.countDocuments({ role });
    const user_id = `${prefix}${String(count + 1).padStart(3, '0')}`;
    
    const user = new User({ 
      user_id, 
      name, 
      password, 
      role, 
      roll_number, 
      batch, 
      semester, 
      department, 
      email, 
      phone,
      fine_amount: 0
    });
    await user.save();
    const token = jwt.sign({ userId: user.user_id, role }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '30d' });
    res.json({ success: true, user: { user_id: user.user_id, name: user.name, role: user.role }, token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// ============= BOOK ROUTES =============
app.get('/api/books', async (req, res) => {
  const books = await Book.find().sort({ created_at: -1 });
  res.json(books);
});

app.post('/api/books', async (req, res) => {
  const lastBook = await Book.findOne().sort({ book_id: -1 });
  const lastId = lastBook ? parseInt(lastBook.book_id) : 0;
  const book = new Book({ ...req.body, book_id: String(lastId + 1), available: true });
  await book.save();
  res.json(book);
});

app.put('/api/books/:id', async (req, res) => {
  const book = await Book.findOneAndUpdate({ book_id: req.params.id }, req.body, { new: true });
  res.json(book);
});

app.delete('/api/books/:id', async (req, res) => {
  await Book.deleteOne({ book_id: req.params.id });
  res.json({ success: true });
});

// ============= BORROW ROUTE =============
app.post('/api/borrow', async (req, res) => {
  const { userId, bookId, userType } = req.body;
  
  try {
    const book = await Book.findOne({ book_id: bookId });
    if (!book) {
      return res.status(400).json({ success: false, message: 'Book not found' });
    }
    
    const availableCopies = safeNumber(book.copies, 0);
    if (availableCopies < 1) {
      return res.status(400).json({ success: false, message: 'Book not available' });
    }
    
    const activeBorrows = await Borrow.countDocuments({ user_id: userId });
    const maxBorrows = userType === 'student' ? 5 : 10;
    if (activeBorrows >= maxBorrows) {
      return res.status(400).json({ success: false, message: `Maximum ${maxBorrows} books allowed` });
    }
    
    const user = await User.findOne({ user_id: userId });
    const userFine = safeNumber(user?.fine_amount, 0);
    
    if (userFine > 0) {
      return res.status(400).json({ success: false, message: `Please clear your fine of Rs. ${userFine} first` });
    }
    
    book.copies = availableCopies - 1;
    book.available = book.copies > 0;
    book.borrowed_count = safeNumber(book.borrowed_count, 0) + 1;
    await book.save();
    
    const transactionId = generateId('tr');
    const borrowDate = new Date().toLocaleDateString('en-GB');
    const dueDate = calculateDueDate(userType);
    
    const transaction = new Transaction({
      transaction_id: transactionId,
      user_id: userId,
      book_id: bookId,
      transaction_date: borrowDate,
      due_date: dueDate,
      type: 'borrow',
      status: 'active',
      fine_amount: 0
    });
    await transaction.save();
    
    const borrow = new Borrow({
      transaction_id: transactionId,
      user_id: userId,
      book_id: bookId,
      borrow_date: borrowDate,
      due_date: dueDate
    });
    await borrow.save();
    
    res.json({ success: true, transactionId, borrowDate, dueDate });
  } catch (error) {
    console.error('Borrow error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============= RETURN ROUTE (NaN Error Fixed) =============
app.post('/api/return', async (req, res) => {
  const { userId, bookId } = req.body;
  
  console.log('📚 Return request:', { userId, bookId });
  
  try {
    const book = await Book.findOne({ book_id: bookId });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    
    const borrow = await Borrow.findOne({ user_id: userId, book_id: bookId });
    if (!borrow) {
      return res.status(400).json({ success: false, message: 'You have not borrowed this book' });
    }
    
    // Update book copies
    const currentCopies = safeNumber(book.copies, 0);
    book.copies = currentCopies + 1;
    book.available = true;
    await book.save();
    
    // Calculate fine
    const returnDate = new Date().toLocaleDateString('en-GB');
    let fine = 0;
    
    if (borrow.due_date) {
      fine = calculateFine(borrow.due_date, returnDate);
    }
    
    // Get current fine (safe)
    const user = await User.findOne({ user_id: userId });
    const currentFine = safeNumber(user?.fine_amount, 0);
    const newFine = currentFine + fine;
    
    // Update user fine (ensure number)
    await User.updateOne(
      { user_id: userId },
      { $set: { fine_amount: newFine } }
    );
    
    // Update transaction
    await Transaction.updateOne(
      { transaction_id: borrow.transaction_id },
      { 
        $set: { 
          return_date: returnDate, 
          fine_amount: fine,
          status: fine > 0 ? 'overdue' : 'completed' 
        }
      }
    );
    
    // Delete borrow record
    await Borrow.deleteOne({ user_id: userId, book_id: bookId });
    
    console.log('✅ Book returned:', { bookId, fine, totalFine: newFine });
    res.json({ success: true, fine: fine });
    
  } catch (error) {
    console.error('❌ Return error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============= GET ROUTES =============
app.get('/api/borrowed/:userId', async (req, res) => {
  try {
    const borrows = await Borrow.find({ user_id: req.params.userId });
    const books = await Promise.all(borrows.map(async (borrow) => {
      const book = await Book.findOne({ book_id: borrow.book_id });
      return { ...book.toObject(), borrow_date: borrow.borrow_date, due_date: borrow.due_date };
    }));
    res.json(books);
  } catch (error) {
    res.status(500).json([]);
  }
});

app.get('/api/fine/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.params.userId });
    const fineAmount = safeNumber(user?.fine_amount, 0);
    res.json({ fine: fineAmount });
  } catch (error) {
    res.status(500).json({ fine: 0 });
  }
});

app.get('/api/history/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ user_id: req.params.userId }).sort({ transaction_date: -1 });
    // Ensure fine_amount is number
    const safeTransactions = transactions.map(t => ({
      ...t.toObject(),
      fine_amount: safeNumber(t.fine_amount, 0)
    }));
    res.json(safeTransactions);
  } catch (error) {
    res.status(500).json([]);
  }
});

// ============= USER MANAGEMENT ROUTES =============
app.get('/api/users/student', async (req, res) => {
  const users = await User.find({ role: 'student', is_active: true }).select('-password');
  const safeUsers = users.map(u => ({
    ...u.toObject(),
    fine_amount: safeNumber(u.fine_amount, 0)
  }));
  res.json(safeUsers);
});

app.get('/api/users/faculty', async (req, res) => {
  const users = await User.find({ role: 'faculty', is_active: true }).select('-password');
  const safeUsers = users.map(u => ({
    ...u.toObject(),
    fine_amount: safeNumber(u.fine_amount, 0)
  }));
  res.json(safeUsers);
});

app.delete('/api/users/:userId', async (req, res) => {
  await User.updateOne({ user_id: req.params.userId }, { is_active: false });
  res.json({ success: true });
});

// ============= TRANSACTIONS ROUTES =============
app.get('/api/transactions', async (req, res) => {
  const transactions = await Transaction.find().sort({ transaction_date: -1 });
  const safeTransactions = transactions.map(t => ({
    ...t.toObject(),
    fine_amount: safeNumber(t.fine_amount, 0)
  }));
  res.json(safeTransactions);
});

// ============= STATISTICS ROUTES =============
app.get('/api/stats', async (req, res) => {
  const [totalBooks, availableBooks, totalStudents, totalFaculty, activeBorrows] = await Promise.all([
    Book.countDocuments(),
    Book.countDocuments({ available: true }),
    User.countDocuments({ role: 'student', is_active: true }),
    User.countDocuments({ role: 'faculty', is_active: true }),
    Borrow.countDocuments()
  ]);
  res.json({ totalBooks, availableBooks, totalStudents, totalFaculty, activeBorrows });
});

// ============= INIT SAMPLE DATA =============
const initSampleData = async () => {
  try {
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      await Book.insertMany([
        { book_id: "1", title: "Python Programming", author: "John Smith", publisher: "Tech Publishers", category: "Programming", copies: 5, available: true, borrowed_count: 0 },
        { book_id: "2", title: "Data Structures", author: "Jane Doe", publisher: "CS Publications", category: "Computer Science", copies: 3, available: true, borrowed_count: 0 },
        { book_id: "3", title: "Machine Learning", author: "Alice Johnson", publisher: "AI Books", category: "AI/ML", copies: 4, available: true, borrowed_count: 0 },
        { book_id: "4", title: "Web Development", author: "Bob Wilson", publisher: "Web Press", category: "Web Development", copies: 2, available: true, borrowed_count: 0 },
        { book_id: "5", title: "Database Systems", author: "Carol Brown", publisher: "DB Press", category: "Database", copies: 3, available: true, borrowed_count: 0 }
      ]);
      console.log('✅ 5 Sample books added');
    }
    
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany([
        { user_id: "S1001", name: "John Student", password: "123456", role: "student", roll_number: "2023001", batch: "2023", semester: "4", department: "CSE", is_active: true, fine_amount: 0 },
        { user_id: "S1002", name: "Jane Student", password: "123456", role: "student", roll_number: "2023002", batch: "2023", semester: "4", department: "EEE", is_active: true, fine_amount: 0 },
        { user_id: "F101", name: "Dr. Robert Faculty", password: "123456", role: "faculty", department: "CSE", is_active: true, fine_amount: 0 },
        { user_id: "F102", name: "Prof. Alice Faculty", password: "123456", role: "faculty", department: "EEE", is_active: true, fine_amount: 0 },
        { user_id: "L10", name: "Admin Librarian", password: "123456", role: "librarian", is_active: true, fine_amount: 0 }
      ]);
      console.log('✅ 5 Sample users added');
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));