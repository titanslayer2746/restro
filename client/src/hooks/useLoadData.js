import { useDispatch, useSelector } from "react-redux";
import { getUserData } from "../https";
import { useEffect, useState } from "react";
import { removeUser, setUser } from "../redux/slices/userSlice";

const useLoadData = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const { logoutInProgress } = useSelector((state) => state.user);
  
  useEffect(() => {
    // Skip fetching user data if logout is in progress
    if (logoutInProgress) {
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const { data } = await getUserData();
        const { _id, name, email, phone, role } = data.data;
        dispatch(setUser({ _id, name, email, phone, role }));
      } catch (error) {
        // Not signed in: stay on the current (possibly public) page
        dispatch(removeUser());
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [dispatch, logoutInProgress]);

  return isLoading;
};

export default useLoadData;