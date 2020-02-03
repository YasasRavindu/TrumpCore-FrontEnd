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
import STATUS from 'constants/notification/status';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const Search = Input.Search;
const dateFormat = 'YYYY-MM-DD';
const columns = [
  {
    title: 'Serial Number',
    dataIndex: 'serial',
    key: 'serial',
  },
  { title: 'Created date', dataIndex: 'createDate', key: 'createDate', width: 150 },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 150,
    render: status => (
      <Tag color={STATUS.DEVICE_STATUS[status].color}>{STATUS.DEVICE_STATUS[status].label}</Tag>
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
      loadDevices: [],
      loadFilterDevices: [],
      loading: false,
      searchDate: ['', ''],
      searchText: '',
      inputValue: 1,
      searchStatus: 'all',
    };
  }

  async componentDidMount() {
    this.loadTable();
  }

  loadTable = () => {
    axios
      .get(environment.baseUrl + 'device/search/all')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const devicesList = response.data.content.map(regDevices => {
          regDevices.key = regDevices.id;
          return regDevices;
        });

        this.setState({
          loadDevices: devicesList,
          loadFilterDevices: devicesList,
        });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  expandedRowRender = (holder, accountNumber) => {
    return (
      <React.Fragment>
        <Row>
          <Col span={6}>
            <Tag color={'geekblue'}>Account Holder</Tag>
          </Col>
          <Col span={6}>
            <p>{holder}</p>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <Tag color={'geekblue'}>Account Number</Tag>
          </Col>
          <Col span={6}>
            <p>{accountNumber}</p>
          </Col>
        </Row>
      </React.Fragment>
    );
  };
  exportPDF = () => {
    const unit = 'pt';
    const size = 'A4'; // Use A1, A2, A3 or A4
    const orientation = 'portrait'; // portrait or landscape

    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(15);

    const title = 'POS Devices Report';
    const headers = [
      ['Serial number', 'Created date', 'Status', 'Account holder', 'Account number'],
    ];

    const realData = this.state.loadFilterDevices.map(d =>
      d.account !== null
        ? [
            d.serial,
            d.createDate,
            d.status.toLowerCase(),
            d.account.holder,
            d.account.accountNumber,
          ]
        : [d.serial, d.createDate, d.status, 'N/A', 'N/A']
    );
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
      doc.save('POS-devices-report.pdf');
    }
  };

  searchDateHandler = (date, dateString) => {
    this.dataFilter('searchDate', dateString);
  };

  searchTextHandler = e => {
    this.dataFilter('searchText', e.target.value);
  };

  searchStatusHandler = v => {
    this.dataFilter('searchStatus', v);
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
        let data = this.state.loadDevices;
        let searchDate = this.state.searchDate;
        let searchText = this.state.searchText;
        let searchStatus = this.state.searchStatus.toUpperCase();

        if (searchText) {
          data = data.filter(d => {
            if (d.account !== null) {
              return (
                d.serial.toLowerCase().includes(searchText.toLowerCase()) ||
                d.account.holder.toLowerCase().includes(searchText.toLowerCase()) ||
                d.account.accountNumber.toLowerCase().includes(searchText.toLowerCase())
              );
            } else {
              return d.serial.toLowerCase().includes(searchText.toLowerCase());
            }
          });
        }

        if (searchDate.length > 0 && searchDate[0] !== '' && searchDate[1] !== '') {
          var startDate = moment(searchDate[0]);
          var endDate = moment(searchDate[1]);
          data = data.filter(d => {
            var date = moment(d.createDate);
            return date.isAfter(startDate) && date.isBefore(endDate);
          });
        }

        if (searchStatus !== 'ALL') {
          data = data.filter(d => d.status === searchStatus);
        }

        this.setState({
          loadFilterDevices: data,
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
                POS Devices Report
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
                    <Col span={8}>
                      <FormItem label="Search">
                        {/* <Input placeholder="Serial number" onChange={this.onChange} /> */}
                        <Search
                          placeholder="Search serial number or account details"
                          onChange={this.searchTextHandler}
                        />
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="Created date">
                        <DatePicker.RangePicker
                          onChange={this.searchDateHandler}
                          format={dateFormat}
                        />
                      </FormItem>
                    </Col>
                    <Col span={4}>
                      <FormItem label="Status">
                        <Select
                          onChange={this.searchStatusHandler}
                          value={this.state.searchStatus}
                          placeholder="Search POS Status"
                        >
                          <Option value="all">All</Option>
                          <Option value="register">Register</Option>
                          <Option value="active">Active</Option>
                          <Option value="inactive">Inactive</Option>
                          <Option value="locked">Locked</Option>
                          <Option value="remove">Remove</Option>
                        </Select>
                      </FormItem>
                    </Col>
                  </Row>
                </Form>

                <article className="article mt-2">
                  <Table
                    columns={columns}
                    dataSource={this.state.loadFilterDevices}
                    expandedRowRender={record =>
                      record.account != null ? (
                        this.expandedRowRender(record.account.holder, record.account.accountNumber)
                      ) : (
                        <span>
                          <Tag color={'red'}>No Account Details</Tag>
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

const Transaction = () => <WrappedData />;

export default Transaction;
