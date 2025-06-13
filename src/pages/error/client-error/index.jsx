import React from "react";

const ClientError = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#123524] text-white">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Something Went Wrong</h1>
        <p className="mb-6 text-lg ">
          We're sorry, but something went wrong on our end. Please try
          refreshing the page or come back later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-block px-6 py-2 mr-5 bg-white text-[#123524] rounded hover:bg-gray-200 transition mb-4"
        >
          Refresh Page
        </button>
        <a
          href="/"
          className="inline-block px-6 py-2 bg-white text-[#123524] rounded hover:bg-gray-200 transition"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
};

export default ClientError;
