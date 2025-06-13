import { useEffect } from "react";

const useDebounce = (callback, dependencies, delay = 1000) => {
  useEffect(() => {
    const handler = setTimeout(() => {
      callback();
    }, delay);

    return () => clearTimeout(handler);
  }, dependencies);
};
export default useDebounce;