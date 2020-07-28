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
  TreeSelect,
  DatePicker,
  message,
  Badge,
  AutoComplete,
  Tooltip,
} from 'antd';
import QueueAnim from 'rc-queue-anim';
import axios from 'axios';
import moment from 'moment';
import { environment, commonUrl } from 'environments';
import { CSVLink } from 'react-csv';
const dateFormat = 'YYYY-MM-DD';
const FormItem = Form.Item;
const { Option } = Select;
const { SHOW_PARENT } = TreeSelect;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const columns = [
  // {
  //   title: 'Transaction Type',
  //   dataIndex: 'TC_TransactionType',
  //   key: 'TC_TransactionType',
  // },
  {
    title: 'Transaction Date',
    dataIndex: 'TransactionDate',
    key: 'TransactionDate',
  },
  {
    title: 'Sender Account',
    dataIndex: 'SenderAccount',
    key: 'SenderAccount',
  },
  {
    title: 'Receiver Account',
    dataIndex: 'ReceiverAccount',
    key: 'ReceiverAccount',
  },
  {
    title: 'Transaction Amount',
    dataIndex: 'TransactionAmount',
    key: 'TransactionAmount',
  },
  {
    title: 'Reference No',
    dataIndex: 'ReferenceNo',
    key: 'ReferenceNo',
  },
];

const csvHeader = [
  // { label: 'Transaction Date', key: 'TransactionDate' },
  { label: 'Transaction Type', key: 'TC_TransactionType' },
  { label: 'Reference No', key: 'ReferenceNo' },
  { label: 'Sender Account', key: 'SenderAccount' },
  { label: 'Sender Account Name', key: 'SenderAccountName' },
  { label: 'Receiver Account', key: 'ReceiverAccount' },
  { label: 'Receiver Account Name', key: 'ReceiverAccountName' },
  { label: 'Transaction Amount', key: 'TransactionAmount' },
  { label: 'Currency Code', key: 'CurrencyCode' },
  { label: 'Transaction Status Name', key: 'TransactionStatusName' },
  { label: 'Mobile Cash Account', key: 'MobileCashAccount' },
  { label: 'Full Name', key: 'FullName' },
  { label: 'Running Balance', key: 'RunningBalance' },
  { label: 'Amount', key: 'Amount' },
  { label: 'Channel Type', key: 'ChannelType' },
  { label: 'Transaction Type Name', key: 'TransactionTypeName' },
  { label: 'Meter Number', key: 'MeterNumber' },
  { label: 'Voucher Number', key: 'VoucherNumber' },
];

const Transaction_type = [
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
  // {
  //   title: 'Bulk Salary Pay',
  //   value: '16',
  //   key: '16',
  // },
  {
    title: 'Manual Entry',
    value: '20',
    key: '20',
  },
];

// Cash Power (10) Soloman Water (11) as specific types - added meeter num and voucher num
const selectTransactionType = [10, 11];

