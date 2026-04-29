/* eslint-disable @typescript-eslint/no-require-imports */

function clearApiEnv() {
  delete process.env.NEXT_PUBLIC_API_BASE_URL;
  delete process.env.NEXT_PUBLIC_API_ORIGIN;
}

function setTestWindow(windowValue) {
  if (windowValue) {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: windowValue,
      writable: true,
    });
    return;
  }

  delete globalThis.window;
}

function loadApiModule({ env = {}, windowValue = null } = {}) {
  jest.resetModules();
  clearApiEnv();
  Object.assign(process.env, env);
  setTestWindow(windowValue);

  const client = {
    interceptors: {
      response: {
        use: jest.fn(),
      },
    },
  };
  const axios = {
    create: jest.fn(() => client),
  };

  jest.doMock("axios", () => ({
    __esModule: true,
    default: axios,
  }));

  const apiModule = require("./apis");
  return { axios, client, apiModule };
}

afterEach(() => {
  clearApiEnv();
  setTestWindow(null);
  jest.dontMock("axios");
});

describe("API utilities", () => {
  test("uses localhost defaults when neither env nor browser host is available", () => {
    const { axios, apiModule } = loadApiModule();

    expect(apiModule.resolveApiBaseUrl()).toBe("http://localhost:8000/api");
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "http://localhost:8000/api",
      withCredentials: true,
    });
    expect(apiModule.default).toBe(axios.create.mock.results[0].value);
    expect(apiModule.getMediaUrl("/media/image.jpg")).toBe(
      "http://localhost:8000/media/image.jpg"
    );
  });

  test("derives the API base URL from the browser hostname", () => {
    const { axios, apiModule } = loadApiModule({
      windowValue: {
        location: {
          hostname: "192.168.1.8",
          pathname: "/dashboard",
          href: "/dashboard",
        },
      },
    });

    expect(apiModule.resolveApiBaseUrl()).toBe("http://192.168.1.8:8000/api");
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "http://192.168.1.8:8000/api",
      withCredentials: true,
    });
  });

  test("uses explicit API base and origin environment values", () => {
    const { apiModule } = loadApiModule({
      env: {
        NEXT_PUBLIC_API_BASE_URL: "https://api.example.com/v1",
        NEXT_PUBLIC_API_ORIGIN: "https://cdn.example.com",
      },
    });

    expect(apiModule.resolveApiBaseUrl()).toBe("https://api.example.com/v1");
    expect(apiModule.getMediaUrl("/media/photo.png")).toBe(
      "https://cdn.example.com/media/photo.png"
    );
  });

  test("returns empty and absolute media paths unchanged", () => {
    const { apiModule } = loadApiModule();

    expect(apiModule.getMediaUrl("")).toBe("");
    expect(apiModule.getMediaUrl("https://assets.example.com/photo.png")).toBe(
      "https://assets.example.com/photo.png"
    );
  });

  test("redirects unauthorized responses outside the login page", async () => {
    const error = { response: { status: 401 } };
    const { client } = loadApiModule({
      windowValue: {
        location: {
          hostname: "localhost",
          pathname: "/dashboard",
          href: "/dashboard",
        },
      },
    });
    const rejected = client.interceptors.response.use.mock.calls[0][1];

    await expect(rejected(error)).rejects.toBe(error);

    expect(globalThis.window.location.href).toBe("/");
  });

  test("does not redirect non-unauthorized responses or login page responses", async () => {
    const { client } = loadApiModule({
      windowValue: {
        location: {
          hostname: "localhost",
          pathname: "/",
          href: "/",
        },
      },
    });
    const rejected = client.interceptors.response.use.mock.calls[0][1];

    await expect(rejected({ response: { status: 500 } })).rejects.toEqual({
      response: { status: 500 },
    });
    await expect(rejected({ response: { status: 401 } })).rejects.toEqual({
      response: { status: 401 },
    });

    expect(globalThis.window.location.href).toBe("/");
  });

  test("does not redirect unauthorized responses when no browser window exists", async () => {
    const { client } = loadApiModule();
    const rejected = client.interceptors.response.use.mock.calls[0][1];

    await expect(rejected({ response: { status: 401 } })).rejects.toEqual({
      response: { status: 401 },
    });

    expect(globalThis.window).toBeUndefined();
  });

  test("passes successful responses through the interceptor", () => {
    const response = { data: { ok: true } };
    const { client } = loadApiModule();
    const fulfilled = client.interceptors.response.use.mock.calls[0][0];

    expect(fulfilled(response)).toBe(response);
  });
});
