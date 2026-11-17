import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import ProfileMenu from "../components/ProfileMenu";

afterEach(cleanup);

const profile = {
  cards: { peek: 2, autoMatch: 0, freeze: 1 },
  classic: [{}, {}, {}],
  timer: [{ won: true }, { won: false }],
};

const setup = (overrides = {}) => {
  const props = { name: "Ann", profile, onSignOut: vi.fn(), onDelete: vi.fn().mockResolvedValue({ ok: true }), ...overrides };
  render(<ProfileMenu {...props} />);
  return props;
};

const open = () => fireEvent.click(screen.getByRole("button", { name: "Profile: Ann" }));
const click = (name) => fireEvent.click(screen.getByRole("button", { name }));

describe("ProfileMenu", () => {
  it("shows only the profile button (icon and the word Profile) until it is clicked", () => {
    setup();
    expect(screen.getByText("Profile")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Profile: Ann" })).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens a profile card with the name and the player's numbers", () => {
    setup();
    open();
    const card = screen.getByRole("dialog");
    expect(card.textContent).toContain("Ann");
    expect(card.textContent).toContain("Peek2");
    expect(card.textContent).toContain("Auto-Match0");
    expect(card.textContent).toContain("Freeze1");
    expect(card.textContent).toContain("Classic games3");
    expect(card.textContent).toContain("Timer games2");
    expect(card.textContent).toContain("Timer wins1");
  });

  it("closes with the close button, the Escape key, or a click outside the card", () => {
    setup();
    open();
    click("Close profile");
    expect(screen.queryByRole("dialog")).toBeNull();

    open();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();

    open();
    fireEvent.click(screen.getByRole("dialog").parentElement);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does not close when the card itself is clicked", () => {
    setup();
    open();
    fireEvent.click(screen.getByRole("dialog"));
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("asks before switching account, and switches only after confirming", () => {
    const { onSignOut } = setup();
    open();
    click("Switch account");
    expect(screen.getByRole("alertdialog").textContent).toContain("Switch account?");
    expect(onSignOut).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole("button", { name: "Switch account" }).at(-1));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("cancelling the switch goes back to the profile card", () => {
    const { onSignOut } = setup();
    open();
    click("Switch account");
    click("Cancel");
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(onSignOut).not.toHaveBeenCalled();
  });

  it("shows Delete account in red, and its confirmation button too", () => {
    setup();
    open();
    expect(screen.getByRole("button", { name: "Delete account" }).className).toContain("danger");
    expect(screen.getByRole("button", { name: "Switch account" }).className).not.toContain("danger");
    click("Delete account");
    expect(screen.getByRole("button", { name: "Delete" }).className).toContain("danger");
    expect(screen.getByRole("button", { name: "Cancel" }).className).not.toContain("danger");
  });

  it("asks before deleting, warns that it is permanent, and deletes only after confirming", async () => {
    const { onDelete } = setup();
    open();
    click("Delete account");
    const warning = screen.getByRole("alertdialog");
    expect(warning.textContent).toContain("permanently");
    expect(onDelete).not.toHaveBeenCalled();
    click("Delete");
    await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(1));
  });

  it("cancelling the delete keeps the account", () => {
    const { onDelete } = setup();
    open();
    click("Delete account");
    click("Cancel");
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("shows the error and stays on the card when deleting fails", async () => {
    setup({ onDelete: vi.fn().mockResolvedValue({ ok: false, error: "Cannot reach the server." }) });
    open();
    click("Delete account");
    click("Delete");
    await waitFor(() => expect(screen.getByRole("dialog").textContent).toContain("Cannot reach the server."));
  });

  it("clears an old error when the profile is opened again", async () => {
    setup({ onDelete: vi.fn().mockResolvedValue({ ok: false, error: "Cannot reach the server." }) });
    open();
    click("Delete account");
    click("Delete");
    await waitFor(() => expect(screen.getByRole("dialog").textContent).toContain("Cannot reach"));
    click("Close profile");
    open();
    expect(screen.getByRole("dialog").textContent).not.toContain("Cannot reach");
  });
});
