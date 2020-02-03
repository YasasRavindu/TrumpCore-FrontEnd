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
} from 'antd';
import { environment } from '../../../../environments';
import axios from 'axios';
import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import STATUS from 'constants/notification/status';

const Search = Input.Search;
const dateFormat = 'YYYY-MM-DD';
const columns = [
  { title: 'Account Holder', dataIndex: 'holder', key: 'holder' },
  {
    title: 'Account No',
    dataIndex: 'accountNo',
    key: 'accountNo',
  },
  { title: 'Serial No', dataIndex: 'serial', key: 'serial' },
  { title: 'Merchant Account No', dataIndex: 'merchantAccNo', key: 'merchantAccNo' },
  { title: 'Merchant Account Name', dataIndex: 'merchantName', key: 'merchantName' },
  { title: 'Device Account No', dataIndex: 'deviceAccNo', key: 'deviceAccNo' },
  { title: 'Device Account Name', dataIndex: 'deviceAcctName', key: 'deviceAcctName' },
  {
    title: 'Log Time',
    dataIndex: 'logTime',
    key: 'logTime',
    render: logTime => moment(logTime).format('MMMM Do YYYY, h:mm:ss a'),
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    render: type => (
      <Tag color={STATUS.TRANSACTION_TYPE[type].color}>{STATUS.TRANSACTION_TYPE[type].label}</Tag>
    ),
  },
];

const FormItem = Form.Item;
const { Option } = Select;
const { Column, ColumnGroup } = Table;

class Data extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadLog: [],
      loadFilterLog: [],
      loading: false,
      searchDate: ['', ''],
      searchText: '',
      searchType: 'all',
      inputValue: 1,
    };
  }

  async componentDidMount() {
    this.loadTable();
  }

  loadTable = () => {
    axios
      .get(environment.baseUrl + 'report/allLogs')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const logList = response.data.content.map(log => {
          log.key = log.id;
          return log;
        });

        this.setState({
          loadLog: logList,
          loadFilterLog: logList,
        });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
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
        'Log Time',
        'Transaction Type',
      ],
    ];

    const realData = this.state.loadFilterLog.map(d => [
      d.holder,
      d.accountNo,
      d.serial,
      d.merchantAccNo,
      d.merchantName,
      d.deviceAccNo,
      d.deviceAcctName,
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
    this.dataFilter('searchDate', dateString);
  };

  searchTextHandler = e => {
    this.dataFilter('searchText', e.target.value);
  };
  searchTypeHandler = v => {
    this.dataFilter('searchType', v);
  };

  onChange = value => {
    this.setState({
      inputValue: value,
    });
  };

  dataFilter = (key, value) => {
    this.setState(
      {
        [key]: value,
      },
      () => {
        let data = this.state.loadLog;
        let searchDate = this.state.searchDate;
        let searchText = this.state.searchText;
        let searchType = this.state.searchType;

        if (searchText) {
          data = data.filter(d => {
            return (
              d.holder.toLowerCase().includes(searchText.toLowerCase()) ||
              d.accountNo.toLowerCase().includes(searchText.toLowerCase()) ||
              d.serial.toLowerCase().includes(searchText.toLowerCase()) ||
              d.merchantAccNo.toLowerCase().includes(searchText.toLowerCase()) ||
              d.merchantName.toLowerCase().includes(searchText.toLowerCase()) ||
              d.deviceAccNo.toLowerCase().includes(searchText.toLowerCase()) ||
              d.deviceAcctName.toLowerCase().includes(searchText.toLowerCase())
            );
          });
        }

        if (searchDate.length > 0 && searchDate[0] !== '' && searchDate[1] !== '') {
          var startDate = moment(searchDate[0]);
          var endDate = moment(searchDate[1]);
          data = data.filter(d => {
            var date = moment(d.logTime);
            return date.isAfter(startDate) && date.isBefore(endDate);
          });
        }

        if (searchType !== 'all') {
          data = data.filter(d => d.type == searchType);
        }

        this.setState({
          loadFilterLog: data,
        });
      }
    );
  };

  render() {
    const { getFieldDecorator } = this.props.form;

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
                  className="float-right"
                >
                  PDF
                </Button>
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
                      <FormItem label="Log time">
                        <DatePicker.RangePicker
                          onChange={this.searchDateHandler}
                          format={dateFormat}
                        />
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="Transaction type">
                        <Select
                          onChange={this.searchTypeHandler}
                          value={this.state.searchType}
                          placeholder="Search transaction type"
                        >
                          <Option value="all">All</Option>
                          <Option value="1">New Biometric</Option>
                          <Option value="2">Edit Biometric</Option>
                          <Option value="3">Change Pin</Option>
                          <Option value="4">Deposit</Option>
                          <Option value="5">Withdrew</Option>
                          <Option value="6">Balance Query</Option>
                          <Option value="7">Merchant Pay</Option>
                          <Option value="8">Sim Registration</Option>
                          <Option value="9">Cancel Transaction</Option>
                          <Option value="10">Cash Power</Option>
                          <Option value="11">Soloman Water</Option>
                          <Option value="12">TELKO</Option>
                          <Option value="13">B Mobile</Option>
                          <Option value="14">NPF</Option>
                        </Select>
                      </FormItem>
                    </Col>
                  </Row>
                </Form>

                <article className="article mt-2">
                  <Table
                    columns={columns}
                    dataSource={this.state.loadFilterLog}
                    scroll={{ x: 1500, y: 400 }}
                    className="ant-table-v1"
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

const Transaction = () => <WrappedData />;

export default Transaction;
