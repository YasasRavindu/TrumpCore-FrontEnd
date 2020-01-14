import React from 'react';
import QueueAnim from 'rc-queue-anim';
import {
  Table,
  Icon,
  Input,
  Button,
  Modal,
  AutoComplete,
  Form,
  Tag,
  Divider,
  Row,
  Col,
  Select,
  InputNumber,
  DatePicker,
} from 'antd';

import { environment, commonUrl } from '../../../environments';
import axios from 'axios';
import moment from 'moment';

const batchStatus = {
  INITIATED: { color: '' },
  DOWNLOADED: { color: 'blue' },
  ACTIVATED: { color: 'magenta' },
};

const dateFormat = 'YYYY-MM-DD';

const Search = Input.Search;
const FormItem = Form.Item;
const { Option } = Select;
const { Column, ColumnGroup } = Table;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

class Data extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: '',
      type: '',
      effectivePeriod: '',
      batchList: [],
      batchFilteredList: [],
      searchDate: ['', ''],
      searchType: 'all',
      searchStatus: 'all',
    };
  }

  async componentDidMount() {
    const { searchType, searchStatus } = this.state;
    axios
      .get(environment.baseUrl + 'card/batch/search/' + searchType + '/' + searchStatus)
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const cardBatchList = response.data.content.map(cardBatch => {
          cardBatch.key = cardBatch.id;
          return cardBatch;
        });
        this.setState({
          batchList: cardBatchList,
          batchFilteredList: cardBatchList,
        });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  }

  searchDateHandler = (date, dateString) => {
    this.dataFilter('searchDate', dateString);
  };

  searchTypeHandler = v => {
    this.dataFilter('searchType', v);
  };

  searchStatusHandler = v => {
    this.dataFilter('searchStatus', v);
  };

  dataFilter = (key, value) => {
    this.setState(
      {
        [key]: value,
      },
      () => {
        let data = this.state.batchList;
        let searchType = this.state.searchType.toUpperCase();
        let searchStatus = this.state.searchStatus.toUpperCase();
        let searchDate = this.state.searchDate;

        if (searchType !== 'ALL') {
          data = searchType ? data.filter(d => d.type === searchType) : data;
        }
        if (searchStatus !== 'ALL') {
          data = searchStatus ? data.filter(d => d.status === searchStatus) : data;
        }
        if (searchDate.length > 0 && searchDate[0] !== '' && searchDate[1] !== '') {
          var startDate = moment(searchDate[0]);
          var endDate = moment(searchDate[1]);
          data = searchStatus
            ? data.filter(d => {
                var date = moment(d.createDate);
                return date.isAfter(startDate) && date.isBefore(endDate);
              })
            : data;
        }

        this.setState({
          batchFilteredList: data,
        });
      }
    );
  };

  submit = e => {
    console.log(this.state);

    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState(
          {
            count: values.count,
            type: values.type,
            effectivePeriod: values.effectivePeriod,
          },
          () => {
            // console.info('success', this.state);
            axios
              .post(environment.baseUrl + 'card/batch/generate', {
                count: this.state.count,
                type: this.state.type,
                effectivePeriod: this.state.effectivePeriod,
              })
              .then(response => {
                console.log('------------------- response - ', response);
                return response;
              })
              .catch(error => {
                console.log('------------------- error - ', error);
                return error;
              });
          }
        );
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <React.Fragment>
        <QueueAnim type="bottom" className="ui-animate">
          <div key="1">
            <div className="box box-default mb-4">
              <div className="box-header">Generate Card Numbers</div>
              <div className="box-body">
                <Form>
                  <Row gutter={24}>
                    <Col span={6} order={4}>
                      <FormItem {...formItemLayout} label="Card Count">
                        {getFieldDecorator('count', {
                          rules: [
                            {
                              type: 'integer',
                              required: true,
                              message: 'Please input your card count',
                            },
                          ],
                        })(<InputNumber min={1} />)}
                      </FormItem>
                    </Col>
                    <Col span={6} order={4}>
                      <FormItem {...formItemLayout} label="Card Type">
                        {getFieldDecorator('type', {
                          rules: [
                            {
                              required: true,
                              message: 'Please input your card type',
                            },
                          ],
                        })(
                          <Select style={{ width: 120 }}>
                            <Option value="DEBIT">Debit</Option>
                            <Option value="CASH">Cash</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={11} order={4}>
                      <FormItem {...formItemLayout} label="Effective Period (Months)">
                        {getFieldDecorator('effectivePeriod', {
                          rules: [
                            {
                              required: true,
                              message: 'Please input months',
                            },
                          ],
                        })(<InputNumber min={1} />)}
                      </FormItem>
                    </Col>
                    <Col span={1} order={4}>
                      <Button type="primary" className="float-right" onClick={this.submit}>
                        Submit
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </div>
            </div>
          </div>
          <div key="2">
            <div className="box box-default">
              {/* <div className="box-header">Add POS ID with Account ID</div> */}
              <div className="box-body">
                <Form>
                  <Row gutter={24}>
                    <Col span={6} order={3}>
                      <FormItem {...formItemLayout} label="Date Range">
                        <DatePicker.RangePicker
                          onChange={this.searchDateHandler}
                          format={dateFormat}
                        />
                      </FormItem>
                    </Col>
                    <Col span={6} order={2}>
                      <FormItem {...formItemLayout} label="Card Type">
                        <Select
                          style={{ width: 120 }}
                          onChange={this.searchTypeHandler}
                          value={this.state.searchType}
                        >
                          <Option value="all">All</Option>
                          <Option value="cash">Cash</Option>
                          <Option value="debit">Debit</Option>
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={6} order={1}>
                      <FormItem {...formItemLayout} label="Status">
                        <Select
                          style={{ width: 120 }}
                          onChange={this.searchStatusHandler}
                          value={this.state.searchStatus}
                        >
                          <Option value="all">All</Option>
                          <Option value="initiated">Initiated</Option>
                          <Option value="downloaded">Downloaded</Option>
                          <Option value="activated">Activated</Option>
                        </Select>
                      </FormItem>
                    </Col>
                  </Row>
                </Form>

                <article className="article mt-2">
                  <Table dataSource={this.state.batchFilteredList}>
                    <Column title="Create Date" dataIndex="createDate" key="createDate" />
                    <Column title="Card Count" dataIndex="count" key="count" />
                    <Column title="Card Type" dataIndex="type" key="type" />
                    <Column
                      title="Status"
                      dataIndex="status"
                      key="status"
                      render={status => <Tag color={batchStatus[status].color}>{status}</Tag>}
                    />
                    <Column
                      title="Action"
                      key="action"
                      render={(text, record) => (
                        <span>
                          <a>Invite {record.lastName}</a>
                          <Divider type="vertical" />
                          <a>Delete</a>
                        </span>
                      )}
                    />
                  </Table>
                </article>
              </div>
            </div>
          </div>
        </QueueAnim>
      </React.Fragment>
    );
  }
}

const WrappedData = Form.create()(Data);

const cardTable = () => <WrappedData />;

export default cardTable;
