import { useQuery } from "@tanstack/react-query";
import { getMenu } from "../https";

// Categories with their dishes, shared by the menu page and the dashboard
const useMenu = () => {
  const query = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      return await getMenu();
    },
    staleTime: 5 * 60 * 1000,
  });

  return { ...query, menu: query.data?.data.data || [] };
};

export default useMenu;
