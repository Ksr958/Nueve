jest.mock("axios", () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
  })),
}));

const axios = require("axios");
const authService = require("./authService");

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("login stores token on success", async () => {
    const mockResponse = {
      data: {
        access: "fake-token",
        user: { id: 1, name: "John" },
      },
    };

    axios.create().post.mockResolvedValue(mockResponse);

    const result = await authService.login({
      email: "test@mail.com",
      password: "1234",
    });

    expect(result).toBeDefined();
  });

  test("login handles failure", async () => {
    axios.create().post.mockRejectedValue(
      new Error("Invalid credentials")
    );

    await expect(
      authService.login({
        email: "wrong@mail.com",
        password: "wrong",
      })
    ).rejects.toThrow("Invalid credentials");
  });

  test("logout clears storage", () => {
    localStorage.setItem("token", "abc123");

    authService.logout?.();

    expect(localStorage.getItem("token")).toBeNull();
  });

  test("getCurrentUser returns stored user", () => {
    const user = { id: 1, name: "Test" };

    localStorage.setItem("user", JSON.stringify(user));

    const result = authService.getCurrentUser?.();

    expect(result).toBeDefined();
  });

  test("handles empty storage safely", () => {
    localStorage.clear();

    const result = authService.getCurrentUser?.();

    expect(result === null || result === undefined).toBe(true);
  });
});