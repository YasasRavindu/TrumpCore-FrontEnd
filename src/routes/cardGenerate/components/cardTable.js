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
    title: 'POS ID',
    dataIndex: 'posid',
    key: 'posid',
  },
  {
    title: 'Account ID',
    dataIndex: 'accountid',
    key: 'accountid',
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
  state = { visible: false, result: [] };
  check = () => {
    this.props.form.validateFields(err => {
      if (!err) {
        console.info('success');
      }
    });
  };
  showModal = () => {
    this.setState({
      visible: true,
    });
  };
  handleOk = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };
  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <React.Fragment>
        <Button type="primary" icon="plus" className="float-right" onClick={this.showModal}>
          Add
        </Button>
        <Modal
          visible={this.state.visible}
          onCancel={this.handleCancel}
          footer={null}
          //   className="custom-modal-v1"
          centered
        >
          <Form>
            <FormItem {...formItemLayout} label="POS ID">
              {getFieldDecorator('posid', {
                rules: [
                  {
                    required: true,
                    message: 'Please input your POS ID',
                  },
                ],
              })(<Input placeholder="Please input your POS ID" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="Account ID">
              {getFieldDecorator('accountId', {
                rules: [
                  {
                    required: true,
                    message: 'Please input your account ID',
                  },
                ],
              })(
                <AutoComplete
                  //style={{ width: 200 }}
                  dataSource={dataSource}
                  placeholder="Type account number here"
                  filterOption={(inputValue, option) =>
                    option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                />
              )}
            </FormItem>
            <FormItem>
              <Button style={{ float: 'right' }} type="primary" onClick={this.check}>
                Submit
              </Button>
            </FormItem>
          </Form>
        </Modal>
      </React.Fragment>
    );
  }
}

const WrappedData = Form.create()(Data);

const cardTable = () => (
  <div className="box box-default">
    {/* <div className="box-header">Add POS ID with Account ID</div> */}
    <div className="box-body">
      <Search placeholder="Search" onSearch={value => console.log(value)} style={{ width: 400 }} />
      <WrappedData />
      <br />
      <br />
      <article className="article">
        <Table columns={columns} dataSource={tableData} className="ant-table-v1" />
      </article>
    </div>
  </div>
);

export default cardTable;
