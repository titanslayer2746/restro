import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import logo from "../assets/images/logo.png";
import Register from "../components/auth/Register";
import Login from "../components/auth/Login";

const Auth = () => {

  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-paper px-5 py-10">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

      <Link
        to="/"
        className="absolute left-5 top-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <MdArrowBack size={18} />
        Back
      </Link>

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-ink bg-surface shadow-[0_30px_80px_-35px_rgba(22,20,15,0.45)]">
        <div className="flex items-center justify-between border-b border-ink px-6 py-2.5 font-mono text-[11px] uppercase tracking-wider">
          <span className="text-ink">staff / {isRegister ? "register" : "clock in"}</span>
          <span className="text-muted">restro</span>
        </div>

        <div className="p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink">
            <img src={logo} alt="Restro Logo" className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              {isRegister ? "Employee Registration" : "Employee Login"}
            </h2>
            <p className="font-mono text-[11px] text-muted">
              {isRegister ? "create your staff account" : "sign in to start service"}
            </p>
          </div>
        </div>
        <div className="rule-dashed my-6" />

        {/* Component  */}
        {isRegister ? <Register setIsRegister={setIsRegister} /> : <Login />}

        <div className="mt-6 flex justify-center">
          <p className="text-sm text-muted">
            {isRegister ? "Already have an account?" : "Don't have an account?"}
            <a
              onClick={(e) => {
                e.preventDefault();
                setIsRegister(!isRegister);
              }}
              className="pl-2 font-semibold text-accent hover:underline"
              href="#"
            >
              {isRegister ? "Sign in" : "Sign up"}
            </a>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
