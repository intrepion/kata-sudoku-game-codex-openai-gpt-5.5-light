import { describe, expect, it } from "vitest";
import { APP_NAME } from "./app";

describe("Ninefold Daily scaffold", () => {
  it("names the app", () => {
    expect(APP_NAME).toBe("Ninefold Daily");
  });
});
