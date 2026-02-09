import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { List, Plus, User as UserIcon, Map as MapIcon, Menu, X, LogOut, Shield, Lock, MessageSquare, CheckCircle, Send, Mail } from 'lucide-react';

// Pages
import IssuesMapPage from './pages/IssuesMapPage';
import DashboardPage from './pages/DashboardPage';
import ComplaintDetailsPage from './pages/ComplaintDetailsPage';
import NewReportPage from './pages/NewReportPage';
import LoginPage from './pages/LoginPage';
import InboxPage from './pages/InboxPage';

// Data
import { MOCK_ISSUES } from './constants';
import { Issue, User as UserType, Message } from './types';

const NavLink: React.FC<{ to: string; icon: React.ReactNode; label: string; mobile?: boolean; onClick?: () => void }> = ({ to, icon, label, mobile, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    
    if (mobile) {
        return (
             <Link 
                to={to} 
                onClick={onClick}
                className={`flex items-center p-4 text-sm font-bold transition-colors ${isActive ? 'text-primary bg-blue-50 border-l-4 border-primary' : 'text-gray-600 hover:text-primary'}`}
            >
                <span className="mr-3">{icon}</span>
                {label}
            </Link>
        )
    }

    return (
        <Link 
            to={to} 
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary font-bold' : 'text-gray-400 hover:text-primary'}`}
        >
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
        </Link>
    );
};

const FeedbackModal: React.FC<{ onClose: () => void; onSend: (topic: string, description: string) => void }> = ({ onClose, onSend }) => {
    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        onSend(topic, description);
        
        // Simulating network delay for effect
        setTimeout(() => {
            setIsSent(true);
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
                    <X size={20} />
                </button>
                
                <div className="flex items-center space-x-3 mb-6 text-primary">
                    <div className="bg-blue-50 p-2 rounded-full">
                        <MessageSquare size={24} />
                    </div>
                    <h2 className="text-xl font-bold">Feedback & Support</h2>
                </div>

                {isSent ? (
                    <div className="text-center py-8 animate-fade-in">
                        <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Message Sent!</h3>
                        <p className="text-gray-500 mb-6">Your message has been sent to the Admin. Thank you for your feedback.</p>
                        <button onClick={onClose} className="bg-gray-100 text-gray-600 font-bold py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors">
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-600 mb-6 text-sm">
                            Found a bug? Have a suggestion? Fill out the form below to send a message directly to the admin inbox.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Topic</label>
                                <input 
                                    type="text" 
                                    required
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., App Crash, Map Issue, Suggestion"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                <textarea 
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Please describe the issue or idea in detail..."
                                    rows={4}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                                />
                            </div>
                            <button 
                                type="submit"
                                className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center shadow-lg shadow-blue-900/10"
                            >
                                <Send size={18} className="mr-2" /> Send Message
                            </button>
                        </form>

                        <div className="border-t border-gray-100 pt-6">
                            <p className="text-xs text-gray-400 font-bold uppercase text-center mb-4">Direct Contact Info</p>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 group hover:border-primary/30 transition-colors">
                                    <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</span>
                                    <a href="mailto:lingeshwaranssmani@gmail.com" className="block text-sm font-bold text-slate-800 group-hover:text-primary break-all transition-colors">lingeshwaranssmani@gmail.com</a>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>(MOCK_ISSUES);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const addIssue = (newIssue: Issue) => {
    setIssues(prev => [newIssue, ...prev]);
  };

  const updateIssue = (updatedIssue: Issue) => {
    setIssues(prev => prev.map(i => i.id === updatedIssue.id ? updatedIssue : i));
  }

  const handleSendMessage = (topic: string, description: string) => {
      const newMessage: Message = {
          id: Date.now().toString(),
          topic,
          description,
          createdAt: new Date().toISOString(),
          isRead: false
      };
      setMessages(prev => [newMessage, ...prev]);
  };

  const handleLogin = (loggedInUser: UserType) => {
      setUser(loggedInUser);
  };

  const handleLogout = () => {
      setUser(null);
      setIsMobileMenuOpen(false);
  };

  return (
    <HashRouter>
      <div className="flex flex-col h-screen bg-background text-slate-800 overflow-hidden font-sans">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white shadow-md z-50 flex items-center justify-between px-4 lg:px-8 border-b border-gray-200">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg shadow-lg shadow-blue-900/20 flex items-center justify-center relative overflow-hidden group">
                    <span className="font-black text-white text-xl relative z-10">C</span>
                </div>
                <div className="flex flex-col justify-center">
                    <div className="h-4 flex items-center">
                        {user?.role === 'admin' ? (
                            <div className="flex items-center space-x-1 animate-fade-in">
                                <Shield size={10} className="text-red-500" />
                                <span className="text-[10px] font-bold text-red-600 uppercase tracking-tight truncate max-w-[150px]" title={user.email}>
                                    {user.email}
                                </span>
                            </div>
                        ) : (
                            <Link to="/login" className="flex items-center text-[10px] text-gray-400 hover:text-primary transition-colors font-semibold uppercase tracking-wider">
                                <Lock size={8} className="mr-1" /> Admin Login
                            </Link>
                        )}
                    </div>
                    <h1 className="font-bold text-xl tracking-tight text-primary leading-none -mt-0.5">CHILL CITY</h1>
                </div>
            </div>
            
            <button className="md:hidden text-primary" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
                <Link to="/" className="text-sm font-bold text-gray-600 hover:text-primary transition-colors uppercase tracking-wide">Issue Map</Link>
                <Link to="/dashboard" className="text-sm font-bold text-gray-600 hover:text-primary transition-colors uppercase tracking-wide">
                    {user?.role === 'admin' ? 'Cloud Dashboard' : 'My Complaints'}
                </Link>
                <Link to="/report" className="bg-primary hover:bg-blue-800 text-white px-6 py-2.5 rounded shadow-lg shadow-blue-900/20 text-sm font-bold transition-all transform hover:-translate-y-0.5">
                    Report Issue
                </Link>
                
                {/* Admin Inbox Icon */}
                {user?.role === 'admin' && (
                    <Link to="/inbox" className="text-gray-400 hover:text-primary relative" title="Inbox">
                        <Mail size={20} />
                        {messages.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {messages.length}
                            </span>
                        )}
                    </Link>
                )}

                <button onClick={() => setShowFeedback(true)} className="text-gray-400 hover:text-primary" title="Feedback">
                    <MessageSquare size={20} />
                </button>
                {user && (
                    <button onClick={handleLogout} className="text-gray-400 hover:text-danger ml-4" title="Logout">
                        <LogOut size={20} />
                    </button>
                )}
            </nav>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
            <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-sm pt-20 md:hidden animate-fade-in">
                <div className="flex flex-col px-4">
                    {user && (
                        <div className="mb-6 px-4 py-3 bg-gray-50 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Logged in as</p>
                                <p className="font-bold text-primary truncate max-w-[200px] text-xs">{user.email}</p>
                            </div>
                            {user.role === 'admin' && <Shield className="text-red-500" size={20} />}
                        </div>
                    )}
                    <NavLink mobile to="/" icon={<MapIcon />} label="Issues Map" onClick={() => setIsMobileMenuOpen(false)}/>
                    <NavLink mobile to="/dashboard" icon={<List />} label={user?.role === 'admin' ? "Cloud Dashboard" : "My Complaints"} onClick={() => setIsMobileMenuOpen(false)}/>
                    <NavLink mobile to="/report" icon={<Plus />} label="Report New Issue" onClick={() => setIsMobileMenuOpen(false)}/>
                    
                    {user?.role === 'admin' && (
                        <NavLink mobile to="/inbox" icon={<Mail />} label={`Inbox (${messages.length})`} onClick={() => setIsMobileMenuOpen(false)}/>
                    )}

                    <button 
                        onClick={() => { setShowFeedback(true); setIsMobileMenuOpen(false); }}
                        className="flex items-center p-4 text-sm font-bold text-gray-600 hover:text-primary transition-colors"
                    >
                         <MessageSquare className="mr-3" size={20} /> Feedback & Support
                    </button>

                    {user ? (
                        <button 
                            onClick={handleLogout}
                            className="flex items-center p-4 text-sm font-bold text-danger hover:bg-red-50 rounded mt-2 transition-colors"
                        >
                            <LogOut className="mr-3" size={20} /> Logout
                        </button>
                    ) : (
                        <Link 
                            to="/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center p-4 text-sm font-bold text-primary hover:bg-blue-50 rounded mt-2 transition-colors"
                        >
                            <UserIcon className="mr-3" size={20} /> Admin Login
                        </Link>
                    )}
                    
                    <div className="mt-8 pt-8 border-t border-gray-200">
                         <p className="text-center text-xs text-gray-400">CHILL CITY &copy; 2024</p>
                    </div>
                </div>
            </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-hidden bg-[#F4F7F6]">
            <Routes>
                <Route path="/" element={<IssuesMapPage issues={issues} />} />
                <Route path="/dashboard" element={<DashboardPage issues={issues} user={user} />} />
                <Route path="/report" element={<NewReportPage onAddIssue={addIssue} existingIssues={issues} user={user} />} />
                <Route path="/inbox" element={<InboxPage messages={messages} user={user} />} />
                <Route 
                    path="/complaint/:id" 
                    element={<ComplaintDetailsPage issues={issues} onUpdateIssue={updateIssue} user={user} />} 
                />
                <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </main>

        {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} onSend={handleSendMessage} />}

        {/* Bottom Tab Bar (Mobile Only) */}
        <nav className="md:hidden h-16 bg-white border-t border-gray-200 px-2 pb-safe z-[1000] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative">
            <div className="flex justify-between items-center w-full h-full px-2">
                <div className="flex-1 flex justify-around">
                    <NavLink to="/" icon={<MapIcon size={24} />} label="Map" />
                    <NavLink to="/dashboard" icon={<List size={24} />} label="Track" />
                </div>
                
                <div className="w-16"></div>

                <div className="flex-1 flex justify-around">
                    {user?.role === 'admin' ? (
                        <NavLink to="/inbox" icon={
                            <div className="relative">
                                <Mail size={24} />
                                {messages.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>}
                            </div>
                        } label="Inbox" />
                    ) : (
                        <button onClick={() => setShowFeedback(true)} className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-400 hover:text-primary">
                            <MessageSquare size={24} />
                             <span className="text-[10px] font-medium">Feedback</span>
                        </button>
                    )}
                    
                    {user ? (
                         <button onClick={handleLogout} className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-400 hover:text-danger">
                            <LogOut size={24} />
                            <span className="text-[10px] font-medium">Exit</span>
                        </button>
                    ) : (
                         <NavLink to="/login" icon={<UserIcon size={24} />} label="Admin" />
                    )}
                </div>
            </div>

            <div className="absolute left-1/2 -top-6 transform -translate-x-1/2">
                <Link 
                    to="/report" 
                    className="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-accent to-yellow-400 text-primary border-4 border-white rounded-full shadow-lg shadow-yellow-500/30 transition-transform active:scale-95"
                >
                    <Plus size={32} strokeWidth={3} />
                </Link>
            </div>
        </nav>

      </div>
    </HashRouter>
  );
};

export default App;