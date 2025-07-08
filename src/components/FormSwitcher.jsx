"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";

export default function FormSwitcher() {
  const [isLogin, setIsLogin] = useState(true);

  return isLogin ? (
    <LoginForm setIsLogin={setIsLogin} />
  ) : (
    <SignUpForm setIsLogin={setIsLogin} />
  );
}