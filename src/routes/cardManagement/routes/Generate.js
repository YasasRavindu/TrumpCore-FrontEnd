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
  Popover,
  Statistic,
} from 'antd';
import axios from 'axios';
import moment from 'moment';

import { Redirect } from 'react-router-dom';
// -------------- IMPORT AUTHORITY -----------------------------------------
import {
  UNAUTHORIZED_ACCESS_EXCEPTION_ROUTE,
  USER_AUTHORITY_CODE,
  getActiveAuthorities,
  checkAuthority,
} from 'constants/authority/authority';
// -------------------------------------------------------------------------

// -------------- OTHER CUSTOM IMPORTS -------------------------------------
import { environment } from 'environments';
import STATUS from 'constants/notification/status';
import getErrorMessage from 'constants/notification/message';
// -------------------------------------------------------------------------

// -------------- ANT DESIGN -----------------------------------------------
const confirm = Modal.confirm;
const FormItem = Form.Item;
const { Option } = Select;
const { Column } = Table;
// -------------------------------------------------------------------------

// -------------- CUSTOM ---------------------------------------------------
const dateFormat = 'YYYY-MM-DD';
// -------------------------------------------------------------------------

class Data extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;

    this.state = {
      // Card Batch Generate From Inputs
      // --------------------------------
      count: '',
      type: '',
      effectivePeriod: '',
      // --------------------------------

      // Card Batch Search From Inputs
      // --------------------------------
      searchCreateDate: ['', ''],
      searchExpiryDate: ['', ''],
      searchCardBatchType: 'all',
      searchCardBatchStatus: 'all',
      // --------------------------------

      // Pagination
      // --------------------------------
      pageSize: 10,
      pageNumber: 1,
      totalRecord: 0,
      // --------------------------------

      // Custom
      // --------------------------------
      loadingGenerate: false,
      loadingTable: false,
      cardBatchList: [],
      // --------------------------------

      totalGeneratableCardCount: 0,
      minBatchCardCount: 0,
      maxBatchCardCount: 0,
      minEffectivePeriod: 0,
      maxEffectivePeriod: 0,
      cashCardCount: 0,
      debitCardCount: 0,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.loadTable();
  }

  loadCardBatchStatus = () => {
    axios
      .get(environment.baseUrl + 'card/batch/status')
      .then(response => {
        let data = response.data.content;
        console.log('------------------- response - ', data);
        this._isMounted &&
          this.setState({
            totalGeneratableCardCount: data.totalGeneratableCardCount,
            minBatchCardCount: data.minBatchCardCount,
            maxBatchCardCount: data.maxBatchCardCount,
            minEffectivePeriod: data.minEffectivePeriod,
            maxEffectivePeriod: data.maxEffectivePeriod,
            cashCardCount: data.cashCardsCount,
            debitCardCount: data.debitCardsCount,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  loadTable = () => {
    this.loadCardBatchStatus();

    this._isMounted &&
      this.setState({
        loadingTable: true,
      });
    axios
      .post(environment.baseUrl + 'card/batch/filterSearchPage', this.getReqBody(true))
      .then(response => {
        console.log('------------------- response - ', response.data.content);

        const cardBatchList = response.data.content.map(cardBatch => {
          cardBatch.key = cardBatch.id;
          return cardBatch;
        });
        this._isMounted &&
          this.setState({
            cardBatchList: cardBatchList,
            loadingTable: false,
          });
        this.loadCardBatchStatus();
      })
      .catch(error => {
        console.log('------------------- error - ', error);
        this._isMounted &&
          this.setState({
            loadingTable: false,
          });
      });
  };

  getReqBody = isPagination => {
    let {
      searchCreateDate,
      searchExpiryDate,
      searchCardBatchType,
      searchCardBatchStatus,
      pageSize,
      pageNumber,
    } = this.state;

    let reqBody = {
      createStartDate: searchCreateDate[0],
      createEndDate: searchCreateDate[1],
      expiryStartDate: searchExpiryDate[0],
      expiryEndDate: searchExpiryDate[1],
      cardBatchType: searchCardBatchType,
      cardBatchStatus: searchCardBatchStatus === 'all' ? [] : [searchCardBatchStatus],
    };

    if (isPagination) {
      reqBody['pageNumber'] = pageNumber;
      reqBody['pageSize'] = pageSize;
    }

    return reqBody;
  };

  paginationHandler = (pageNumber, pageSize) => {
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

  searchCreateDateHandler = (date, dateString) => {
    this.dataFilter('searchCreateDate', dateString);
  };

  searchExpiryDateHandler = (date, dateString) => {
    this.dataFilter('searchExpiryDate', dateString);
  };

  searchCardBatchTypeHandler = v => {
    this.dataFilter('searchCardBatchType', v);
  };

  searchCardBatchStatusHandler = v => {
    this.dataFilter('searchCardBatchStatus', v);
  };

  dataFilter = (key, value) => {
    this._isMounted &&
      this.setState(
        {
          [key]: value,
        },
        () => {
          this.paginationHandler(1, this.state.pageSize);
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
            this.paginationHandler(1, this.state.pageSize);
          })
          .catch(error => {
            console.log('------------------- error - ', error);
            message.warning('Something Wrong');
          });
      },
      onCancel() {},
    });
  }

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
        this.paginationHandler(1, this.state.pageSize);
      })
      .catch(error => {
        console.log('------------------- error - ', error);
        message.warning('Something Wrong');
      });
  }

  submit = e => {
    this._isMounted && this.setState({ loadingGenerate: true });
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
            console.log('------------------- response - ', response);
            const { searchType, searchStatus } = this.state;
            this.paginationHandler(1, this.state.pageSize);
            this.props.form.resetFields();
            this._isMounted && this.setState({ loadingGenerate: false });
            message.success('Congratulations! You have successfully generated a card batch.');
          })
          .catch(error => {
            console.log('------------------- error - ', error);
            message.error(getErrorMessage(error, 'CARD_GENERATE_ERROR'));
            this._isMounted && this.setState({ loadingGenerate: false });
          });
      } else {
        this.setState({ loadingGenerate: false });
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
      return <Redirect to={UNAUTHORIZED_ACCESS_EXCEPTION_ROUTE} />;
    }
    // -------------------------------------------------------------------------------

    // -------------------------------------------------------------------------------
    const {
      searchCardBatchType,
      searchCardBatchStatus,
      cardBatchList,
      loadingGenerate,
      totalRecord,
      pageNumber,
      totalGeneratableCardCount,
      minBatchCardCount,
      maxBatchCardCount,
      minEffectivePeriod,
      maxEffectivePeriod,
      cashCardCount,
      debitCardCount,
    } = this.state;
    const { getFieldDecorator } = this.props.form;
    const content = (
      <>
        <Statistic title="Debit Cards Count" value={debitCardCount} />
        <Statistic title="Cash Cards Count" value={cashCardCount} />
        <Statistic title="Total Cards Count" value={debitCardCount + cashCardCount} />
        <Statistic
          title="Remaining Cards Count"
          value={totalGeneratableCardCount - (debitCardCount + cashCardCount)}
        />
        <Statistic title="Total Generatable Cards Count" value={totalGeneratableCardCount} />
      </>
    );
    // -------------------------------------------------------------------------------

    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          {checkAuthority(viewAuthorities, USER_AUTHORITY_CODE.CARD_GENERATE_GENERATE) && (
            <div key="1">
              <div className="box box-default mb-4">
                <div className="box-header" style={{ fontSize: 20 }}>
                  Generate Card Numbers
                  <Tooltip title="Card Statistical Report" className="float-right mt-2">
                    <Popover
                      placement="leftTop"
                      title="Card Statistical Report"
                      content={content}
                      trigger="click"
                    >
                      <Icon type="info-circle" className="mr-3" />
                    </Popover>
                  </Tooltip>
                  <Divider type="horizontal" />
                </div>

                <div className="box-body">
                  <Form>
                    <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                      <Col xs={24} sm={12} md={12} lg={6}>
                        <FormItem label="Card Count">
                          {getFieldDecorator('count', {
                            rules: [
                              {
                                required: true,
                                message: 'Please add your card count.',
                              },
                            ],
                          })(<InputNumber min={1} style={{ width: '100%' }} />)}
                        </FormItem>
                      </Col>
                      <Col xs={24} sm={12} md={12} lg={6}>
                        <FormItem label="Card Type">
                          {getFieldDecorator('type', {
                            rules: [
                              {
                                required: true,
                                message: 'Please select your card type.',
                              },
                            ],
                          })(
                            <Select>
                              <Option value="DEBIT">Debit</Option>
                              <Option value="CASH">Cash</Option>
                            </Select>
                          )}
                        </FormItem>
                      </Col>
                      <Col xs={24} sm={12} md={12} lg={6}>
                        <FormItem label="Effective Period (Months)">
                          {getFieldDecorator('effectivePeriod', {
                            rules: [
                              {
                                required: true,
                                message: 'Please enter a valid effective period.',
                              },
                            ],
                          })(<InputNumber min={1} style={{ width: '100%' }} />)}
                        </FormItem>
                      </Col>
                      <Col xs={24} sm={12} md={12} lg={6}>
                        <Button
                          type="primary"
                          loading={loadingGenerate}
                          className="float-right"
                          onClick={this.submit}
                          style={{ marginTop: 43 }}
                        >
                          Generate
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                  {minBatchCardCount > 0 &&
                    maxBatchCardCount > 0 &&
                    minEffectivePeriod > 0 &&
                    maxEffectivePeriod > 0 && (
                      <div className="mt-4">
                        <div className="callout callout-info">
                          <div className="col-md-8 pl-0">
                            <p>
                              <span className="text-red">*</span>
                              {` Card count should be between ${minBatchCardCount} - ${maxBatchCardCount}`}
                              <br />
                              <span className="text-red">*</span>
                              {` Effective Period should be between ${minEffectivePeriod} - ${maxEffectivePeriod}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
          <div key="2">
            <div className="box box-default">
              <div className="box-body">
                <Form>
                  <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                    <Col xs={24} sm={12} md={12} lg={8}>
                      <FormItem label="Create Date Range">
                        <DatePicker.RangePicker
                          style={{ width: '100%' }}
                          onChange={this.searchCreateDateHandler}
                          format={dateFormat}
                        />
                      </FormItem>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                      <FormItem label="Expiry Date Range">
                        <DatePicker.RangePicker
                          style={{ width: '100%' }}
                          onChange={this.searchExpiryDateHandler}
                          format={dateFormat}
                        />
                      </FormItem>
                    </Col>
                    <Col xs={12} sm={8} md={8} lg={4}>
                      <FormItem label="Card Type">
                        <Select
                          onChange={this.searchCardBatchTypeHandler}
                          value={searchCardBatchType}
                        >
                          <Option value="all">All</Option>
                          <Option value="cash">Cash</Option>
                          <Option value="debit">Debit</Option>
                        </Select>
                      </FormItem>
                    </Col>
                    <Col xs={12} sm={8} md={8} lg={4}>
                      <FormItem label="Status">
                        <Select
                          onChange={this.searchCardBatchStatusHandler}
                          value={searchCardBatchStatus}
                        >
                          <Option value="all">All</Option>
                          <Option value="initiate">Initiate</Option>
                          <Option value="download">Download</Option>
                          <Option value="active">Active</Option>
                        </Select>
                      </FormItem>
                    </Col>
                  </Row>
                </Form>

                <article className="article mt-2">
                  {/* ------------------------- Card Batch Table ----------------------------------------- */}
                  <Table
                    dataSource={cardBatchList}
                    scroll={{ x: 1100, y: 600 }}
                    className="ant-table-v1"
                    pagination={{
                      showSizeChanger: true,
                      total: totalRecord,
                      onChange: this.paginationHandler,
                      current: pageNumber,
                      onShowSizeChange: this.pageSizeHandler,
                      pageSizeOptions: ['10', '20', '30', '40', '50', '100'],
                    }}
                  >
                    <Column title="Created Date" dataIndex="createDate" key="createDate" />
                    <Column title="Expiry Date" dataIndex="expiryDate" key="expiryDate" />
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
                  {/* ------------------------- ---------------------------------------------------------- */}
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
