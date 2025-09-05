import { useFeedStore } from "../store/feedStore";

export type UserRole = "staff" | "family" | "resident";

export const useAuthRole = () => {
  const { currentRole, currentUser, switchRole } = useFeedStore();

  const isStaff = currentRole === "staff";
  const isFamily = currentRole === "family";

  return {
    currentRole,
    currentUser,
    switchRole,
    isStaff,
    isFamily,
  };
};
