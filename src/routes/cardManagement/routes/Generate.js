import React from 'react';
import QueueAnim from 'rc-queue-anim';
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
  Tooltip,
} from 'antd';
import { environment, commonUrl } from '../../../environments';
import getErrorMessage from 'constants/notification/message';

import { Redirect } from 'react-router-dom';
// -------------- IMPORT AUTHORITY -----------------------------------------
import {
  DEFAULT_EXCEPTION_ROUTE,
  USER_AUTHORITY_CODE,
  getActiveAuthorities,
  checkAuthority,
} from 'constants/authority/authority';
// -------------------------------------------------------------------------

import axios from 'axios';
import moment from 'moment';
import STATUS from 'constants/notification/status';
const confirm = Modal.confirm;

const batchStatus = {
  INITIATE: { color: '' },
  DOWNLOAD: { color: 'blue' },
  ACTIVE: { color: 'magenta' },
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
    this._isMounted = false;
    this.state = {
      count: '',
      type: '',
      effectivePeriod: '',
      batchList: [],
      batchFilteredList: [],
      searchDate: ['', ''],
      searchType: 'all',
      searchStatus: 'all',
      loading: false,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    const { searchType, searchStatus } = this.state;
    this.loadTable(searchType, searchStatus);
  }

  loadTable = (type, status) => {
    axios
      .get(environment.baseUrl + 'card/batch/search/' + type + '/' + status)
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const cardBatchList = response.data.content.map(cardBatch => {
          cardBatch.key = cardBatch.id;
          return cardBatch;
        });
        this._isMounted &&
          this.setState({
            batchList: cardBatchList,
            batchFilteredList: cardBatchList,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

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
    this._isMounted &&
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
            data = data.filter(d => d.type === searchType);
          }
          if (searchStatus !== 'ALL') {
            data = data.filter(d => d.status === searchStatus);
          }
          if (searchDate.length > 0 && searchDate[0] !== '' && searchDate[1] !== '') {
            var startDate = moment(searchDate[0]);
            var endDate = moment(searchDate[1]);
            data = data.filter(d => {
              var date = moment(d.createDate);
              return date.isAfter(startDate) && date.isBefore(endDate);
            });
          }

          this._isMounted &&
            this.setState({
              batchFilteredList: data,
            });
        }
      );
  };

  batchDelete(id) {
    let current = this;
    confirm({
      title: 'Are you sure you want to delete batch?',
      content: 'Clicking on OK will delete the entire card batch',
      onOk() {
        axios
          .delete(environment.baseUrl + 'card/batch/delete/' + id)
          .then(response => {
            console.log('------------------- response - ', response);
            message.success('Successfully Deleted');
            current.refresh();
          })
          .catch(error => {
            console.log('------------------- error - ', error);
            message.warning('Something Wrong');
          });
      },
      onCancel() {},
    });
  }

  refresh = () => {
    const { searchType, searchStatus } = this.state;
    this.loadTable(searchType, searchStatus);
  };

  downloadCsv(id) {
    axios
      .get(environment.baseUrl + 'file/download/batch/' + id)
      .then(response => {
        console.log('------------------- response - ', response);
        message.success('Successfully Downloaded');
        const type = response.headers['content-type'];
        const blob = new Blob([response.data], { type: type, encoding: 'UTF-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'CardNumbers_' + id + '.csv';
        link.click();

        const { searchType, searchStatus } = this.state;
        this.loadTable(searchType, searchStatus);
      })
      .catch(error => {
        console.log('------------------- error - ', error);
        message.warning('Something Wrong');
      });
  }

  submit = e => {
    console.log(this.state);
    this._isMounted && this.setState({ loading: true });
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        axios
          .post(environment.baseUrl + 'card/batch/generate', {
            count: values.count,
            type: values.type,
            effectivePeriod: values.effectivePeriod,
          })
          .then(response => {
            message.success('Congratulations! You have successfully generated a card batch.');
            const { searchType, searchStatus } = this.state;
            this.loadTable(searchType, searchStatus);
            this.props.form.resetFields();
            this._isMounted && this.setState({ loading: false });
            console.log('------------------- response - ', response);
          })
          .catch(error => {
            console.log('------------------- error - ', error);
            message.error(getErrorMessage(error, 'CARD_GENERATE_ERROR'));
            this._isMounted && this.setState({ loading: false });
          });
      } else {
        this.setState({ loading: false });
      }
    });
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    // -------------- GET ACTIVE AUTHORITIES -----------------------------------------
    const viewAuthorities = getActiveAuthorities(USER_AUTHORITY_CODE.CARD_GENERATE);
    // -------------------------------------------------------------------------------

    // -------------- IF UNAUTHORIZED ------------------------------------------------
    if (viewAuthorities === 'UNAUTHORIZED') {
      return <Redirect to={DEFAULT_EXCEPTION_ROUTE} />;
    }
    // -------------------------------------------------------------------------------

    const { getFieldDecorator } = this.props.form;

    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          {checkAuthority(viewAuthorities, USER_AUTHORITY_CODE.CARD_GENERATE_GENERATE) && (
            <div key="1">
              <div className="box box-default mb-4">
                <div className="box-header">Generate Card Numbers</div>

                <div className="box-body mt-3">
                  <Form layout="inline">
                    <FormItem label="Card Count">
                      {getFieldDecorator('count', {
                        rules: [
                          {
                            required: true,
                            message: 'Please add your card count.',
                          },
                        ],
                      })(<InputNumber min={1} />)}
                    </FormItem>
                    <FormItem label="Card Type">
                      {getFieldDecorator('type', {
                        rules: [
                          {
                            required: true,
                            message: 'Please select your card type.',
                          },
                        ],
                      })(
                        <Select style={{ width: 120 }}>
                          <Option value="DEBIT">Debit</Option>
                          <Option value="CASH">Cash</Option>
                        </Select>
                      )}
                    </FormItem>
                    <FormItem label="Effective Period (Months)">
                      {getFieldDecorator('effectivePeriod', {
                        rules: [
                          {
                            required: true,
                            message: 'Please enter a valid effective period.',
                          },
                        ],
                      })(<InputNumber min={1} />)}
                    </FormItem>
                    <Button
                      type="primary"
                      loading={this.state.loading}
                      className="float-right"
                      onClick={this.submit}
                    >
                      Generate
                    </Button>
                  </Form>
                  <div className="mt-4">
                    <p>
                      * Minimum card count should be greater than 10 and less than 10000
                      <br />* Months that should be greater than 6 and less than 60
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div key="2">
            <div className="box box-default">
              <div className="box-body">
                <Form layout="inline">
                  <FormItem {...formItemLayout} label="Date Range">
                    <DatePicker.RangePicker onChange={this.searchDateHandler} format={dateFormat} />
                  </FormItem>

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

                  <FormItem {...formItemLayout} label="Status">
                    <Select
                      style={{ width: 120 }}
                      onChange={this.searchStatusHandler}
                      value={this.state.searchStatus}
                    >
                      <Option value="all">All</Option>
                      <Option value="initiate">Initiate</Option>
                      <Option value="download">Download</Option>
                      <Option value="active">Active</Option>
                    </Select>
                  </FormItem>
                </Form>

                <article className="article mt-2">
                  <Table dataSource={this.state.batchFilteredList}>
                    <Column title="Created Date" dataIndex="createDate" key="createDate" />
                    <Column title="Card Count" dataIndex="count" key="count" />
                    <Column title="Card Type" dataIndex="type" key="type" />
                    <Column
                      title="Status"
                      dataIndex="status"
                      key="status"
                      render={status => (
                        <Tag color={STATUS.BATCH_STATUS[status].color}>{status}</Tag>
                      )}
                    />
                    <Column
                      title="Action"
                      key="action"
                      render={(text, record) => (
                        <span>
                          {record.status &&
                            record.status !== 'ACTIVE' &&
                            checkAuthority(
                              viewAuthorities,
                              USER_AUTHORITY_CODE.CARD_GENERATE_DOWNLOAD
                            ) && (
                              <>
                                <Tooltip title="Download">
                                  <Icon
                                    onClick={() => this.downloadCsv(record.id, record.createDate)}
                                    type="download"
                                    className="mr-3"
                                  />
                                </Tooltip>
                              </>
                            )}
                          {record.status &&
                            record.status === 'INITIATE' &&
                            checkAuthority(
                              viewAuthorities,
                              USER_AUTHORITY_CODE.CARD_GENERATE_REMOVE
                            ) && (
                              <Tooltip title="Remove">
                                <Icon onClick={() => this.batchDelete(record.id)} type="delete" />
                              </Tooltip>
                            )}
                        </span>
                      )}
                    />
                  </Table>
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

const Generate = () => <WrappedData />;

export default Generate;
