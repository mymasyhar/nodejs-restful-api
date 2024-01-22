import supertest from "supertest";
import { web } from "../src/applications/web.js";
import { logger } from "../src/applications/logging.js";
import {
  createUserTest,
  getUserTest,
  removeUserTest,
} from "../src/util/remove-test.js";
import bcrypt from "bcrypt";

describe("POST /api/users", () => {
  it("should be able to register new user", async () => {
    let result = await supertest(web).post("/api/users").send({
      username: "samantha",
      name: "samantha harris",
      password: "secret",
    });
    expect(result.status).toBe(200);
    expect(result.body.data.username).toBe("samantha");
    expect(result.body.data.name).toBe("samantha harris");
    expect(result.body.data.password).toBeUndefined();

    result = await supertest(web).post("/api/users").send({
      username: "samantha",
      name: "samantha harris",
      password: "secret",
    });
    logger.info(result);
    expect(result.status).toBe(400);
  });

  it("should be failed if request is invalid", async () => {
    const result = await supertest(web).post("/api/users").send({
      username: "",
      name: "",
      password: "six",
    });
    expect(result.status).toBe(400);
    logger.info(result);
  });
});

describe("POST /api/users/login", () => {
  beforeEach(async () => {
    await createUserTest();
  });

  afterEach(async () => {
    await removeUserTest();
  });

  it("should be able to login", async () => {
    const result = await supertest(web).post("/api/users/login").send({
      username: "test",
      password: "test123",
    });
    logger.info(result);
    expect(result.status).toBe(200);
    expect(result.body.data.token).toBeDefined();
    expect(result.body.data.token).not.toBeNull();
  });

  it("should be error when username or password is empty", async () => {
    const result = await supertest(web).post("/api/users/login").send({
      username: "test",
      password: "",
    });
    logger.info(result);
    expect(result.status).toBe(400);
    expect(result.body.errors).not.toBeNull();
  });

  it("should be error when username or password is empty", async () => {
    const result = await supertest(web).post("/api/users/login").send({
      username: "test",
      password: "",
    });
    logger.info(result);
    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });

  it("should be unauthorized if the user or password is wrong", async () => {
    const result = await supertest(web).post("/api/users/login").send({
      username: "test",
      password: "test12",
    });
    logger.info(result);
    expect(result.status).toBe(401);
    expect(result.body.errors).toBeDefined();
  });
});

describe("GET /api/users/current", () => {
  beforeEach(async () => {
    await createUserTest();
  });

  afterEach(async () => {
    await removeUserTest();
  });

  it("should be able to get current contact", async () => {
    const result = await supertest(web)
      .get("/api/users/current")
      .set("Authorization", "test");

    expect(result.status).toBe(200);
    expect(result.body.data.username).toBe("test");
    expect(result.body.data.token).toBe("test");
  });

  it("should rejected if the token has invalid", async () => {
    const result = await supertest(web)
      .get("/api/users/current")
      .set("Authorization", "asdgasedegtw");

    expect(result.status).toBe(401);
    expect(result.body.errors).toBeDefined();
  });
});

describe("PATCH /api/users/current", () => {
  beforeEach(async () => {
    await createUserTest();
  });

  afterEach(async () => {
    await removeUserTest();
  });

  it("should be able to update current user name and password", async () => {
    const result = await supertest(web)
      .patch("/api/users/current")
      .set("Authorization", "test")
      .send({
        name: "masyhar",
        password: "secret",
      });
    expect(result.status).toBe(200);
    expect(result.body.data.name).toBe("masyhar");
    expect(result.body.data.username).toBe("test");

    const data = await getUserTest();
    expect(await bcrypt.compare("secret", data.password)).toBe(true);
  });

  it("should be able to update current user name", async () => {
    const result = await supertest(web)
      .patch("/api/users/current")
      .set("Authorization", "test")
      .send({
        name: "masyhar",
      });
    expect(result.status).toBe(200);
    expect(result.body.data.name).toBe("masyhar");
    expect(result.body.data.username).toBe("test");
  });

  it('should be able to update current user password', async () => {
    const result = await supertest(web)
      .patch("/api/users/current")
      .set("Authorization", "test")
      .send({
        password: "masyhar",
      });
    expect(result.status).toBe(200);

    const data = await getUserTest();
    expect(await bcrypt.compare("masyhar", data.password)).toBe(true);
  });

  it('should be invalid if the user name and password is empty', async () => {
    const result = await supertest(web)
      .patch("/api/users/current")
      .set("Authorization", "test")
      .send({
        name: "",
        password: "",
      });
      logger.info(result);
    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });

  it('should be invalid to update if the user is not login first', async () => {
    const result = await supertest(web)
      .patch("/api/users/current")
      .set("Authorization", "asdfat")
      .send({
        name: "",
        password: "",
      });
      logger.info(result);
    expect(result.status).toBe(401);
    expect(result.body.errors).toBeDefined();
  });
});

describe('DELETE /api/users/logout', () => {
  beforeEach(async () => {
    await createUserTest();
  });

  afterEach(async () => {
    await removeUserTest();
  });
  it('should be able to logout', async () => {
    const result = await supertest(web).delete('/api/users/logout').set('Authorization', 'test');
    expect(result.status).toBe(200);
    expect(result.body.data).toBe("OK");

    const user = await getUserTest();
    expect(user.token).toBeNull();
  });

  it('should be invalid if the user is not login first', async () => {
    const result = await supertest(web).delete('/api/users/logout').set('Authorization', 'qrwetgsdgsafdg');
    expect(result.status).toBe(401);
    expect(result.body.errors).toBeDefined();
  });
})
