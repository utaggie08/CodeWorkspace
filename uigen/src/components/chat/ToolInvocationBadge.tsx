"use client";

import { Loader2 } from "lucide-react";

type ToolInvocationLike = {
  toolName?: string;
  state?: string;
  result?: unknown;
  args?: Record<string, unknown>;
};

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocationLike;
}

function getFilePathFromArgs(args: Record<string, unknown> | undefined): string | null {
  if (!args) {
    return null;
  }

  const directPath = args.path;
  if (typeof directPath === "string" && directPath.length > 0) {
    return directPath;
  }

  const command = args.command;
  if (typeof command === "string") {
    if (command === "create" || command === "str_replace" || command === "insert" || command === "view") {
      const commandPath = args.path;
      if (typeof commandPath === "string" && commandPath.length > 0) {
        return commandPath;
      }
    }
    if (command === "rename") {
      const newPath = args.new_path;
      if (typeof newPath === "string" && newPath.length > 0) {
        return newPath;
      }
      const oldPath = args.old_path;
      if (typeof oldPath === "string" && oldPath.length > 0) {
        return oldPath;
      }
    }
    if (command === "delete") {
      const deletePath = args.path;
      if (typeof deletePath === "string" && deletePath.length > 0) {
        return deletePath;
      }
    }
  }

  return null;
}

function getToolActionText(toolName: string | undefined, args: Record<string, unknown> | undefined): string {
  const filePath = getFilePathFromArgs(args);
  const command = typeof args?.command === "string" ? args.command : null;

  if (toolName === "str_replace_editor") {
    if (command === "create") {
      return "Generating your component";
    }
    if (command === "str_replace" || command === "insert") {
      return "Updating component code";
    }
    if (command === "view") {
      return "Reading component files";
    }
    return "Writing component code";
  }

  if (toolName === "file_manager") {
    if (command === "rename") {
      return "Renaming component";
    }
    if (command === "delete") {
      return "Removing component";
    }
    return "Managing components";
  }

  if (filePath) {
    return `Running ${toolName ?? "tool"} on ${filePath}`;
  }

  return toolName ?? "Running tool";
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const isComplete = toolInvocation.state === "result" && !!toolInvocation.result;
  const actionText = getToolActionText(toolInvocation.toolName, toolInvocation.args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{actionText}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{actionText}</span>
        </>
      )}
    </div>
  );
}

export { getToolActionText };
