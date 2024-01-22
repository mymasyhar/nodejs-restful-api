import { prismaClient } from "../applications/database.js";
import { ResponseError } from "../error/response-error.js";
import {
  getUserValidation,
  loginUserValidation,
  registerUserValidation,
  updateUserValidation,
} from "../validation/user-validation.js";
import { validate } from "../validation/validation.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

const register = async (request) => {
  const user = validate(registerUserValidation, request);

  const countUser = await prismaClient.user.count({
    where: {
      username: user.username,
    },
  });

  if (countUser == 1) {
    throw new ResponseError(400, "username is already registered");
  } else {
    user.password = await bcrypt.hash(user.password, 10);

    return prismaClient.user.create({
      data: user,
      select: {
        username: true,
        name: true,
      },
    });
  }
};

const login = async (request) => {
  const loginRequest = validate(loginUserValidation, request);
  const user = await prismaClient.user.findUnique({
    where: {
      username: loginRequest.username,
    },
    select: {
      username: true,
      password: true,
    },
  });

  if (!user) {
    throw new ResponseError(401, "username or password is wrong!");
  }

  const isPasswordValid = await bcrypt.compare(
    loginRequest.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new ResponseError(401, "username or password is wrong!");
  }
  const token = uuid().toString();
  return prismaClient.user.update({
    data: {
      token: token,
    },
    where: {
      username: user.username,
    },
    select: {
      token: true,
    },
  });
};

const get = async (username) => {
  username = validate(getUserValidation, username);

  const user = await prismaClient.user.findUnique({
    where: {
      username: username,
    },
  });
  if (!user) {
    throw new ResponseError(404, "not found user");
  }
  return user;
};

const update = async (request) => {
  const userData = validate(updateUserValidation, request);
  const userCountInDatabase = await prismaClient.user.count({
    where: {
      username: userData.username,
    },
  });
  if (userCountInDatabase !== 1) {
    throw new ResponseError(404, "user not found");
  }
  const updatedData = {};
  if (userData.name) {
    updatedData.name = userData.name;
  }
  if (userData.password) {
    updatedData.password = await bcrypt.hash(userData.password, 10);
  }

  return await prismaClient.user.update({
    where: {
      username: userData.username
    },
    data: updatedData,
    select: {
      username: true,
      name: true
    }
  });
};

const logout = async (username) => {
  username = validate(getUserValidation, username);

  const user = await prismaClient.user.findUnique({
    where: {
      username: username
    }
  });

  if(!user){
    throw new ResponseError(404, 'not found user')
  }

  return await prismaClient.user.update({
    where: {
      username: username
    },
    data: {
      token: null
    },
    select: {
      username: true
    }
  });
}

export default { register, login, get, update, logout };
