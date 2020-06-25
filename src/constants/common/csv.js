const CSV = {
  CARDS: {
    CATALOG: {
      CSV_HEADER: [
        { label: 'Card No', key: 'cardNo' },
        { label: 'Created date', key: 'createDate' },
        { label: 'Expiry date', key: 'expiryDate' },
        { label: 'Card Type', key: 'type' },
        { label: 'Status', key: 'status' },
      ],
      TREE_DATA: [
        {
          title: 'Pending',
          value: 'pending',
          key: 'pending',
        },
        {
          title: 'Active',
          value: 'active',
          key: 'active',
        },
        {
          title: 'Inactive',
          value: 'inactive',
          key: 'inactive',
        },
        {
          title: 'Locked',
          value: 'locked',
          key: 'locked',
        },
        {
          title: 'Cancelled',
          value: 'cancelled',
          key: 'cancelled',
        },
        {
          title: 'Expired',
          value: 'expired',
          key: 'expired',
        },
      ],
    },
  },
};

export default CSV;
