import { submitLogin } from "../app/login/login-actions";

describe("submitLogin", () => {
  it("logs in a patient and redirects to the patient area", async () => {
    const loginUser = jest.fn().mockResolvedValue({ access_token: "token-123" });
    const setAuth = jest.fn();
    const navigate = jest.fn();
    const setMessage = jest.fn();
    const setLoading = jest.fn();
    const showSuccess = jest.fn();
    const showError = jest.fn();

    await submitLogin(
      { email: "patient@email.com", password: "secret", role: "patient" },
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
    const loginUser = jest.fn().mockResolvedValue({ access_token: "token-456" });
    const setAuth = jest.fn();
    const navigate = jest.fn();
    const setMessage = jest.fn();
    const setLoading = jest.fn();
    const showSuccess = jest.fn();
    const showError = jest.fn();

    await submitLogin(
      { email: "dentist@email.com", password: "secret", role: "dentist" },
      { loginUser, setAuth, navigate, setMessage, setLoading, showSuccess, showError }
    );

    expect(setAuth).toHaveBeenCalledWith("token-456", "dentist");
    expect(navigate).toHaveBeenCalledWith("/odontologo");
  });

  it("surfaces login errors", async () => {
    const loginUser = jest.fn().mockRejectedValue(new Error("Falha no login"));
    const setAuth = jest.fn();
    const navigate = jest.fn();
    const setMessage = jest.fn();
    const setLoading = jest.fn();
    const showSuccess = jest.fn();
    const showError = jest.fn();

    await submitLogin(
      { email: "user@email.com", password: "wrong", role: "patient" },
      { loginUser, setAuth, navigate, setMessage, setLoading, showSuccess, showError }
    );

    expect(setAuth).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(setMessage).toHaveBeenLastCalledWith("Falha no login");
    expect(showError).toHaveBeenCalledWith("Falha no login");
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });
});