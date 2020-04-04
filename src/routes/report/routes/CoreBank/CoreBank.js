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
  AutoComplete,
  Tooltip,
} from 'antd';
import QueueAnim from 'rc-queue-anim';
import axios from 'axios';
import moment from 'moment';
import { environment, commonUrl } from '../../../../environments';
import { CSVLink } from 'react-csv';
const dateFormat = 'YYYY-MM-DD';
const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const columns = [
  {
    title: 'Transaction Type',
    dataIndex: 'TC_TransactionType',
    key: 'TC_TransactionType',
  },
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
  { label: 'Transaction Date', key: 'TransactionDate' },
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
];

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

  DateHandler = (date, dateString) => {
    if (dateString.length > 0 && dateString[0] !== '' && dateString[1] !== '') {
      this.setState({
        fromDate: dateString[0],
        toDate: dateString[1],
      });
    }
  };

  dataSubmit = () => {
    this._isMounted &&
      this.setState({
        tableLoading: true,
      });
    const { selectedAccount, fromDate, toDate } = this.state;
    if (selectedAccount !== undefined && fromDate !== undefined && toDate !== undefined) {
      axios
        .post(environment.baseUrl + 'report/coreBankLog', {
          accNo: selectedAccount.accountNumber,
          fromDate: fromDate,
          toDate: toDate,
        })
        .then(response => {
          console.log('------------------- response - ', response.data.content);
          const transactionRecord = response.data.content.map(record => {
            record.key = record.TransactionId;
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
        });
    } else {
      message.error('Please fill the account number and date range');
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
      </React.Fragment>
    );
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { filteredAccountList } = this.state;
    const optionsAccounts = filteredAccountList.map(account => (
      <Option key={account.id} value={account.id}>
        {`${account.accountNumber} - ${account.holder}`}
      </Option>
    ));
    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div key="1">
            <div className="box box-default">
              <div className="box-header">
                CoreBank Report
                {/* <Button
                  type="primary"
                  shape="round"
                  icon="download"
                  onClick={() => this.exportPDF()}
                  className="float-right ml-1"
                >
                  PDF
                </Button> */}
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

const CoreBank = () => <WrappedData />;

export default CoreBank;
