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
  Divider,
  TreeSelect,
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
import TREE_DATA from 'constants/common/treeData';
// -------------------------------------------------------------------------

// -------------- ANT DESIGN -----------------------------------------------
const Search = Input.Search;
const FormItem = Form.Item;
const { Option } = Select;
const { Column, ColumnGroup } = Table;
// -------------------------------------------------------------------------

// -------------- CUSTOM ---------------------------------------------------
const dateFormat = 'YYYY-MM-DD';
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const searchDeviceStatusDefault = ['register', 're-register'];
// -------------------------------------------------------------------------

class Data extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.treeData = TREE_DATA.DEVICE_STATUS.REGISTRATION;

    this.state = {
      // Card Batch Search From Inputs
      // --------------------------------
      searchText: '',
      searchRegisterDate: ['', ''],
      searchDeviceStatus: [],
      // --------------------------------

      // Pagination
      // --------------------------------
      pageSize: 10,
      pageNumber: 1,
      totalRecord: 0,
      // --------------------------------

      // Custom
      // --------------------------------
      deviceListTable: [],
      loadingTable: false,
      loadingRegistration: false,
      // --------------------------------

    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.loadTable();
  }

  loadTable = () => {
    this._isMounted &&
      this.setState({
        loadingTable: true,
      });
    axios
      .post(environment.baseUrl + 'device/filterSearchPage', this.getReqBody(true))
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const devicesList = response.data.content.map(regDevices => {
          regDevices.key = regDevices.id;
          return regDevices;
        });

        this._isMounted &&
          this.setState({
            loadDevices: devicesList,
            loadFilterDevices: devicesList,

            deviceListTable: devicesList,
            loadingTable: false,
            totalRecord: response.data.pagination.totalRecords,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  // ------------   For loadTable   -----------------------------------
  getReqBody = isPagination => {
    let { searchText, searchRegisterDate, searchDeviceStatus, pageSize, pageNumber } = this.state;

    let reqBody = {
      columnName: 'serial',
      keyword: searchText,
      startDate: searchRegisterDate[0],
      endDate: searchRegisterDate[1],
      deviceStatus:
        searchDeviceStatus.length === 0 ? searchDeviceStatusDefault : searchDeviceStatus,
    };

    if (isPagination) {
      reqBody['pageNumber'] = pageNumber;
      reqBody['pageSize'] = pageSize;
    }

    return reqBody;
  };

  // ------------   Pagination   --------------------------------------
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
  // ------------------------------------------------------------------

  // ------------   Search Handlers  ----------------------------------
  searchTextHandler = e => {
    this.setFilterValue('searchText', e.target.value);
  };

  searchDateHandler = (date, dateString) => {
    this.setFilterValue('searchRegisterDate', dateString);
  };

  searchDeviceStatusHandler = v => {
    this.setFilterValue('searchDeviceStatus', v.length === this.treeData.length ? [] : v);
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
          };
        } else {
          return {
            [key]: value,
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
  // ------------------------------------------------------------------

  submit = e => {
    this._isMounted && this.setState({ loadingRegistration: true });
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
            this._isMounted && this.setState({ loadingRegistration: false });
            console.log('------------------- response - ', response);
          })
          .catch(error => {
            console.log('------------------- error - ', error);
            message.error(getErrorMessage(error, 'DEVICES_REGISTRATION_ERROR'));
            this._isMounted && this.setState({ loadingRegistration: false });
          });
      } else {
        this.setState({ loadingRegistration: false });
      }
    });
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    // -------------- GET ACTIVE AUTHORITIES -----------------------------------------
    const viewAuthorities = getActiveAuthorities(USER_AUTHORITY_CODE.POS_DEVICE_REGISTRATION);
    // -------------------------------------------------------------------------------

    // -------------- IF UNAUTHORIZED ------------------------------------------------
    if (viewAuthorities === 'UNAUTHORIZED') {
      return <Redirect to={UNAUTHORIZED_ACCESS_EXCEPTION_ROUTE} />;
    }
    // -------------------------------------------------------------------------------

    // -------------------------------------------------------------------------------
    const { treeData } = this;
    const {
      searchDeviceStatus,
      deviceListTable,
      loadingTable,
      totalRecord,
      pageNumber,
      loadingRegistration,
    } = this.state;
    const { getFieldDecorator } = this.props.form;
    // -------------------------------------------------------------------------------

    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          {checkAuthority(
            viewAuthorities,
            USER_AUTHORITY_CODE.POS_DEVICE_REGISTRATION_REGISTER
          ) && (
            <div key="1">
              <div className="box box-default mb-4">
                <div className="box-header custom_header">
                  Device Registration
                  <Divider type="horizontal" className="custom_divider" />
                </div>
                <div className="box-body">
                  <Form>
                    <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                      <Col xs={24} sm={18} md={18} lg={12}>
                        <FormItem label="Device Serial Number">
                          {getFieldDecorator('SerialNumber', {
                            rules: [
                              {
                                required: true,
                                message: 'Please enter device serial number',
                              },
                            ],
                          })(<Input placeholder="Serial number" style={{ width: '100%' }} />)}
                        </FormItem>
                      </Col>
                      <Col xs={24} sm={6} md={6} lg={6}>
                        <Button
                          type="primary"
                          loading={loadingRegistration}
                          className="float-right"
                          onClick={this.submit}
                          style={{ marginTop: 43 }}
                        >
                          Generate
                        </Button>
                      </Col>
                    </Row>
                  </Form>
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
                      <FormItem label="Search">
                        <Search placeholder="Search  Here..." onChange={this.searchTextHandler} />
                      </FormItem>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                      <FormItem label="Assigned Date">
                        <DatePicker.RangePicker
                          style={{ width: '100%' }}
                          onChange={this.searchDateHandler}
                          format={dateFormat}
                        />
                      </FormItem>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                      <FormItem label="Card Status">
                        <TreeSelect
                          treeData={treeData}
                          value={searchDeviceStatus}
                          onChange={this.searchDeviceStatusHandler}
                          treeCheckable={true}
                          searchPlaceholder={'Please select'}
                          style={{ width: '100%' }}
                          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                          allowClear
                        />
                      </FormItem>
                    </Col>
                  </Row>
                </Form>

                <article className="article mt-2">
                  <Table
                    dataSource={deviceListTable}
                    loading={loadingTable}
                    scroll={{ x: 1100, y: 400 }}
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
                    <Column title="Serial Number" dataIndex="serial" key="serial" />
                    <Column title="Created Date" dataIndex="createDate" key="createDate" />
                    <Column
                      title="Status"
                      dataIndex="status"
                      key="status"
                      render={status => (
                        <Tag color={STATUS.DEVICE_STATUS[status].color}>
                          {STATUS.DEVICE_STATUS[status].label}
                        </Tag>
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

const registration = () => <WrappedData />;

export default registration;
