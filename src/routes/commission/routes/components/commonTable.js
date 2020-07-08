import React from 'react';

// -------------- OTHER CUSTOM IMPORTS -------------------------------------
import STATUS from 'constants/notification/status';
import { Table, Tooltip, Icon, Tag } from 'antd';
// -------------------------------------------------------------------------

const CommonTable = props => {

  let { tableDataList, loadingTable, activeKey, checkFormStatus } = props;
  const TABLE_HEADER = {
    1: [
      { title: 'Agent Type Code', dataIndex: 'agentTypeCode', key: 'agentTypeCode' },
      { title: 'Agent Type Name', dataIndex: 'agentTypeName', key: 'agentTypeName' },
      {
        title: 'Agent Type Status',
        dataIndex: 'active',
        key: 'active',
        render: status => (
          <Tag color={STATUS.COMMON_STATUS_ACTIVE_INACTIVE[status].color}>
            {STATUS.COMMON_STATUS_ACTIVE_INACTIVE[status].label}
          </Tag>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        render: record => (
          <Tooltip title="Edit">
            <Icon onClick={() => checkFormStatus(record)} type="edit" className="mr-3" />
          </Tooltip>
        ),
      },
    ],
    2: [
      { title: 'Channel Type', dataIndex: 'channelType', key: 'channelType' },
      {
        title: 'Channel Type Status',
        dataIndex: 'active',
        key: 'active',
        render: status => (
          <Tag color={STATUS.COMMON_STATUS_ACTIVE_INACTIVE[status].color}>
            {STATUS.COMMON_STATUS_ACTIVE_INACTIVE[status].label}
          </Tag>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        render: record => (
          <Tooltip title="Edit">
            <Icon onClick={() => checkFormStatus(record)} type="edit" className="mr-3" />
          </Tooltip>
        ),
      },
    ],
    3: [
      {
        title: 'Distribution Type Code',
        dataIndex: 'distributionTypeCode',
        key: 'distributionTypeCode',
      },
      { title: 'Distribution Type Name', dataIndex: 'distribution', key: 'distribution' },
      {
        title: 'Distribution Type Status',
        dataIndex: 'active',
        key: 'active',
        render: status => (
          <Tag color={STATUS.COMMON_STATUS_ACTIVE_INACTIVE[status].color}>
            {STATUS.COMMON_STATUS_ACTIVE_INACTIVE[status].label}
          </Tag>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        render: record => (
          <Tooltip title="Edit">
            <Icon onClick={() => checkFormStatus(record)} type="edit" className="mr-3" />
          </Tooltip>
        ),
      },
    ],
    4: [
      {
        title: 'Transaction Type Code',
        dataIndex: 'tc_TransactionTypeCode',
        key: 'tc_TransactionTypeCode',
      },
      {
        title: 'Transaction Type Name',
        dataIndex: 'tc_TransactionType',
        key: 'tc_TransactionType',
      },
      {
        title: 'Deduct Commission',
        dataIndex: 'deductCommision',
        key: 'deductCommision',
        render: status => (
          <Tag color={STATUS.COMMON_STATUS_ACTIVE_INACTIVE[status].color}>
            {STATUS.COMMON_STATUS_ACTIVE_INACTIVE[status].label}
          </Tag>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        render: record => (
          <Tooltip title="Edit">
            <Icon onClick={() => checkFormStatus(record)} type="edit" className="mr-3" />
          </Tooltip>
        ),
      },
    ],
  };
  return (
    <div>
      <Table
        columns={TABLE_HEADER[activeKey]}
        dataSource={tableDataList}
        loading={loadingTable}
        // scroll={{ x: 1500, y: 300 }}
        className="ant-table-v1"
      />
    </div>
  );
};

export default CommonTable;
