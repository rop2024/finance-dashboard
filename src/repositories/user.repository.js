const prisma = require("../config/db");

exports.createUser = (data) => {
  return prisma.user.create({ data });
};

exports.findUserByEmail = (email) => {
  return prisma.user.findUnique({
    where: { email }
  });
};

exports.findUserById = (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });
};

exports.updateUser = (id, data) => {
  return prisma.user.update({
    where: { id },
    data
  });
};

exports.getAllUsers = () => {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};

exports.deleteUser = (id) => {
  return prisma.user.deleteMany({
    where: { id }
  });
};