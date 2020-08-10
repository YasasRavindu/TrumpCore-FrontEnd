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
  Tooltip,
} from 'antd';

import { Redirect } from 'react-router-dom';
// -------------- IMPORT AUTHORITY -----------------------------------------
import {
  UNAUTHORIZED_ACCESS_EXCEPTION_ROUTE,
  USER_AUTHORITY_CODE,
  getActiveAuthorities,
  checkAuthority,
} from 'constants/authority/authority';
// -------------------------------------------------------------------------

import { environment, commonUrl } from 'environments';
import axios from 'axios';
import Password from 'antd/lib/input/Password';
import getErrorMessage from 'constants/notification/message';
import STATUS from 'constants/notification/status';
import moment from 'moment';

const FormItem = Form.Item;
const { Option } = Select;
const { Column, ColumnGroup } = Table;
let now = moment().utc();

class Data extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      userList: [],
      userRole: [],
      currentUser: undefined,
      currentRole: undefined,
      visible: false,
      subscriptionData: undefined,
      visibleSubscription: false,
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    this.loadTable();
    axios
      .get(environment.baseUrl + 'role')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        this._isMounted &&
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
        let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const userList = response.data.content.filter(user => {
          if (currentUser.id !== user.id) {
            user.key = user.id;
            return user;
          }
        });

        this._isMounted &&
          this.setState({
            userList: userList,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  handleStatus = (id, value) => {
    console.log(id, value);

    axios
      .get(
        environment.baseUrl +
          'platform-users/changeStatus/' +
          id +
          '/' +
          STATUS.USER_STATUS[value].code
      )
      .then(response => {
        // console.log('------------------- response - ', response.data.content);
        message.success('User Status Successfully Changed.');
        this.loadTable();
      })
      .catch(error => {
        this.showErrorMsg(error);
        console.log('------------------- error - ', error);
      });
  };

  submit = e => {
    e.preventDefault();

    this.props.form.validateFields(['accountName', 'email', 'password', 'role'], (err, values) => {
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
            message.success('User Account Successfully Created.');
            console.log('------------------- response - ', response);
            this.loadTable();
            this.props.form.resetFields();
          })
          .catch(error => {
            this.showErrorMsg(error);
            console.log('------------------- error - ', error);
          });
      }
    });
  };

  showErrorMsg = error => {
    message.error(getErrorMessage(error, 'USER_SAVE_ERROR'));
  };

  onRoleSelect = e => {
    this._isMounted &&
      this.setState({
        currentRole: e,
      });
  };

  toggleModal = (id, currentRole) => {
    if (id) {
      this.props.form.setFieldsValue({
        roleUpdate: currentRole,
      });
      this._isMounted &&
        this.setState({
          currentUser: id,
          visible: true,
        });
    } else {
      this._isMounted &&
        this.setState({
          visible: false,
          currentUser: undefined,
          currentRole: undefined,
        });
    }
  };

  updateUser = () => {
    if (this.state.currentRole) {
      axios
        .put(environment.baseUrl + 'platform-users', {
          id: this.state.currentUser,
          role: {
            id: this.state.currentRole,
          },
        })
        .then(response => {
          message.success('User Role Successfully Updated');
          console.log('------------------- response - ', response);
          this.loadTable();
          this.toggleModal(undefined);
        })
        .catch(error => {
          this.showErrorMsg(error);
          console.log('------------------- error - ', error);
        });
    }
  };

  editSubscription = id => {
    console.log('---------user id', id);
    if (id) {
      axios
        .get(environment.baseUrl + 'platform-users/subscription/' + id)
        .then(response => {
          console.log('------------------- response - ', response.data.content);

          let subscriptionData = response.data.content;
          subscriptionData.isExpire = now.isAfter(subscriptionData.expireDate);

          this._isMounted &&
            this.setState({
              subscriptionData: subscriptionData,
              visibleSubscription: true,
            });
        })
        .catch(error => {
          console.log('------------------- error - ', error);
        });
    } else {
      this._isMounted &&
        this.setState({
          subscriptionData: undefined,
          visibleSubscription: false,
        });
    }
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    // -------------- GET ACTIVE AUTHORITIES -----------------------------------------
    const viewAuthorities = getActiveAuthorities(USER_AUTHORITY_CODE.USER_MANAGEMENT_USERS);
    // -------------------------------------------------------------------------------

    // -------------- IF UNAUTHORIZED ------------------------------------------------
    if (viewAuthorities === 'UNAUTHORIZED') {
      return <Redirect to={UNAUTHORIZED_ACCESS_EXCEPTION_ROUTE} />;
    }
    // -------------------------------------------------------------------------------

    const { getFieldDecorator } = this.props.form;
    const { userRole, userList, subscriptionData } = this.state;

    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          {checkAuthority(viewAuthorities, USER_AUTHORITY_CODE.USER_MANAGEMENT_USERS_CREATE) && (
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
                                message: 'Please enter your account name',
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
                                message: 'The email you entered is not in the right format.',
                              },
                              {
                                required: true,
                                message: 'Please add your email.',
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
                                message: 'Please enter a password.',
                              },
                              { min: 5, message: 'Password must be minimum 5 characters.' },
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
                                message: 'Please select a user role.',
                              },
                            ],
                          })(
                            <Select placeholder="Role">
                              {userRole &&
                                userRole.map(role => {
                                  if (role.name !== 'Super Admin') {
                                    return (
                                      <Option key={role.id} value={role.id}>
                                        {role.name}
                                      </Option>
                                    );
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
          )}
          <div key="2">
            <div className="box box-default">
              <div className="box-body">
                <article className="article mt-2">
                  <Table dataSource={userList}>
                    <Column title="Account Name" dataIndex="accName" key="accountName" />
                    <Column title="Email" dataIndex="email" key="email" />
                    <Column
                      title="Status"
                      dataIndex="status"
                      key="status"
                      render={status => (
                        <Tag color={STATUS.USER_STATUS[status].color}>
                          {STATUS.USER_STATUS[status].label}
                        </Tag>
                      )}
                    />
                    <Column
                      title="Role"
                      dataIndex="role"
                      key="role"
                      render={role => <Tag>{role.name}</Tag>}
                    />
                    <Column
                      title="Action"
                      key="action"
                      render={(text, record) => (
                        <span>
                          {record.status &&
                            record.status === 'ACTIVE' &&
                            checkAuthority(
                              viewAuthorities,
                              USER_AUTHORITY_CODE.USER_MANAGEMENT_USERS_INACTIVE
                            ) && (
                              <Tooltip title="Inactive" className="mr-3">
                                <Icon
                                  onClick={() => this.handleStatus(record.id, 'INACTIVE')}
                                  type="close-circle-o"
                                />
                              </Tooltip>
                            )}
                          {record.status &&
                            record.status !== 'ACTIVE' &&
                            checkAuthority(
                              viewAuthorities,
                              USER_AUTHORITY_CODE.USER_MANAGEMENT_USERS_ACTIVE
                            ) && (
                              <Tooltip title="Active" className="mr-3">
                                <Icon
                                  onClick={() => this.handleStatus(record.id, 'ACTIVE')}
                                  type="check-circle-o"
                                />
                              </Tooltip>
                            )}

                          {checkAuthority(
                            viewAuthorities,
                            USER_AUTHORITY_CODE.USER_MANAGEMENT_USERS_UPDATE
                          ) && (
                            <Tooltip title="Update" className="mr-3">
                              <Icon
                                onClick={() => this.toggleModal(record.id, record.role.id)}
                                type="edit"
                              />
                            </Tooltip>
                          )}

                          <Tooltip title="Subscription">
                            <Icon
                              onClick={() => this.editSubscription(record.id)}
                              type="reconciliation"
                            />
                          </Tooltip>
                        </span>
                      )}
                    />
                  </Table>
                </article>
              </div>
            </div>
          </div>
        </QueueAnim>
        <Modal
          title="Change User Role"
          visible={this.state.visible}
          onOk={this.updateUser}
          confirmLoading={this.state.confirmLoading}
          onCancel={() => this.toggleModal(undefined)}
          width="300px"
        >
          <Form>
            <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
              <Col span={24}>
                <FormItem>
                  {getFieldDecorator('roleUpdate', {
                    rules: [
                      {
                        required: true,
                        message: 'Please select a user role.',
                      },
                    ],
                  })(
                    <Select placeholder="Role" onSelect={this.onRoleSelect}>
                      {userRole &&
                        userRole.map(role => {
                          if (role.name !== 'Super Admin') {
                            return (
                              <Option key={role.id} value={role.id}>
                                {role.name}
                              </Option>
                            );
                          }
                        })}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            {/* <Row>
              <Col span={24} order={4}>
                <Button type="primary" className="float-right" onClick={this.submit}>
                  Submit
                </Button>
              </Col>
            </Row> */}
          </Form>
        </Modal>
        <Modal
          title="Subscription"
          visible={this.state.visibleSubscription}
          //onOk={this.updateUser}
          //confirmLoading={this.state.confirmLoading}
          footer={null}
          onCancel={() => this.editSubscription(undefined)}
          width="400px"
        >
          <Form>
            <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
              <Col span={24}>
                {subscriptionData && subscriptionData.isExpire ? (
                  <Icon type="reconciliation" style={{ fontSize: '32px' }} />
                ) : (
                  <Icon type="reconciliation" style={{ fontSize: '32px' }} />
                )}
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
        </Modal>
      </div>
    );
  }
}

const WrappedData = Form.create()(Data);

const users = () => <WrappedData />;

export default users;
