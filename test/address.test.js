import supertest from "supertest";
import { web } from "../src/applications/web.js";
import { logger } from "../src/applications/logging.js";
import bcrypt from "bcrypt";
import {
  createTestAddress,
  createTestContact,
  createTestContactMany,
  createUserTest,
  getTestAddress,
  getTestContact,
  removeAllContacts,
  removeAllTestAddresses,
  removeUserTest,
} from "../src/util/remove-test.js";

describe("POST /api/contacts/:contactId/addresses", () => {
  beforeEach(async () => {
    await createUserTest();
    await createTestContact();
  });

  afterEach(async () => {
    await removeAllTestAddresses();
    await removeAllContacts();
    await removeUserTest();
  });

  it("should be able to create new address", async () => {
    const testContact = await getTestContact();
    const result = await supertest(web)
      .post("/api/contacts/" + testContact.id + "/addresses")
      .set("Authorization", "test")
      .send({
        street: "test street",
        city: "test city",
        province: "test province",
        country: "test country",
        postalCode: "112345",
      });
    expect(result.status).toBe(200);
    expect(result.body.data.id).toBeDefined();
    expect(result.body.data.street).toBe("test street");
    expect(result.body.data.city).toBe("test city");
    expect(result.body.data.province).toBe("test province");
    expect(result.body.data.country).toBe("test country");
    expect(result.body.data.postalCode).toBe("112345");
  });

  it("should be able invalid to create new address if the required field is empty", async () => {
    const testContact = await getTestContact();
    const result = await supertest(web)
      .post("/api/contacts/" + testContact.id + "/addresses")
      .set("Authorization", "test")
      .send({
        street: "test street",
        city: "test city",
        province: "test province",
        country: "",
        postalCode: "",
      });
    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });

  it("should be able invalid to create new address if the contact is not found", async () => {
    const testContact = await getTestContact();
    const result = await supertest(web)
      .post("/api/contacts/" + testContact.id + "/addresses")
      .set("Authorization", "test")
      .send({
        street: "test street",
        city: "test city",
        province: "test province",
        country: "",
        postalCode: "",
      });
    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });
});

describe("GET /api/contacts/:contactId/addresses/:addressId", () => {
  beforeEach(async () => {
    await createUserTest();
    await createTestContact();
    await createTestAddress();
  });

  afterEach(async () => {
    await removeAllTestAddresses();
    await removeAllContacts();
    await removeUserTest();
  });

  it("should be able to get address", async () => {
    const testContact = await getTestContact();
    const testAddress = await getTestAddress();
    const result = await supertest(web)
      .get("/api/contacts/" + testContact.id + "/addresses/" + testAddress.id)
      .set("Authorization", "test");

    expect(result.status).toBe(200);
    expect(result.body.data.id).toBeDefined();
    expect(result.body.data.street).toBe("jalan test");
    expect(result.body.data.city).toBe("kota test");
    expect(result.body.data.country).toBe("indonesia");
    expect(result.body.data.postalCode).toBe("224512");
  });

  it("should be invalid to get address if contact is not found", async () => {
    const testContact = await getTestContact();
    const testAddress = await getTestAddress();
    const result = await supertest(web)
      .get(
        "/api/contacts/" + (testContact.id + 1) + "/addresses/" + testAddress.id
      )
      .set("Authorization", "test");
    expect(result.status).toBe(404);
    expect(result.body.errors).toBeDefined();
  });

  it("should be invalid to get address if address is not found", async () => {
    const testContact = await getTestContact();
    const testAddress = await getTestAddress();
    const result = await supertest(web)
      .get(
        "/api/contacts/" + testContact.id + "/addresses/" + (testAddress.id + 1)
      )
      .set("Authorization", "test");
    expect(result.status).toBe(404);
    expect(result.body.errors).toBeDefined();
  });
});

