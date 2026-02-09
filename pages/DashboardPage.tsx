import React, { useState } from 'react';
import { Issue, IssueStatus, User } from '../types';
import StatusBadge from '../components/StatusBadge';
import IssueIcon from '../components/IssueIcon';
import { Link } from 'react-router-dom';
import { Filter, ChevronRight, CheckCircle, Clock, FileText, Download, Shield } from 'lucide-react';
import jsPDF from "jspdf";

interface DashboardPageProps {
  issues: Issue[];
  user: User | null;
}

const StatCard: React.FC<{ label: string; value: number; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
    <div className="bg-white border border-gray-100 p-5 rounded-xl flex items-center space-x-4 shadow-sm">
        <div className={`p-3 rounded-full ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">{label}</p>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const DashboardPage: React.FC<DashboardPageProps> = ({ issues, user }) => {
  const [filter, setFilter] = useState<IssueStatus | 'All'>('All');
  
  const isAdmin = user?.role === 'admin';

  // If Admin, show ALL issues. If Citizen/Guest, show only 'Me' issues.
  const relevantIssues = isAdmin ? issues : issues.filter(i => i.author === 'Me');
  const displayedIssues = filter === 'All' ? relevantIssues : relevantIssues.filter(i => i.status === filter);

  const stats = {
      total: relevantIssues.length,
      pending: relevantIssues.filter(i => i.status === IssueStatus.NEW || i.status === IssueStatus.IN_PROGRESS).length,
      resolved: relevantIssues.filter(i => i.status === IssueStatus.RESOLVED).length,
  };

  const handleDownloadPDF = (id: string) => {
      const issue = issues.find(i => i.id === id);
      if (!issue) return;

      const doc = new jsPDF();
      
      // Header Background
      doc.setFillColor(27, 59, 111); // Primary Blue
      doc.rect(0, 0, 210, 40, 'F');
      
      // Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("CHILL CITY", 20, 20);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Official Civic Complaint Receipt", 20, 30);

      // Body Content
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text("Generated Receipt", 20, 50);
      doc.setLineWidth(0.5);
      doc.line(20, 52, 190, 52);

      let yPos = 65;
      const lineHeight = 10;

      const addField = (label: string, value: string) => {
          doc.setFont("helvetica", "bold");
          doc.text(label, 20, yPos);
          doc.setFont("helvetica", "normal");
          doc.text(value, 80, yPos);
          yPos += lineHeight;
      };

      addField("Complaint ID:", issue.id);
      addField("Date Posted:", new Date(issue.createdAt).toLocaleString());
      addField("Issue Type:", issue.type);
      addField("Current Status:", issue.status);
      addField("Assigned Authority:", issue.assignedAuthority);
      addField("Location:", issue.locationName);
      
      if (issue.deadline) {
        addField("SLA Deadline:", new Date(issue.deadline).toLocaleDateString());
      }
      
      if (issue.resolvedAt) {
          addField("Date Cleared:", new Date(issue.resolvedAt).toLocaleString());
      }

      yPos += 5;
      doc.setFont("helvetica", "bold");
      doc.text("Description:", 20, yPos);
      yPos += 7;
      doc.setFont("helvetica", "normal");
      
      const splitDescription = doc.splitTextToSize(issue.description, 170);
      doc.text(splitDescription, 20, yPos);
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text("Thank you for reporting this issue and helping improve Chennai.", 105, 280, { align: 'center' });
      doc.text(`Timestamp: ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });

      doc.save(`ChillCity_Receipt_${issue.id}.pdf`);
  }

  const handleGlobalExport = () => {
      // 1. Define Headers with requested specific names
      const headers = ['Complaint ID', 'Type', 'Date Posted', 'Date Cleared', 'Turnaround Time', 'Assigned Authority', 'Status', 'Author'];
      
      // 2. Generate Rows with Logic - Exporting ALL issues available in context
      const rows = issues.map(issue => {
          let turnaround = "Pending";
          
          if (issue.createdAt && issue.resolvedAt) {
              const start = new Date(issue.createdAt).getTime();
              const end = new Date(issue.resolvedAt).getTime();
              const diffMs = end - start;
              
              if (diffMs > 0) {
                  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  turnaround = days > 0 ? `${days}d ${hours}h` : `${hours}h`;
              }
          } else if (issue.status === IssueStatus.RESOLVED) {
              turnaround = "Data Missing";
          }

          return [
              issue.id,
              `"${issue.type}"`,
              `"${new Date(issue.createdAt).toLocaleString()}"`,
              `"${issue.resolvedAt ? new Date(issue.resolvedAt).toLocaleString() : 'Not Cleared'}"`,
              `"${turnaround}"`,
              `"${issue.assignedAuthority}"`,
              issue.status,
              `"${issue.author}"`
          ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      
      // 3. Trigger Download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chill-city-overall-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert("Overall Report Export Complete! The CSV includes all complaints with posting and clearance dates.");
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-primary">
                    {isAdmin ? "Admin Cloud Dashboard" : "Track My Complaints"}
                </h1>
                {isAdmin && <Shield className="text-red-500" size={24} />}
            </div>
            <p className="text-gray-500">
                {isAdmin ? "Manage, monitor, and resolve civic issues across the city." : "Manage and monitor the status of your reported civic issues."}
            </p>
          </div>
          <button 
            onClick={handleGlobalExport}
            className="flex items-center justify-center space-x-2 bg-primary text-white hover:bg-blue-800 px-5 py-2.5 rounded-lg font-bold text-sm shadow-md shadow-blue-900/10 transition-all transform hover:-translate-y-0.5"
          >
              <Download size={16} />
              <span>Export Overall Report</span>
          </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Reported" value={stats.total} color="bg-blue-600" icon={<FileText className="text-blue-600" />} />
          <StatCard label="In Progress" value={stats.pending} color="bg-yellow-500" icon={<Clock className="text-yellow-600" />} />
          <StatCard label="Resolved" value={stats.resolved} color="bg-green-600" icon={<CheckCircle className="text-green-600" />} />
      </div>

      {/* Filter Bar */}
      <div className="flex justify-between items-center mb-6">
          <div className="relative">
             <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="appearance-none bg-white border border-gray-300 text-slate-700 py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer text-sm font-medium shadow-sm"
             >
                 <option value="All">All Statuses</option>
                 <option value={IssueStatus.NEW}>New</option>
                 <option value={IssueStatus.IN_PROGRESS}>In Progress</option>
                 <option value={IssueStatus.RESOLVED}>Resolved</option>
                 <option value={IssueStatus.DISPUTED}>Disputed</option>
             </select>
             <Filter size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
          </div>
          <Link to="/report" className="text-sm text-primary font-bold hover:underline md:hidden">
              + New Report
          </Link>
      </div>

      {/* List / Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
         {/* Desktop Table Header */}
         <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">
             <div className="col-span-2">Complaint ID</div>
             <div className="col-span-2">Type</div>
             <div className="col-span-2">Authority</div>
             <div className="col-span-2">Deadline</div>
             <div className="col-span-2">Location</div>
             <div className="col-span-1">Status</div>
             <div className="col-span-1 text-right">Action</div>
         </div>

         {/* Rows */}
         {displayedIssues.length === 0 ? (
             <div className="p-12 text-center text-gray-400">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p>No complaints found matching criteria.</p>
             </div>
         ) : (
             displayedIssues.map(issue => (
                <div key={issue.id} className="group hover:bg-blue-50/50 transition-colors border-b border-gray-100 last:border-0">
                    {/* Desktop Row */}
                    <div className="hidden md:grid grid-cols-12 gap-4 p-4 items-center text-sm text-slate-700">
                        <div className="col-span-2 font-mono text-gray-600 font-bold text-xs truncate" title={issue.id}>{issue.id}</div>
                        <div className="col-span-2 font-bold text-primary flex items-center">
                            <IssueIcon type={issue.type} size={16} className="mr-2 text-primary/80" />
                            <span className="truncate">{issue.type}</span>
                        </div>
                        <div className="col-span-2 text-xs font-medium bg-gray-100 rounded px-2 py-1 inline-block truncate" title={issue.assignedAuthority}>
                            {issue.assignedAuthority || "Pending Assignment"}
                        </div>
                        <div className="col-span-2 font-medium text-gray-600 flex items-center">
                            <Clock size={12} className="mr-1 text-accent" />
                            {issue.deadline ? new Date(issue.deadline).toLocaleDateString() : 'TBD'}
                        </div>
                        <div className="col-span-2 truncate text-gray-500">{issue.locationName}</div>
                        <div className="col-span-1"><StatusBadge status={issue.status} /></div>
                        <div className="col-span-1 text-right flex justify-end space-x-2">
                             <button 
                                onClick={() => handleDownloadPDF(issue.id)}
                                className="text-gray-400 hover:text-primary transition-colors"
                                title="Download PDF"
                             >
                                 <Download size={16} />
                             </button>
                             <Link to={`/complaint/${issue.id}`} className="text-primary hover:text-blue-800 font-bold text-xs border border-primary/20 hover:border-primary px-3 py-1 rounded transition-all">
                                {isAdmin ? 'Manage' : 'View'}
                             </Link>
                        </div>
                    </div>

                    {/* Mobile Card Row */}
                    <div className="md:hidden p-4 border-b border-gray-100 relative">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <img src={issue.imageUrl} className="w-12 h-12 rounded object-cover border border-gray-200" alt="" />
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                        <IssueIcon type={issue.type} size={12} className="text-primary" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">{issue.type}</h3>
                                    <p className="text-xs text-gray-500 font-mono">{issue.id}</p>
                                </div>
                            </div>
                            <StatusBadge status={issue.status} size="sm" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded">
                            <div>
                                <span className="block text-[10px] text-gray-400 uppercase">Authority</span>
                                <span className="font-medium truncate block">{issue.assignedAuthority || "Pending"}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] text-gray-400 uppercase">Deadline</span>
                                <span className="font-medium text-red-600">{issue.deadline || "TBD"}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                             <button 
                                onClick={() => handleDownloadPDF(issue.id)}
                                className="flex items-center text-xs text-gray-500 font-medium"
                             >
                                 <Download size={12} className="mr-1" /> PDF Receipt
                             </button>
                             <Link to={`/complaint/${issue.id}`} className="text-primary font-bold text-xs flex items-center">
                                {isAdmin ? 'Manage' : 'View Details'} <ChevronRight size={14} />
                             </Link>
                        </div>
                    </div>
                </div>
             ))
         )}
      </div>
    </div>
  );
};

export default DashboardPage;