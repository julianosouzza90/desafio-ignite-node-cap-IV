import request from "supertest";
import { hash } from "bcryptjs";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../../../app";
import  getConnection from "../../../../database";


let connection: Connection;
describe("Create statement", () => {

  beforeAll(async() => {
    connection = await getConnection();
    await connection.runMigrations();

    const password =  await hash("123456", 8);
    const id = uuidv4();

    await connection.query(`insert into users
     (id, name, email, password, created_at, updated_at)
     values ('${id}', 'userTest', 'test@mail.com', '${password}', 'now()' , 'now()')`,
     );

  });
  afterAll(async() => {
    await connection.dropDatabase();
    await connection.close();
  })


  it("should be able to create a statement", async() => {

      let response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "test@mail.com",
        password: "123456"
      });
      const { token } = response.body;

      response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: 'Deposit Test'
      })
      .auth(token, { type: "bearer" });

      expect(response.body.amount).toBe(100);
      expect(response.status).toBe(201);

  });

  it("should not be able to create a withdrawal statement when the requested amount is greater than the balance", async() => {

    let response = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "test@mail.com",
      password: "123456"
    });
    const { token } = response.body;

    response = await request(app)
    .post("/api/v1/statements/withdraw")
    .send({
      amount: 200,
      description: 'Deposit Test'
    })
    .auth(token, { type: "bearer" });

    expect(response.statusCode).toBe(400);
  })

  it("should not  be able to create a statement when user does not exist", async() => {

    let response = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "test@mail.com",
      password: "123456"
    });

    const { token } = response.body;
    await connection.query(`DELETE FROM users WHERE email = 'test@mail.com' `)

    response = await request(app)
    .post("/api/v1/statements/deposit")
    .send({
      amount: 100,
      description: 'Deposit Test'
    })
    .auth(token, { type: "bearer" });


    expect(response.statusCode).toBe(404);

});

it("Should be able to create an transfer statement", async () => {

  let response = await request(app)
  .post("/api/v1/users")
  .send({
    name: "Carlos Briggs",
    email: "povnok@icha.bj",
    password: "123456"
  });
  const recipient_id = response.body.id;
  response = await request(app)
  .post("/api/v1/users")
  .send({
    name: "Sender User",
    email: "test@mail.com",
    password: "123456"
  });


  response = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "test@mail.com",
      password: "123456"
    });

    const { token } = response.body;

   response =  await request(app)
    .post(`/api/v1/statements/deposit`)
    .auth(token, { type: "bearer" })
    .send({
      amount:900,
      description: "Transfer"
    });


  response = await request(app)
  .post(`/api/v1/statements/transfer/${recipient_id}`)
  .auth(token, { type: "bearer" })
  .send({
    amount:100,
    description: "Transfer"
  });

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty("id");

});

});
