export const CUSTOM_MESSAGE = {
  DEFAULT_ERROR: 'Something went wrong please try again!',
  LOGIN_ERROR: {
    userNotExist: 'Invalid Email!',
    userNotActivated: 'Your account has been deactivated. Please contact MOBILECASH support center',
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

  USER_ROLE_ERROR: {
    roleHasUsers: 'Users have been assigned to this role!',
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
  RESETPASSWORD_LINK_ERROR: {
    invalidToken: 'This token is invalid!',
    expired: 'This token is expired!',
    defaultError: 'Something went wrong please try again!',
  },
  RESETPASSWORD_CHANGE_ERROR: {
    oldPassword: 'You have entered the password you previously used!',
    userNotExist: 'The corresponding user account does not exist!',
    defaultError: 'Something went wrong please try again!',
  },
  RESETPASSWORD_RESET_ERROR: {
    userNotExists: 'The corresponding user account does not exist!',
    defaultError: 'Something went wrong please try again!',
  },
  DEVICE_VERSION_MANAGEMENT_ERROR: {
    invalidVersionNo: 'Please enter a valid version number!',
    invalidVersionName: 'Please enter a valid version name!',
    invalidFile: 'Please enter a valid version file!',
    invalidFileType:
      'The file you uploaded is not in the due format. Please upload a file ending with .apk file name.',
    invalidKeyConstant: 'Invalid FTP key constant, Check the database!',
    versionNoOrVersionNameAlreadyExist:
      'A version with the same version number or version name already exists.',
    versionNameAlreadyUsedAsADirectoryName:
      'Version name you entered is already used as a directory name.',
    ftpLoginFailed:
      'Found an error related to FTP server. Please contact MobileCash support center to get it sorted',
    storeFileError:
      'Found an error related to FTP server. Please contact MobileCash support center to get it sorted',
    deleteCurrentFileError:
      'Found an error related to FTP server. Please contact MobileCash support center to get it sorted',
    makeDirectoryError:
      'Found an error related to FTP server. Please contact MobileCash support center to get it sorted',
    changeDirectoryError:
      'Found an error related to FTP server. Please contact MobileCash support center to get it sorted',
    renameDirectoryError:
      'Found an error related to FTP server. Please contact MobileCash support center to get it sorted',
    defaultError: 'Something went wrong please try again!',
  },
  SCHEDULE_REPORT_ERROR: {
    missingEmail: 'Please enter E-mail address',
    missingAccountId: 'Please enter Account number',
    persistIssue: 'There is persists issue',
    searchIssue: 'There is search issue',
    reportNotExist: 'Could not update your email. Please try again!',
    updateIssue: 'Could not update your email. Please try again!',
    wrongStatusType: 'Could not update the status!',
    invalidStatus: 'Could not update the status!',
    deleteIssue: 'Found an error while deleting the record',
    defaultError: 'Something went wrong please try again!',
  },
  IPG_SERVICE_ERROR: {
    searchIssue: 'Could not find respective results',
    saveIssue: 'Could not create the record. Please try again later',
    recordExistsForAccount: 'A record has been already created using this account',
    doesNotExists: "Couldn't find any results for the searched items",
    missingFailUrl: 'Please enter the URL for the failed attempts',
    missingSuccessUrl: 'Please enter the URL for the success attempts',
    defaultError: 'Something went wrong please try again!',
  },
};

export function getErrorMessage(error, arrayKey) {
  let msg = null;
  let errorJSON = CUSTOM_MESSAGE[arrayKey];

  if (errorJSON === undefined) {
    console.log('Message : getErrorMessage : Invalid Array Key!');
    msg = CUSTOM_MESSAGE.DEFAULT_ERROR;
  } else {
    if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.validationFailures &&
      error.response.data.validationFailures[0] &&
      error.response.data.validationFailures[0].code
    ) {
      let errorCode = error.response.data.validationFailures[0].code;
      msg = errorJSON[errorCode];
      if (msg === undefined) {
        console.log('Message : getErrorMessage : Invalid Error Code!');
        msg = errorJSON['defaultError'];
      }
    } else {
      msg = errorJSON['defaultError'];
    }
  }

  return msg;
}

export default getErrorMessage;
