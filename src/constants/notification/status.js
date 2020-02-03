const STATUS = {
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
};

export default STATUS;
