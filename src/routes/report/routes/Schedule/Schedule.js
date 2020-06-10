import React from 'react';
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
  Popconfirm,
  AutoComplete,
  Tooltip,
} from 'antd';
import QueueAnim from 'rc-queue-anim';
import axios from 'axios';
import moment from 'moment';
import { environment, commonUrl } from 'environments';
import STATUS from 'constants/notification/status';
import getErrorMessage from 'constants/notification/message';
import { CSVLink } from 'react-csv';
const dateFormat = 'YYYY-MM-DD';
const FormItem = Form.Item;
const Search = Input.Search;
const { Option } = Select;
const { Column, ColumnGroup } = Table;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

// const csvHeader = [
//   { label: 'Transaction Date', key: 'TransactionDate' },
//   { label: 'Transaction Type', key: 'TC_TransactionType' },
//   { label: 'Reference No', key: 'ReferenceNo' },
//   { label: 'Sender Account', key: 'SenderAccount' },
//   { label: 'Sender Account Name', key: 'SenderAccountName' },
//   { label: 'Receiver Account', key: 'ReceiverAccount' },
//   { label: 'Receiver Account Name', key: 'ReceiverAccountName' },
//   { label: 'Transaction Amount', key: 'TransactionAmount' },
//   { label: 'Currency Code', key: 'CurrencyCode' },
//   { label: 'Transaction Status Name', key: 'TransactionStatusName' },
//   { label: 'Mobile Cash Account', key: 'MobileCashAccount' },
//   { label: 'Full Name', key: 'FullName' },
//   { label: 'Running Balance', key: 'RunningBalance' },
//   { label: 'Amount', key: 'Amount' },
//   { label: 'Channel Type', key: 'ChannelType' },
//   { label: 'Transaction Type Name', key: 'TransactionTypeName' },
// ];

