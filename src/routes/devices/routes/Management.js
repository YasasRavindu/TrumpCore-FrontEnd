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

import { environment, commonUrl } from '../../../environments';
import axios from 'axios';
import Password from 'antd/lib/input/Password';
import CUSTOM_MESSAGE from 'constants/notification/message';
import moment from 'moment';

const deviceStatus = {
  ACTIVE: { color: 'blue', label: 'ACTIVE', value: '1' },
  INACTIVE: { color: '', label: 'INACTIVE', value: '2' },
  LOCKED: { color: 'magenta', label: 'LOCKED', value: '3' },
};
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
      .get(environment.baseUrl + 'device/changeStatus/' + id + '/' + deviceStatus[value].value)
      .then(response => {
        // console.log('------------------- response - ', response.data.content);
        this.loadData();
      })
      .catch(error => {
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
            let msg = null;
            if (
              error &&
              error.response &&
              error.response.data &&
              error.response.data.validationFailures &&
              error.response.data.validationFailures[0] &&
              error.response.data.validationFailures[0].code
            ) {
              let errorCode = error.response.data.validationFailures[0].code;
              msg = CUSTOM_MESSAGE.DEVICE_ASSIGN_ERROR[errorCode];
              if (msg === undefined) {
                msg = CUSTOM_MESSAGE.DEVICE_ASSIGN_ERROR['defaultError'];
              }
            } else {
              msg = CUSTOM_MESSAGE.DEVICE_ASSIGN_ERROR['defaultError'];
            }
            message.error(msg);
            console.log('------------------- error - ', error);
          });
      }
    });
  };

  render() {
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
      <div className="container-fluid no-breadcrumb container-mw-xl chapter">
        <QueueAnim type="bottom" className="ui-animate">
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
                          option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !==
                          -1
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
                          option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !==
                          -1
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
                        <Tag color={deviceStatus[status].color}>{deviceStatus[status].label}</Tag>
                      )}
                    />
                    <Column
                      title="Action"
                      key="action"
                      render={(text, record) => (
                        <span>
                          {record.status && record.status === 'ACTIVE' && (
                            <>
                              <Tooltip title="Inactive">
                                <Icon
                                  onClick={
                                    () => this.handleStatus(record.id, 'INACTIVE')
                                    // this.handleStatus(record.id, deviceStatus['INACTIVE'].value)
                                  }
                                  type="close-circle-o"
                                />
                              </Tooltip>
                              <Divider type="vertical" />
                              <Tooltip title="lock">
                                <Icon
                                  onClick={() => this.handleStatus(record.id, 'LOCKED')}
                                  type="lock"
                                />
                              </Tooltip>
                            </>
                          )}
                          {record.status && record.status === 'INACTIVE' && (
                            <>
                              <Tooltip title="Active">
                                <Icon
                                  onClick={() => this.handleStatus(record.id, 'ACTIVE')}
                                  type="check-circle-o"
                                />
                              </Tooltip>
                              <Divider type="vertical" />
                              <Tooltip title="Lock">
                                <Icon
                                  onClick={() => this.handleStatus(record.id, 'LOCKED')}
                                  type="lock"
                                />
                              </Tooltip>
                            </>
                          )}
                          {record.status && record.status === 'LOCKED' && (
                            <>
                              <Tooltip title="Inactive">
                                <Icon
                                  onClick={() => this.handleStatus(record.id, 'INACTIVE')}
                                  type="close-circle-o"
                                />
                              </Tooltip>
                              <Divider type="vertical" />
                              <Tooltip title="Unlock">
                                <Icon
                                  onClick={() => this.handleStatus(record.id, 'ACTIVE')}
                                  type="unlock"
                                />
                              </Tooltip>
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
