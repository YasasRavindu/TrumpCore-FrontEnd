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
import { environment } from '../../../../../../environments';
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
    dataIndex: 'cardNo',
    key: 'cardNo',
    fixed: 'left',
  },
  { title: 'Created date', dataIndex: 'cardBatch.createDate', key: 'createDate' },
  { title: 'Expiry date', dataIndex: 'cardBatch.expiryDate', key: 'expiryDate' },
  {
    title: 'Card Type',
    dataIndex: 'cardBatch.type',
    key: 'type',
    render: type => <Tag color={STATUS.CARD_TYPE[type].color}>{STATUS.CARD_TYPE[type].label}</Tag>,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: status => (
      <Tag color={STATUS.CARD_STATUS[status].color}>{STATUS.CARD_STATUS[status].label}</Tag>
    ),
  },
];

const csvHeader = [
  { label: 'Card No', key: 'cardNo' },
  { label: 'Created date', key: 'createDate' },
  { label: 'Expiry date', key: 'expiryDate' },
  { label: 'Card Type', key: 'type' },
  { label: 'Status', key: 'status' },
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
      loadCards: [],
      loadFilterCards: [],
      loading: false,
      searchDate: ['', ''],
      searchText: '',
      inputValue: 1,
      searchType: 'ALL',
      searchState: [],
      tableLoading: true,
    };
  }

  async componentDidMount() {
    this.loadTable();
  }

  loadTable = () => {
    axios
      .get(environment.baseUrl + 'card/search/all/all')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const cardList = response.data.content.map(card => {
          card.key = card.id;
          return card;
        });

        this.setState({
          loadCards: cardList,
          loadFilterCards: cardList,
          tableLoading: false,
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

    const title = 'Cards Report';
    const headers = [['Card No', 'Created date', 'Expiry date', 'Card type', 'Card status']];

    const realData = this.state.loadFilterCards.map(d => [
      d.cardNo,
      d.cardBatch.createDate,
      d.cardBatch.expiryDate,
      d.cardBatch.type,
      d.status,
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
      doc.save('Card-catalog-report.pdf');
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
        let data = this.state.loadCards;
        let searchDate = this.state.searchDate;
        let searchText = this.state.searchText;
        let searchType = this.state.searchType.toUpperCase();
        let searchState = this.state.searchState;

        if (
          searchText ||
          (searchDate.length > 0 && searchDate[0] !== '' && searchDate[1] !== '') ||
          searchType.length > 0 ||
          searchState.length > 0
        ) {
          let returnable;
          data = data.filter(d => {
            returnable = true;
            if (returnable && searchText) {
              returnable = d.cardNo.toLowerCase().includes(searchText.toLowerCase());
            }
            if (
              returnable &&
              searchDate.length > 0 &&
              searchDate[0] !== '' &&
              searchDate[1] !== ''
            ) {
              var startDate = moment(searchDate[0]);
              var endDate = moment(searchDate[1]);
              var date = moment(d.cardBatch.expiryDate);
              returnable = date.isAfter(startDate) && date.isBefore(endDate);
            }
            if (returnable && searchType.length > 0) {
              if (searchType == 'ALL') {
                returnable = true;
              } else {
                returnable = searchType.includes(d.cardBatch.type);
              }
            }
            if (returnable && searchState.length > 0) {
              returnable = searchState.includes(d.status.toLowerCase());
            }
            return returnable;
          });
        }

        this.setState({
          loadFilterCards: data,
        });
      }
    );
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
                Cards Catalog
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
                  data={this.state.loadFilterCards.map(d => ({
                    cardNo: d.cardNo,
                    createDate: d.cardBatch.createDate,
                    expiryDate: d.cardBatch.expiryDate,
                    type: d.cardBatch.type.toLowerCase(),
                    status: d.status.toLowerCase(),
                  }))}
                  headers={csvHeader}
                  filename={'Card-catalog-report.csv'}
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
                        <Search placeholder="Search Card No" onChange={this.searchTextHandler} />
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="Expire Date">
                        <DatePicker.RangePicker
                          onChange={this.searchDateHandler}
                          format={dateFormat}
                        />
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="Card Type">
                        <Select
                          onChange={this.searchTypeHandler}
                          value={this.state.searchType}
                          placeholder="Search Card Type"
                        >
                          <Option value="ALL">All</Option>
                          <Option value="DEBIT">Debit</Option>
                          <Option value="CASH">Cash</Option>
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="Card Status">
                        <TreeSelect {...tProps} />
                      </FormItem>
                    </Col>
                    {/* <Col span={6}>
                      <FormItem>
                        
                      </FormItem>
                    </Col> */}
                  </Row>
                </Form>

                <article className="article mt-2">
                  <Table
                    columns={columns}
                    dataSource={this.state.loadFilterCards}
                    loading={this.state.tableLoading}
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

const Catalog = () => <WrappedData />;

export default Catalog;
