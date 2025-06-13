import React, { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { ErrorBoundary, Loader } from "./common";
import router from "./routes";

const App = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        <RouterProvider router={router} />
        
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
