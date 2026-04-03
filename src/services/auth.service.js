const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepo = require("../repositories/user.repository");

exports.register = async (userData) => {
  const { email, password, name } = userData;
  
  // Validation
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  
  // Check if user exists
  const existingUser = await userRepo.findUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create user
  const user = await userRepo.createUser({
    email,
    password: hashedPassword,
    name
  });
  
  // Generate token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    token
  };
};

exports.login = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  
  // Find user
  const user = await userRepo.findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid credentials");
  }
  
  // Check password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }
  
  // Generate token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    token
  };
};

exports.getCurrentUser = async (userId) => {
  const user = await userRepo.findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};