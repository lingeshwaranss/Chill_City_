import React from 'react';
import { Message, User } from '../types';
import { Mail, Clock, ArrowLeft, Inbox } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface InboxPageProps {
    messages: Message[];
    user: User | null;
}

const InboxPage: React.FC<InboxPageProps> = ({ messages, user }) => {
    const navigate = useNavigate();

    // Protection: Only allow admins
    if (!user || user.role !== 'admin') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-background">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <Mail size={32} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Access Restricted</h2>
                <p className="text-gray-500 mb-6 max-w-xs mx-auto">This inbox is reserved for administrators to view citizen feedback.</p>
                <Link to="/login" className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-800 transition-colors">
                    Admin Login
                </Link>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-[#F4F7F6] p-4 md:p-8 pb-24">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center mb-6">
                    <button onClick={() => navigate(-1)} className="mr-4 text-gray-500 hover:text-primary md:hidden">
                        <ArrowLeft />
                    </button>
                    <h1 className="text-2xl font-bold text-primary flex items-center">
                        <Inbox className="mr-3" /> Admin Inbox
                        {messages.length > 0 && (
                            <span className="ml-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-mono">
                                {messages.length}
                            </span>
                        )}
                    </h1>
                </div>

                {messages.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <Mail size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700">Inbox is Empty</h3>
                        <p className="text-gray-500 text-sm mt-1">No new feedback messages from citizens.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all relative overflow-hidden group animate-fade-in">
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${msg.isRead ? 'bg-gray-300' : 'bg-primary'}`}></div>
                                
                                <div className="flex justify-between items-start mb-2 pl-2">
                                    <div className="flex-1 pr-4">
                                        <h3 className="font-bold text-slate-800 text-base md:text-lg">{msg.topic}</h3>
                                        <p className="text-xs text-primary font-bold uppercase tracking-wider mt-1">From: Citizen</p>
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium flex items-center bg-gray-50 px-2 py-1 rounded">
                                        <Clock size={12} className="mr-1" />
                                        {new Date(msg.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                    </span>
                                </div>
                                
                                <div className="pl-2 mt-3">
                                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        {msg.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InboxPage;