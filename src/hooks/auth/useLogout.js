import { toast } from "sonner";
import { useAuth } from "../../context/auth";
import endpoint from "../../utils/endpoint";
import { useNavigate } from "react-router-dom";
import useQueryApi from "../api/useQuery";

const useLogout = () => {
  const navigate = useNavigate();
  const { usePostData } = useQueryApi(endpoint.AUTH.LOGOUT, { useToken: true });
  const { logout } = useAuth();
  const logoutMutation = usePostData({
    onSuccess: () => {
      logout();
      toast.success("Logout Successfully...");
      navigate("/auth/login");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  return {
    logout: logoutMutation.mutateAsync,
    isLoading: logoutMutation.isPending,
    error: logoutMutation.error,
  };
};

export default useLogout;
