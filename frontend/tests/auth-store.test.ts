import { useAuthStore } from "../store/auth";

describe("auth store", () => {
  it("should set and clear auth", () => {
    useAuthStore.getState().setAuth("token", "patient");
    expect(useAuthStore.getState().token).toBe("token");
    expect(useAuthStore.getState().role).toBe("patient");

    useAuthStore.getState().logout();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().role).toBeNull();
  });
});
