const updateUser = data => {
  return {
    type: "UPDATE_USER",
    data
  };
};

const removeUser = () => {
  return {
    type: "REMOVE_USER"
  };
};

export { updateUser, removeUser };
