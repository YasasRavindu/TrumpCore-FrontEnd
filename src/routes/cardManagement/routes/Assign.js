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
  DEFAULT_EXCEPTION_ROUTE,
  USER_AUTHORITY_CODE,
  getActiveAuthorities,
  checkAuthority,
} from 'constants/authority/authority';
// -------------------------------------------------------------------------

import { environment, commonUrl } from '../../../environments';
import axios from 'axios';
import getErrorMessage from 'constants/notification/message';
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
      filteredCardList: [],
      assignList: [],
      filteredAssignedList: [],
      accountList: [],
      filteredAccountList: [],
      searchDate: ['', ''],
      searchText: '',
      checkedID: '',
      modelVisible: false,
      modelType: undefined,
      selectedAccount: undefined,
      selectedCard: undefined,
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
            filteredCardList: cardList.slice(0, 100),
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
            filteredAccountList: response.data.content.slice(0, 100),
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

  handleUpdate = (id, selectedCard, selectedAccount) => {
    if (id) {
      this._isMounted &&
        this.setState(
          {
            checkedID: id,
            selectedAccount: selectedAccount,
            selectedCard: selectedCard,
          },
          () => {
            this.showModel('edit');
          }
        );
    }
  };

  showModel = type => {
    this._isMounted &&
      this.setState({
        modelVisible: true,
        modelType: type,
      });
  };

  handleModelCancel = e => {
    this.props.form.resetFields();
    this._isMounted &&
      this.setState({
        modelVisible: false,
        selectedAccount: undefined,
        selectedCard: undefined,
      });
  };

  handleSubmit = type => {
    if (type == 'assign') {
      const { selectedAccount, selectedCard } = this.state;
      this.props.form.validateFields(['cardNumber', 'accountNumber'], (err, values) => {
        if (!err) {
          console.log(values);
          axios
            .post(environment.baseUrl + 'cardRegistry', {
              account: {
                id: selectedAccount.id,
              },
              card: {
                id: selectedCard.id,
              },
            })
            .then(response => {
              message.success('Card Successfully Assign to Account');
              console.log('------------------- response - ', response);
              this.loadData();
              this.props.form.resetFields();
              this._isMounted &&
                this.setState({
                  selectedAccount: undefined,
                  selectedCard: undefined,
                  modelVisible: false,
                });
            })
            .catch(error => {
              message.error(getErrorMessage(error, 'CARD_ASSIGN_ERROR'));
              console.log('------------------- error - ', error);
            });
        }
      });
    } else if (type == 'edit') {
      const { checkedID, selectedAccount, selectedCard } = this.state;
      this.props.form.validateFields(['cardNumber'], (err, values) => {
        if (!err) {
          axios
            .put(environment.baseUrl + 'cardRegistry/' + checkedID + '/card', {
              account: {
                id: selectedAccount.id,
              },
              card: {
                id: selectedCard.id,
              },
            })
            .then(response => {
              message.success('Card Successfully Assign to Account');
              console.log('------------------- response - ', response);
              this.loadData();
              this.props.form.resetFields();
              this._isMounted &&
                this.setState({
                  checkedID: '',
                  selectedAccount: undefined,
                  selectedCard: undefined,
                  modelVisible: false,
                });
            })
            .catch(error => {
              message.error(getErrorMessage(error, 'CARD_ASSIGN_ERROR'));
              console.log('------------------- error - ', error);
            });
        }
      });
    }
  };

  showAccountDetail = account => {
    if (
      this.state.selectedAccount === null ||
      this.state.selectedAccount === undefined ||
      this.state.selectedAccount.id !== account.id ||
      !this.state.displayDetail
    ) {
      this._isMounted &&
        this.setState({
          account: account,
          // displayDetail: true,
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

  updateCardList = input => {
    let cardList;
    if (input === '' || input === undefined) {
      cardList = this.state.cardList;
    } else {
      cardList = this.state.cardList.filter(card => {
        return card.cardNo.indexOf(input) !== -1;
      });
    }
    this.setState({
      filteredCardList: cardList.slice(0, 100),
    });
  };

  setCard = inputValue => {
    let selectedCard = undefined;
    this.state.cardList.map(card => {
      if (
        inputValue !== undefined &&
        (card.id.toUpperCase() === inputValue.toUpperCase() ||
          card.cardNo.toUpperCase() === inputValue.toUpperCase())
      ) {
        selectedCard = card;
      }
    });
    if (selectedCard === undefined) {
      this.updateCardList('');
    }
    this.setState({
      selectedCard: selectedCard,
    });
    this.props.form.setFieldsValue({
      cardNumber: selectedCard === undefined ? '' : selectedCard.cardNo,
    });
  };

  updateAccountList = input => {
    let accountList;
    if (input === '' || input === undefined) {
      accountList = this.state.accountList;
    } else {
      accountList = this.state.accountList.filter(account => {
        return account.accountNumber.indexOf(input) !== -1 || account.holder.indexOf(input) !== -1;
      });
    }
    this.setState({
      filteredAccountList: accountList.slice(0, 100),
    });
  };

  setAccount = inputValue => {
    let selectedAccount = undefined;
    this.state.accountList.map(account => {
      if (
        inputValue !== undefined &&
        (account.id.toUpperCase() === inputValue.toUpperCase() ||
          account.accountNumber.toUpperCase() === inputValue.toUpperCase() ||
          inputValue.toUpperCase().includes(account.accountNumber.toUpperCase()))
      ) {
        selectedAccount = account;
        // this.showAccountDetail(account);
      }
    });
    if (selectedAccount === undefined) {
      this.updateAccountList('');
    }
    this.setState({
      selectedAccount: selectedAccount,
    });
    this.props.form.setFieldsValue({
      accountNumber:
        selectedAccount === undefined
          ? ''
          : `${selectedAccount.accountNumber} - ${selectedAccount.holder}`,
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
      return <Redirect to={DEFAULT_EXCEPTION_ROUTE} />;
    }
    // -------------------------------------------------------------------------------

    const { getFieldDecorator } = this.props.form;
    const {
      filteredAccountList,
      filteredCardList,
      filteredAssignedList,
    } = this.state;

    const optionsCards = filteredCardList.map(card => (
      <Option key={card.id} value={card.id}>
        {card.cardNo}
      </Option>
    ));

    const optionsAccounts = filteredAccountList.map(account => (
      <Option key={account.id} value={account.id}>
        {`${account.accountNumber} - ${account.holder}`}
      </Option>
    ));

    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div key="1">
            <div className="box box-default">
              {checkAuthority(viewAuthorities, USER_AUTHORITY_CODE.CARD_ASSIGN_ASSIGN) && (
                <div className="box-header">
                  Card Management
                  <Button
                    type="primary"
                    shape="round"
                    icon="plus"
                    onClick={() => this.showModel('assign')}
                    className="float-right ml-1"
                  >
                    Assign
                  </Button>
                </div>
              )}

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
                                    this.handleUpdate(record.id, record.card, record.account)
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
              </div>
            </div>
          </div>
        </QueueAnim>
        <Modal
          visible={this.state.modelVisible}
          onCancel={this.handleModelCancel}
          //onOk={this.handleSubmit(this.state.modelType)}
          footer={[
            (this.state.modelType == 'assign' || this.state.modelType == 'edit') &&
            this.state.selectedAccount != undefined ? (
              <Button
                key="submit"
                type="primary"
                onClick={() => this.handleSubmit(this.state.modelType)}
              >
                Assign
              </Button>
            ) : null,
          ]}
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
                  <AutoComplete
                    dataSource={optionsAccounts}
                    style={{ width: 600 }}
                    placeholder="Account Number"
                    onBlur={inputValue => {
                      this.setAccount(inputValue);
                    }}
                    onChange={inputValue => {
                      this.updateAccountList(inputValue);
                    }}
                    onSelect={inputValue => {
                      this.setAccount(inputValue);
                    }}
                  />
                )}
              </FormItem>
            )}
            <React.Fragment>
              {this.state.modelType == 'assign' && this.state.selectedAccount != undefined ? (
                <Divider type="horizontal" />
              ) : null}
              <article className="article">
                <div className="row mt-3">
                  {(this.state.modelType == 'assign' || this.state.modelType == 'edit') &&
                  this.state.selectedAccount != undefined ? (
                    <div className="col-lg-6 mb-2">
                      <article className="profile-card-v1 h-100">
                        <img
                          src={
                            this.state.selectedAccount &&
                            environment.baseUrl +
                              'file/downloadImg/account/' +
                              this.state.selectedAccount.id
                          }
                          onError={e => {
                            e.target.onerror = null;
                            e.target.src = profile_avatar;
                          }}
                          alt="Profile image"
                          width="150"
                        />

                        <h4>{this.state.selectedAccount && this.state.selectedAccount.holder}</h4>
                        <span>
                          {this.state.selectedAccount && this.state.selectedAccount.accountNumber}
                        </span>
                      </article>
                    </div>
                  ) : null}
                  {(this.state.modelType == 'assign' || this.state.modelType == 'edit') &&
                  this.state.selectedAccount != undefined ? (
                    <div className="col-lg-6 mb-2">
                      <article className="profile-card-v1 h-100">
                        {this.state.modelType ? (
                          <Tag color="green" className="float-right">
                            Not Assign
                          </Tag>
                        ) : (
                          <Tag color="purple" className="float-right">
                            Assign
                          </Tag>
                        )}

                        <FormItem className="mt-4">
                          {getFieldDecorator('cardNumber', {
                            rules: [
                              {
                                required: true,
                                message: 'Please enter your card number',
                              },
                            ],
                          })(
                            <AutoComplete
                              allowClear
                              dataSource={optionsCards}
                              style={{ width: 300 }}
                              onBlur={inputValue => {
                                this.setCard(inputValue);
                              }}
                              onChange={inputValue => {
                                this.updateCardList(inputValue);
                              }}
                              onSelect={inputValue => {
                                this.setCard(inputValue);
                              }}
                              placeholder="Card Number"
                            />
                          )}
                        </FormItem>
                      </article>
                    </div>
                  ) : null}
                </div>
              </article>
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
