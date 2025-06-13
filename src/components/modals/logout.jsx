import React from "react";
import { LogoutSvg } from "../../assets/svgs";
import { useModal } from "../../context/modal";
import { useLogout } from "../../hooks";
import { Button } from "../../common";

const Logout = () => {
  const { logout, isLoading } = useLogout();
  const { closeModal } = useModal();
  const handleLogout = async () => {
    await logout({});
    closeModal();
  };
  return (
    <div className="flex flex-col items-center py-4">
      <div className="flex flex-col items-center justify-center mb-6">
        <LogoutSvg />
        <h3 className="mb-3 text-lg font-bold md:text-2xl text-custom_primary">
          Confirm Logout
        </h3>
        <p className="text-base text-gray-600 md:text-lg">
          Are you sure you want to logout?
        </p>
      </div>
      <div className="flex gap-4">
        <Button
          className="px-4 py-2 mt-4 text-sm font-semibold text-white rounded-md bg-custom_black hover:opacity-70"
          type="submit"
          onClick={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? "Logging out..." : "Logout"}
        </Button>
        <Button
          onClick={closeModal}
          className="px-4 py-2 mt-4 ml-4 text-sm font-semibold text-black border rounded-md border-[#e6e3e3] hover:bg-custom_black hover:text-white"
          type="button"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default Logout;
