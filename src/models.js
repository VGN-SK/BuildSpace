// src/models.js

export const sampleUser = {
  id: 1,
  name: "John Doe",
  avatar: "https://via.placeholder.com/150",
  bio: "Hyperloop enthusiast @ IITM, loves dashboards and hackathons.",
  skills: ["Python", "MQTT", "SolidJS"],
  interests: ["Hyperloop", "Control Systems", "Web Dashboards"],
};

export const sampleProjects = [
  {
    id: 1,
    title: "Hyperloop Telemetry Dashboard",
    description: "Real-time pod telemetry and control dashboard for EHC.",
    techStack: ["NestJS", "Vue", "MQTT"],
    status: "Open for collaborators",
    members: ["John Doe"],
  },
];

export const sampleOpportunities = [
  {
    id: 1,
    type: "Hackathon team opening",
    title: "Looking for frontend dev for BuildSpace",
    description: "Need someone comfortable with SolidJS / Vue for UI work.",
    contact: "@johndoe",
  },
];
