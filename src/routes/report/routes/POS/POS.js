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
import CUSTOM_MESSAGE from 'constants/notification/message';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Search = Input.Search;
const deviceStatus = {
  REGISTER: { color: '', label: 'REGISTER' },
  REMOVE: { color: 'magenta', label: 'DELETED' },
};
const dateFormat = 'YYYY-MM-DD';

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const columns = [
  {
    title: 'Serial Number',
    dataIndex: 'serial',
    key: 'serial',
  },
  { title: 'Created date', dataIndex: 'createDate', key: 'createDate', width: 150 },
  { title: 'Status', dataIndex: 'status', key: 'status', width: 150 },
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
      searchStatus: 'ALL',
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
  // exportPDF = () => {
  //   const unit = 'pt';
  //   const size = 'A4'; // Use A1, A2, A3 or A4
  //   const orientation = 'portrait'; // portrait or landscape

  //   const marginLeft = 40;
  //   const doc = new jsPDF(orientation, unit, size);

  //   doc.setFontSize(15);

  //   const title = 'My Awesome Report';
  //   const headers = [['card no', 'created', 'expire', 'status']];

  //   const data1 = data.map(elt => [elt.cardNo, elt.createDate, elt.expireDate, elt.status]);

  //   let content = {
  //     startY: 50,
  //     head: headers,
  //     body: data1,
  //   };

  //   doc.text(title, marginLeft, 40);
  //   doc.autoTable(content);
  //   doc.save('report.pdf');
  // };

  submit = e => {
    this.setState({ loading: true });
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        axios
          .post(environment.baseUrl + 'device', {
            serial: values.SerialNumber,
          })
          .then(response => {
            message.success('Congratulations! Your device successfully registered.');
            this.loadTable();
            this.props.form.resetFields();
            this.setState({ loading: false });
            console.log('------------------- response - ', response);
          })
          .catch(error => {
            console.log('------------------- error - ', error);
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
              msg = CUSTOM_MESSAGE.DIVICES_REGISTRATION_ERROR[errorCode];
              if (msg === undefined) {
                msg = CUSTOM_MESSAGE.DIVICES_REGISTRATION_ERROR['defaultError'];
              }
            } else {
              msg = CUSTOM_MESSAGE.DIVICES_REGISTRATION_ERROR['defaultError'];
            }
            message.error(msg);
            this.setState({ loading: false });
          });
      }
    });
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
            return (
              d.serial.toLowerCase().includes(searchText.toLowerCase()) ||
              d.status.toLowerCase().includes(searchText.toLowerCase())
            );
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

        if (searchStatus !== 'All') {
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
      <div className="container-fluid no-breadcrumb container-mw-xl chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div key="1">
            <div className="box box-default">
              <div className="box-header">POS Devices Report</div>
              <div className="box-body">
                <Form>
                  <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                    <Col span={6}>
                      <FormItem>
                        {/* <Input placeholder="Serial number" onChange={this.onChange} /> */}
                        <Search placeholder="Search device ID" onChange={this.searchTextHandler} />
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem>
                        <DatePicker.RangePicker
                          onChange={this.searchDateHandler}
                          format={dateFormat}
                        />
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem>
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
                    <Col span={6}>
                      {/* <FormItem>
                        <Slider
                          marks={marks}
                          onChange={this.onChange}
                          value={this.state.inputValue}
                        />
                      </FormItem> */}
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
