import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "../components";
import { DefaultLayout } from "../layout/index";
import { ClientError, Home, Login, NotFound } from "./import";

const ProtectedRouteWrapper = ({ children }) => (
  <ProtectedRoute allowedRoles={["ADMIN"]}>{children}</ProtectedRoute>
);

const routes = [{ path: "/", element: <Home /> }];

const router = createBrowserRouter([
  {
    path: "/auth/login",
    element: <Login />,
    errorElement: <ClientError />,
    public: true,
  },
  {
    path: "/",
    element: <DefaultLayout />,
    errorElement: <ClientError />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRouteWrapper>
            <Home />
          </ProtectedRouteWrapper>
        ),
      },
      ...routes.map((route) => ({
        path: route.path,
        element: <ProtectedRouteWrapper>{route.element}</ProtectedRouteWrapper>,
      })),
    ],
  },
  { path: "*", element: <NotFound />, errorElement: <ClientError /> },
]);

export default router;
