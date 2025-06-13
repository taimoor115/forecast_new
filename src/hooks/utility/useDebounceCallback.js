// import { useEffect, useRef } from 'react';

// const useDebounceCallback = (callback, delay = 1000) => {
//   const timeoutRef = useRef(null);
//   const callbackRef = useRef(callback);

//   useEffect(() => {
//     callbackRef.current = callback;
//   }, [callback]);

//   useEffect(() => {
//     return () => {
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//     };
//   }, []);

//   const debouncedFunction = (...args) => {
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }

//     timeoutRef.current = setTimeout(() => {
//       callbackRef.current(...args);
//     }, delay);
//   };

//   return debouncedFunction;
// };

// export default useDebounceCallback;

import { useEffect, useRef } from 'react';

const useDebounceCallback = (callback, delay = 1000) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);
  const promiseRef = useRef(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedFunction = (...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(async () => {
        const result = await callbackRef.current(...args);
        resolve(result);
      }, delay);
    });
  };

  return debouncedFunction;
};

export default useDebounceCallback;