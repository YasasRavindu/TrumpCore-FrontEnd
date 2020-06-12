import React from 'react';
import QueueAnim from 'rc-queue-anim';
import {
  Table,
  Icon,
  Input,
  Form,
  Row,
  Col,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Tooltip,
  Divider,
} from 'antd';

import { Redirect } from 'react-router-dom';
// -------------- IMPORT AUTHORITY -----------------------------------------
import {
  UNAUTHORIZED_ACCESS_EXCEPTION_ROUTE,
  USER_AUTHORITY_CODE,
  getActiveAuthorities,
  checkAuthority,
} from 'constants/authority/authority';
// -------------------------------------------------------------------------

import { environment } from 'environments';
import axios from 'axios';
import moment from 'moment';
import getErrorMessage from 'constants/notification/message';
import STATUS from 'constants/notification/status';
const Search = Input.Search;
const dateFormat = 'YYYY-MM-DD';

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const FormItem = Form.Item;
const { Option } = Select;
const { Column, ColumnGroup } = Table;

class Data extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      inactiveList: [],
      inactiveFieldList: [],
      searchText: '',
      searchDate: ['', ''],
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    this.loadTable();
  }

  loadTable = () => {
    axios
      .get(environment.baseUrl + 'device/search/remove')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const inactiveList = response.data.content.map(inactive => {
          inactive.key = inactive.id;
          return inactive;
        });
        this._isMounted &&
          this.setState({
            inactiveList: inactiveList,
            inactiveFieldList: inactiveList,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  // devicesDelete = id => {
  //   axios
  //     .delete(environment.baseUrl + 'device/' + id)
  //     .then(response => {
  //       message.success('Devices  successfully removed');
  //       console.log('------------------- response - ', response);
  //       this.loadTable();
  //     })
  //     .catch(error => {
  //       let msg = null;
  //       if (
  //         error &&
  //         error.response &&
  //         error.response.data &&
  //         error.response.data.validationFailures &&
  //         error.response.data.validationFailures[0] &&
  //         error.response.data.validationFailures[0].code
  //       ) {
  //         let errorCode = error.response.data.validationFailures[0].code;
  //         msg = CUSTOM_MESSAGE.DEVICES_STATUS_CHANGE_ERROR[errorCode];
  //         if (msg === undefined) {
  //           msg = CUSTOM_MESSAGE.DEVICES_STATUS_CHANGE_ERROR['defaultError'];
  //         }
  //       } else {
  //         msg = CUSTOM_MESSAGE.DEVICES_STATUS_CHANGE_ERROR['defaultError'];
  //       }
  //       message.error(msg);
  //       console.log('------------------- error - ', error);
  //     });
  // };

  handleStatus = (id, value) => {
    axios
      .get(
        environment.baseUrl + 'device/changeStatus/' + id + '/' + STATUS.DEVICE_STATUS[value].value
      )
      .then(response => {
        message.success('Device status successfully updated!');
        // console.log('------------------- response - ', response.data.content);
        this.loadTable();
      })
      .catch(error => {
        console.log('------------------- error - ', error);
        message.error(getErrorMessage(error, 'DEVICES_STATUS_CHANGE_ERROR'));
      });
  };

  searchDateHandler = (date, dateString) => {
    this.dataFilter('searchDate', dateString);
  };

  searchTextHandler = e => {
    this.dataFilter('searchText', e.target.value);
  };

  dataFilter = (key, value) => {
    this._isMounted &&
      this.setState(
        {
          [key]: value,
        },
        () => {
          let data = this.state.inactiveList;
          let searchDate = this.state.searchDate;
          let searchText = this.state.searchText;

          if (searchText) {
            data = data.filter(d => {
              if (d.account !== null) {
                return (
                  d.serial.toLowerCase().includes(searchText.toLowerCase()) ||
                  d.account.holder.toLowerCase().includes(searchText.toLowerCase()) ||
                  d.account.accountNumber.toLowerCase().includes(searchText.toLowerCase())
                );
              } else {
                return d.serial.toLowerCase().includes(searchText.toLowerCase());
              }
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
          this._isMounted &&
            this.setState({
              inactiveFieldList: data,
            });
        }
      );
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    // -------------- GET ACTIVE AUTHORITIES -----------------------------------------
    const viewAuthorities = getActiveAuthorities(USER_AUTHORITY_CODE.POS_DEVICE_REMOVE);
    // -------------------------------------------------------------------------------

    // -------------- IF UNAUTHORIZED ------------------------------------------------
    if (viewAuthorities === 'UNAUTHORIZED') {
      return <Redirect to={UNAUTHORIZED_ACCESS_EXCEPTION_ROUTE} />;
    }
    // -------------------------------------------------------------------------------

    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div key="1">
            <div className="box box-default">
              <div className="box-header">Remove device from account</div>
              <div className="box-body">
                <Form>
                  <Row gutter={24}>
                    <Col span={8} order={3}>
                      <FormItem>
                        {/* <Input placeholder="Serial number" onChange={this.onChange} /> */}
                        <Search
                          placeholder="Input search text"
                          onChange={this.searchTextHandler}
                          style={{ width: 200 }}
                        />
                      </FormItem>
                    </Col>
                    <Col span={8} order={3}>
                      <FormItem {...formItemLayout} label="Date Range">
                        <DatePicker.RangePicker
                          onChange={this.searchDateHandler}
                          format={dateFormat}
                        />
                      </FormItem>
                    </Col>
                  </Row>
                </Form>

                <article className="article mt-2">
                  <Table dataSource={this.state.inactiveFieldList}>
                    <Column title="Serial Number" dataIndex="serial" key="serial" />
                    <Column title="Created Date" dataIndex="createDate" key="createDate" />
                    <Column
                      title="Account Number"
                      dataIndex="account.accountNumber"
                      key="accountNumber"
                    />
                    <Column title="Account Holder" dataIndex="account.holder" key="holder" />
                    <Column
                      title="Action"
                      key="action"
                      render={(text, record) => (
                        <span>
                          {checkAuthority(
                            viewAuthorities,
                            USER_AUTHORITY_CODE.POS_DEVICE_REMOVE_RE_REGISTER
                          ) && (
                            <Popconfirm
                              title="Are you sure you want to re-register this device?"
                              onConfirm={() => this.handleStatus(record.id, 'RE_REGISTER')}
                              // onConfirm={() => this.devicesDelete(record.id)}
                              okText="Yes"
                              cancelText="No"
                            >
                              <Tooltip title="Re Register" className="mr-3">
                                <Icon type="reload" />
                              </Tooltip>
                            </Popconfirm>
                          )}

                          {checkAuthority(
                            viewAuthorities,
                            USER_AUTHORITY_CODE.POS_DEVICE_REMOVE_REMOVE
                          ) && (
                            <Popconfirm
                              title="Are you sure you want to delete this device?"
                              onConfirm={() => this.handleStatus(record.id, 'REMOVE')}
                              // onConfirm={() => this.devicesDelete(record.id)}
                              okText="Yes"
                              cancelText="No"
                            >
                              <Tooltip title="Remove">
                                <Icon type="delete" />
                              </Tooltip>
                            </Popconfirm>
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
const remove = () => <WrappedData />;
export default remove;
