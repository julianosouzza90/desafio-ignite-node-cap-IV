import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("show user profile", () => {
  let showUserProfileUseCase: ShowUserProfileUseCase;
  let usersRepositoryInMemory: InMemoryUsersRepository;
  let authenticateUSerUseCase: AuthenticateUserUseCase;
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
    authenticateUSerUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);
  });


  it("should be show user profile", async () => {
    const passwordHash = await hash("123456", 8);
    const user = await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "teste@teste.com",
      password: passwordHash
    });

    const id = user.id as string;
    const userProfile = await showUserProfileUseCase.execute(id);

    expect(userProfile.id).toBe(id);
    expect(userProfile.name).toBe("John Doe");
    expect(userProfile.email).toBe("teste@teste.com");
  });
})
