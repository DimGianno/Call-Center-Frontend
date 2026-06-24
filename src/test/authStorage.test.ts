import { describe, expect, it } from "vitest";
import { getEmailValidationMessage, isValidEmail, validateAuthForm } from "../utils/authStorage";

describe("email validation", () => {
  it.each([
    "user@example.com",
    "first.last+notifications@example.co.uk",
    "customer_service@example.io",
    "o'reilly@example.com",
    "USER@EXAMPLE.COM",
    "  user@example.com  ",
  ])("accepts the practical public email address %s", (email) => {
    expect(isValidEmail(email)).toBe(true);
    expect(getEmailValidationMessage(email)).toBe("");
  });

  it.each([
    "",
    "user.example.com",
    "user@@example.com",
    ".user@example.com",
    "user.@example.com",
    "user..name@example.com",
    "user name@example.com",
    "user@example",
    "user@example..com",
    "user@-example.com",
    "user@example-.com",
    "δοκιμή@παράδειγμα.δοκιμή",
  ])("rejects the unsupported or malformed address %s", (email) => {
    expect(isValidEmail(email)).toBe(false);
    expect(getEmailValidationMessage(email)).not.toBe("");
  });

  it("enforces the local-part and domain-label length limits", () => {
    expect(isValidEmail(`${"a".repeat(64)}@example.com`)).toBe(true);
    expect(getEmailValidationMessage(`${"a".repeat(65)}@example.com`)).toBe(
      "The part before @ must be 64 characters or fewer.",
    );

    expect(isValidEmail(`user@${"b".repeat(63)}.com`)).toBe(true);
    expect(getEmailValidationMessage(`user@${"b".repeat(64)}.com`)).toBe(
      "Each domain part must be 63 characters or fewer.",
    );
  });

  it("enforces the complete email length limit", () => {
    const maximumLengthEmail = `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(61)}`;
    const overlongEmail = `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(62)}`;

    expect(maximumLengthEmail).toHaveLength(254);
    expect(isValidEmail(maximumLengthEmail)).toBe(true);
    expect(overlongEmail).toHaveLength(255);
    expect(getEmailValidationMessage(overlongEmail)).toBe("Email must be 254 characters or fewer.");
  });

  it("uses the detailed email guidance during form validation", () => {
    const email = "user@example";

    expect(
      validateAuthForm({
        email,
        password: "password123",
        isSignup: false,
      }),
    ).toBe(getEmailValidationMessage(email));
  });
});
