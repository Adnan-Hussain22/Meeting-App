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

const updateProfile = data => {
  return {
    type: "UPDATE_PROFILE",
    data
  };
};

export { updateUser, removeUser, updateProfile };
