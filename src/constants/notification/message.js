const CUSTOM_MESSAGE = {
  LOGIN_ERROR: {
    userNotExist: 'Invalid Email!',
    incorrectPassword: 'Invalid Password!',
    defaultError: 'Something went wrong please try again!',
  },
  CARD_GENERATE_ERROR: {
    invalidCount: 'Please check your card count!',
    countExceeded: 'You have reached the maximum count allowed!',
    invalidEffectivePeriod: 'Please enter a valid effective period!',
    invalidCardType: 'Please select a card type!',
    defaultError: 'Something went wrong please try again!',
  },
  USER_SAVE_ERROR: {
    // invalidCount: 'Please check your card count!',
    defaultError: 'Something went wrong please try again!',
  },
  
  USER_ROLE_SAVE_ERROR: {
    roleNameAlreadyExist: 'Role name already exist!',
    defaultError: 'Something went wrong please try again!',
  },
  DEVICES_REGISTRATION_ERROR: {
    alreadyRegistered: 'Device already registered!',
    issueInRegister: 'Something wrong!',
    defaultError: 'Something went wrong please try again!',
  },
  DEVICE_ASSIGN_ERROR: {
    deviceNotExists: 'Device Not Exists!',
    accountNotExists: 'Account Not Exists!',
    defaultError: 'Something went wrong please try again!',
  },
  DEVICES_REMOVE_ERROR: {
    notExists: 'This Assignment not exists!',
    defaultError: 'Something went wrong please try again!',
  },
  CARD_ASSIGN_ERROR: {
    accountAlreadyAssigned: 'This account already assigned!',
    cardAlreadyAssigned: 'This card already assigned!',
    defaultError: 'Something went wrong please try again!',
  },
  CARD_REGISTRY_ERROR: {
    cardAlreadyAssigned: 'This card already assigned!',
    accountAlreadyAssigned: 'This account already assigned!',
    invalidContext: 'Invalid context!',
    defaultError: 'Something went wrong please try again!',
  },
};

export default CUSTOM_MESSAGE;
