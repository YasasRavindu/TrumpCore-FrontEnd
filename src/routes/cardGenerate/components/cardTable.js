import React from 'react';
import { Table, Icon, Input, Button, Modal, AutoComplete, Form } from 'antd';
import DEMO from 'constants/demoData';
const Search = Input.Search;
const FormItem = Form.Item;
const dataSource = ['1234-87275-2354', '1234-87575-7588', '1234-28645-8624'];
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

const columns = [
  {
    title: 'Create Date',
    dataIndex: 'createDate',
    key: 'createDate',
  },
  {
    title: 'Card Count',
    dataIndex: 'count',
    key: 'count',
  },
  {
    title: 'Card Type',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'Action',
    key: 'action',
    render: (text, record) => (
      <span>
        <a href={DEMO.link}>
          <Icon type="edit" />
        </a>
        <span className="ant-divider" />
        <a href={DEMO.link}>
          <Icon type="delete" />
        </a>
      </span>
    ),
  },
];

const tableData = [
  {
    key: '1',
    posid: '123424443uur',
    accountid: '1234-87275-2354',
  },
  {
    key: '2',
    posid: '123424443Ate',
    accountid: '1234-87575-7588',
  },
  {
    key: '3',
    posid: '12344we43ee',
    accountid: '1234-28645-8624',
  },
];

class Data extends React.Component {
  state = {};

  render() {
    return (
      <React.Fragment>
        <Search
          placeholder="Search"
          onSearch={value => console.log(value)}
          style={{ width: 400 }}
        />
        <article className="article mt-2">
          <Table columns={columns} dataSource={tableData} className="ant-table-v1" />
        </article>
      </React.Fragment>
    );
  }
}

const WrappedData = Form.create()(Data);

const cardTable = () => (
  <div className="box box-default">
    {/* <div className="box-header">Add POS ID with Account ID</div> */}
    <div className="box-body">
      <WrappedData />
    </div>
  </div>
);

export default cardTable;
