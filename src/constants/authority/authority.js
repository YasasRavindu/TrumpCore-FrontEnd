export const DEFAULT_EXCEPTION_ROUTE = '/exception/403';
export const DEFAULT_REDIRECT_ROUTE = '/app/cardManagement/';

export const USER_AUTHORITY_SECTION = {
  SECTION01: 'CARD',
  SECTION02: 'POS_DEVICE',
  SECTION03: 'USER_MANAGEMENT',
  SECTION04: 'REPORT',
  SECTION05: 'ACCOUNT',
};

export const USER_AUTHORITY_CODE = {
  // CARD
  CARD_GENERATE: 'CG-D',
  CARD_GENERATE_GENERATE: 'CG-G',
  CARD_GENERATE_DOWNLOAD: 'CG-DW',
  CARD_GENERATE_REMOVE: 'CG-R',

  CARD_ASSIGN: 'CA-D',
  CARD_ASSIGN_ASSIGN: 'CA-AS',
  CARD_ASSIGN_LOCK: 'CA-L',
  CARD_ASSIGN_UNLOCK: 'CA-UL',
  CARD_ASSIGN_CANCEL: 'CA-C',
  CARD_ASSIGN_RE_ASSIGN: 'CA-RAS',

  // POS DEVICE
  POS_DEVICE_REGISTRATION: 'PDREG-D',
  POS_DEVICE_REGISTRATION_REGISTER: 'PDREG-REG',

  POS_DEVICE_MANAGEMENT: 'PDM-D',
  POS_DEVICE_MANAGEMENT_ASSIGN: 'PDM-AS',
  POS_DEVICE_MANAGEMENT_ACTIVE: 'PDM-A',
  POS_DEVICE_MANAGEMENT_INACTIVE: 'PDM-I',
  POS_DEVICE_MANAGEMENT_LOCK: 'PDM-L',
  POS_DEVICE_MANAGEMENT_UNLOCK: 'PDM-UL',

  POS_DEVICE_REMOVE: 'PDR-D',
  POS_DEVICE_REMOVE_RE_REGISTER: 'PDR-RREG',
  POS_DEVICE_REMOVE_REMOVE: 'PDR-R',

  // USER MANAGEMENT
  USER_MANAGEMENT_USERS: 'UMU-D',
  USER_MANAGEMENT_USERS_CREATE: 'UMU-C',
  USER_MANAGEMENT_USERS_ACTIVE: 'UMU-A',
  USER_MANAGEMENT_USERS_INACTIVE: 'UMU-I',
  USER_MANAGEMENT_USERS_UPDATE: 'UMU-U',

  USER_MANAGEMENT_ROLES: 'UMR-D',
  USER_MANAGEMENT_ROLES_CREATE: 'UMR-C',
  USER_MANAGEMENT_ROLES_UPDATE: 'UMR-U',
  USER_MANAGEMENT_ROLES_REMOVE: 'UMR-R',

  // REPORT
  REPORT_TRANSACTION: 'RT-D',
  REPORT_POS_DEVICES: 'RPD-D',
  REPORT_CARDS: 'RC-D',

  // ACCOUNT
  ACCOUNT_UPLOAD: 'ACCU-D',
  ACCOUNT_MANAGEMENT: 'ACCM-D',
};

