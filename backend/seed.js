const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Issue = require('./models/Issue');
require('dotenv').config();

// Realistic Pune GPS coordinates — field name matches Issue schema
const LOCATIONS = {
  kothrud:     { location: "Kothrud, Pune",       lat: 18.5074, lng: 73.8077 },
  vimanNagar:  { location: "Viman Nagar, Pune",   lat: 18.5679, lng: 73.9143 },
  fcRoad:      { location: "FC Road, Pune",        lat: 18.5236, lng: 73.8420 },
  hinjewadi:   { location: "Hinjewadi Phase 1",   lat: 18.5913, lng: 73.7389 },
  koregaon:    { location: "Koregaon Park, Pune", lat: 18.5362, lng: 73.8930 },
  wagholi:     { location: "Wagholi, Pune",        lat: 18.5793, lng: 73.9806 },
  baner:       { location: "Baner, Pune",          lat: 18.5590, lng: 73.7868 },
  chinchwad:   { location: "Chinchwad, Pune",      lat: 18.6279, lng: 73.7979 },
};

const seedDB = async () => {
  try {
    console.log("🌱 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sevasync');

    console.log("🧹 Wiping old data for a clean demo environment...");
    await User.deleteMany({});
    await Issue.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash("demo123", salt);

    // --- NGO Accounts ---
    const ngo = await User.create({
      name: "Pune Seva Foundation (NGO)",
      email: "ngo@demo.com",
      password: pass,
      role: "ngo",
      contact: "9876543210",
      location: "Shivaji Nagar, Pune",
    });

    // --- Volunteer Accounts (Realistic Indian Names) ---
    const volunteers = await User.insertMany([
      { name: "Aarav Joshi",    email: "volunteer@demo.com", password: pass, role: "volunteer", contact: "9988776655", location: "Viman Nagar, Pune",   impactScore: 450, hoursVolunteered: 12 },
      { name: "Priya Sharma",   email: "priya@demo.com",     password: pass, role: "volunteer", contact: "9876501234", location: "Kothrud, Pune",       impactScore: 720, hoursVolunteered: 24 },
      { name: "Rohan Deshmukh", email: "rohan@demo.com",     password: pass, role: "volunteer", contact: "9765432100", location: "FC Road, Pune",        impactScore: 310, hoursVolunteered: 8  },
      { name: "Sneha Patil",    email: "sneha@demo.com",     password: pass, role: "volunteer", contact: "9654321009", location: "Baner, Pune",           impactScore: 980, hoursVolunteered: 32 },
      { name: "Mihir Kulkarni", email: "mihir@demo.com",     password: pass, role: "volunteer", contact: "9543210098", location: "Koregaon Park, Pune",  impactScore: 150, hoursVolunteered: 4  },
    ]);

    const [aarav, priya, rohan, sneha] = volunteers;

    // --- Demo Issues (Hyper-Realistic Scenarios) ---
    const issues = await Issue.insertMany([
      {
        title: "Critical Waterlogging on Karve Road",
        description: "Flash floods have blocked Karve Road near Kothrud Depot after 80mm rainfall. Two-wheelers are stranded and visibility is poor. Volunteers needed for traffic diversion and victim assistance.",
        category: "Infrastructure",
        urgency: "High",
        ...LOCATIONS.kothrud,
        createdBy: ngo._id,
        status: "Open",
        isEmergency: true,
      },
      {
        title: "Emergency Blood Requirement — O+ Needed",
        description: "Critical patient at Ruby Hall Clinic (Viman Nagar) requires 3 units of O+ blood immediately post-surgery. Contact the hospital coordinator on arrival.",
        category: "Health",
        urgency: "High",
        ...LOCATIONS.vimanNagar,
        createdBy: ngo._id,
        status: "Open",
      },
      {
        title: "Free Medical Camp — Diabetes & BP Screening",
        description: "Organizing a free health camp at Ganesh Mandir ground, FC Road. Need 4 trained volunteers for registration, blood pressure testing, and crowd management.",
        category: "Health",
        urgency: "Medium",
        ...LOCATIONS.fcRoad,
        createdBy: ngo._id,
        status: "Open",
      },
      {
        title: "Orphanage Ration & Dry Goods Distribution",
        description: "Sneh Sadan Orphanage in Koregaon Park has received 600kg of rice, dal, and oil from donors. Need 5 volunteers to sort, pack, and distribute packages to 3 nearby shelters.",
        category: "Food Relief",
        urgency: "Medium",
        ...LOCATIONS.koregaon,
        createdBy: ngo._id,
        status: "Open",
      },
      {
        title: "Mula River Bank Plastic Cleanup Drive",
        description: "Post-Ganeshotsav, plastic garlands and thermocol idols have accumulated along the Mula River bank near Baner. Gloves, bags, and refreshments will be provided. Bring good energy!",
        category: "Environment",
        urgency: "Low",
        ...LOCATIONS.baner,
        createdBy: ngo._id,
        status: "Open",
      },
      {
        title: "ZP School Flood Damage — Book Recovery",
        description: "Zilla Parishad school in Wagholi suffered roof damage during the storm. Textbooks and materials are soaked. Urgent need for volunteers to dry-sort and salvage materials before next week.",
        category: "Education",
        urgency: "High",
        ...LOCATIONS.wagholi,
        createdBy: ngo._id,
        status: "In Progress",
        assignedVolunteers: [aarav._id],
      },
      {
        title: "IT Park E-Waste Awareness Campaign",
        description: "Conducting an e-waste collection and awareness drive in Hinjewadi Phase 1 tech campus. Need volunteers who can speak to software professionals about responsible disposal.",
        category: "Environment",
        urgency: "Low",
        ...LOCATIONS.hinjewadi,
        createdBy: ngo._id,
        status: "Open",
      },
    ]);

    // Add completed task to Priya's history (so her Impact page looks great in demo)
    const completedTask = await Issue.create({
      title: "Tree Plantation Drive — Chinchwad IT Park",
      description: "Successfully planted 75 native saplings around the Chinchwad IT park perimeter.",
      category: "Environment",
      urgency: "Low",
      ...LOCATIONS.chinchwad,
      createdBy: ngo._id,
      status: "Completed",
      assignedVolunteers: [priya._id, sneha._id],
    });

    // Update user task lists
    await User.findByIdAndUpdate(aarav._id, { $push: { acceptedTasks: issues[5]._id } }); // Wagholi school
    await User.findByIdAndUpdate(priya._id, { $push: { acceptedTasks: completedTask._id } });
    await User.findByIdAndUpdate(sneha._id, { $push: { acceptedTasks: completedTask._id } });

    console.log("\n✅ Seed complete! Perfect demo environment ready.\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  🏢 NGO Login:       ngo@demo.com       | demo123");
    console.log("  🦸 Volunteer:       volunteer@demo.com | demo123");
    console.log("  📊 High-Impact Vol: priya@demo.com     | demo123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed Error:", err.message);
    process.exit(1);
  }
};

seedDB();
