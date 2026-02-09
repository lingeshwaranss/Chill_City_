import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ADMIN_EMAILS } from '../constants';
import { User } from '../types';
import { Mail, ArrowRight, X } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Check if email is in the admin list
    const isAdmin = ADMIN_EMAILS.includes(email.trim().toLowerCase());
    
    const user: User = {
        email: email,
        role: isAdmin ? 'admin' : 'citizen'
    };

    onLogin(user);
    navigate('/');
  };

  return (
    <div className="h-full flex items-center justify-center bg-background p-4 relative">
      <Link to="/" className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
        <X size={24} />
      </Link>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20">
                <span className="font-black text-white text-3xl">C</span>
            </div>
            <h1 className="text-2xl font-bold text-primary">CHILL CITY</h1>
            <p className="text-gray-500 text-sm">Administrative Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@chillcity.gov" 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        required
                    />
                </div>
            </div>

            <button 
                type="submit" 
                className="w-full bg-primary hover:bg-blue-800 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20 flex items-center justify-center transition-all group"
            >
                Secure Login <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
             <Link to="/" className="text-sm text-gray-400 hover:text-primary font-medium">
                Cancel and return to Public View
             </Link>
             <p className="text-[10px] text-gray-300 mt-4">
                Authorized Personnel Only.
             </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;