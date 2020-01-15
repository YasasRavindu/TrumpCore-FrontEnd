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
} from 'antd';

import { environment, commonUrl } from '../../../environments';
import axios from 'axios';
import Password from 'antd/lib/input/Password';

const userStatus = {
  ACTIVE: { color: '' },
  DOWNLOADED: { color: 'blue' },
  ACTIVATED: { color: 'magenta' },
};

// ACTIVE("Active", "A"),
// INACTIVE("Inactive", "I"),
// DELETED("Deleted", "D"),
// PENDING_ACTIVATION("Pending Activation", "PEA"),
// TEMP_LOCKED_BAD_CREDENTIALS("Temp Locked Bad Credentials", "TELBC");

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
            message.success('User Account Successfully');
            console.log('------------------- response - ', response);
            this.loadTable();
            this.props.form.resetFields();
          })
          .catch(error => {
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
              <div className="box-header">User Registration</div>
              <div className="box-body">
                <Form>
                  <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                    <Col span={6}>
                      <FormItem>
                        {getFieldDecorator('accountName', {
                          rules: [
                            {
                              required: true,
                              message: 'Please input your account name',
                            },
                          ],
                        })(<Input placeholder="Account Name" />)}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem>
                        {getFieldDecorator('email', {
                          rules: [
                            {
                              type: 'email',
                              message: 'The input is not valid E-mail!',
                            },
                            {
                              required: true,
                              message: 'Please input your E-mail!',
                            },
                            ,
                          ],
                        })(<Input placeholder="Email" />)}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem>
                        {getFieldDecorator('password', {
                          rules: [
                            {
                              required: true,
                              message: 'Please input your password',
                            },
                          ],
                        })(<Password placeholder="Password" />)}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem>
                        {getFieldDecorator('role', {
                          rules: [
                            {
                              required: true,
                              message: 'Please input your role',
                            },
                          ],
                        })(
                          <Select placeholder="Role">
                            {userRole &&
                              userRole.map(role => {
                                if (role.name !== 'Super Admin') {
                                 return <Option key={role.id} value={role.id}>
                                    {role.name}
                                  </Option>;
                                }
                              })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24} order={4}>
                      <Button type="primary" className="float-right" onClick={this.submit}>
                        Submit
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </div>
            </div>
          </div>
          <div key="2">
            <div className="box box-default">
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
                    <Column title="Account Name" dataIndex="accName" key="accountName" />
                    <Column title="Email" dataIndex="email" key="email" />
                    <Column
                      title="Status"
                      dataIndex="status"
                      key="status"
                      render={status => <Tag color={userStatus[status].color}>{status}</Tag>}
                    />
                    <Column
                      title="Role"
                      dataIndex="role"
                      key="role"
                      render={role => <Tag>{role.name}</Tag>}
                    />
                    {/* <Column
                      title="Action"
                      key="action"
                      render={(text, record) => <span>Action</span>}
                    /> */}
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

const users = () => <WrappedData />;

export default users;