class Data extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      accountList: [],
      filteredAccountList: [],
      selectedAccount: undefined,
      fromDate: undefined,
      toDate: undefined,
      searchData: [],
      tableLoading: false,
      loading: false,
      searchType: undefined,
    };
  }

  async componentDidMount() {
    this._isMounted = true;
  }

  DateHandler = (date, dateString) => {
    if (dateString.length > 0 && dateString[0] !== '' && dateString[1] !== '') {
      this.setState({
        fromDate: dateString[0],
        toDate: dateString[1],
      });
    }
  };
  searchTypeHandler = value => {
    this.setState({
      searchType: value,
    });
  };

  dataSubmit = () => {
    this._isMounted &&
      this.setState({
        tableLoading: true,
        searchData: [],
      });
    const { searchType, fromDate, toDate } = this.state;
    console.log(searchType);

    if (searchType !== undefined && fromDate !== undefined && toDate !== undefined) {
      axios
        .post(environment.baseUrl + 'report/coreBankLogByType', {
          fromDate: fromDate,
          toDate: toDate,
          transactionType: searchType,
        })
        .then(response => {
          console.log('------------------- response - ', response.data.content);
          let i = 1;
          const transactionRecord = response.data.content.map(record => {
            record.key = i;
            i++;
            record.TransactionDate = record.TransactionDate
              ? moment(record.TransactionDate).format('MMMM Do YYYY, h:mm:ss a')
              : 'N/A';
            return record;
          });

          this._isMounted &&
            this.setState({
              searchData: transactionRecord,
              tableLoading: false,
            });
        })
        .catch(error => {
          console.log('------------------- error - ', error);
          message.error('Something wrong!');
          this._isMounted &&
            this.setState({
              tableLoading: false,
            });
        });
    } else {
      message.error('Please fill the Transaction Type and date range');
      this._isMounted &&
        this.setState({
          tableLoading: false,
        });
    }
  };

  expandedRowRender = record => {
    return (
      <React.Fragment>
        <Row>
          <Col span={6}>
            <Tag color={'geekblue'}>Transaction Type name</Tag>
          </Col>
          <Col span={6}>
            <p>{record.TransactionTypeName ? record.TransactionTypeName : 'N/A'}</p>
          </Col>
          <Col span={6}>
            <Tag color={'geekblue'}>Sender Account Name</Tag>
          </Col>
          <Col span={6}>
            <p>{record.SenderAccountName ? record.SenderAccountName : 'N/A'}</p>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <Tag color={'geekblue'}>Receiver Account Name</Tag>
          </Col>
          <Col span={6}>
            <p>{record.ReceiverAccountName ? record.ReceiverAccountName : 'N/A'}</p>
          </Col>
          <Col span={6}>
            <Tag color={'geekblue'}>Currency Code</Tag>
          </Col>
          <Col span={6}>
            <p>{record.CurrencyCode ? record.CurrencyCode : 'N/A'}</p>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <Tag color={'geekblue'}>Transaction Status Name</Tag>
          </Col>
          <Col span={6}>
            <p>{record.TransactionStatusName ? record.TransactionStatusName : 'N/A'}</p>
          </Col>
          <Col span={6}>
            <Tag color={'geekblue'}>Mobile Cash Account</Tag>
          </Col>
          <Col span={6}>
            <p>{record.MobileCashAccount ? record.MobileCashAccount : 'N/A'}</p>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <Tag color={'geekblue'}>Full Name</Tag>
          </Col>
          <Col span={6}>
            <p>{record.FullName ? record.FullName : 'N/A'}</p>
          </Col>
          <Col span={6}>
            <Tag color={'geekblue'}>Running Balance</Tag>
          </Col>
          <Col span={6}>
            <p>{record.RunningBalance ? record.RunningBalance : 'N/A'}</p>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <Tag color={'geekblue'}>Amount</Tag>
          </Col>
          <Col span={6}>
            <p>{record.Amount ? record.Amount : 'N/A'}</p>
          </Col>
          <Col span={6}>
            <Tag color={'geekblue'}>Channel Type</Tag>
          </Col>
          <Col span={6}>
            <p>{record.ChannelType ? record.ChannelType : 'N/A'}</p>
          </Col>
        </Row>
        {selectTransactionType.includes(record.TransactionTypeIDTC) && (
          <Row>
            <Col span={6}>
              <Tag color={'geekblue'}>Meter Number</Tag>
            </Col>
            <Col span={6}>
              <p>{record.UtilityPayment ? record.UtilityPayment.MeterNumber : 'N/A'}</p>
            </Col>
            <Col span={6}>
              <Tag color={'geekblue'}>Voucher Number</Tag>
            </Col>
            <Col span={6}>
              <p>{record.UtilityPayment ? record.UtilityPayment.Vouchers : 'N/A'}</p>
            </Col>
          </Row>
        )}
      </React.Fragment>
    );
  };

  render() {
    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div key="1">
            <div className="box box-default">
              <div className="box-header">
                CoreBank Report
                <CSVLink
                  data={this.state.searchData.map(
                    d =>
                      d && {
                        TransactionDate: d.TransactionDate ? d.TransactionDate : 'N/A',
                        TransactionTypeName: d.TransactionTypeName ? d.TransactionTypeName : 'N/A',
                        ReferenceNo: d.ReferenceNo ? d.ReferenceNo : 'N/A',
                        SenderAccount: d.SenderAccount ? d.SenderAccount : 'N/A',
                        SenderAccountName: d.SenderAccountName ? d.SenderAccountName : 'N/A',
                        ReceiverAccount: d.ReceiverAccount ? d.ReceiverAccount : 'N/A',
                        ReceiverAccountName: d.ReceiverAccountName ? d.ReceiverAccountName : 'N/A',
                        TransactionAmount: d.TransactionAmount ? d.TransactionAmount : 'N/A',
                        CurrencyCode: d.CurrencyCode ? d.CurrencyCode : 'N/A',
                        TransactionStatusName: d.TransactionStatusName
                          ? d.TransactionStatusName
                          : 'N/A',
                        MobileCashAccount: d.MobileCashAccount ? d.MobileCashAccount : 'N/A',
                        FullName: d.FullName ? d.FullName : 'N/A',
                        RunningBalance: d.RunningBalance ? d.RunningBalance : 'N/A',
                        Amount: d.Amount ? d.Amount : 'N/A',
                        ChannelType: d.ChannelType ? d.ChannelType : 'N/A',
                        TC_TransactionType: d.TC_TransactionType ? d.TC_TransactionType : 'N/A',
                        MeterNumber: d.UtilityPayment ? d.UtilityPayment.MeterNumber : 'N/A',
                        VoucherNumber: d.UtilityPayment ? d.UtilityPayment.Vouchers : 'N/A',
                      }
                  )}
                  headers={csvHeader}
                  filename={'Corebank-report.csv'}
                  className="ant-btn float-right ant-btn-primary ant-btn-round"
                >
                  <Icon type="download" />
                  <span className="mr-1"></span>
                  CSV
                </CSVLink>
              </div>
              <div className="box-body">
                <Form>
                  <Row gutter={24}>
                    <Col span={9} order={1}>
                      <FormItem {...formItemLayout} label="Transaction type">
                        {/* <TreeSelect {...tProps} /> */}
                        <Select
                          placeholder="Select transaction type"
                          onChange={this.searchTypeHandler}
                        >
                          {Transaction_type &&
                            Transaction_type.map(type => {
                              return (
                                <Option key={type.value} value={type.value}>
                                  {type.title}
                                </Option>
                              );
                            })}
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={9} order={2}>
                      <FormItem {...formItemLayout} label="Date Range">
                        <DatePicker.RangePicker onChange={this.DateHandler} format={dateFormat} />
                      </FormItem>
                    </Col>
                    <Col span={5} order={3}>
                      <Button
                        type="primary"
                        loading={this.state.loading}
                        shape="round"
                        onClick={() => this.dataSubmit()}
                        className="float-left ml-1"
                      >
                        Search
                      </Button>
                    </Col>
                  </Row>
                </Form>

                <article className="article mt-2">
                  <Table
                    columns={columns}
                    dataSource={this.state.searchData}
                    loading={this.state.tableLoading}
                    expandedRowRender={record =>
                      record != null ? (
                        this.expandedRowRender(record)
                      ) : (
                        <span>
                          <Tag color={'red'}>No Details</Tag>
                        </span>
                      )
                    }
                    //scroll={{ x: 1500, y: 300 }}
                    className="components-table-demo-nested"
                  />
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

const CoreBank2 = () => <WrappedData />;

export default CoreBank2;
