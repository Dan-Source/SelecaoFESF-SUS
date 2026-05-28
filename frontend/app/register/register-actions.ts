import { Role } from "@/types/models";

export type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

export type RegisterDependencies = {
  registerUser: (payload: RegisterFormValues) => Promise<unknown>;
  setMessage: (message: string) => void;
  setLoading: (loading: boolean) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  resetForm: () => void;
};

export async function submitRegister(values: RegisterFormValues, dependencies: RegisterDependencies) {
  const { registerUser, setMessage, setLoading, showSuccess, showError, resetForm } = dependencies;

  try {
    setLoading(true);
    setMessage("");
    await registerUser(values);
    setMessage("Cadastro realizado com sucesso. Faca login.");
    showSuccess("Cadastro realizado com sucesso.");
    resetForm();
  } catch (error) {
    const nextMessage = error instanceof Error ? error.message : "Erro ao cadastrar";
    setMessage(nextMessage);
    showError(nextMessage);
  } finally {
    setLoading(false);
  }
}