import supertest from "supertest";
import { web } from "../src/applications/web.js";
import { logger } from "../src/applications/logging.js";
import bcrypt from "bcrypt";
import {
  createTestContact,
  createTestContactMany,
  createUserTest,
  getTestContact,
  removeAllContacts,
  removeUserTest,
} from "../src/util/remove-test.js";

describe("POST /api/contacts", () => {
  beforeEach(async () => {
    await createUserTest();
  });

  afterEach(async () => {
    await removeAllContacts();
    await removeUserTest();
  });

  it("should be able to create new contact", async () => {
    const result = await supertest(web)
      .post("/api/contacts")
      .set("Authorization", "test")
      .send({
        firstName: "hannah",
        lastName: "montana",
        email: "montana@x.com",
        phone: "171273245",
      });

    expect(result.status).toBe(200);
    expect(result.body.data.firstName).toBe("hannah");
    expect(result.body.data.lastName).toBe("montana");
    expect(result.body.data.email).toBe("montana@x.com");
    expect(result.body.data.phone).toBe("171273245");
  });

  it("should be able to create new contact even the optional is not included in contacts", async () => {
    let result = await supertest(web)
      .post("/api/contacts")
      .set("Authorization", "test")
      .send({
        firstName: "hannah",
        // lastName: "montana",
        email: "montana@x.com",
        phone: "171273245",
      });

    expect(result.status).toBe(200);
    expect(result.body.data.firstName).toBe("hannah");
    expect(result.body.data.lastName).toBeNull();
    expect(result.body.data.email).toBe("montana@x.com");
    expect(result.body.data.phone).toBe("171273245");

    result = await supertest(web)
      .post("/api/contacts")
      .set("Authorization", "test")
      .send({
        firstName: "hannah",
        lastName: "montana",
        // email: "montana@x.com",
        phone: "171273245",
      });

    expect(result.status).toBe(200);
    expect(result.body.data.firstName).toBe("hannah");
    expect(result.body.data.lastName).toBe("montana");
    expect(result.body.data.email).toBeNull();
    expect(result.body.data.phone).toBe("171273245");

    result = await supertest(web)
      .post("/api/contacts")
      .set("Authorization", "test")
      .send({
        firstName: "hannah",
        lastName: "montana",
        email: "montana@x.com",
        // phone: "171273245"
      });

    expect(result.status).toBe(200);
    expect(result.body.data.firstName).toBe("hannah");
    expect(result.body.data.lastName).toBe("montana");
    expect(result.body.data.email).toBe("montana@x.com");
    expect(result.body.data.phone).toBeNull();
  });

  it("should be invalid to create new contact if the required input is missing or input format is not valid", async () => {
    let result = await supertest(web)
      .post("/api/contacts")
      .set("Authorization", "test")
      .send({
        firstName: "",
        lastName: "montana",
        email: "montana@x.com",
        phone: "171273245",
      });

    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();

    result = await supertest(web)
      .post("/api/contacts")
      .set("Authorization", "test")
      .send({
        firstName: "hannah",
        lastName: "montana",
        email: "montana125",
        phone: "171273245",
      });

    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();

    result = await supertest(web)
      .post("/api/contacts")
      .set("Authorization", "test")
      .send({
        firstName: "hannah",
        lastName: "montana",
        email: "montana125",
        phone: "171273245856868986867394587938457938457",
      });

    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });

  it("should be invalid to create new contact if the user is not login", async () => {
    let result = await supertest(web)
      .post("/api/contacts")
      .set("Authorization", "asdgawtwert")
      .send({
        firstName: "",
        lastName: "montana",
        email: "montana@x.com",
        phone: "171273245",
      });
    expect(result.status).toBe(401);
    expect(result.body.errors).toBeDefined();
  });
});

describe("GET /api/contacts/:contactId", () => {
  beforeEach(async () => {
    await createUserTest();
    await createTestContact();
  });

  afterEach(async () => {
    await removeAllContacts();
    await removeUserTest();
  });

  it("should be able to get contact", async () => {
    const contact = await getTestContact();
    const result = await supertest(web)
      .get("/api/contacts/" + contact.id)
      .set("Authorization", "test");

    expect(result.status).toBe(200);
    expect(result.body.data.firstName).toBe("test");
    expect(result.body.data.lastName).toBe("test");
    expect(result.body.data.email).toBe("test@x.com");
    expect(result.body.data.phone).toBe("1245566144");
  });

  it("should be invalid if the contactId not valid", async () => {
    const contact = await getTestContact();
    const result = await supertest(web)
      .get("/api/contacts/" + contact.id + 1)
      .set("Authorization", "test");

    expect(result.status).toBe(404);
    expect(result.body.errors).toBeDefined();
  });
});

