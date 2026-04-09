import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolInvocationBadge, getToolActionText } from "../ToolInvocationBadge";

test("shows create file message for str_replace_editor create command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "create", path: "/App.jsx" },
      }}
    />
  );

  expect(screen.getByText("Generating your component")).toBeDefined();
});

test("shows edit file message for str_replace_editor str_replace command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "result",
        result: "ok",
        args: { command: "str_replace", path: "/components/Card.jsx" },
      }}
    />
  );

  expect(screen.getByText("Updating component code")).toBeDefined();
});

test("shows rename message for file_manager command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: "file_manager",
        state: "call",
        args: { command: "rename", old_path: "/Old.jsx", new_path: "/New.jsx" },
      }}
    />
  );

  expect(screen.getByText("Renaming component")).toBeDefined();
});

test("falls back to generic text when path is unavailable", () => {
  expect(getToolActionText("str_replace_editor", {})).toBe("Writing component code");
  expect(getToolActionText("file_manager", {})).toBe("Managing components");
});
