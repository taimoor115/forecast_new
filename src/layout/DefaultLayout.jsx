import { Outlet } from "react-router-dom";

const DefaultLayout = () => {
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <div className="relative flex flex-col flex-1 overflow-x-hidden overflow-y-auto ">
          <main>
            <div>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default DefaultLayout;
