import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    content: null,
  });

  const openModal = (content) => {
    setModalState({ isOpen: true, content });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, content: null });
  };

  return (
    <ModalContext.Provider value={{ ...modalState, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
