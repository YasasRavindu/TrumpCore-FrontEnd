import React from 'react';
import QueueAnim from 'rc-queue-anim';
import {
  Table,
  Input,
  Button,
  Form,
  Tag,
  Row,
  Col,
  Select,
  DatePicker,
  message,
  Slider,
  Icon,
  TreeSelect,
  Tooltip,
  Modal,
  Divider,
  ConfigProvider,
  Pagination,
} from 'antd';
import { environment } from '../../../../environments';
import axios from 'axios';
import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CSVLink } from 'react-csv';
import STATUS from 'constants/notification/status';

const Search = Input.Search;
const dateFormat = 'YYYY-MM-DD';
const { SHOW_PARENT } = TreeSelect;

const customizeRenderEmpty = () => (
  <div style={{ textAlign: 'center' }}>
    <Tag color="orange">Please filter any of the above fields to get the reports.</Tag>
  </div>
);

const columnList = [
  { label: 'Account Holder', value: 'account' },
  { label: 'Account No', value: 'accountNo' },
  { label: 'Serial No', value: 'serial' },
  { label: 'Device Account Name', value: 'deviceAccount' },
  { label: 'Device Account No', value: 'deviceAccountNo' },
  { label: 'Merchant Account Name', value: 'merchant' },
  { label: 'Merchant Account No', value: 'merchantNo' },
];

const csvHeader = [
  { label: 'Account Holder', key: 'holder' },
  { label: 'Account No', key: 'accountNo' },
  { label: 'Serial No', key: 'serial' },
  { label: 'Merchant Account No', key: 'merchantAccNo' },
  { label: 'Merchant Account Name', key: 'merchantName' },
  { label: 'Device Account No', key: 'deviceAccNo' },
  { label: 'Device Account Name', key: 'deviceAcctName' },
  { label: 'Amount', key: 'amount' },
  { label: 'Log Time', key: 'logTime' },
  { label: 'Type', key: 'type' },
];
const treeData = [
  {
    title: 'New Biometric',
    value: '1',
    key: '1',
  },
  {
    title: 'Edit Biometric',
    value: '2',
    key: '2',
  },
  {
    title: 'Change Pin',
    value: '3',
    key: '3',
  },
  {
    title: 'Deposit',
    value: '4',
    key: '4',
  },
  {
    title: 'Withdraw',
    value: '5',
    key: '5',
  },
  {
    title: 'Balance Query',
    value: '6',
    key: '6',
  },
  {
    title: 'Merchant Pay',
    value: '7',
    key: '7',
  },
  {
    title: 'Sim Registration',
    value: '8',
    key: '8',
  },
  {
    title: 'Cancel Transaction',
    value: '9',
    key: '9',
  },
  {
    title: 'Cash Power',
    value: '10',
    key: '10',
  },
  {
    title: 'Soloman Water',
    value: '11',
    key: '11',
  },
  {
    title: 'B Mobile',
    value: '12',
    key: '12',
  },
  {
    title: 'TELKO',
    value: '13',
    key: '13',
  },
  {
    title: 'NPF',
    value: '14',
    key: '14',
  },
  {
    title: 'Cash Transfer',
    value: '15',
    key: '15',
  },
];

const FormItem = Form.Item;
const { Option } = Select;
const { Column, ColumnGroup } = Table;

