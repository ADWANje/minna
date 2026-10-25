"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="pw" className="text-sm text-earth">كلمة السر</label>
      <input
        id="pw"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        className="h-12 border border-line bg-paper px-3.5 text-[15px] outline-none focus:border-ink"
      />
      <p role="alert" className="m-0 min-h-5 text-sm text-rust">{state.error}</p>
      <button type="submit" disabled={pending} className="h-12 cursor-pointer rounded-sm border-0 bg-night text-[15px] text-bone disabled:opacity-60">
        {pending ? "لحظة..." : "دخول"}
      </button>
    </form>
  );
}
