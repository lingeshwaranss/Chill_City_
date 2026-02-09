
export enum IssueStatus {
  NEW = 'New',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  DISPUTED = 'Disputed'
}

export interface User {
  email: string;
  role: 'admin' | 'citizen';
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Issue {
  id: string;
  type: string;
  description: string;
  locationName: string;
  coordinates: LatLng;
  status: IssueStatus;
  imageUrl: string;
  resolvedImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string; // New field for turnaround time calculation
  author: string; // 'Me' or others for demo
  comments: Comment[];
  timeline: TimelineEvent[];
  assignedAuthority: string;
  deadline: string;
  // New fields for contact info
  contactNumber?: string;
  contactEmail?: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface TimelineEvent {
  status: IssueStatus | 'Submitted' | 'Assigned';
  date: string;
  description: string;
  active: boolean;
}

export interface Message {
  id: string;
  topic: string;
  description: string;
  createdAt: string;
  isRead: boolean;
}
