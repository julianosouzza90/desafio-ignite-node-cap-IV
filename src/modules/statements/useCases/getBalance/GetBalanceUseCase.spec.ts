import { hash } from "bcryptjs";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalanceUseCase: GetBalanceUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
describe("balance", () => {

  beforeEach(()=>{
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
      );
  })


  it("should be able to return user balance", async () => {
    const passwordHash = await hash("123456", 8);
    const user = await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "johndoe@example.com",
      password: passwordHash
    });
    const id = user.id as string;
    await statementsRepositoryInMemory.create({
      user_id:id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description:"deposit of salary"

    });
    const {statement} = await getBalanceUseCase.execute({ user_id: id });

    expect(statement).toHaveLength(1);
    expect(statement[0].amount).toBe(100);

  });

  it("should be able to return user balance whit transfer statement", async () => {
    const passwordHash = await hash("123456", 8);
    const user = await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "johndoe@example.com",
      password: passwordHash
    });
    const id = user.id as string;

    const recipient_user = await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "recipient@user.com",
      password: passwordHash
    });
    const recipient_id = recipient_user.id as string;

    await statementsRepositoryInMemory.create({
      user_id:id,
      type: OperationType.TRANSFER,
      amount: 100,
      description:"deposit of salary",
      recipient_id,
      sender_id: id

    });
    const {statement} = await getBalanceUseCase.execute({ user_id: id });

    expect(statement).toHaveLength(1);
    expect(statement[0].sender_id).toBeDefined();
    expect(statement[0].sender_id).toBeDefined();
  });

  it("should not be able to return use balance when user id does not exist", async () => {

    await expect(async () => {

      const passwordHash = await hash("123456", 8);
      const user = await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "johndoe@example.com",
      password: passwordHash
    });
    const id = user.id as string;
    await statementsRepositoryInMemory.create({
      user_id:id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description:"deposit of salary"

    });
    await getBalanceUseCase.execute({ user_id: 'userId inexistent' });
    }).rejects.toBeInstanceOf(AppError)

  });
});
