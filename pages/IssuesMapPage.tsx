import React, { useState } from 'react';
import MapComponent from '../components/MapComponent';
import IssueCard from '../components/IssueCard';
import { Issue, LatLng } from '../types';
import { CHENNAI_CENTER } from '../constants';
import { Search, Filter } from 'lucide-react';

interface IssuesMapPageProps {
  issues: Issue[];
}

const IssuesMapPage: React.FC<IssuesMapPageProps> = ({ issues }) => {
  const [selectedIssueId, setSelectedIssueId] = useState<string | undefined>(undefined);
  const [mapCenter, setMapCenter] = useState<LatLng>(CHENNAI_CENTER);
  const [mapZoom, setMapZoom] = useState<number>(13);

  const handleSelectIssue = (id: string) => {
    setSelectedIssueId(id);
    const issue = issues.find(i => i.id === id);
    if (issue) {
      setMapCenter(issue.coordinates);
      setMapZoom(16);
    }
  };

  return (
    <div className="flex h-full relative">
      {/* Sidebar List (Desktop) */}
      <div className="absolute inset-y-0 left-0 w-full md:w-[400px] z-20 pointer-events-none flex flex-col">
        
        {/* Search Bar Floating */}
        <div className="p-4 pointer-events-auto">
            <div className="bg-white border border-gray-200 rounded-full shadow-lg flex items-center px-4 h-12">
                <Search className="text-gray-400 mr-2" size={18} />
                <input 
                    type="text" 
                    placeholder="Search location..." 
                    className="bg-transparent border-none focus:outline-none text-gray-800 text-sm flex-1 placeholder-gray-400"
                />
                <button className="text-primary hover:bg-blue-50 p-2 rounded-full transition-colors">
                    <Filter size={18} />
                </button>
            </div>
        </div>

        {/* List Container */}
        <div className="flex-1 overflow-hidden flex flex-col justify-end md:justify-start px-4 pb-20 md:pb-4 pointer-events-none">
             <div className="pointer-events-auto bg-white/90 md:bg-white/95 backdrop-blur-md border border-gray-200 rounded-t-2xl md:rounded-2xl shadow-2xl overflow-y-auto max-h-[40vh] md:max-h-full md:h-auto md:flex-1 no-scrollbar p-4 space-y-3">
                <div className="flex justify-between items-center mb-2 md:hidden">
                    <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto" />
                </div>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Nearby Issues</h2>
                {issues.map(issue => (
                    <IssueCard 
                        key={issue.id} 
                        issue={issue} 
                        isActive={selectedIssueId === issue.id}
                        onClick={() => handleSelectIssue(issue.id)}
                    />
                ))}
             </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 h-full w-full bg-gray-200 absolute inset-0 z-0">
        <MapComponent 
            center={mapCenter} 
            zoom={mapZoom} 
            issues={issues} 
            selectedIssueId={selectedIssueId}
            onSelectIssue={handleSelectIssue}
        />
      </div>
    </div>
  );
};

export default IssuesMapPage;