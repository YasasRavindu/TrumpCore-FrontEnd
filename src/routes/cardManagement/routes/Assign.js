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
  Badge,
  AutoComplete,
  Tooltip,
  Popconfirm,
} from 'antd';

import { Redirect } from 'react-router-dom';
// -------------- IMPORT AUTHORITY -----------------------------------------
import {
  DEFAULT_REDIRECT_ROUTE,
  USER_AUTHORITY_CODE,
  getActiveAuthorities,
  checkAuthority,
} from 'constants/authority/authority';
// -------------------------------------------------------------------------

import { environment, commonUrl } from '../../../environments';
import axios from 'axios';
import CUSTOM_MESSAGE from 'constants/notification/message';
import moment from 'moment';
import STATUS from 'constants/notification/status';
import profile_avatar from '../../../assets/images/profile_avatar.png';

const dateFormat = 'YYYY-MM-DD';
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const FormItem = Form.Item;
const { Option } = Select;
const { Column, ColumnGroup } = Table;
const footer = {
  position: 'fixed',
  left: '0',
  right: '0',
  bottom: '0',
  float: 'right',
};

class Data extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      cardList: [],
      assignList: [],
      filteredAssignedList: [],
      accountList: [],
      searchDate: ['', ''],
      searchText: '',
      visible: false,
      checkedID: '',
      checkedcardId: '',
      checkedaccountId: '',
      modelVisible: false,
      modelType: undefined,
      account: undefined,
      displayDetail: false,
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    this.loadData();
  }

  loadData = () => {
    axios
      .get(environment.baseUrl + 'card/search/debit/inactive')
      .then(response => {
        // console.log('------------------- response - ', response.data.content);
        const cardList = response.data.content.map(device => {
          device.key = device.id;
          return device;
        });
        this._isMounted &&
          this.setState({
            cardList: cardList,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
    axios
      .post(environment.baseUrl + 'account/filterSearch', {
        status: '1',
        context: '',
        cardAssigned: '0',
      })
      .then(response => {
        // console.log('------------------- response - ', response.data.content);
        this._isMounted &&
          this.setState({
            accountList: response.data.content,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });

    axios
      .get(environment.baseUrl + 'cardRegistry')
      .then(response => {
        // console.log('------------------- response - ', response.data.content);
        const assignList = response.data.content.map(device => {
          device.key = device.id;
          return device;
        });
        this._isMounted &&
          this.setState({
            assignList: assignList,
            filteredAssignedList: assignList,
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

  dataFilter = (key, value) => {
    this._isMounted &&
      this.setState(
        {
          [key]: value,
        },
        () => {
          let data = this.state.assignList;
          let searchDate = this.state.searchDate;
          let searchText = this.state.searchText;

          if (searchText) {
            data = data.filter(d => {
              return (
                (d.account &&
                  (d.account.holder.toLowerCase().includes(searchText.toLowerCase()) ||
                    d.account.accountNumber.toLowerCase().includes(searchText.toLowerCase()))) ||
                (d.card && d.card.cardNo.toLowerCase().includes(searchText.toLowerCase()))
              );
            });
          }

          if (searchDate.length > 0 && searchDate[0] !== '' && searchDate[1] !== '') {
            var startDate = moment(searchDate[0]);
            var endDate = moment(searchDate[1]);
            data = data.filter(d => {
              var date = moment(d.assignedDate);
              return date.isAfter(startDate) && date.isBefore(endDate);
            });
          }

          this._isMounted &&
            this.setState({
              filteredAssignedList: data,
            });
        }
      );
  };

  handleUpdate = (id, cardId, accountId) => {
    if (id) {
      this._isMounted &&
        this.setState(
          {
            checkedID: id,
            checkedcardId: cardId,
            checkedaccountId: accountId,
          },
          () => {
            // this._isMounted &&
            //   this.setState({
            //     visible: true,
            //   });
            // console.log(this.state);

            this.state.accountList.map(account => {
              if (account.id.toUpperCase() === accountId.toUpperCase()) {
                this.showAccountDetail(account);
                //keyCard = false;
              }
            });
            this.showModel('edit');
          }
        );
    }
  };

  assignmentSubmit = e => {
    e.preventDefault();
    const { checkedID, checkedaccountId } = this.state;
    this.props.form.validateFields(['updatecardNumber'], (err, values) => {
      if (!err) {
        axios
          .put(environment.baseUrl + 'cardRegistry/' + checkedID + '/card', {
            account: {
              id: checkedaccountId,
            },
            card: {
              id: values.updatecardNumber,
            },
          })
          .then(response => {
            message.success('Card Successfully Assign to Account');
            console.log('------------------- response - ', response);
            this.loadData();
            this.props.form.resetFields();
            this._isMounted &&
              this.setState({
                visible: false,
                checkedID: '',
                checkedcardId: '',
                checkedaccountId: '',
              });
          })
          .catch(error => {
            let msg = null;
            if (
              error &&
              error.response &&
              error.response.data &&
              error.response.data.validationFailures &&
              error.response.data.validationFailures[0] &&
              error.response.data.validationFailures[0].code
            ) {
              let errorCode = error.response.data.validationFailures[0].code;
              console.log('error code', errorCode);

              msg = CUSTOM_MESSAGE.CARD_REGISTRY_ERROR[errorCode];
              if (msg === undefined) {
                msg = CUSTOM_MESSAGE.CARD_REGISTRY_ERROR['defaultError'];
              }
            } else {
              msg = CUSTOM_MESSAGE.CARD_REGISTRY_ERROR['defaultError'];
            }
            message.error(msg);
            console.log('------------------- error - ', error);
          });
      }
    });
  };

  handleCancel = e => {
    this._isMounted &&
      this.setState({
        visible: false,
      });
  };

  handleModelCancel = e => {
    this._isMounted &&
      this.setState({
        modelVisible: false,
      });
  };

  handleStatus = (id, value) => {
    axios
      .put(environment.baseUrl + 'card/update', {
        id: id,
        status: value,
      })
      .then(response => {
        // console.log('------------------- response - ', response.data.content);
        this.loadData();
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  submit = e => {
    e.preventDefault();
    this.props.form.validateFields(['cardNumber', 'accountNumber'], (err, values) => {
      if (!err) {
        console.log(values);
        axios
          .post(environment.baseUrl + 'cardRegistry', {
            account: {
              id: values.accountNumber,
            },
            card: {
              id: values.cardNumber,
            },
          })
          .then(response => {
            message.success('Card Successfully Assign to Account');
            console.log('------------------- response - ', response);
            this.loadData();
            this.props.form.resetFields();
          })
          .catch(error => {
            let msg = null;
            if (
              error &&
              error.response &&
              error.response.data &&
              error.response.data.validationFailures &&
              error.response.data.validationFailures[0] &&
              error.response.data.validationFailures[0].code
            ) {
              let errorCode = error.response.data.validationFailures[0].code;
              msg = CUSTOM_MESSAGE.CARD_ASSIGN_ERROR[errorCode];
              if (msg === undefined) {
                msg = CUSTOM_MESSAGE.CARD_ASSIGN_ERROR['defaultError'];
              }
            } else {
              msg = CUSTOM_MESSAGE.CARD_ASSIGN_ERROR['defaultError'];
            }
            message.error(msg);
            console.log('------------------- error - ', error);
          });
      }
    });
  };

  showAccountDetail = account => {
    if (
      this.state.account === null ||
      this.state.account === undefined ||
      this.state.account.id !== account.id ||
      !this.state.displayDetail
    ) {
      this.setState({
        account: account,
        displayDetail: true,
      });
    }
  };

  getAccount = (accountList, inputValue) => {
    let keyCard = true;
    accountList.map(account => {
      if (
        inputValue !== undefined &&
        (account.accountNumber.toUpperCase() === inputValue.toUpperCase() ||
          account.id.toUpperCase() === inputValue.toUpperCase())
      ) {
        this.showAccountDetail(account);
        keyCard = false;
      }
    });

    return keyCard;
  };

  showModel = type => {
    this._isMounted &&
      this.setState({
        modelVisible: true,
        modelType: type,
      });
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    // -------------- GET ACTIVE AUTHORITIES -----------------------------------------
    const viewAuthorities = getActiveAuthorities(USER_AUTHORITY_CODE.CARD_ASSIGN);
    // -------------------------------------------------------------------------------

    // -------------- IF UNAUTHORIZED ------------------------------------------------
    if (viewAuthorities === 'UNAUTHORIZED') {
      return <Redirect to={DEFAULT_REDIRECT_ROUTE} />;
    }
    // -------------------------------------------------------------------------------

    const { getFieldDecorator } = this.props.form;
    const { accountList, cardList, filteredAssignedList } = this.state;

    const optionsCards = cardList.map(card => (
      <Option key={card.id} value={card.id}>
        {card.cardNo}
      </Option>
    ));

    const optionsAccounts = accountList.map(account => (
      <Option key={account.id} value={account.id}>
        {`${account.accountNumber} - ${account.holder}`}
      </Option>
    ));

    // const PageLayout = () => (
    //   <Layout className="app-layout">
    //     <AppContent/>
    //   </Layout>
    // )

    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          {/* {checkAuthority(viewAuthorities, USER_AUTHORITY_CODE.CARD_ASSIGN_ASSIGN) && (
            <div key="1">
              <div className="box box-default mb-4">
                <div className="box-header">Assign card to account</div>
                <div className="box-body">
                  <Form layout="inline">
                    <FormItem>
                      {getFieldDecorator('cardNumber', {
                        rules: [
                          {
                            required: true,
                            message: 'Please enter your card number',
                          },
                        ],
                      })(
                        // (<Input placeholder="Serial Number" />)
                        <AutoComplete
                          allowClear
                          dataSource={optionsCards}
                          style={{ width: 200 }}
                          onBlur={inputValue => {
                            let keyCard = false;
                            cardList.map(card => {
                              if (
                                inputValue !== undefined &&
                                card.id.toUpperCase() === inputValue.toUpperCase()
                              ) {
                                keyCard = true;
                              }
                            });
                            if (!keyCard) {
                              this.props.form.setFieldsValue({
                                cardNumber: '',
                              });
                            }
                          }}
                          placeholder="Card Number"
                          filterOption={(inputValue, option) =>
                            option.props.children
                              .toUpperCase()
                              .indexOf(inputValue.toUpperCase()) !== -1
                          }
                        />
                      )}
                    </FormItem>
                    <FormItem>
                      <Badge
                        count={'Assign to >'}
                        style={{
                          backgroundColor: '#fff',
                          color: '#999',
                          boxShadow: '0 0 0 1px #d9d9d9 inset',
                          marginTop: '10px',
                        }}
                      />
                    </FormItem>

                    <FormItem>
                      {getFieldDecorator('accountNumber', {
                        rules: [
                          {
                            required: true,
                            message: 'Please enter your Account number',
                          },
                        ],
                      })(
                        // <Input placeholder="Account Number" />
                        <AutoComplete
                          dataSource={optionsAccounts}
                          style={{ width: 200 }}
                          onBlur={inputValue => {
                            let keyCard = false;
                            accountList.map(account => {
                              if (
                                inputValue !== undefined &&
                                (account.accountNumber.toUpperCase() === inputValue.toUpperCase() ||
                                  account.id.toUpperCase() === inputValue.toUpperCase())
                              ) {
                                keyCard = true;
                              }
                            });
                            if (!keyCard) {
                              this.props.form.setFieldsValue({
                                accountNumber: '',
                              });
                            }
                          }}
                          placeholder="Account Number"
                          filterOption={(inputValue, option) =>
                            option.props.children
                              .toUpperCase()
                              .indexOf(inputValue.toUpperCase()) !== -1
                          }
                        />
                      )}
                    </FormItem>

                    <Button type="primary" className="float-right" onClick={this.submit}>
                      Assign
                    </Button>
                  </Form>
                </div>
              </div>
            </div>
          )} */}

          <div key="2">
            <div className="box box-default">
              <div className="box-header">
                Card Management
                <Button
                  type="primary"
                  shape="round"
                  icon="plus"
                  onClick={() => this.showModel('assign')}
                  className="float-right ml-1"
                >
                  Add
                </Button>
              </div>

              <div className="box-body">
                <Form>
                  <Row gutter={24}>
                    <Col span={8} order={3}>
                      <FormItem>
                        <Input.Search
                          placeholder="input search text"
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
                  <Table dataSource={filteredAssignedList}>
                    <Column
                      title="Account Number"
                      dataIndex="account.accountNumber"
                      key="accountNumber"
                    />
                    <Column title="Account Holder" dataIndex="account.holder" key="accountHolder" />
                    <Column title="Card Number" dataIndex="card.cardNo" key="cardNo" />
                    <Column
                      title="Card Status"
                      dataIndex="card.status"
                      key="cardStatus"
                      render={status => (
                        <>
                          {status && (
                            <Tag color={STATUS.CARD_STATUS[status].color}>
                              {STATUS.CARD_STATUS[status].label}
                            </Tag>
                          )}
                        </>
                      )}
                    />
                    <Column title="Assigned Date" dataIndex="assignedDate" key="assignedDate" />
                    <Column
                      title="Action"
                      key="action"
                      render={(text, record) => (
                        <span>
                          {record.card.status &&
                            (record.card.status === 'ACTIVE' ||
                              record.card.status === 'LOCKED') && (
                              <>
                                {record.card.status === 'ACTIVE' &&
                                  checkAuthority(
                                    viewAuthorities,
                                    USER_AUTHORITY_CODE.CARD_ASSIGN_LOCK
                                  ) && (
                                    <>
                                      <Tooltip title="Lock">
                                        <Icon
                                          onClick={() =>
                                            this.handleStatus(record.card.id, 'LOCKED')
                                          }
                                          type="lock"
                                          className="mr-3"
                                        />
                                      </Tooltip>
                                    </>
                                  )}
                                {record.card.status === 'LOCKED' &&
                                  checkAuthority(
                                    viewAuthorities,
                                    USER_AUTHORITY_CODE.CARD_ASSIGN_UNLOCK
                                  ) && (
                                    <>
                                      <Tooltip title="Unlock">
                                        <Icon
                                          onClick={() =>
                                            this.handleStatus(record.card.id, 'ACTIVE')
                                          }
                                          type="unlock"
                                          className="mr-3"
                                        />
                                      </Tooltip>
                                      <Divider type="vertical" />
                                    </>
                                  )}
                                {checkAuthority(
                                  viewAuthorities,
                                  USER_AUTHORITY_CODE.CARD_ASSIGN_CANCEL
                                ) && (
                                  <Popconfirm
                                    title="Are you sure delete this assignment?"
                                    onConfirm={() => this.handleStatus(record.card.id, 'CANCELLED')}
                                    okText="Yes"
                                    cancelText="No"
                                  >
                                    <Tooltip title="Cancel">
                                      <Icon type="close-circle-o" />
                                    </Tooltip>
                                  </Popconfirm>
                                )}
                              </>
                            )}

                          {record.card.status &&
                            (record.card.status === 'CANCELLED' ||
                              record.card.status === 'EXPIRED') &&
                            checkAuthority(
                              viewAuthorities,
                              USER_AUTHORITY_CODE.CARD_ASSIGN_RE_ASSIGN
                            ) && (
                              <Tooltip title="Assign New Card">
                                <Icon
                                  onClick={() =>
                                    this.handleUpdate(record.id, record.card.id, record.account.id)
                                  }
                                  type="edit"
                                />
                              </Tooltip>
                            )}
                        </span>
                      )}
                    />
                  </Table>
                </article>
                <Modal
                  title="Update card registry"
                  visible={this.state.visible}
                  onOk={this.assignmentSubmit}
                  onCancel={this.handleCancel}
                  okText="Assign"
                  centered
                >
                  <Form>
                    <FormItem>
                      {getFieldDecorator('updatecardNumber', {
                        rules: [
                          {
                            required: true,
                            message: 'Please enter your card number',
                          },
                        ],
                      })(
                        // (<Input placeholder="Serial Number" />)
                        <AutoComplete
                          dataSource={optionsCards}
                          style={{ width: 200 }}
                          onBlur={inputValue => {
                            let keyCard = false;
                            cardList.map(card => {
                              if (
                                inputValue !== undefined &&
                                card.id.toUpperCase() === inputValue.toUpperCase()
                              ) {
                                keyCard = true;
                              }
                            });
                            if (!keyCard) {
                              this.props.form.setFieldsValue({
                                updatecardNumber: '',
                              });
                            }
                          }}
                          placeholder="Card Number"
                          filterOption={(inputValue, option) =>
                            option.props.children
                              .toUpperCase()
                              .indexOf(inputValue.toUpperCase()) !== -1
                          }
                        />
                      )}
                    </FormItem>
                  </Form>
                </Modal>
              </div>
            </div>
          </div>
        </QueueAnim>
        <Modal
          visible={this.state.modelVisible}
          onCancel={this.handleModelCancel}
          footer={null}
          width={800}
        >
          <Form layout="inline">
            {this.state.modelType == 'assign' && (
              <FormItem>
                {getFieldDecorator('accountNumber', {
                  rules: [
                    {
                      required: true,
                      message: 'Please enter your Account number',
                    },
                  ],
                })(
                  // <Input placeholder="Account Number" />
                  <AutoComplete
                    dataSource={optionsAccounts}
                    style={{ width: 600 }}
                    onBlur={inputValue => {
                      if (this.getAccount(accountList, inputValue)) {
                        this.props.form.setFieldsValue({
                          accountNumber: '',
                        });
                      }
                    }}
                    onChange={inputValue => {
                      this.getAccount(accountList, inputValue);
                    }}
                    placeholder="Account Number"
                    filterOption={(inputValue, option) =>
                      option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                    }
                  />
                )}
              </FormItem>
            )}
            <React.Fragment>
              {this.state.modelType == 'assign' && this.state.account != undefined ? (
                <Divider type="horizontal" />
              ) : null}
              <article className="article">
                <div className="row mt-3">
                  {(this.state.modelType == 'assign' || this.state.modelType == 'edit') &&
                  this.state.account != undefined ? (
                    <div className="col-lg-6 mb-2">
                      <article className="profile-card-v1 h-100">
                        <img
                          src={
                            this.state.account &&
                            environment.baseUrl +
                              'file/downloadImg/account/' +
                              this.state.account.id
                          }
                          onError={e => {
                            e.target.onerror = null;
                            e.target.src = profile_avatar;
                          }}
                          alt="Profile image"
                          width="150"
                        />

                        <h4>{this.state.account && this.state.account.holder}</h4>
                        <span>{this.state.account && this.state.account.accountNumber}</span>
                      </article>
                    </div>
                  ) : null}
                  {(this.state.modelType == 'assign' || this.state.modelType == 'edit') &&
                  this.state.account != undefined ? (
                    <div className="col-lg-6 mb-2">
                      <article className="profile-card-v1 h-100">
                        <FormItem>
                          {getFieldDecorator('cardNumber', {
                            rules: [
                              {
                                required: true,
                                message: 'Please enter your card number',
                              },
                            ],
                          })(
                            // (<Input placeholder="Serial Number" />)
                            <AutoComplete
                              allowClear
                              dataSource={optionsCards}
                              style={{ width: 200 }}
                              onBlur={inputValue => {
                                let keyCard = false;
                                cardList.map(card => {
                                  if (
                                    inputValue !== undefined &&
                                    card.id.toUpperCase() === inputValue.toUpperCase()
                                  ) {
                                    keyCard = true;
                                  }
                                });
                                if (!keyCard) {
                                  this.props.form.setFieldsValue({
                                    cardNumber: '',
                                  });
                                }
                              }}
                              placeholder="Card Number"
                              filterOption={(inputValue, option) =>
                                option.props.children
                                  .toUpperCase()
                                  .indexOf(inputValue.toUpperCase()) !== -1
                              }
                            />
                          )}
                        </FormItem>
                        <h4>buddi</h4>
                        <span>jenifer</span>
                      </article>
                    </div>
                  ) : null}
                </div>
              </article>
              <div className="row">
                {(this.state.modelType == 'assign' || this.state.modelType == 'edit') &&
                this.state.account != undefined ? (
                  <Button type="primary" className={footer} onClick={this.submit}>
                    Assign
                  </Button>
                ) : null}
              </div>
            </React.Fragment>
          </Form>
        </Modal>
      </div>
    );
  }
}
const WrappedData = Form.create()(Data);
const Assign = () => <WrappedData />;
export default Assign;