describe("PUT /api/contacts/:contactId/addresses/:addressId", () => {
  beforeEach(async () => {
    await createUserTest();
    await createTestContact();
    await createTestAddress();
  });

  afterEach(async () => {
    await removeAllTestAddresses();
    await removeAllContacts();
    await removeUserTest();
  });

  it("should be able to update address", async () => {
    const testContact = await getTestContact();
    const testAddress = await getTestAddress();

    const result = await supertest(web)
      .put("/api/contacts/" + testContact.id + "/addresses/" + testAddress.id)
      .set("Authorization", "test")
      .send({
        street: "test street 1st",
        city: "test city 1st",
        province: "test province update",
        country: "south carolina",
        postalCode: "993645",
      });

    expect(result.status).toBe(200);
    expect(result.body.data.id).toBe(testAddress.id);
    expect(result.body.data.street).toBe("test street 1st");
    expect(result.body.data.city).toBe("test city 1st");
    expect(result.body.data.country).toBe("south carolina");
    expect(result.body.data.postalCode).toBe("993645");
  });

  it("should be invalid to update address if contactId is not found", async () => {
    const testContact = await getTestContact();
    const testAddress = await getTestAddress();

    const result = await supertest(web)
      .put(
        "/api/contacts/" + (testContact.id + 1) + "/addresses/" + testAddress.id
      )
      .set("Authorization", "test")
      .send({
        street: "test street 1st",
        city: "test city 1st",
        province: "test province update",
        country: "south carolina",
        postalCode: "993645",
      });

    expect(result.status).toBe(404);
    expect(result.body.errors).toBeDefined();
  });

  it("should be invalid to update address if the address is not found", async () => {
    const testContact = await getTestContact();
    const testAddress = await getTestAddress();

    const result = await supertest(web)
      .put(
        "/api/contacts/" + testContact.id + "/addresses/" + (testAddress.id + 1)
      )
      .set("Authorization", "test")
      .send({
        street: "test street 1st",
        city: "test city 1st",
        province: "test province update",
        country: "south carolina",
        postalCode: "993645",
      });

    expect(result.status).toBe(404);
    expect(result.body.errors).toBeDefined();
  });

  it("should be invalid to update address if the updated address is not valid", async () => {
    const testContact = await getTestContact();
    const testAddress = await getTestAddress();

    const result = await supertest(web)
      .put(
        "/api/contacts/" + testContact.id + "/addresses/" + (testAddress.id + 1)
      )
      .set("Authorization", "test")
      .send({
        street: "test street 1st",
        city: "test city 1st",
        province: "test province update",
        country: "south carolina",
        postalCode: "993645969689839048503890",
      });

    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });
});

describe("DELETE /api/contacts/:contactId/addresses/:addressId", () => {
  beforeEach(async () => {
    await createUserTest();
    await createTestContact();
    await createTestAddress();
  });

  afterEach(async () => {
    await removeAllTestAddresses();
    await removeAllContacts();
    await removeUserTest();
  });

  it("should be able to delete address", async () => {
    const testContact = await getTestContact();
    let testAddress = await getTestAddress();

    const result = await supertest(web)
      .delete("/api/contacts/" + testContact.id + "/addresses/" + testAddress.id)
      .set("Authorization", "test");
    expect(result.status).toBe(200);
    expect(result.body.data).toBe("OK");
    
    testAddress = await getTestAddress();
    expect(testAddress).toBeNull();
  });

  it("should be invalid to delete address if the contact is not found", async () => {
    const testContact = await getTestContact();
    let testAddress = await getTestAddress();

    const result = await supertest(web)
      .delete("/api/contacts/" + (testContact.id + 1) + "/addresses/" + testAddress.id)
      .set("Authorization", "test");
    expect(result.status).toBe(404);
    expect(result.body.errors).toBeDefined();
  });

  it("should be invalid to delete address if the address is not found", async () => {
    const testContact = await getTestContact();
    const testAddress = await getTestAddress();

    const result = await supertest(web)
      .delete("/api/contacts/" + testContact.id + "/addresses/" + (testAddress.id + 1))
      .set("Authorization", "test");
    logger.info(result);
    expect(result.status).toBe(404);
    expect(result.body.errors).toBeDefined();
  });
});

describe('GET /api/contacts/:contactId/addresses', () => {
  beforeEach(async () => {
    await createUserTest();
    await createTestContact();
    await createTestAddress();
  });

  afterEach(async () => {
    await removeAllTestAddresses();
    await removeAllContacts();
    await removeUserTest();
  });

  it('should be able to make a list of address', async () => {
    const testContact = await getTestContact();
    const result = await supertest(web).get('/api/contacts/' + testContact.id + '/addresses').set('Authorization', 'test');
    logger.info(result);
    expect(result.status).toBe(200);
    expect(result.body.data.length).toBe(1);
  });

  it('should be invalid to make a list of address if the contact was not found', async () => {
    const testContact = await getTestContact();
    const result = await supertest(web).get('/api/contacts/' + (testContact.id + 1) + '/addresses').set('Authorization', 'test');
    logger.info(result);
    expect(result.status).toBe(404);
    expect(result.body.errors).toBeDefined();
  });
})
