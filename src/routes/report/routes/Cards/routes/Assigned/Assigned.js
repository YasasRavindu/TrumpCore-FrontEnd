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
import { environment } from '../../../../../../environments';
import axios from 'axios';
import moment from 'moment';
import CUSTOM_MESSAGE from 'constants/notification/message';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Search = Input.Search;
const cardStatus = {
  ACTIVE: { color: '', label: 'Active' },
  INACTIVE: { color: 'magenta', label: 'Inactive' },
  LOCKED: { color: 'red', label: 'Locked' },
  CANCELLED: { color: 'volcano', label: 'Cancelled' },
  EXPIRED: { color: 'orange', label: 'Expired' },
};
const dateFormat = 'YYYY-MM-DD';

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const columns = [
  {
    title: 'Card No',
    dataIndex: 'card.cardNo',
    key: 'cardNo',
    fixed: 'left',
  },
  { title: 'Account no', dataIndex: 'account.accountNumber', key: 'accountNumber' },
  { title: 'Account holder', dataIndex: 'account.holder', key: 'holder' },
  { title: 'Card expire date', dataIndex: 'card.cardBatch.expiryDate', key: 'expireDate' },
  { title: 'Card create date', dataIndex: 'card.cardBatch.createDate', key: 'createDate' },
  {
    title: 'Card status',
    dataIndex: 'card.status',
    key: 'status',
    render: status => <Tag color={cardStatus[status].color}>{cardStatus[status].label}</Tag>,
  },
  { title: 'Card assigned date', dataIndex: 'assignedDate', key: 'assignedDate' },
];

const FormItem = Form.Item;
const { Option } = Select;
const { Column, ColumnGroup } = Table;

class Data extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadCardRegistry: [],
      loadFilterCardRegistry: [],
      loading: false,
      searchExDate: ['', ''],
      searchAsDate: ['', ''],
      searchText: '',
      searchState: 'ALL',
      inputValue: 1,
    };
  }

  async componentDidMount() {
    this.loadTable();
  }

  loadTable = () => {
    axios
      .get(environment.baseUrl + 'cardRegistry')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const cardList = response.data.content.map(cardRegistry => {
          cardRegistry.key = cardRegistry.id;
          return cardRegistry;
        });

        this.setState({
          loadCardRegistry: cardList,
          loadFilterCardRegistry: cardList,
        });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  searchexDateHandler = (date, dateString) => {
    this.dataFilter('searchExDate', dateString);
  };
  searchAsDateHandler = (date, dateString) => {
    this.dataFilter('searchAsDate', dateString);
  };

  searchTextHandler = e => {
    this.dataFilter('searchText', e.target.value);
  };
  searchStateHandler = s => {
    this.dataFilter('searchState', s);
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
        let data = this.state.loadCardRegistry;
        let searchExDate = this.state.searchExDate;
        let searchAsDate = this.state.searchAsDate;
        let searchText = this.state.searchText;
        let searchState = this.state.searchState.toUpperCase();

        if (searchText) {
          data = data.filter(d => {
            return (
              d.card.cardNo.toLowerCase().includes(searchText.toLowerCase()) ||
              d.account.accountNumber.toLowerCase().includes(searchText.toLowerCase()) ||
              d.account.holder.toLowerCase().includes(searchText.toLowerCase())
            );
          });
        }

        if (searchExDate.length > 0 && searchExDate[0] !== '' && searchExDate[1] !== '') {
          var startDate = moment(searchExDate[0]);
          var endDate = moment(searchExDate[1]);
          data = data.filter(d => {
            var date = moment(d.card.cardBatch.expiryDate);
            return date.isAfter(startDate) && date.isBefore(endDate);
          });
        }
        if (searchAsDate.length > 0 && searchAsDate[0] !== '' && searchAsDate[1] !== '') {
          var startDate = moment(searchAsDate[0]);
          var endDate = moment(searchAsDate[1]);
          data = data.filter(d => {
            var date = moment(d.assignedDate);
            return date.isAfter(startDate) && date.isBefore(endDate);
          });
        }

        if (searchState !== 'ALL') {
          data = data.filter(d => d.card.status == searchState);
        }

        this.setState({
          loadFilterCardRegistry: data,
        });
      }
    );
  };

  exportPDF = () => {
    const unit = 'pt';
    const size = 'A4'; // Use A1, A2, A3 or A4
    const orientation = 'landscape'; // portrait or landscape

    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(15);

    const title = 'Cards Report';
    const headers = [
      [
        'Card No',
        'Account no',
        'Account Holder',
        'Card expire date',
        'Card create date',
        'Card status',
        'Card Assigned date',
      ],
    ];

    const realData = this.state.loadFilterCardRegistry.map(d => [
      d.card.cardNo,
      d.account.accountNumber,
      d.account.holder,
      d.card.cardBatch.expiryDate,
      d.card.cardBatch.createDate,
      d.card.status.toLowerCase(),
      d.assignedDate,
    ]);
    let content = {
      startY: 50,
      head: headers,
      body: realData,
    };

    if (realData.length == 0) {
      message.error("Sorry, we couldn't find any card details with filtered data");
    } else {
      doc.text(title, marginLeft, 40);
      doc.autoTable(content);
      doc.save('Transaction-report.pdf');
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div key="1">
            <div className="box box-default">
              <div className="box-header">
                Assigned Cards
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
                        {/* <Input placeholder="Serial number" onChange={this.onChange} /> */}
                        <Search placeholder="Input Search Text" onChange={this.searchTextHandler} />
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="Card expire date">
                        <DatePicker.RangePicker
                          onChange={this.searchexDateHandler}
                          format={dateFormat}
                        />
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="Card assigned date">
                        <DatePicker.RangePicker
                          onChange={this.searchAsDateHandler}
                          format={dateFormat}
                        />
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="Card Status">
                        <Select
                          onChange={this.searchStateHandler}
                          value={this.state.searchState}
                          placeholder="Search Card Status"
                        >
                          <Option value="ALL">All</Option>
                          <Option value="ACTIVE">Active</Option>
                          <Option value="INACTIVE">Inactive</Option>
                          <Option value="LOCKED">Locked</Option>
                          <Option value="CANCELLED">Cancelled</Option>
                          <Option value="EXPIRED">Expired</Option>
                        </Select>
                      </FormItem>
                    </Col>
                  </Row>
                </Form>

                <article className="article mt-2">
                  <Table
                    columns={columns}
                    dataSource={this.state.loadFilterCardRegistry}
                    scroll={{ x: 1500, y: 300 }}
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

const Assigned = () => <WrappedData />;

export default Assigned;
