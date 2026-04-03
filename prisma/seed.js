const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  // Create default categories
  const categories = [
    { name: "Salary", type: "income", icon: "💰", color: "#4CAF50" },
    { name: "Freelance", type: "income", icon: "💻", color: "#2196F3" },
    { name: "Investment", type: "income", icon: "📈", color: "#FF9800" },
    { name: "Food", type: "expense", icon: "🍔", color: "#F44336" },
    { name: "Transport", type: "expense", icon: "🚗", color: "#9C27B0" },
    { name: "Shopping", type: "expense", icon: "🛍️", color: "#E91E63" },
    { name: "Entertainment", type: "expense", icon: "🎬", color: "#3F51B5" },
    { name: "Bills", type: "expense", icon: "💡", color: "#FFC107" },
    { name: "Healthcare", type: "expense", icon: "🏥", color: "#00BCD4" },
    { name: "Education", type: "expense", icon: "📚", color: "#8BC34A" }
  ];
  
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }
  
  // Create demo user
  const hashedPassword = await bcrypt.hash("demo123", 10);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      password: hashedPassword,
      name: "Demo User"
    }
  });
  
  console.log("✅ Database seeded successfully!");
  console.log("📧 Demo user: demo@example.com");
  console.log("🔑 Demo password: demo123");
}

main()
  .catch(e => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });