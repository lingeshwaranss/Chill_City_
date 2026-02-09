Project Overview

The Smart Civic Issue Reporter is a web-based platform designed to bridge the gap between citizens and urban authorities. By leveraging AI and real-time geolocation, it streamlines the process of reporting and resolving civic issues like potholes, garbage overflow, and faulty streetlights to improve public trust and transparency.

Key Features

    GPS Map Camera Integration: Users capture live photos instantly; gallery uploads are disabled to ensure authenticity.

    Automatic Geotagging: Every report automatically captures the current address, date, time, and precise longitude and latitude.

    AI-Powered Validation:

        CNN (Convolutional Neural Network): Automatically detects and classifies the type of civic issue from the photo.

    Duplicate Detection: AI analyzes photos and GPS coordinates to avoid redundant "Repair Reports" for the same issue.

    Fraud Prevention: Uses image validation and geo-distance threshold checking to identify and block fake complaints.

Smart Complaint ID Logic: Generates unique IDs based on City/Town and Pincode (e.g., TRT631209-001). The sequence increments automatically for each area.

Transparent Tracking: Citizens can track the status of their complaints through a public visibility dashboard until resolution.

Technical Stack

    Frontend: Web interface for user reporting and authority dashboards.

Backend: Database for complaint storage and rule-based classification for routing.

Algorithms:

    CNN: For image-based issue detection.

Geolocation Algorithm: For auto-tagging and map updates.

Finite State Machine (FSM): For tracking issue status from report to resolution.

Impact and Benefits

    Faster Resolution: Automates the routing of complaints to the correct department.

Accountability: Public visibility of resolved issues encourages official performance.

Cost-Effective: Built using open-source frameworks to minimize infrastructure costs.

Support & Feedback

For reporting bugs or providing feedback regarding the platform, please contact:

    Developer: Lingeshwaran SS

    Phone: +91 7094502287

    Email: lingeshwaranssmani@gmail.com