class Data extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      accountList: [],
      reportList: [],
      filteredAccountList: [],
      selectedAccount: undefined,
      selectedSchedule: undefined,
      loadFilterScheduleDetails: [],
      //searchData: [],
      searchText: '',
      loadFilterSchedule: [],
      tableLoading: false,
      loading: false,
      visible: false,
      editEmailScheduleId: undefined,
      confirmLoading: false,
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    this.loadData();
  }

  loadData = () => {
    this._isMounted &&
      this.setState({
        loading: true,
        tableLoading: true,
      });
    axios
      .get(environment.baseUrl + 'report/scheduleReport/all')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const reportList = response.data.content.map(report => {
          report.key = report.id;
          return report;
        });
        this._isMounted &&
          this.setState({
            reportList: reportList,
            loadFilterSchedule: reportList,
            tableLoading: false,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
        this._isMounted &&
          this.setState({
            tableLoading: false,
          });
      });

    axios
      .post(environment.baseUrl + 'account/filterSearch', {
        status: '',
        context: 'all',
        cardAssigned: '',
      })
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const accountList = response.data.content.map(account => {
          account.key = account.id;
          return account;
        });
        this._isMounted &&
          this.setState({
            accountList: accountList,
            loading: false,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
        this._isMounted &&
          this.setState({
            loading: false,
          });
      });
  };

  async viewSchedule(id) {
    await axios
      .get(environment.baseUrl + 'report/scheduleReport/log/' + id)
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const selectedSchedule = response.data.content.map(schedule => {
          schedule.key = schedule.id;
          return schedule;
        });
        this._isMounted &&
          this.setState({
            selectedSchedule: selectedSchedule,
            loadFilterScheduleDetails: selectedSchedule,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  }

  updateAccountList = input => {
    let accountList;
    if (input === '' || input === undefined) {
      accountList = this.state.accountList;
    } else {
      accountList = this.state.accountList.filter(account => {
        return account.accountNumber.indexOf(input) !== -1 || account.holder.indexOf(input) !== -1;
      });
    }
    this.setState({
      filteredAccountList: accountList.slice(0, 100),
    });
  };

  setAccount = inputValue => {
    let selectedAccount = undefined;
    this.state.accountList.map(account => {
      if (
        inputValue !== undefined &&
        (account.id.toUpperCase() === inputValue.toUpperCase() ||
          account.accountNumber.toUpperCase() === inputValue.toUpperCase() ||
          inputValue.toUpperCase().includes(account.accountNumber.toUpperCase()))
      ) {
        selectedAccount = account;
        // this.showAccountDetail(account);
      }
    });
    if (selectedAccount === undefined) {
      this.updateAccountList('');
    }
    this.setState({
      selectedAccount: selectedAccount,
    });
    this.props.form.setFieldsValue({
      accountNumber:
        selectedAccount === undefined
          ? ''
          : `${selectedAccount.accountNumber} - ${selectedAccount.holder}`,
    });
  };

  resetSchedule = () => {
    this._isMounted &&
      this.setState({
        selectedSchedule: undefined,
      });
  };

  dataSubmit = e => {
    e.preventDefault();
    const { selectedAccount } = this.state;
    this.props.form.validateFieldsAndScroll(['email'], (err, values) => {
      if (!err && selectedAccount !== undefined) {
        axios
          .post(environment.baseUrl + 'report/scheduleReport', {
            email: values.email,
            account: {
              id: selectedAccount.id,
            },
          })
          .then(response => {
            console.log('------------------- response - ', response.data.content);
            message.success('Schedule created successfully');
            this.loadData();
            this.props.form.resetFields();
          })
          .catch(error => {
            console.log('------------------- error - ', error);
            //message.error('Something wrong!');
            message.error(getErrorMessage(error, 'SCHEDULE_REPORT_ERROR'));
          });
      } else {
        message.error('Please fill the account number and E-mail');
      }
    });
  };

  searchTextHandler = e => {
    this.scheduleDataFilter('searchText', e.target.value);
  };

  scheduleDataFilter = (key, value) => {
    this.setState(
      {
        [key]: value,
      },
      () => {
        let data = this.state.reportList;
        let searchText = this.state.searchText;
        if (searchText) {
          let returnable;
          data = data.filter(d => {
            returnable = true;
            if (returnable && searchText) {
              if (d.account !== null) {
                returnable =
                  d.email.toLowerCase().includes(searchText.toLowerCase()) ||
                  d.account.holder.toLowerCase().includes(searchText.toLowerCase()) ||
                  d.account.accountNumber.toLowerCase().includes(searchText.toLowerCase()) ||
                  d.status.toLowerCase().includes(searchText.toLowerCase());
              } else {
                returnable =
                  d.email.toLowerCase().includes(searchText.toLowerCase()) ||
                  d.status.toLowerCase().includes(searchText.toLowerCase());
              }
            }
            return returnable;
          });
        }

        this.setState({
          loadFilterSchedule: data,
        });
      }
    );
  };

  searchDateHandler = (date, dateString) => {
    this.ScheduleDetailsFilter('searchDate', dateString);
  };

  ScheduleDetailsFilter = (key, value) => {
    this.setState(
      {
        [key]: value,
      },
      () => {
        let data = this.state.selectedSchedule;
        let searchDate = this.state.searchDate;
        if (searchDate.length > 0 && searchDate[0] !== '' && searchDate[1] !== '') {
          let returnable;
          data = data.filter(d => {
            returnable = true;
            if (
              returnable &&
              searchDate.length > 0 &&
              searchDate[0] !== '' &&
              searchDate[1] !== ''
            ) {
              var startDate = moment(searchDate[0]);
              var endDate = moment(searchDate[1]);
              var date = moment(d.createDate);
              returnable = date.isAfter(startDate) && date.isBefore(endDate);
            }
            return returnable;
          });
        }

        this.setState({
          loadFilterScheduleDetails: data,
        });
      }
    );
  };

  stateBtn(status, title, type, record) {
    return (
      <Tooltip title={title} className="mr-3">
        <Icon onClick={() => this.handleStatus(record.id, status)} type={type} />
      </Tooltip>
    );
  }

  handleStatus = (id, value) => {
    axios
      .put(
        environment.baseUrl +
          'report/scheduleReport/updateStatus/' +
          id +
          '/' +
          STATUS.SCHEDULE_REPORT_STATUS[value].value
      )
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        this.loadData();
      })
      .catch(error => {
        message.error(getErrorMessage(error, 'SCHEDULE_REPORT_ERROR'));
        console.log('------------------- error - ', error);
      });
  };

  toggleModal = record => {
    this.setState({
      editEmailScheduleId: record.id,
      visible: true,
    });
  };

  updateEmail = () => {
    this.props.form.validateFields(['edit_email'], (err, values) => {
      this.setState({
        confirmLoading: true,
      });
      if (!err) {
        axios
          .put(
            environment.baseUrl + 'report/scheduleReport/update/' + this.state.editEmailScheduleId,
            {
              email: values.edit_email,
            }
          )
          .then(response => {
            console.log('------------------- response - ', response.data.content);
            message.success('Email was successfully updated');
            this.loadData();
            this.setState({
              editEmailScheduleId: undefined,
              visible: false,
              confirmLoading: false,
            });
            this.props.form.resetFields();
          })
          .catch(error => {
            console.log('------------------- error - ', error);
            message.error(getErrorMessage(error, 'SCHEDULE_REPORT_ERROR'));
            this.setState({
              editEmailScheduleId: undefined,
              visible: false,
              confirmLoading: false,
            });
            this.props.form.resetFields();
          });
      }
    });
  };

  ScheduleDelete = id => {
    if (id) {
      axios
        .delete(environment.baseUrl + 'report/scheduleReport/delete/' + id)
        .then(response => {
          message.success('Schedule report successfully deleted!');
          console.log('------------------- response - ', response.data.content);
          this.loadData();
        })
        .catch(error => {
          console.log('------------------- error - ', error);
          message.error(getErrorMessage(error, 'SCHEDULE_REPORT_ERROR'));
        });
    } else {
      message.error('Something wrong!');
    }
  };

  handleCancel = e => {
    // console.log(e);
    this.setState({
      editEmailScheduleId: undefined,
      visible: false,
    });
    this.props.form.resetFields();
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { filteredAccountList, selectedSchedule } = this.state;
    const optionsAccounts = filteredAccountList.map(account => (
      <Option key={account.id} value={account.id}>
        {`${account.accountNumber} - ${account.holder}`}
      </Option>
    ));
    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        {selectedSchedule === undefined && (
          <>
            <div key="1">
              <div className="box box-default mb-4">
                <div className="box-header">Schedule Report</div>
                <div className="box-body">
                  <Form onSubmit={this.dataSubmit}>
                    <Row gutter={24}>
                      <Col span={6} order={1}>
                        <FormItem>
                          {getFieldDecorator('accountNumber', {
                            rules: [
                              {
                                required: true,
                                message: 'Please enter your account number or name',
                              },
                            ],
                          })(
                            // <Input placeholder="Account Number" />
                            <AutoComplete
                              dataSource={optionsAccounts}
                              style={{ width: 300 }}
                              placeholder="Account Number"
                              onBlur={inputValue => {
                                this.setAccount(inputValue);
                              }}
                              onChange={inputValue => {
                                this.updateAccountList(inputValue);
                              }}
                              onSelect={inputValue => {
                                this.setAccount(inputValue);
                              }}
                            />
                          )}
                        </FormItem>
                      </Col>
                      <Col span={9} order={2}>
                        <FormItem {...formItemLayout} label="Email">
                          {getFieldDecorator('email', {
                            rules: [
                              { type: 'email', message: 'The input is not valid E-mail!' },
                              { required: true, message: 'Please input your email!' },
                            ],
                          })(
                            <Input
                              size="default"
                              //prefix={<Icon type="mail" style={{ fontSize: 13 }} />}
                              placeholder="Enter your Email"
                            />
                          )}
                        </FormItem>
                      </Col>
                      <Col span={5} order={3}>
                        <Button
                          type="primary"
                          loading={this.state.loading}
                          shape="round"
                          htmlType="submit"
                          className="float-left ml-1"
                        >
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
                  <Row gutter={24}>
                    <Col span={8} order={3}>
                      <FormItem>
                        <Search
                          placeholder="Search email or account details"
                          onChange={this.searchTextHandler}
                        />
                      </FormItem>
                    </Col>
                  </Row>

                  <article className="article mt-2">
                    <Table
                      dataSource={this.state.loadFilterSchedule}
                      loading={this.state.tableLoading}
                      className="components-table-demo-nested"
                    >
                      <Column title="E-mail" dataIndex="email" key="email" />
                      <Column title="Account Holder" dataIndex="account.holder" key="holder" />
                      <Column
                        title="Account Number"
                        dataIndex="account.accountNumber"
                        key="accountNumber"
                      />
                      <Column
                        title="Status"
                        dataIndex="status"
                        key="status"
                        render={status => (
                          <Tag color={STATUS.SCHEDULE_REPORT_STATUS[status].color}>
                            {STATUS.SCHEDULE_REPORT_STATUS[status].label}
                          </Tag>
                        )}
                      />
                      <Column
                        title="Action"
                        key="action"
                        render={(text, record) => (
                          <>
                            <span>
                              {record.status && record.status === 'ACTIVE' && (
                                <>
                                  {this.stateBtn('INACTIVE', 'Inactive', 'close-circle-o', record)}
                                </>
                              )}
                              {record.status && record.status === 'INACTIVE' && (
                                <>{this.stateBtn('ACTIVE', 'Active', 'check-circle-o', record)}</>
                              )}
                            </span>
                            <span>
                              <Tooltip title="Update" className="mr-3">
                                <Icon onClick={() => this.toggleModal(record)} type="edit" />
                              </Tooltip>
                            </span>
                            <span>
                              <Popconfirm
                                title="Are you sure you want to delete this schedule?"
                                onConfirm={() => this.ScheduleDelete(record.id)}
                                okText="Yes"
                                cancelText="No"
                              >
                                <Tooltip title="Remove" className="mr-3">
                                  <Icon type="delete" />
                                </Tooltip>
                              </Popconfirm>
                            </span>
                            <span>
                              <Tooltip title="View">
                                <Icon
                                  onClick={() => this.viewSchedule(record.id)}
                                  type="menu-unfold"
                                />
                              </Tooltip>
                            </span>
                          </>
                        )}
                      />
                    </Table>
                  </article>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedSchedule !== undefined && (
          <>
            <div key="1">
              <div className="box box-default">
                <div className="box-header">
                  Schedule Report Details
                  <Row>
                    <Button
                      type="primary"
                      //shape="circle"
                      icon="arrow-left"
                      size="default"
                      className="float-left mt-2"
                      onClick={() => this.resetSchedule()}
                    >
                      Back
                    </Button>
                  </Row>
                </div>
                <div className="box-body">
                  <Row gutter={20}>
                    <Col span={6}>
                      <FormItem label="Log Date">
                        <DatePicker.RangePicker
                          onChange={this.searchDateHandler}
                          format={dateFormat}
                        />
                      </FormItem>
                    </Col>
                  </Row>
                  <article className="article">
                    <Table
                      dataSource={this.state.loadFilterScheduleDetails}
                      //loading={this.state.tableLoading}
                      className="components-table-demo-nested"
                    >
                      <Column
                        title="Log Time"
                        dataIndex="logTime"
                        key="logTime"
                        render={logTime => moment(logTime).format('MMMM Do YYYY, h:mm:ss a')}
                      />
                      <Column title="Remark" dataIndex="remarks" key="remarks" />
                      <Column
                        title="Success"
                        dataIndex="success"
                        key="success"
                        render={success => (
                          <Tag color={STATUS.SCHEDULE_REPORT_DETAIL[success].color}>
                            {STATUS.SCHEDULE_REPORT_DETAIL[success].label}
                          </Tag>
                        )}
                      />
                    </Table>
                  </article>
                </div>
              </div>
            </div>
          </>
        )}

        <Modal
          onOk={this.updateEmail}
          confirmLoading={this.state.confirmLoading}
          onCancel={this.handleCancel}
          title="Edit E-mail"
          visible={this.state.visible}
          width="300px"
        >
          <Form>
            <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
              <Col span={24}>
                <FormItem>
                  {getFieldDecorator('edit_email', {
                    rules: [
                      { type: 'email', message: 'The input is not valid E-mail!' },
                      { required: true, message: 'Please input your email!' },
                    ],
                  })(
                    <Input
                      size="default"
                      //prefix={<Icon type="mail" style={{ fontSize: 13 }} />}
                      placeholder="Enter your Email"
                    />
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
      </div>
    );
  }
}
const WrappedData = Form.create()(Data);

const Schedule = () => <WrappedData />;

export default Schedule;
