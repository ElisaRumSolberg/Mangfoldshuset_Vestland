// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import SubmissionForm, { type SubmissionResult } from "./SubmissionForm";

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });
async function mount(action: (data: FormData) => Promise<SubmissionResult>) {
  await act(async () => root.render(createElement(SubmissionForm, { action },
    createElement("input", { key: "input", name: "name", defaultValue: "Synthetic QA Ø" }),
    createElement("button", { key: "button", type: "submit" }, "Send"),
  )));
}
function submit() { container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); }
it("keeps entered values after a validation/database error", async () => {
  const action = vi.fn().mockResolvedValue({ error: "Synthetic failure" }); await mount(action);
  await act(async () => submit());
  expect(container.querySelector("input")!.value).toBe("Synthetic QA Ø");
  expect(container.querySelector('[role="alert"]')!.textContent).toBe("Synthetic failure");
  expect(action.mock.calls[0][0].get("name")).toBe("Synthetic QA Ø");
});
it("retains input and shows a generic message on network failure", async () => {
  await mount(vi.fn().mockRejectedValue(new Error("private server details")));
  await act(async () => submit());
  expect(container.querySelector("input")!.value).toBe("Synthetic QA Ø");
  expect(container.textContent).not.toContain("private server details");
  expect(container.querySelector('[role="alert"]')).not.toBeNull();
});
it("blocks duplicate submissions while pending", async () => {
  let finish!: (result: SubmissionResult) => void;
  const action = vi.fn(() => new Promise<SubmissionResult>(resolve => { finish = resolve; })); await mount(action);
  await act(async () => { submit(); submit(); });
  expect(action).toHaveBeenCalledOnce();
  expect(container.querySelector("fieldset")!.disabled).toBe(true);
  await act(async () => finish({ error: "retry later" }));
  expect(container.querySelector("fieldset")!.disabled).toBe(false);
});
