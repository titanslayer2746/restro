import React, { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { enqueueSnackbar } from "notistack";
import { getStaff, updateUserRole } from "../../https";
import { setUser } from "../../redux/slices/userSlice";
import { getAvatarName } from "../../utils";
import { Initials, Skeleton, Spinner } from "../shared/ui";

const ROLES = ["Waiter", "Cashier", "Admin"];

const Staff = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const me = useSelector((state) => state.user);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      return await getStaff();
    },
  });

  useEffect(() => {
    if (isError) enqueueSnackbar("Couldn't load staff", { variant: "error" });
  }, [isError]);

  const roleMutation = useMutation({
    mutationFn: (vars) => updateUserRole(vars),
    onSuccess: (res) => {
      const updated = res.data.data;
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      // Changing your own role takes effect right away in this session
      if (updated._id === me._id) {
        dispatch(setUser({ ...me, role: updated.role }));
      }
      enqueueSnackbar(res.data.message, { variant: "success" });
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Couldn't change the role", { variant: "error" });
    },
  });

  const staff = data?.data.data || [];
  const savingId = roleMutation.isPending ? roleMutation.variables?.userId : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-ink bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink px-5 py-3">
        <h2 className="font-semibold tracking-tight text-ink">Staff</h2>
        <span className="mono-label">new sign-ups start as waiters</span>
      </div>

      <ul>
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-center gap-4 border-b border-line px-5 py-3.5 last:border-b-0">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-2.5 w-1/3" />
              </div>
              <Skeleton className="h-8 w-48 rounded-full" />
            </li>
          ))}

        {staff.map((user) => (
          <li key={user._id} className="flex flex-wrap items-center gap-4 border-b border-line px-5 py-3.5 last:border-b-0">
            <Initials>{getAvatarName(user.name)}</Initials>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">
                {user.name}
                {user._id === me._id && <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-muted">you</span>}
              </p>
              <p className="truncate font-mono text-[11px] text-muted">{user.email}</p>
            </div>

            <div className="flex items-center gap-2">
              {savingId === user._id && <Spinner className="text-muted" />}
              <div className="inline-flex rounded-full border border-line p-0.5" role="radiogroup" aria-label={`Role for ${user.name}`}>
                {ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    role="radio"
                    aria-checked={user.role === role}
                    disabled={Boolean(savingId) || user.role === role}
                    onClick={() => roleMutation.mutate({ userId: user._id, role })}
                    className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                      user.role === role ? "bg-ink text-paper" : "text-muted hover:text-ink disabled:hover:text-muted"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Staff;
