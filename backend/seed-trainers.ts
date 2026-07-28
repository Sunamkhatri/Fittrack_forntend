import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/fittrack";

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  username: String,
  password: String,
  role: { type: String, default: "user" },
  age: Number,
  gender: String,
  weight: Number,
  bio: String,
  specialty: String,
  hourlyRate: Number,
  clients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

const trainers = [
  {
    firstName: "Adam",
    lastName: "Sharma",
    email: "adam@fittrack.com",
    username: "adam_trainer",
    bio: "Certified ISSA personal trainer with 8+ years of experience in strength conditioning and muscle hypertrophy. I specialize in transforming beginners into confident lifters.",
    specialty: "Strength & Conditioning",
    hourlyRate: 1500,
    age: 32,
    gender: "male",
    weight: 82,
  },
  {
    firstName: "Eve",
    lastName: "Johnson",
    email: "eve@fittrack.com",
    username: "eve_trainer",
    bio: "Yoga and flexibility coach focused on holistic wellness. My sessions blend traditional yoga with modern mobility drills to improve posture and relieve stress.",
    specialty: "Yoga & Flexibility",
    hourlyRate: 1200,
    age: 28,
    gender: "female",
    weight: 58,
  },
  {
    firstName: "Ram",
    lastName: "Thapa",
    email: "ram@fittrack.com",
    username: "ram_trainer",
    bio: "HIIT and cardio specialist. Former marathon runner turned fitness coach. I design high-intensity programs that maximize fat burn in minimal time.",
    specialty: "HIIT & Cardio",
    hourlyRate: 1000,
    age: 30,
    gender: "male",
    weight: 75,
  },
  {
    firstName: "Sita",
    lastName: "Gurung",
    email: "sita@fittrack.com",
    username: "sita_trainer",
    bio: "Sports nutritionist and weight management expert. I create personalized diet plans alongside workout routines for sustainable body transformation.",
    specialty: "Nutrition & Weight Loss",
    hourlyRate: 1300,
    age: 27,
    gender: "female",
    weight: 55,
  },
  {
    firstName: "Krishna",
    lastName: "Basnet",
    email: "krishna@fittrack.com",
    username: "krishna_trainer",
    bio: "Calisthenics and bodyweight training expert. No gym? No problem. I help clients build impressive physiques using only their body weight.",
    specialty: "Calisthenics",
    hourlyRate: 800,
    age: 25,
    gender: "male",
    weight: 70,
  },
  {
    firstName: "Anjali",
    lastName: "Rai",
    email: "anjali@fittrack.com",
    username: "anjali_trainer",
    bio: "CrossFit Level 2 certified coach. I push limits and break barriers. My sessions are intense, fun, and always different.",
    specialty: "CrossFit",
    hourlyRate: 1400,
    age: 29,
    gender: "female",
    weight: 62,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const hashedPassword = await bcrypt.hash("Trainer@123", 12);

    for (const t of trainers) {
      const exists = await User.findOne({ email: t.email });
      if (exists) {
        console.log(`⏩ Trainer ${t.firstName} ${t.lastName} already exists, skipping.`);
        continue;
      }

      await User.create({
        ...t,
        password: hashedPassword,
        role: "trainer",
      });
      console.log(`✅ Created trainer: ${t.firstName} ${t.lastName} (${t.specialty})`);
    }

    console.log("\n🎉 Seed complete! All trainers are ready.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();
