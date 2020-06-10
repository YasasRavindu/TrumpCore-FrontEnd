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
} from 'antd';
import { environment } from 'environments';
import axios from 'axios';
import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CSVLink } from 'react-csv';
import STATUS from 'constants/notification/status';
const { SHOW_PARENT } = TreeSelect;

const Search = Input.Search;
const dateFormat = 'YYYY-MM-DD';

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
    render: status => (
      <Tag color={STATUS.CARD_STATUS[status].color}>{STATUS.CARD_STATUS[status].label}</Tag>
    ),
  },
  { title: 'Card assigned date', dataIndex: 'assignedDate', key: 'assignedDate' },
];
const csvHeader = [
  { label: 'Card No', key: 'cardNo' },
  { label: 'Account no', key: 'accountNumber' },
  { label: 'Account holder', key: 'holder' },
  { label: 'Card expire date', key: 'expiryDate' },
  { label: 'Card create date', key: 'createDate' },
  { label: 'Card status', key: 'status' },
  { label: 'Assigned Date', key: 'assignedDate' },
];
const treeData = [
  {
    title: 'Active',
    value: 'active',
    key: 'active',
  },
  {
    title: 'Inactive',
    value: 'inactive',
    key: 'inactive',
  },
  {
    title: 'Locked',
    value: 'locked',
    key: 'locked',
  },
  {
    title: 'Cancelled',
    value: 'cancelled',
    key: 'cancelled',
  },
  {
    title: 'Expired',
    value: 'expired',
    key: 'expired',
  },
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
      searchState: [],
      inputValue: 1,
      tableLoading: true,
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
          tableLoading: false,
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
        let searchState = this.state.searchState;
        if (
          searchText ||
          (searchExDate.length > 0 && searchExDate[0] !== '' && searchExDate[1] !== '') ||
          (searchAsDate.length > 0 && searchAsDate[0] !== '' && searchAsDate[1] !== '') ||
          searchState.length > 0
        ) {
          let returnable;
          data = data.filter(d => {
            returnable = true;
            if (returnable && searchText) {
              returnable =
                d.card.cardNo.toLowerCase().includes(searchText.toLowerCase()) ||
                d.account.accountNumber.toLowerCase().includes(searchText.toLowerCase()) ||
                d.account.holder.toLowerCase().includes(searchText.toLowerCase());
            }
            if (
              returnable &&
              searchExDate.length > 0 &&
              searchExDate[0] !== '' &&
              searchExDate[1] !== ''
            ) {
              var startDate = moment(searchExDate[0]);
              var endDate = moment(searchExDate[1]);
              var date = moment(d.card.cardBatch.expiryDate);
              returnable = date.isAfter(startDate) && date.isBefore(endDate);
            }
            if (
              returnable &&
              searchAsDate.length > 0 &&
              searchAsDate[0] !== '' &&
              searchAsDate[1] !== ''
            ) {
              var startDate = moment(searchAsDate[0]);
              var endDate = moment(searchAsDate[1]);
              var date = moment(d.assignedDate);
              returnable = date.isAfter(startDate) && date.isBefore(endDate);
            }
            if (returnable && searchState.length > 0) {
              returnable = searchState.includes(d.card.status.toLowerCase());
            }
            return returnable;
          });
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
      doc.save('Card-Assign-report.pdf');
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const tProps = {
      treeData,
      value: this.state.searchState,
      onChange: this.searchStateHandler,
      treeCheckable: true,
      showCheckedStrategy: SHOW_PARENT,
      searchPlaceholder: 'Please select',
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
                Assigned Cards
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
                  data={this.state.loadFilterCardRegistry.map(d => ({
                    cardNo: d.card.cardNo,
                    accountNumber: d.account.accountNumber,
                    holder: d.account.holder,
                    expiryDate: d.card.cardBatch.expiryDate,
                    createDate: d.card.cardBatch.createDate,
                    status: d.card.status.toLowerCase(),
                    assignedDate: d.assignedDate,
                  }))}
                  headers={csvHeader}
                  filename={'Card-Assign-report.csv'}
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
                        <TreeSelect {...tProps} />
                      </FormItem>
                    </Col>
                  </Row>
                </Form>

                <article className="article mt-2">
                  <Table
                    columns={columns}
                    dataSource={this.state.loadFilterCardRegistry}
                    loading={this.state.tableLoading}
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
