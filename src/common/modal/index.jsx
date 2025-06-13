import { useEffect, useRef } from "react";
import { useModal } from "../../context/modal";

const Modal = () => {
  const { isOpen, content, closeModal } = useModal();
  const ref = useRef();

  // useEffect(() => {
  //   const handler = (e) => {
  //     // Prevent closing if click is on form input
  //     if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
  //       return;
  //     }
  //     if (ref.current && !ref.current.contains(e.target)) {
  //       closeModal();
  //     }
  //   };

  //   document.addEventListener("mousedown", handler);

  //   return () => {
  //     document.removeEventListener("mousedown", handler);
  //   };
  // }, [closeModal]);

  if (!isOpen) return null;

  return (
    <div className="flex overflow-y-auto overflow-x-hidden fixed inset-0 justify-center items-center px-3 backdrop-blur-sm z-99999 bg-black/50">
      <div
        ref={ref}
        id="popup-modal"
        tabIndex="-1"
        className="relative w-full max-w-lg bg-white rounded-lg shadow dark:bg-gray-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[80vh] overflow-y-auto p-4">{content}</div>
      </div>
    </div>
  );
};

export default Modal;
