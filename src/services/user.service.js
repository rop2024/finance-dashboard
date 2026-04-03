const userRepo = require("../repositories/user.repository");

exports.getAllUsers = async () => {
  return userRepo.getAllUsers();
};

exports.getUserById = async (id) => {
  const user = await userRepo.findUserById(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

exports.updateUserRole = async (id, role) => {
  const user = await userRepo.updateUser(id, { role });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

exports.deleteUser = async (id) => {
  const result = await userRepo.deleteUser(id);
  if (result.count === 0) {
    throw new Error("User not found");
  }
  return { message: "User deleted successfully" };
};