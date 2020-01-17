import React from 'react';
import QueueAnim from 'rc-queue-anim';
import {
  Table,
  Icon,
  Input,
  Button,
  Modal,
  Form,
  Tag,
  Divider,
  Row,
  Col,
  Select,
  InputNumber,
  DatePicker,
  message,
  Badge,
} from 'antd';

import { environment, commonUrl } from '../../../environments';
import axios from 'axios';
import Password from 'antd/lib/input/Password';
import CUSTOM_MESSAGE from 'constants/notification/message';

const userStatus = {
  ACTIVE: { color: '', label: 'ACTIVE' },
  INACTIVE: { color: 'blue', label: 'INACTIVE' },
  DELETED: { color: 'magenta', label: 'DELETED' },
  PENDING_ACTIVATION: { color: 'magenta', label: 'PENDING' },
  TEMP_LOCKED_BAD_CREDENTIALS: { color: 'magenta', label: 'LOCKED' },
};

const FormItem = Form.Item;
const { Option } = Select;
const { Column, ColumnGroup } = Table;

class Data extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userList: [],
      userRole: [],
    };
  }

  async componentDidMount() {
    this.loadTable();
    axios
      .get(environment.baseUrl + 'role')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        this.setState({
          userRole: response.data.content,
        });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  }

  loadTable = () => {
    axios
      .get(environment.baseUrl + 'platform-users')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const userList = response.data.content.map(user => {
          user.key = user.id;
          return user;
        });
        this.setState({
          userList: userList,
        });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  submit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        axios
          .post(environment.baseUrl + 'platform-users', {
            accName: values.accountName,
            email: values.email,
            password: values.password,
            role: {
              id: values.role,
            },
          })
          .then(response => {
            message.success('User Account Successfully Created');
            console.log('------------------- response - ', response);
            this.loadTable();
            this.props.form.resetFields();
          })
          .catch(error => {
            let errorCode = error.response.data.validationFailures[0].code;
            let msg = CUSTOM_MESSAGE.USER_SAVE_ERROR[errorCode];
            if (msg === undefined) {
              msg = CUSTOM_MESSAGE.USER_SAVE_ERROR['defaultError'];
            }
            message.error(msg);
            console.log('------------------- error - ', error);
          });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { userRole, userList } = this.state;

    return (
      <div className="container-fluid no-breadcrumb container-mw-xl chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div key="1">
            <div className="box box-default mb-4">
              <div className="box-header">Assign Devices</div>
              <div className="box-body">
                <Form>
                  <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                    <Col span={6} order={4}>
                      <FormItem>
                        {getFieldDecorator('Serial number', {
                          rules: [
                            {
                              required: true,
                              message: 'Please enter your Serial number',
                            },
                          ],
                        })(<Input placeholder="Serial Number" />)}
                      </FormItem>
                    </Col>
                    <Col span={3} order={3} justify="space-around" align="middle">
                      <Badge
                        count={'Assign to >'}
                        style={{
                          backgroundColor: '#fff',
                          color: '#999',
                          boxShadow: '0 0 0 1px #d9d9d9 inset',
                          marginTop: '10px',
                        }}
                      />
                    </Col>
                    <Col span={6} order={2}>
                      <FormItem>
                        {getFieldDecorator('Account Number', {
                          rules: [
                            {
                              required: true,
                              message: 'Please enter your Account number',
                            },
                          ],
                        })(<Input placeholder="Account Number" />)}
                      </FormItem>
                    </Col>
                    <Col span={6} order={1}>
                      <Button type="primary" className="float-right" onClick={this.submit}>
                        Assign
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </div>
            </div>
          </div>
          <div key="2">
            <div className="box box-default">
              <div className="box-header">Device Management</div>
              <div className="box-body">
                {/* <Form>
                  <Row gutter={24}>
                    <Col span={8} order={3}>
                      <FormItem {...formItemLayout} label="Date Range">
                        <DatePicker.RangePicker
                          onChange={this.searchDateHandler}
                          format={dateFormat}
                        />
                      </FormItem>
                    </Col>
                    <Col span={6} order={2}>
                      <FormItem {...formItemLayout} label="Card Type">
                        <Select
                          style={{ width: 120 }}
                          onChange={this.searchTypeHandler}
                          value={this.state.searchType}
                        >
                          <Option value="all">All</Option>
                          <Option value="cash">Cash</Option>
                          <Option value="debit">Debit</Option>
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={6} order={1}>
                      <FormItem {...formItemLayout} label="Status">
                        <Select
                          style={{ width: 120 }}
                          onChange={this.searchStatusHandler}
                          value={this.state.searchStatus}
                        >
                          <Option value="all">All</Option>
                          <Option value="initiated">Initiated</Option>
                          <Option value="downloaded">Downloaded</Option>
                          <Option value="activated">Activated</Option>
                        </Select>
                      </FormItem>
                    </Col>
                  </Row>
                </Form> */}

                <article className="article mt-2">
                  <Table dataSource={userList}>
                    <Column title="Serial Number" dataIndex="serialnumber" key="serialNumber" />
                    <Column title="Account Number" dataIndex="accnumber" key="accNumber" />
                    <Column
                      title="Status"
                      dataIndex="status"
                      key="status"
                      render={status => (
                        <Tag color={userStatus[status].color}>{userStatus[status].label}</Tag>
                      )}
                    />
                    <Column
                      title="Action"
                      key="action"
                      render={(text, record) => (
                        <span>
                          {record.status && record.status !== 'ACTIVATED' && (
                            <Icon onClick={() => this.batchDelete(record.id)} type="delete" />
                          )}
                          {record.status && record.status === 'INITIATED' && (
                            <>
                              <Divider type="vertical" />
                              <Icon
                                onClick={() => this.downloadCsv(record.id, record.createDate)}
                                type="download"
                              />
                            </>
                          )}
                        </span>
                      )}
                    />
                  </Table>
                </article>
              </div>
            </div>
          </div>
        </QueueAnim>
      </div>
    );
  }
}
const WrappedData = Form.create()(Data);
const management = () => <WrappedData />;
export default management;
