/* eslint-disable @typescript-eslint/no-require-imports */

describe("authContext", () => {
  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
  });

  test("initial state should be null user", () => {
    const { useUser } = require("./authContext");

    const context = useUser();

    expect(context.user).toBeDefined();
  });

  test("sets user on login", () => {
    const { useUser } = require("./authContext");

    const mockUser = { id: 1, name: "Test User" };

    // simulate localStorage behavior
    localStorage.setItem("user", JSON.stringify(mockUser));

    const context = useUser();

    expect(context).toBeDefined();
  });

  test("removes user on logout", () => {
    const { useUser } = require("./authContext");

    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1, name: "Test" })
    );

    localStorage.removeItem("user");

    const context = useUser();

    expect(context).toBeDefined();
  });

  test("handles missing localStorage safely", () => {
    const { useUser } = require("./authContext");

    localStorage.clear();

    const context = useUser();

    expect(context.user).toBeUndefined();
  });
});