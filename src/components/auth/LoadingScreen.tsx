import React from "react";

const LoadingScreen = () => {
  return (
    <main
      className="relative p-6 flex flex-col gap-6 items-center
      justify-center w-full min-h-dvh bg-primary"
    >
      <span className="loader"></span>
    </main>
  );
};

export default LoadingScreen;
