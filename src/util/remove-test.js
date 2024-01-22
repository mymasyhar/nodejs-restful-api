import { prismaClient } from "../applications/database";
import bcrypt from "bcrypt";

export const removeUserTest = async () => {
  await prismaClient.user.deleteMany({});
};

export const createUserTest = async () => {
  await prismaClient.user.create({
    data: {
      username: "test",
      password: await bcrypt.hash("test123", 10),
      name: "test",
      token: "test",
    },
  });
};

export const getUserTest = async () => {
  return await prismaClient.user.findUnique({
    where: {
      username: "test",
    },
  });
};

export const removeAllContacts = async () => {
  return await prismaClient.contact.deleteMany({
    where: {
      username: "test"
    }
  });
};

export const createTestContact = async() => {
  return await prismaClient.contact.create({
    data: {
      username: 'test',
      firstName: 'test',
      lastName: 'test',
      email: 'test@x.com',
      phone: '1245566144',
    }
  })
}

export const createTestContactMany = async() => {
  for (let i = 0; i < 15; i++) {
    await prismaClient.contact.create({
      data: {
        username: `test`,
        firstName: `test ${i}`,
        lastName: `test ${i}`,
        email: `test${i}@x.com`,
        phone: `123456789${i}`,
      }
    })
    
  }
}

export const getTestContact = async() => {
  return prismaClient.contact.findFirst({
    where: {
      username: 'test'
    }
  })
}

export const createTestAddress = async() => {
  const contact = await getTestContact();
  await prismaClient.address.create({
    data:{
      contactId: contact.id,
      street: 'jalan test',
      city: 'kota test',
      province: 'provinsi test',
      country: 'indonesia',
      postalCode: '224512'
    }
  })
}

export const getTestAddress = async() => {
  return prismaClient.address.findFirst({
    where: {
      contact: {
        username: 'test'
      }
    }
  })
}

export const removeAllTestAddresses = async() => {
  return prismaClient.address.deleteMany({
    where: {
      contact: {
        username: 'test'
      }
    }
  })
}

