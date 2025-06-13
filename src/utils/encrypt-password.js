export const encryptPassword = (password) => {
  try {
    return btoa(password);
  } catch (error) {
    throw error;
  }
};
