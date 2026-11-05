import { describe, expect, it } from "vitest";
import { registrationSchema, messageSchema } from "@/lib/chat-validation";
describe("Visitor registration", () => {
  it("requires a display name, email and password", () => {
    expect(
      registrationSchema.safeParse({
        display_name: "Visitor",
        email: "visitor@example.com",
        password: "secure-pass-123",
      }).success,
    ).toBe(true);
    expect(
      registrationSchema.safeParse({
        display_name: "",
        email: "visitor@example.com",
        password: "secure-pass-123",
      }).success,
    ).toBe(false);
    expect(
      registrationSchema.safeParse({
        display_name: "Visitor",
        email: "invalid",
        password: "secure-pass-123",
      }).success,
    ).toBe(false);
    expect(
      registrationSchema.safeParse({
        display_name: "Visitor",
        email: "visitor@example.com",
        password: "",
      }).success,
    ).toBe(false);
  });
});
describe("Messages", () => {
  it("rejects empty messages", () => {
    expect(messageSchema.safeParse("  ").success).toBe(false);
    expect(messageSchema.parse(" Hello ")).toBe("Hello");
  });
});
