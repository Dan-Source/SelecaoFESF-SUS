import { submitRegister } from "../app/register/register-actions";

describe("submitRegister", () => {
  it("registers a user and resets the form", async () => {
    const registerUser = jest.fn().mockResolvedValue(undefined);
    const setMessage = jest.fn();
    const setLoading = jest.fn();
    const showSuccess = jest.fn();
    const showError = jest.fn();
    const resetForm = jest.fn();

    await submitRegister(
      {
        name: "Maria Silva",
        email: "maria@email.com",
        password: "secret",
        role: "patient",
      },
      { registerUser, setMessage, setLoading, showSuccess, showError, resetForm }
    );

    expect(registerUser).toHaveBeenCalledWith({
      name: "Maria Silva",
      email: "maria@email.com",
      password: "secret",
      role: "patient",
    });
    expect(setMessage).toHaveBeenNthCalledWith(1, "");
    expect(setMessage).toHaveBeenLastCalledWith("Cadastro realizado com sucesso. Faca login.");
    expect(showSuccess).toHaveBeenCalledWith("Cadastro realizado com sucesso.");
    expect(showError).not.toHaveBeenCalled();
    expect(resetForm).toHaveBeenCalledTimes(1);
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });

  it("surfaces register errors", async () => {
    const registerUser = jest.fn().mockRejectedValue(new Error("Erro ao cadastrar"));
    const setMessage = jest.fn();
    const setLoading = jest.fn();
    const showSuccess = jest.fn();
    const showError = jest.fn();
    const resetForm = jest.fn();

    await submitRegister(
      {
        name: "Joao Santos",
        email: "joao@email.com",
        password: "secret",
        role: "dentist",
      },
      { registerUser, setMessage, setLoading, showSuccess, showError, resetForm }
    );

    expect(setMessage).toHaveBeenLastCalledWith("Erro ao cadastrar");
    expect(showError).toHaveBeenCalledWith("Erro ao cadastrar");
    expect(showSuccess).not.toHaveBeenCalled();
    expect(resetForm).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });
});