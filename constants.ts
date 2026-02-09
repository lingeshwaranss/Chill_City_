import { Issue, IssueStatus } from './types';

export const CHENNAI_CENTER = { lat: 12.980, lng: 80.220 }; // Roughly near city center

export const ADMIN_EMAILS = [
  'learnyourgorl@gmail.com',
  'lingeshwaranssmani@gmail.com',
  'moslin0362@violetcollege.co.in',
  'estherlucky307@gmail.com',
  'dinesh20071226@gmail.com',
  'akashgayathri142@gmail.com',
  'lingesh4206esiva@gmail.com'
];

export const MOCK_ISSUES: Issue[] = [
  {
    id: 'VEL600042-001',
    type: 'Pothole',
    description: 'Large pothole causing traffic slowdown near Phoenix Marketcity.',
    locationName: 'Velachery Main Rd',
    coordinates: { lat: 12.975, lng: 80.220 },
    status: IssueStatus.NEW,
    // Image of a damaged road/pothole
    imageUrl: 'https://thumbs.dreamstime.com/b/big-pothole-road-caused-freezing-thawing-spring-season-52105898.jpg',
    createdAt: '2026-01-31T10:00:00Z',
    updatedAt: '2026-02-13T10:00:00Z',
    author: 'Other',
    assignedAuthority: 'Highways Department (Div 12)',
    deadline: '2026-02-16',
    comments: [],
    timeline: [
      { status: 'Submitted', date: 'Jan 25, 10:00 AM', description: 'Report submitted by citizen', active: true },
    ]
  },
  {
    id: 'TAM600045-001',
    type: 'Streetlight Failure',
    description: 'Entire row of streetlights out near the railway station.',
    locationName: 'Tambaram East',
    coordinates: { lat: 12.924, lng: 80.128 },
    status: IssueStatus.IN_PROGRESS,
    // Image of a streetlight at night
    imageUrl: 'https://media.gettyimages.com/id/2170915412/photo/los-angeles-ca-a-street-light-off-at-night-at-macarthur-park-on-tuesday-sept-10-2024-in-los.jpg?s=612x612&w=0&k=20&c=Ozd59grFFLQq3Tq_1WXra7bto-KmDVPX3yrF3FSqgTc=',
    createdAt: '2026-01-31T18:30:00Z',
    updatedAt: '2026-02-01T09:00:00Z',
    author: 'Me',
    assignedAuthority: 'TNEB Tambaram Section',
    deadline: '2026-02-28',
    comments: [],
    timeline: [
      { status: 'Submitted', date: 'Jan 31, 6:30 PM', description: 'Report submitted', active: true },
      { status: 'Assigned', date: 'Feb 01, 10:00 AM', description: 'Assigned to Ward 42 Engineer', active: true },
      { status: IssueStatus.IN_PROGRESS, date: 'Feb 04, 09:00 AM', description: 'Repair crew dispatched', active: true },
    ]
  },
  {
    id: 'PAL600041-001',
    type: 'Garbage Dump',
    description: 'Illegal garbage dumping on the roadside.',
    locationName: 'ECR, Palavakkam',
    coordinates: { lat: 12.960, lng: 80.260 },
    status: IssueStatus.RESOLVED,
    // Image of waste/garbage
    imageUrl: 'https://static.toiimg.com/thumb/msid-69382005,imgsize-182773,width-400,height-225,resizemode-72/69382005.jpg',
    // Clean street image
    resolvedImageUrl: 'https://media.gettyimages.com/id/1129579519/photo/two-large-overflowing-green-dumpsters-on-a-sidewalk.jpg?s=612x612&w=0&k=20&c=NlKYa9q8b7nreZo8LXFQ5_dK2lBUdXLEJGxZVp94bIs=',
    createdAt: '2025-10-15T08:00:00Z',
    updatedAt: '2025-10-18T14:00:00Z',
    resolvedAt: '2025-10-19T14:00:00Z',
    author: 'Me',
    assignedAuthority: 'Zone 13 Sanitation Officer',
    deadline: '2025-10-20',
    comments: [],
    timeline: [
      { status: 'Submitted', date: 'Oct 15, 8:00 AM', description: 'Report submitted', active: true },
      { status: 'Assigned', date: 'Oct 16, 11:00 AM', description: 'Assigned to Sanitation Dept', active: true },
      { status: IssueStatus.RESOLVED, date: 'Oct 18, 02:00 PM', description: 'Garbage cleared', active: true },
    ]
  },
  {
    id: 'ADY600020-001',
    type: 'Water Leakage',
    description: 'Pipe burst flooding the street corner.',
    locationName: 'Adyar, Gandhi Nagar',
    coordinates: { lat: 13.006, lng: 80.256 },
    status: IssueStatus.NEW,
    // Image of water pipe/leak
    imageUrl: 'https://media.gettyimages.com/id/1326176533/photo/nsewage-water-leak.jpg?s=612x612&w=0&k=20&c=WTm3Olwtt411nMF9jSmspvCoXJA_oyH5XSanvRs4bqk=',
    createdAt: '2026-01-26T07:15:00Z',
    updatedAt: '2026-01-26T07:15:00Z',
    author: 'Other',
    assignedAuthority: 'Metro Water (CMWSSB)',
    deadline: '2026-01-27',
    comments: [],
    timeline: [
        { status: 'Submitted', date: 'Feb , 7:15 AM', description: 'Report submitted', active: true }
    ]
  },
  {
    id: 'TNA600017-001',
    type: 'Broken Footpath',
    description: 'Paver blocks missing, dangerous for pedestrians.',
    locationName: 'T. Nagar',
    coordinates: { lat: 13.040, lng: 80.230 },
    status: IssueStatus.DISPUTED,
    // Image of paving/construction
    imageUrl: 'https://static.toiimg.com/thumb/msid-125920622,imgsize-173360,width-400,height-225,resizemode-72/125920622.jpg',
    resolvedImageUrl: 'https://toolkit.irap.org/wp-content/uploads/2022/02/An-obstructed-footpath-and-pedestrian-walking-on-the-road..jpeg',
    createdAt: '2023-10-10T12:00:00Z',
    updatedAt: '2023-10-25T16:00:00Z',
    resolvedAt: '2023-10-24T17:00:00Z',
    author: 'Other',
    assignedAuthority: 'Zone 10 Engineering Dept',
    deadline: '2023-10-24',
    comments: [
        { id: 'c1', author: 'Citizen', text: 'The work is incomplete. Only half the blocks are fixed.', date: 'Oct 25, 4:00 PM' }
    ],
    timeline: [
      { status: 'Submitted', date: 'Oct 10, 12:00 PM', description: 'Report submitted', active: true },
      { status: IssueStatus.RESOLVED, date: 'Oct 24, 05:00 PM', description: 'Marked resolved by contractor', active: true },
      { status: IssueStatus.DISPUTED, date: 'Oct 25, 04:00 PM', description: 'Citizen raised dispute: Work incomplete', active: true },
    ]
  }
];