class Data extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      loadLog: [],
      searchDate: ['', ''],
      searchColumn: 'account',
      searchText: '',
      searchType: [],
      pageSize: 10,
      pageNumber: 1,
      totalRecord: 0,
      logRequest: {},
      logResponse: {},
      visible: false,
      customize: true,
      loading: false,
    };
  }

  async componentDidMount() {
    this.loadTable();
  }

  loadTable = () => {
    axios
      .post(environment.baseUrl + 'report/log/filterSearch', this.createReqBody())
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        let data = response.data;
        const logList = data.content.map(log => {
          log.key = log.id;
          return log;
        });
        this.setState(
          {
            loadLog: logList,
            totalRecord: data.pagination.totalRecords,
          },
          () => {
            console.log(this.state);
          }
        );
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  createReqBody() {
    console.log(this.state);
    let { searchDate, searchColumn, searchText, searchType, pageSize, pageNumber } = this.state;

    let reqBody = {
      context: 'all',
      colName: '',
      colValue: '',
      types: [],
      startDate: null,
      endDate: null,
      pageSize: pageSize,
      pageNumber: pageNumber,
    };
    if (
      searchText !== '' ||
      searchType.length > 0 ||
      searchDate[0] !== '' ||
      searchDate[1] !== ''
    ) {
      reqBody.context = 'filter';
      reqBody.colName = searchColumn;
      reqBody.colValue = searchText;
      reqBody.types = searchType;
      reqBody.startDate = searchDate[0] === '' ? null : `${searchDate[0]} 00:00:00`;
      reqBody.endDate = searchDate[1] === '' ? null : `${searchDate[1]} 00:00:00`;
    }
    return reqBody;
  }

  paginationHandler = (pageNumber, pageSize) => {
    this.setState(
      {
        pageNumber,
        pageSize,
      },
      () => {
        this.loadTable();
      }
    );
  };

  pageSizeHandler = (pageNumber, pageSize) => {
    this.paginationHandler(1, pageSize);
  };

  exportPDF = () => {
    const unit = 'pt';
    const size = 'A4'; // Use A1, A2, A3 or A4
    const orientation = 'landscape'; // portrait or landscape

    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(15);

    const title = 'Transaction Report';
    const headers = [
      [
        'Account holder',
        'Account no',
        'Serial no',
        'Merchant account',
        'Merchant Name',
        'Device Account',
        'Device Acc name',
        'Amount',
        'Log Time',
        'Transaction Type',
      ],
    ];

    const realData = this.state.loadLog.map(d => [
      d.holder ? d.holder : 'N/A',
      d.accountNo ? d.accountNo : 'N/A',
      d.serial ? d.serial : 'N/A',
      d.merchantAccNo ? d.merchantAccNo : 'N/A',
      d.merchantName ? d.merchantName : 'N/A',
      d.deviceAccNo ? d.deviceAccNo : 'N/A',
      d.deviceAcctName ? d.deviceAcctName : 'N/A',
      d.amount ? d.amount : 'N/A',
      moment(d.logTime).format('MMMM Do YYYY, h:mm:ss a'),
      STATUS.TRANSACTION_TYPE[d.type].label,
    ]);
    let content = {
      startY: 50,
      head: headers,
      body: realData,
    };

    if (realData.length == 0) {
      message.error("Sorry, we couldn't find any devices with filtered data");
    } else {
      doc.text(title, marginLeft, 40);
      doc.autoTable(content);
      doc.save('Transaction-report.pdf');
    }
  };

  searchDateHandler = (date, dateString) => {
    this.setFilters('searchDate', dateString);
  };

  searchTextHandler = e => {
    let keyWord = e.target.value;
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.timeout = setTimeout(
      function() {
        this.setFilters('searchText', keyWord);
      }.bind(this),
      3000
    );
  };

  searchColumnHandler = v => {
    this.setFilters('searchColumn', v);
  };
  searchTypeHandler = v => {
    this.setFilters('searchType', v);
  };

  setFilters = (key, value) => {
    this.setState(
      {
        [key]: value,
        pageNumber: 1,
      },
      () => {
        this.loadTable();
      }
    );
  };

  viewLog = id => {
    axios
      .get(environment.baseUrl + 'report/log/' + id)
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const stng = response.data.content.log;
        if (stng.includes('|')) {
          let [req, res] = stng.split('|');
          if (req && res) {
            console.log('req and res', req, res);
            this.setState(
              {
                logRequest: JSON.parse(req),
                logResponse: JSON.parse(res),
              },
              () => {
                this.setState({
                  visible: true,
                });
              }
            );
          } else {
            message.error('Something Wrong');
          }
        } else {
          console.log('req', stng);
          this.setState(
            {
              logRequest: JSON.parse(stng),
              logResponse: {},
            },
            () => {
              this.setState({
                visible: true,
              });
            }
          );
        }
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };
  handleCancel = e => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const {
      customize,
      loading,
      loadLog,
      visible,
      logRequest,
      logResponse,
      searchType,
      totalRecord,
      pageNumber,
    } = this.state;

    const tProps = {
      treeData,
      value: searchType,
      onChange: this.searchTypeHandler,
      treeCheckable: true,
      showCheckedStrategy: SHOW_PARENT,
      searchPlaceholder: 'Please Select',
      style: {
        width: '100%',
      },
    };

    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div key="1">
            <div className="box box-default">
              <div className="box-header">
                Transaction Report
                <Button
                  type="primary"
                  shape="round"
                  icon="download"
                  onClick={() => this.exportPDF()}
                  className="float-right ml-1"
                >
                  PDF
                </Button>
                <CSVLink
                  data={loadLog.map(d => ({
                    holder: d.holder ? d.holder : 'N/A',
                    accountNo: d.accountNo ? d.accountNo : 'N/A',
                    serial: d.serial ? d.serial : 'N/A',
                    merchantAccNo: d.merchantAccNo ? d.merchantAccNo : 'N/A',
                    merchantName: d.merchantName ? d.merchantName : 'N/A',
                    deviceAccNo: d.deviceAccNo ? d.deviceAccNo : 'N/A',
                    deviceAcctName: d.deviceAcctName ? d.deviceAcctName : 'N/A',
                    amount: d.amount ? d.amount : 'N/A',
                    logTime: moment(d.logTime).format('MMMM Do YYYY, h:mm:ss a'),
                    type: STATUS.TRANSACTION_TYPE[d.type].label,
                  }))}
                  headers={csvHeader}
                  filename={'Transaction-report.csv'}
                  className="ant-btn float-right ant-btn-primary ant-btn-round"
                >
                  <Icon type="download" />
                  <span className="mr-1"></span>
                  CSV
                </CSVLink>
              </div>
              <div className="box-body">
                <Form>
                  <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                    <Col span={6}>
                      <FormItem label="Search">
                        <Search placeholder="Input Search Text" onChange={this.searchTextHandler} />
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="Search Column">
                        <Select defaultValue="account" onChange={this.searchColumnHandler}>
                          {columnList &&
                            columnList.map(col => {
                              return (
                                <Option key={col.value} value={col.value}>
                                  {col.label}
                                </Option>
                              );
                            })}
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="Log time">
                        <DatePicker.RangePicker
                          onChange={this.searchDateHandler}
                          format={dateFormat}
                        />
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="Transaction type">
                        <TreeSelect {...tProps} />
                      </FormItem>
                    </Col>
                  </Row>
                </Form>

                <article className="article mt-2">
                  <ConfigProvider renderEmpty={customize && customizeRenderEmpty}>
                    <Table
                      //columns={columns}
                      dataSource={loadLog}
                      scroll={{ x: 1500, y: 400 }}
                      className="ant-table-v1"
                      loading={loading}
                      pagination={{
                        showSizeChanger: true,
                        total: totalRecord,
                        onChange: this.paginationHandler,
                        current: pageNumber,
                        onShowSizeChange: this.pageSizeHandler,
                      }}
                    >
                      <Column
                        title="Account Holder"
                        dataIndex="holder"
                        key="holder"
                        render={holder => (holder ? holder : <span>N/A</span>)}
                      />
                      <Column
                        title="Account No"
                        dataIndex="accountNo"
                        key="accountNo"
                        render={accountNo => (accountNo ? accountNo : <span>N/A</span>)}
                      />
                      <Column title="Serial No" dataIndex="serial" key="serial" />
                      <Column
                        title="Merchant Account No"
                        dataIndex="merchantAccNo"
                        key="merchantAccNo"
                      />
                      <Column
                        title="Merchant Account Name"
                        dataIndex="merchantName"
                        key="merchantName"
                      />
                      <Column title="Device Account No" dataIndex="deviceAccNo" key="deviceAccNo" />
                      <Column
                        title="Device Account Name"
                        dataIndex="deviceAcctName"
                        key="deviceAcctName"
                      />
                      <Column title="Amount" dataIndex="amount" key="amount" />
                      <Column
                        title="Log Time"
                        dataIndex="logTime"
                        key="logTime"
                        render={logTime => moment(logTime).format('MMMM Do YYYY, h:mm:ss a')}
                      />
                      <Column
                        title="Type"
                        dataIndex="type"
                        key="type"
                        render={type => (
                          <Tag color={STATUS.TRANSACTION_TYPE[type].color}>
                            {STATUS.TRANSACTION_TYPE[type].label}
                          </Tag>
                        )}
                      />
                      <Column
                        title="Action"
                        key="status"
                        render={(text, record) => (
                          <Tooltip title="Information">
                            <Icon onClick={() => this.viewLog(record.id)} type="plus-square" />
                          </Tooltip>
                        )}
                      />
                    </Table>
                  </ConfigProvider>
                </article>
              </div>
            </div>
          </div>
        </QueueAnim>
        <Modal title="Log Details" onCancel={this.handleCancel} visible={visible} footer={null}>
          <h3>Request</h3>
          {Object.entries(logRequest).map(([key, value]) => {
            return (
              <h4 key={key}>
                {key} : {value}
              </h4>
            );
          })}
          <Divider type="horizontal" />
          <h3>Response</h3>
          {Object.entries(logResponse).map(([key, value]) => {
            return (
              <h4 key={key}>
                {key} : {value}
              </h4>
            );
          })}
        </Modal>
      </div>
    );
  }
}

const WrappedData = Form.create()(Data);

const Transaction = () => <WrappedData />;

export default Transaction;
