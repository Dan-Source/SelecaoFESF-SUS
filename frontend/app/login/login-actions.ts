import { Role } from "@/types/models";

export type LoginFormValues = {
  email: string;
  password: string;
  role: Role;
};

export type LoginDependencies = {
  loginUser: (email: string, password: string) => Promise<{ access_token: string }>;
  setAuth: (token: string, role: Role) => void;
  navigate: (path: string) => void;
  setMessage: (message: string) => void;
  setLoading: (loading: boolean) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
};

export async function submitLogin(values: LoginFormValues, dependencies: LoginDependencies) {
  const { email, password, role } = values;
  const { loginUser, setAuth, navigate, setMessage, setLoading, showSuccess, showError } = dependencies;

  try {
    setLoading(true);
    setMessage("");
    const response = await loginUser(email, password);
    setAuth(response.access_token, role);
    showSuccess("Login realizado com sucesso.");
    navigate(role === "patient" ? "/paciente" : "/odontologo");
  } catch (error) {
    const nextMessage = error instanceof Error ? error.message : "Erro ao autenticar";
    setMessage(nextMessage);
    showError(nextMessage);
  } finally {
    setLoading(false);
  }
}