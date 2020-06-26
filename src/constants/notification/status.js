const STATUS = {
  COMMON_STATUS_ACTIVE_INACTIVE: {
    false: { color: '', label: 'INACTIVE', value: '0' },
    true: { color: 'blue', label: 'ACTIVE', value: '1' },
  },
  DEVICE_STATUS: {
    REGISTER: { color: 'blue', label: 'REGISTER', value: '0' },
    ACTIVE: { color: 'blue', label: 'ACTIVE', value: '1' },
    INACTIVE: { color: '', label: 'INACTIVE', value: '2' },
    LOCKED: { color: 'magenta', label: 'LOCKED', value: '3' },
    RE_REGISTER: { color: 'magenta', label: 'RE-REGISTER', value: '4' },
    REMOVE: { color: 'magenta', label: 'REMOVE', value: '5' },
  },
  USER_STATUS: {
    ACTIVE: { color: 'blue', label: 'ACTIVE', value: '0', code: 'A' },
    INACTIVE: { color: 'magenta', label: 'INACTIVE', value: '1', code: 'I' },
    DELETED: { color: 'magenta', label: 'DELETED', value: '2', code: 'D' },
    PENDING_ACTIVATION: { color: 'magenta', label: 'PENDING', value: '3', code: 'PEA' },
    TEMP_LOCKED_BAD_CREDENTIALS: { color: 'magenta', label: 'LOCKED', value: '4', code: 'TELBC' },
  },
  TRANSACTION_TYPE: {
    1: { color: '', label: 'New Biometric' },
    2: { color: 'magenta', label: 'Edit Biometric' },
    3: { color: 'red', label: 'Change Pin' },
    4: { color: 'volcano', label: 'Deposit' },
    5: { color: 'orange', label: 'Withdrew' },
    6: { color: 'gold', label: 'Balance Query' },
    7: { color: 'lime', label: 'Merchant Pay' },
    8: { color: 'green', label: 'Sim Registration' },
    9: { color: 'cyan', label: 'Cancel Transaction' },
    10: { color: 'blue', label: 'Cash Power' },
    11: { color: 'geekblue', label: 'Soloman Water' },
    12: { color: 'purple', label: 'B Mobile' },
    13: { color: 'black', label: 'TELKO' },
    14: { color: 'pink', label: 'NPF' },
    15: { color: 'coral', label: 'Cash Transfer' },
  },
  CARD_TYPE: {
    DEBIT: { color: 'green', label: 'Debit' },
    CASH: { color: 'cyan', label: 'Cash' },
  },
  CARD_STATUS: {
    ACTIVE: { color: '', label: 'Active' },
    INACTIVE: { color: 'magenta', label: 'Inactive' },
    LOCKED: { color: 'red', label: 'Locked' },
    CANCELLED: { color: 'volcano', label: 'Cancelled' },
    EXPIRED: { color: 'orange', label: 'Expired' },
    PENDING: { color: 'cyan', label: 'Pending' },
  },
  BATCH_STATUS: {
    INITIATE: { color: '' },
    DOWNLOAD: { color: 'blue' },
    ACTIVE: { color: 'magenta' },
  },
  SCHEDULE_REPORT_STATUS: {
    ACTIVE: { color: '', label: 'Active', value: '1' },
    INACTIVE: { color: 'magenta', label: 'Inactive', value: '2' },
  },
  SCHEDULE_REPORT_DETAIL: {
    true: { color: 'blue', label: 'Success' },
    false: { color: 'red', label: 'Unsuccess' },
  },
  IPG_SERVICE_RECORD: {
    true: { color: 'blue', label: 'Active' },
    false: { color: 'magenta', label: 'Inactive' },
  },
};

export default STATUS;
