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
      createdAt: true
    }
  });
};

exports.updateUser = (id, data) => {
  return prisma.user.update({
    where: { id },
    data
  });
};