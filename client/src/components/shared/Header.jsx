import React, { useEffect, useState } from "react";
import logo from "../../assets/images/logo.png";
import { FaSearch, FaBell } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { IoLogOutOutline } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../https";
import { removeUser, setLogoutInProgress } from "../../redux/slices/userSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { getAvatarName } from "../../utils";
import { Initials, Spinner } from "./ui";

const useClock = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now.toLocaleTimeString("en-GB", { hour12: false });
};

const iconButton =
  "flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink";

const Header = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const clock = useClock();

  const logoutMutation = useMutation({
    mutationFn: () => {
      dispatch(setLogoutInProgress(true));
      return logout();
    },
    onSuccess: (data) => {
      console.log(data);
      dispatch(removeUser());
      navigate("/", { replace: true });
    },
    onError: (error) => {
      console.log(error);
      dispatch(setLogoutInProgress(false));
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-5 md:px-10">
        {/* LOGO */}
        <button onClick={() => navigate("/home")} className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink">
            <img src={logo} className="h-5 w-5" alt="" />
          </span>
          <span className="text-[17px] font-semibold tracking-tight text-ink">restro</span>
        </button>

        {/* SEARCH */}
        <label className="hidden w-full max-w-sm items-center gap-3 rounded-full border border-line bg-surface px-4 py-1.5 focus-within:border-ink md:flex">
          <FaSearch className="text-muted" size={12} />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted/70"
          />
        </label>

        {/* LOGGED USER DETAILS  */}
        <div className="flex items-center gap-2.5">
          <span className="mr-2 hidden font-mono text-[11px] tabular-nums tracking-wider text-muted lg:block">
            {clock}
          </span>
          {userData.role === "Admin" && (
            <button
              onClick={() => navigate("/dashboard")}
              aria-label="Dashboard"
              className={`${iconButton} ${
                location.pathname === "/dashboard" ? "border-ink bg-ink text-paper" : ""
              }`}
            >
              <MdDashboard size={16} />
            </button>
          )}
          <button aria-label="Notifications" className={iconButton}>
            <FaBell size={13} />
          </button>
          <div className="ml-1 flex items-center gap-2.5 border-l border-line pl-3.5">
            <Initials className="h-8 w-8 rounded-md">{getAvatarName(userData.name)}</Initials>
            <div className="hidden flex-col items-start leading-tight sm:flex">
              <span className="text-sm font-semibold text-ink">{userData.name}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                {userData.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              aria-label="Log out"
              aria-busy={logoutMutation.isPending}
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-accent-soft hover:text-accent disabled:cursor-wait"
            >
              {logoutMutation.isPending ? <Spinner /> : <IoLogOutOutline size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