describe("PUT /api/contacts/:contactId", () => {
  beforeEach(async () => {
    await createUserTest();
    await createTestContact();
  });

  afterEach(async () => {
    await removeAllContacts();
    await removeUserTest();
  });

  it("should be able to update existing contact", async () => {
    const testContact = await getTestContact();
    const result = await supertest(web)
      .put("/api/contacts/" + testContact.id)
      .set("Authorization", "test")
      .send({
        firstName: "BJ",
        lastName: "Fogg",
        email: "fogg@x.com",
        phone: "8274399464",
      });
    expect(result.status).toBe(200);
    expect(result.body.data.id).toBe(testContact.id);
    expect(result.body.data.firstName).toBe("BJ");
    expect(result.body.data.lastName).toBe("Fogg");
    expect(result.body.data.email).toBe("fogg@x.com");
    expect(result.body.data.phone).toBe("8274399464");
  });

  it("should be invalid to update existing contact if the input has not validated", async () => {
    const testContact = await getTestContact();
    let result = await supertest(web)
      .put("/api/contacts/" + testContact.id)
      .set("Authorization", "test")
      .send({
        firstName: "BJ",
        lastName: "Fogg",
        email: "fogg.com",
        phone: "8274399464",
      });

    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();

    result = await supertest(web)
      .put("/api/contacts/" + testContact.id)
      .set("Authorization", "qwqwrq")
      .send({
        firstName: "BJ",
        lastName: "Fogg",
        email: "fogg@x.com",
        phone: "8274399464",
      });

    expect(result.status).toBe(401);
    expect(result.body.errors).toBeDefined();

    result = await supertest(web)
      .put("/api/contacts/" + testContact.id)
      .set("Authorization", "test")
      .send({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      });

    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });

  it("should be invalid to update if contact is not found", async () => {
    const testContact = await getTestContact();
    const result = await supertest(web)
      .put("/api/contacts/" + testContact.id + 1)
      .set("Authorization", "test")
      .send({
        firstName: "BJ",
        lastName: "Fogg",
        email: "fogg@x.com",
        phone: "8274399464",
      });

    expect(result.status).toBe(404);
    expect(result.body.errors).toBeDefined();
  });
});

describe("DELETE /api/contacts/:contactId", () => {
  beforeEach(async () => {
    await createUserTest();
    await createTestContact();
  });

  afterEach(async () => {
    await removeAllContacts();
    await removeUserTest();
  });

  it("should be able to delete contact", async () => {
    let testContact = await getTestContact();
    const result = await supertest(web)
      .delete("/api/contacts/" + testContact.id)
      .set("Authorization", "test");
    expect(result.status).toBe(200);
    expect(result.body.data).toBe("OK");

    testContact = await getTestContact();
    expect(testContact).toBeNull();
  });

  it("should be invalid to delete contact if the contact is not found", async () => {
    const testContact = await getTestContact();
    const result = await supertest(web)
      .delete("/api/contacts/" + testContact.id + 1)
      .set("Authorization", "test");

    expect(result.status).toBe(404);
    expect(result.body.errors).toBeDefined();
  });

  it("should be invalid to delete contact if the users not yet login", async () => {
    const testContact = await getTestContact();
    const result = await supertest(web)
      .delete("/api/contacts/" + testContact.id)
      .set("Authorization", "test222");

    expect(result.status).toBe(401);
    expect(result.body.errors).toBeDefined();
  });
});

describe("GET /api/contacts", () => {
  beforeEach(async () => {
    await createUserTest();
    await createTestContactMany();
  });

  afterEach(async () => {
    await removeAllContacts();
    await removeUserTest();
  });

  it("should be able to search contact without parameters", async () => {
    const results = await supertest(web)
      .get("/api/contacts")
      .set("Authorization", "test");

    expect(results.status).toBe(200);
    expect(results.body.data.length).toBe(10);
    expect(results.body.paging.page).toBe(1);
    expect(results.body.paging.totalPages).toBe(2);
    expect(results.body.paging.totalItems).toBe(15);
  });

  it("should be able to search contact to page 2", async () => {
    const results = await supertest(web)
      .get("/api/contacts")
      .set("Authorization", "test")
      .query({
        page: 2,
      });

    expect(results.status).toBe(200);
    expect(results.body.data.length).toBe(5);
    expect(results.body.paging.page).toBe(2);
    expect(results.body.paging.totalPages).toBe(2);
    expect(results.body.paging.totalItems).toBe(15);
  });

  it("should be able to seach contact using name", async () => {
    const results = await supertest(web)
      .get("/api/contacts")
      .set("Authorization", "test")
      .query({
        name: "test 1",
      });
    expect(results.status).toBe(200);
    expect(results.body.data.length).toBe(6);
    expect(results.body.paging.page).toBe(1);
    expect(results.body.paging.totalPages).toBe(1);
    expect(results.body.paging.totalItems).toBe(6);
  });

  it("should be able to seach contact using email", async () => {
    const results = await supertest(web)
      .get("/api/contacts")
      .set("Authorization", "test")
      .query({
        email: "1@x.com",
      });
    expect(results.status).toBe(200);
    expect(results.body.data.length).toBe(2);
    expect(results.body.paging.page).toBe(1);
    expect(results.body.paging.totalPages).toBe(1);
    expect(results.body.paging.totalItems).toBe(2);
  });

  it("should be able to seach contact using phone", async () => {
    const results = await supertest(web)
      .get("/api/contacts")
      .set("Authorization", "test")
      .query({
        phone: "1234567891",
      });
    expect(results.status).toBe(200);
    expect(results.body.data.length).toBe(6);
    expect(results.body.paging.page).toBe(1);
    expect(results.body.paging.totalPages).toBe(1);
    expect(results.body.paging.totalItems).toBe(6);
  });
});