const USER_AUTHORITY = {
  DISPLAY_AUTHORITIES: {
    [USER_AUTHORITY_SECTION.SECTION01]: [
      USER_AUTHORITY_CODE.CARD_GENERATE,
      USER_AUTHORITY_CODE.CARD_ASSIGN,
    ],
    [USER_AUTHORITY_SECTION.SECTION02]: [
      USER_AUTHORITY_CODE.POS_DEVICE_REGISTRATION,
      USER_AUTHORITY_CODE.POS_DEVICE_MANAGEMENT,
      USER_AUTHORITY_CODE.POS_DEVICE_REMOVE,
    ],
    [USER_AUTHORITY_SECTION.SECTION03]: [
      USER_AUTHORITY_CODE.USER_MANAGEMENT_USERS,
      USER_AUTHORITY_CODE.USER_MANAGEMENT_ROLES,
    ],
    [USER_AUTHORITY_SECTION.SECTION04]: [
      USER_AUTHORITY_CODE.REPORT_TRANSACTION,
      USER_AUTHORITY_CODE.REPORT_POS_DEVICES,
      USER_AUTHORITY_CODE.REPORT_CARDS,
    ],
    [USER_AUTHORITY_SECTION.SECTION05]: [
      USER_AUTHORITY_CODE.ACCOUNT_UPLOAD,
      USER_AUTHORITY_CODE.ACCOUNT_MANAGEMENT,
    ],
  },
  // VIEW_ACTION_AUTHORITIES: {
  //   [USER_AUTHORITY_CODE.CARD_GENERATE]: [
  //     USER_AUTHORITY_CODE.CARD_GENERATE_GENERATE,
  //     USER_AUTHORITY_CODE.CARD_GENERATE_DOWNLOAD,
  //     USER_AUTHORITY_CODE.CARD_GENERATE_REMOVE,
  //   ],
  //   [USER_AUTHORITY_CODE.CARD_ASSIGN]: [
  //     USER_AUTHORITY_CODE.CARD_ASSIGN_ASSIGN,
  //     USER_AUTHORITY_CODE.CARD_ASSIGN_LOCK,
  //     USER_AUTHORITY_CODE.CARD_ASSIGN_UNLOCK,
  //     USER_AUTHORITY_CODE.CARD_ASSIGN_CANCEL,
  //     USER_AUTHORITY_CODE.CARD_ASSIGN_RE_ASSIGN,
  //   ],
  //   [USER_AUTHORITY_CODE.POS_DEVICE_REGISTRATION]: [
  //     USER_AUTHORITY_CODE.POS_DEVICE_REGISTRATION_REGISTER,
  //   ],
  //   [USER_AUTHORITY_CODE.POS_DEVICE_MANAGEMENT]: [
  //     USER_AUTHORITY_CODE.POS_DEVICE_MANAGEMENT_ASSIGN,
  //     USER_AUTHORITY_CODE.POS_DEVICE_MANAGEMENT_ACTIVE,
  //     USER_AUTHORITY_CODE.POS_DEVICE_MANAGEMENT_INACTIVE,
  //     USER_AUTHORITY_CODE.POS_DEVICE_MANAGEMENT_LOCK,
  //     USER_AUTHORITY_CODE.POS_DEVICE_MANAGEMENT_UNLOCK,
  //   ],
  //   [USER_AUTHORITY_CODE.POS_DEVICE_REMOVE]: [
  //     USER_AUTHORITY_CODE.POS_DEVICE_REMOVE_RE_REGISTER,
  //     USER_AUTHORITY_CODE.POS_DEVICE_REMOVE_REMOVE,
  //   ],
  //   [USER_AUTHORITY_CODE.USER_MANAGEMENT_USERS]: [
  //     USER_AUTHORITY_CODE.USER_MANAGEMENT_USERS_CREATE,
  //     USER_AUTHORITY_CODE.USER_MANAGEMENT_USERS_ACTIVE,
  //     USER_AUTHORITY_CODE.USER_MANAGEMENT_USERS_INACTIVE,
  //     USER_AUTHORITY_CODE.USER_MANAGEMENT_USERS_UPDATE,
  //   ],
  //   [USER_AUTHORITY_CODE.USER_MANAGEMENT_ROLES]: [
  //     USER_AUTHORITY_CODE.USER_MANAGEMENT_ROLES_CREATE,
  //     USER_AUTHORITY_CODE.USER_MANAGEMENT_ROLES_UPDATE,
  //     USER_AUTHORITY_CODE.USER_MANAGEMENT_ROLES_REMOVE,
  //   ],
  //   [USER_AUTHORITY_CODE.REPORT_TRANSACTION]: [],
  //   [USER_AUTHORITY_CODE.REPORT_POS_DEVICES]: [],
  //   [USER_AUTHORITY_CODE.REPORT_CARDS]: [],
  // },
};

export function getActiveAuthorities(viewCode) {
  let user = JSON.parse(localStorage.getItem('currentUser'));

  if (
    user &&
    user !== undefined &&
    user.role !== undefined &&
    user.role.authorities !== undefined
  ) {
    let userAuthorityCodes = user.role.authorities.map(authority => {
      return authority.code;
    });

    // console.log('------------ Authority', userAuthorityCodes);

    if (viewCode === undefined) {
      let returnAuthorities = {};
      Object.keys(USER_AUTHORITY.DISPLAY_AUTHORITIES).forEach(function(key) {
        returnAuthorities[key] = USER_AUTHORITY.DISPLAY_AUTHORITIES[key].filter(authority =>
          userAuthorityCodes.includes(authority)
        );
      });
      // console.log('------------ Authority', returnAuthorities);

      // ==================================================================================
      return returnAuthorities;
      // ==================================================================================
    } else {
      // TOO ADVANCED
      // ==================================================================================
      // if (USER_AUTHORITY.VIEW_ACTION_AUTHORITIES[viewCode] !== undefined) {
      //   if (userAuthorityCodes.includes(viewCode)) {
      //     let returnAuthorities = USER_AUTHORITY.VIEW_ACTION_AUTHORITIES[
      //       viewCode
      //     ].filter(authority => userAuthorityCodes.includes(authority));
      //     // console.log('------------ Authority', returnAuthorities);

      //     // ==================================================================================
      //     return returnAuthorities;
      //     // ==================================================================================
      //   } else {
      //     console.log('ERROR - getActiveAuthorities - UNAUTHORIZED ACCESS');
      //   }
      // } else {
      //   console.log('ERROR - getActiveAuthorities - UNDEFINED');
      // }
      // return 'UNAUTHORIZED';
      // ==================================================================================

      if (userAuthorityCodes.includes(viewCode)) {
        // ==================================================================================
        return userAuthorityCodes;
        // ==================================================================================
      } else {
        console.log('ERROR - getActiveAuthorities - UNAUTHORIZED ACCESS');
      }
      return 'UNAUTHORIZED';
    }
  } else {
    console.log('ERROR - getActiveAuthorities - CURRENT USER');
  }

  return {};
}

export function checkAuthority(authorityArray, authority) {
  return (
    (authorityArray && authorityArray !== undefined && authorityArray.includes(authority)) === true
  );
}
