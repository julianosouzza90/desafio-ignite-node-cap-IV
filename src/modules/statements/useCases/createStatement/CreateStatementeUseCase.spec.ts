import { hash } from "bcryptjs";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

describe("Create Statement", () => {

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("should be able to create a new statement", async () => {
    const passwordHash = await hash("123456", 8);
    const user = await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "johndoe@example.com",
      password: passwordHash
    });
    const id = user.id as string;

    const statement = await createStatementUseCase.execute({
      user_id: id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "deposit of salary"
    });

    expect(statement).toHaveProperty("id");

  });
  it("Should be able to create  a transfer statement", async () => {
    const password = await hash("123456", 8);
    const recipient_user = await usersRepositoryInMemory.create({
      name: "Carlos Briggs",
      email: "lut@ato.pr",
      password,
    });

    const sender_user = await usersRepositoryInMemory.create({
      name: "Manuel Bennett",
      email: "utuzez@lesi.cd",
      password
    });

    await createStatementUseCase.execute({
      user_id: sender_user.id as string,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: "Deposit"
    });

    const transfer = await createStatementUseCase.execute({
      amount: 100,
      description: "transfer to recipient",
      type: OperationType.TRANSFER,
      user_id: sender_user.id as string,
      sender_id: sender_user.id as string,
      recipient_id: recipient_user.id as string
    });

    expect(transfer).toHaveProperty("id");
    expect(transfer).toHaveProperty("recipient_id");

  });
  it("Should not be able to create a transfer if  recipient does not exists", async () => {

    const user_sender = await usersRepositoryInMemory.create({
      name: "user",
      email: "test@mail.com",
      password: "123456"
    });

   await expect(
      createStatementUseCase.execute({
      amount:200,
      description: "Transfer",
      type: OperationType.TRANSFER,
      recipient_id: "RecipientInexistent",
      sender_id: "RecipientInexistent",
      user_id: user_sender.id as string
    })
   ).rejects.toEqual(new CreateStatementError.UserNotFound())



  });
  it("Should not be able to create a transfer it the balance is less than the amount", async () => {
    const password = await hash("123456", 8);
    const recipient_user = await usersRepositoryInMemory.create({
      name: "Carlos Briggs",
      email: "lut@ato.pr",
      password,
    });

    const sender_user = await usersRepositoryInMemory.create({
      name: "Manuel Bennett",
      email: "utuzez@lesi.cd",
      password
    });

      await expect(
        createStatementUseCase.execute({
          amount: 100,
          description: "transfer to recipient",
          type: OperationType.TRANSFER,
          user_id: sender_user.id as string,
          sender_id: sender_user.id as string,
          recipient_id: recipient_user.id as string
        })
      ).rejects.toEqual(new CreateStatementError.InsufficientFunds());
  });

  it("should not be able to create a withdrawal transaction if the balance is less than the requested amount", async () => {

    await expect(async () => {
      const passwordHash = await hash("123456", 8);
      const user = await usersRepositoryInMemory.create({
        name: "John Doe",
        email: "johndoe@example.com",
        password: passwordHash
      });
      const id = user.id as string;

      await createStatementUseCase.execute({
        user_id: id,
        type: OperationType.WITHDRAW,
        amount: 500,
        description: "deposit of salary"
      });

    }).rejects.toBeInstanceOf(AppError);

  });

});
