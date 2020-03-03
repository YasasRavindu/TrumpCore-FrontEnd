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
  AutoComplete,
  Tooltip,
} from 'antd';

import { Redirect } from 'react-router-dom';
// -------------- IMPORT AUTHORITY -----------------------------------------
import {
  DEFAULT_EXCEPTION_ROUTE,
  USER_AUTHORITY_CODE,
  getActiveAuthorities,
  checkAuthority,
} from 'constants/authority/authority';
// -------------------------------------------------------------------------

import { environment, commonUrl } from '../../../environments';
import axios from 'axios';
import Password from 'antd/lib/input/Password';
import getErrorMessage from 'constants/notification/message';
import STATUS from 'constants/notification/status';
import moment from 'moment';

const dateFormat = 'YYYY-MM-DD';

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const FormItem = Form.Item;
const { Option } = Select;
const { Column, ColumnGroup } = Table;

class Data extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      searchText: '',
      searchStatus: 'ALL',
      registeredDeviceList: [],
      assignedDeviceList: [],
      filteredAssignedDeviceList: [],
      accountList: [],
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    this.loadData();
  }

  loadData = () => {
    axios
      .get(environment.baseUrl + 'device/search/register')
      .then(response => {
        // console.log('------------------- response - ', response.data.content);
        const deviceList = response.data.content.map(device => {
          device.key = device.id;
          return device;
        });
        this._isMounted &&
          this.setState({
            registeredDeviceList: deviceList,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
    axios
      .get(environment.baseUrl + 'device/search/assign')
      .then(response => {
        // console.log('------------------- response - ', response.data.content);
        const deviceList = response.data.content.map(device => {
          device.key = device.id;
          return device;
        });
        this._isMounted &&
          this.setState({
            assignedDeviceList: deviceList,
            filteredAssignedDeviceList: deviceList,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
    axios
      .post(environment.baseUrl + 'account/filterSearch', {
        status: '1',
        context: '',
        cardAssigned: '',
      })
      .then(response => {
        // console.log('------------------- response - ', response.data.content);
        this._isMounted &&
          this.setState({
            accountList: response.data.content,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  handleStatus = (id, value) => {
    axios
      .get(
        environment.baseUrl + 'device/changeStatus/' + id + '/' + STATUS.DEVICE_STATUS[value].value
      )
      .then(response => {
        // console.log('------------------- response - ', response.data.content);
        this.loadData();
      })
      .catch(error => {
        message.error(getErrorMessage(error, 'DEVICES_STATUS_CHANGE_ERROR'));
        console.log('------------------- error - ', error);
      });
  };

  searchStatusHandler = v => {
    this.dataFilter('searchStatus', v);
  };

  searchTextHandler = e => {
    this.dataFilter('searchText', e.target.value);
  };

  dataFilter = (key, value) => {
    this._isMounted &&
      this.setState(
        {
          [key]: value,
        },
        () => {
          let data = this.state.assignedDeviceList;
          let searchStatus = this.state.searchStatus.toUpperCase();
          let searchText = this.state.searchText;

          if (searchText) {
            data = data.filter(d => {
              return (
                d.serial.toLowerCase().includes(searchText.toLowerCase()) ||
                (d.account &&
                  (d.account.holder.toLowerCase().includes(searchText.toLowerCase()) ||
                    d.account.accountNumber.toLowerCase().includes(searchText.toLowerCase())))
              );
            });
          }

          if (searchStatus !== 'ALL') {
            data = data.filter(d => d.status === searchStatus);
          }

          this._isMounted &&
            this.setState({
              filteredAssignedDeviceList: data,
            });
        }
      );
  };

  submit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log(values);
        axios
          .put(environment.baseUrl + 'device/assign', {
            serial: values.serialNumber,
            account: {
              id: values.accountNumber,
            },
          })
          .then(response => {
            message.success('Device Successfully Assign to Account');
            console.log('------------------- response - ', response);
            this.loadData();
            this.props.form.resetFields();
          })
          .catch(error => {
            message.error(getErrorMessage(error, 'DEVICE_ASSIGN_ERROR'));
            console.log('------------------- error - ', error);
          });
      }
    });
  };

  actionBtn(status, title, type, viewAuthorities, authCode, record) {
    if (checkAuthority(viewAuthorities, authCode)) {
      return (
        <Tooltip title={title} className="mr-3">
          <Icon onClick={() => this.handleStatus(record.id, status)} type={type} />
        </Tooltip>
      );
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    // -------------- GET ACTIVE AUTHORITIES -----------------------------------------
    const viewAuthorities = getActiveAuthorities(USER_AUTHORITY_CODE.POS_DEVICE_MANAGEMENT);
    // -------------------------------------------------------------------------------

    // -------------- IF UNAUTHORIZED ------------------------------------------------
    if (viewAuthorities === 'UNAUTHORIZED') {
      return <Redirect to={DEFAULT_EXCEPTION_ROUTE} />;
    }
    // -------------------------------------------------------------------------------

    const { getFieldDecorator } = this.props.form;
    const { accountList, registeredDeviceList, filteredAssignedDeviceList } = this.state;

    const optionsDevices = registeredDeviceList.map(device => (
      <Option key={device.id} value={device.serial}>
        {device.serial}
      </Option>
    ));

    const optionsAccounts = accountList.map(account => (
      <Option key={account.id} value={account.id}>
        {account.accountNumber}
      </Option>
    ));

    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          {checkAuthority(viewAuthorities, USER_AUTHORITY_CODE.POS_DEVICE_MANAGEMENT_ASSIGN) && (
            <div key="1">
              <div className="box box-default mb-4">
                <div className="box-header">Assign Devices</div>
                <div className="box-body">
                  <Form layout="inline">
                    <FormItem>
                      {getFieldDecorator('serialNumber', {
                        rules: [
                          {
                            required: true,
                            message: 'Please enter your Serial number',
                          },
                        ],
                      })(
                        // (<Input placeholder="Serial Number" />)
                        <AutoComplete
                          dataSource={optionsDevices}
                          style={{ width: 200 }}
                          onBlur={inputValue => {
                            let keyCard = false;
                            registeredDeviceList.map(device => {
                              if (
                                inputValue !== undefined &&
                                device.serial.toUpperCase() === inputValue.toUpperCase()
                              ) {
                                keyCard = true;
                              }
                            });
                            if (!keyCard) {
                              this.props.form.setFieldsValue({
                                serialNumber: '',
                              });
                            }
                          }}
                          placeholder="Serial Number"
                          filterOption={(inputValue, option) =>
                            option.props.children
                              .toUpperCase()
                              .indexOf(inputValue.toUpperCase()) !== -1
                          }
                        />
                      )}
                    </FormItem>
                    <FormItem>
                      <Badge
                        count={'Assign to >'}
                        style={{
                          backgroundColor: '#fff',
                          color: '#999',
                          boxShadow: '0 0 0 1px #d9d9d9 inset',
                          marginTop: '10px',
                        }}
                      />
                    </FormItem>

                    <FormItem>
                      {getFieldDecorator('accountNumber', {
                        rules: [
                          {
                            required: true,
                            message: 'Please enter your Account number',
                          },
                        ],
                      })(
                        // <Input placeholder="Account Number" />
                        <AutoComplete
                          dataSource={optionsAccounts}
                          style={{ width: 200 }}
                          onBlur={inputValue => {
                            let keyCard = false;
                            accountList.map(account => {
                              if (
                                inputValue !== undefined &&
                                (account.accountNumber.toUpperCase() === inputValue.toUpperCase() ||
                                  account.id.toUpperCase() === inputValue.toUpperCase())
                              ) {
                                keyCard = true;
                              }
                            });
                            if (!keyCard) {
                              this.props.form.setFieldsValue({
                                accountNumber: '',
                              });
                            }
                          }}
                          placeholder="Account Number"
                          filterOption={(inputValue, option) =>
                            option.props.children
                              .toUpperCase()
                              .indexOf(inputValue.toUpperCase()) !== -1
                          }
                        />
                      )}
                    </FormItem>

                    <Button type="primary" className="float-right" onClick={this.submit}>
                      Assign
                    </Button>
                  </Form>
                </div>
              </div>
            </div>
          )}

          <div key="2">
            <div className="box box-default">
              <div className="box-header">Device Management</div>
              <div className="box-body">
                <Form>
                  <Row gutter={24}>
                    <Col span={8} order={1}>
                      <FormItem>
                        <Input.Search
                          placeholder="input search text"
                          onChange={this.searchTextHandler}
                          style={{ width: 200 }}
                        />
                      </FormItem>
                    </Col>
                    <Col span={6} order={2}>
                      <FormItem {...formItemLayout} label="Device Status">
                        <Select
                          style={{ width: 120 }}
                          onChange={this.searchStatusHandler}
                          value={this.state.searchStatus}
                        >
                          <Option value="all">All</Option>
                          <Option value="active">Active</Option>
                          <Option value="inactive">Inactive</Option>
                          <Option value="locked">Locked</Option>
                        </Select>
                      </FormItem>
                    </Col>
                  </Row>
                </Form>

                <article className="article mt-2">
                  <Table dataSource={filteredAssignedDeviceList}>
                    <Column title="Serial Number" dataIndex="serial" key="serial" />
                    <Column title="Account Holder" dataIndex="account.holder" key="accountHolder" />
                    <Column
                      title="Account Number"
                      dataIndex="account.accountNumber"
                      key="accountNo"
                    />
                    <Column
                      title="Status"
                      dataIndex="status"
                      key="status"
                      render={status => (
                        <Tag color={STATUS.DEVICE_STATUS[status].color}>
                          {STATUS.DEVICE_STATUS[status].label}
                        </Tag>
                      )}
                    />
                    <Column
                      title="Action"
                      key="action"
                      render={(text, record) => (
                        <span>
                          {this.actionBtn(record)}
                          {record.status && record.status === 'ACTIVE' && (
                            <>
                              {this.actionBtn(
                                'INACTIVE',
                                'Inactive',
                                'close-circle-o',
                                viewAuthorities,
                                USER_AUTHORITY_CODE.POS_DEVICE_MANAGEMENT_INACTIVE,
                                record
                              )}
                              {this.actionBtn(
                                'LOCKED',
                                'Lock',
                                'lock',
                                viewAuthorities,
                                USER_AUTHORITY_CODE.POS_DEVICE_MANAGEMENT_LOCK,
                                record
                              )}
                            </>
                          )}
                          {record.status && record.status === 'INACTIVE' && (
                            <>
                              {this.actionBtn(
                                'ACTIVE',
                                'Active',
                                'check-circle-o',
                                viewAuthorities,
                                USER_AUTHORITY_CODE.POS_DEVICE_MANAGEMENT_ACTIVE,
                                record
                              )}
                              {this.actionBtn(
                                'LOCKED',
                                'Lock',
                                'lock',
                                viewAuthorities,
                                USER_AUTHORITY_CODE.POS_DEVICE_MANAGEMENT_LOCK,
                                record
                              )}
                            </>
                          )}
                          {record.status && record.status === 'LOCKED' && (
                            <>
                              {this.actionBtn(
                                'INACTIVE',
                                'Inactive',
                                'close-circle-o',
                                viewAuthorities,
                                USER_AUTHORITY_CODE.POS_DEVICE_MANAGEMENT_INACTIVE,
                                record
                              )}
                              {this.actionBtn(
                                'ACTIVE',
                                'Unlock',
                                'unlock',
                                viewAuthorities,
                                USER_AUTHORITY_CODE.POS_DEVICE_MANAGEMENT_UNLOCK,
                                record
                              )}
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
