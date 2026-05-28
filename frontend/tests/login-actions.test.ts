import { describe, expect, it, jest } from "@jest/globals";
import { submitLogin } from "../app/login/login-actions";

type LoginUserFn = (email: string, password: string) => Promise<{
  access_token: string;
  token_type: string;
  role: "patient" | "dentist";
}>;

describe("submitLogin", () => {
  it("logs in a patient and redirects to the patient area", async () => {
    const loginUser = jest.fn() as jest.MockedFunction<LoginUserFn>;
    loginUser.mockResolvedValue({ access_token: "token-123", token_type: "bearer", role: "patient" });
    const setAuth = jest.fn();
    const navigate = jest.fn();
    const setMessage = jest.fn();
    const setLoading = jest.fn();
    const showSuccess = jest.fn();
    const showError = jest.fn();

    await submitLogin(
      { email: "patient@email.com", password: "secret" },
      { loginUser, setAuth, navigate, setMessage, setLoading, showSuccess, showError }
    );

    expect(loginUser).toHaveBeenCalledWith("patient@email.com", "secret");
    expect(setAuth).toHaveBeenCalledWith("token-123", "patient");
    expect(navigate).toHaveBeenCalledWith("/paciente");
    expect(showSuccess).toHaveBeenCalledWith("Login realizado com sucesso.");
    expect(showError).not.toHaveBeenCalled();
    expect(setMessage).toHaveBeenNthCalledWith(1, "");
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });

  it("logs in a dentist and redirects to the dentist area", async () => {
    const loginUser = jest.fn() as jest.MockedFunction<LoginUserFn>;
    loginUser.mockResolvedValue({ access_token: "token-456", token_type: "bearer", role: "dentist" });
    const setAuth = jest.fn();
    const navigate = jest.fn();
    const setMessage = jest.fn();
    const setLoading = jest.fn();
    const showSuccess = jest.fn();
    const showError = jest.fn();

    await submitLogin(
      { email: "dentist@email.com", password: "secret" },
      { loginUser, setAuth, navigate, setMessage, setLoading, showSuccess, showError }
    );

    expect(setAuth).toHaveBeenCalledWith("token-456", "dentist");
    expect(navigate).toHaveBeenCalledWith("/odontologo");
  });

  it("surfaces login errors", async () => {
    const loginUser = jest.fn() as jest.MockedFunction<LoginUserFn>;
    loginUser.mockRejectedValue(new Error("Falha no login"));
    const setAuth = jest.fn();
    const navigate = jest.fn();
    const setMessage = jest.fn();
    const setLoading = jest.fn();
    const showSuccess = jest.fn();
    const showError = jest.fn();

    await submitLogin(
      { email: "user@email.com", password: "wrong" },
      { loginUser, setAuth, navigate, setMessage, setLoading, showSuccess, showError }
    );

    expect(setAuth).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(setMessage).toHaveBeenLastCalledWith("Falha no login");
    expect(showError).toHaveBeenCalledWith("Falha no login");
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });
});