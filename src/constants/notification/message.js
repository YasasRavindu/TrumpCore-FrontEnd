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
  DEVICE_ASSIGN_ERROR: {
    deviceNotExists: 'Device Not Exists!',
    accountNotExists: 'Account Not Exists!',
    defaultError: 'Something went wrong please try again!',
  },
  DIVICES_REGISTRATION_ERROR: {
    alreadyRegistered: 'Device already registered!',
    issueInRegister: 'Something wrong!',
    defaultError: 'Something went wrong please try again!',
  },
  DIVICES_REMOVE_ERROR: {
    notExists: 'This Assignment not exists!',
    defaultError: 'Something went wrong please try again!',
  },
};

export default CUSTOM_MESSAGE;
