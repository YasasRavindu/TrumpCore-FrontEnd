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
import CSV from 'constants/common/csv';
import TREE_DATA from 'constants/common/treeData';

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

const FormItem = Form.Item;
const { Option } = Select;
const { Column, ColumnGroup } = Table;

class Data extends React.Component {
  constructor(props) {
    super(props);

    this._isMounted = false;
    this.csvHeader = CSV.CARDS.CATALOG;
    this.treeData = TREE_DATA.CARD_STATUS;

    this.state = {
      cardListTable: [],
      cardListReport: [],
      loadingTable: false,
      loadingReport: false,

      searchText: '',
      searchTextTimer: null,
      searchDate: ['', ''],
      searchType: 'all',
      searchState: [],

      pageSize: 10,
      pageNumber: 1,
      totalRecord: 0,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.loadTable();
  }

  getReqBody = isPagination => {
    let { searchDate, searchText, searchType, searchState, pageSize, pageNumber } = this.state;

    let reqBody = {
      keyword: searchText,
      startDate: searchDate[0],
      endDate: searchDate[1],
      cardBatchType: searchType,
      cardStatus: searchState,
    };

    if (isPagination) {
      reqBody['pageNumber'] = pageNumber;
      reqBody['pageSize'] = pageSize;
    }

    return reqBody;
  };

  loadTable = () => {
    this._isMounted &&
      this.setState({
        loadingTable: true,
      });

    axios
      .post(environment.baseUrl + 'card/filterSearchPage', this.getReqBody(true))
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const cardListTable = response.data.content.map(card => {
          card.key = card.id;
          return card;
        });
        this._isMounted &&
          this.setState({
            cardListTable: cardListTable,
            loadingTable: false,
            totalRecord: response.data.pagination.totalRecords,
          });
      })
      .catch(error => {
        this._isMounted &&
          this.setState({
            loadingTable: false,
          });
        console.log('------------------- error - ', error);
      });
  };

  loadReport = () => {
    this._isMounted &&
      this.setState({
        loadingReport: true,
      });

    axios
      .post(environment.baseUrl + 'card/filterSearchAll', this.getReqBody(false))
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const cardListReport = response.data.content.map(card => {
          card.key = card.id;
          return card;
        });
        this._isMounted &&
          this.setState({
            cardListReport: cardListReport,
            loadingReport: false,
          });
      })
      .catch(error => {
        this._isMounted &&
          this.setState({
            loadingReport: false,
          });
        console.log('------------------- error - ', error);
      });
  };

  paginationHandler = (pageNumber, pageSize) => {
    clearInterval(this.state.searchTextTimer);
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

  searchTextHandler = e => {
    this.setFilterValue('searchText', e.target.value);
  };
  searchDateHandler = (date, dateString) => {
    this.setFilterValue('searchDate', dateString);
  };

  searchTypeHandler = v => {
    this.setFilterValue('searchType', v);
  };

  searchStateHandler = v => {
    this.setFilterValue('searchState', v.length === this.treeData.length ? [] : v);
  };

  setFilterValue = (key, value) => {
    this.setState(
      () => {
        if (key === 'searchText') {
          clearInterval(this.state.searchTextTimer);
          let intervalId = setInterval(() => this.paginationHandler(1, this.state.pageSize), 2000);
          return {
            searchText: value,
            searchTextTimer: intervalId,
            cardListReport: [],
          };
        } else {
          return {
            [key]: value,
            cardListReport: [],
          };
        }
      },
      () => {
        if (key !== 'searchText') {
          this.paginationHandler(1, this.state.pageSize);
        }
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
    const headers = [['Card No', 'Created date', 'Expiry date', 'Card type', 'Card status']];

    const realData = this.state.cardListReport.map(d => [
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

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const {
      searchType,
      cardListTable,
      cardListReport,
      loadingTable,
      loadingReport,
      totalRecord,
      pageNumber,
    } = this.state;
    const { treeData, csvHeader } = this;

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
                {cardListReport.length === 0 && (
                  <Button
                    loading={loadingReport}
                    type="primary"
                    shape="round"
                    icon="copy"
                    onClick={() => this.loadReport()}
                    className="float-right ml-1"
                  >
                    Reports
                  </Button>
                )}
                {cardListReport.length > 0 && (
                  <>
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
                      data={this.state.cardListReport.map(d => ({
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
                  </>
                )}
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
                          value={searchType}
                          placeholder="Search Card Type"
                        >
                          <Option value="all">All</Option>
                          <Option value="debit">Debit</Option>
                          <Option value="cash">Cash</Option>
                        </Select>
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
                    dataSource={cardListTable}
                    loading={loadingTable}
                    scroll={{ x: 1500, y: 400 }}
                    className="ant-table-v1"
                    pagination={{
                      showSizeChanger: true,
                      total: totalRecord,
                      onChange: this.paginationHandler,
                      current: pageNumber,
                      onShowSizeChange: this.pageSizeHandler,
                      pageSizeOptions: ['10', '20', '30', '40', '50', '100'],
                    }}
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
