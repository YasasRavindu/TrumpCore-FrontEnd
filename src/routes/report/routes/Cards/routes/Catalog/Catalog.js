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

const Search = Input.Search;
const cardStatus = {
  ACTIVE: { color: '', label: 'active' },
  INACTIVE: { color: 'magenta', label: 'inactive' },
  LOCKED: { color: 'red', label: 'locked' },
  CANCELLED: { color: 'volcano', label: 'cancelled' },
  EXPIRED: { color: 'orange', label: 'expired' },
};
const dateFormat = 'YYYY-MM-DD';

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const columns = [
  {
    title: 'Card No',
    dataIndex: 'cardNo',
    key: 'cardNo',
    fixed: 'left',
  },
  { title: 'Created date', dataIndex: 'cardBatch.createDate', key: 'createDate' },
  { title: 'Expiry date', dataIndex: 'cardBatch.expiryDate', key: 'expiryDate' },
  { title: 'Card Type', dataIndex: 'cardBatch.type', key: 'type' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: type => <Tag color={cardStatus[status].color}>{cardStatus[status].label}</Tag>,
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
      searchState: 'ALL',
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
        });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
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
        let searchState = this.state.searchState.toUpperCase();

        if (searchText) {
          data = data.filter(d => {
            return d.cardNo.toLowerCase().includes(searchText.toLowerCase());
          });
        }

        if (searchDate.length > 0 && searchDate[0] !== '' && searchDate[1] !== '') {
          var startDate = moment(searchDate[0]);
          var endDate = moment(searchDate[1]);
          data = data.filter(d => {
            var date = moment(d.cardBatch.expiryDate);
            return date.isAfter(startDate) && date.isBefore(endDate);
          });
        }

        if (searchType !== 'ALL') {
          data = data.filter(d => d.cardBatch.type == searchType);
        }

        if (searchState !== 'ALL') {
          data = data.filter(d => d.status == searchState);
        }

        this.setState({
          loadFilterCards: data,
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
              <div className="box-header">Cards Catalog</div>
              <div className="box-body">
                <Form>
                  <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                    <Col span={6}>
                      <FormItem>
                        {/* <Input placeholder="Serial number" onChange={this.onChange} /> */}
                        <Search placeholder="Search Card No" onChange={this.searchTextHandler} />
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
                          onChange={this.searchTypeHandler}
                          value={this.state.searchType}
                          placeholder="Search Card Type"
                        >
                          <Option value="ALL">All</Option>
                          <Option value="DEBIT">Debit</Option>
                          <Option value="CASH">Credit</Option>
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem>
                        <Select
                          onChange={this.searchStateHandler}
                          value={this.state.searchState}
                          placeholder="Search Card Status"
                        >
                          <Option value="ALL">All</Option>
                          <Option value="ACTIVE">active</Option>
                          <Option value="INACTIVE">inactive</Option>
                          <Option value="LOCKED">locked</Option>
                          <Option value="CANCELLED">cancelled</Option>
                          <Option value="EXPIRED">expired</Option>
                        </Select>
                      </FormItem>
                    </Col>
                  </Row>
                </Form>

                <article className="article mt-2">
                  <Table
                    columns={columns}
                    dataSource={this.state.loadFilterCards}
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
