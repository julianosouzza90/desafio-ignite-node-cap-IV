import { hash } from "bcryptjs";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
describe("Create a user session", () => {

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);
  })

  it("should be create a user session", async () => {
    const passwordHash = await hash("123456", 8);

    await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "teste@teste.com",
      password: passwordHash
    });


    const {user, token}  = await authenticateUserUseCase.execute({
      email: "teste@teste.com",
      password: "123456"
    });
   expect(user).toHaveProperty("id");
   expect(token).toBeDefined();


  });
  it("Should not be able to create a user session when the password is incorrect", async() =>{
    await expect(async() => {
      const passwordHash = await hash("123456", 8);
      await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "teste@teste.com",
      password: passwordHash
    });

    await authenticateUserUseCase.execute({
      email: "teste@teste.com",
      password: "incorrectPassword"
    })

    }).rejects.toBeInstanceOf(AppError);
  });
  it("Should not be able to create a user session when email is non-existent", async() =>{
    await expect(async() => {
      const passwordHash = await hash("123456", 8);
      await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "johmdoe@teste.com",
      password: passwordHash
    });

    await authenticateUserUseCase.execute({
      email: "nonexistent@mail.com",
      password: "123456"
    })

    }).rejects.toBeInstanceOf(AppError);
  });

})
