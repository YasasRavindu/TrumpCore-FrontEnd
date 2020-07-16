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
  DatePicker,
  message,
  AutoComplete,
  Tooltip,
  Popconfirm,
  TreeSelect,
} from 'antd';

import { Redirect } from 'react-router-dom';
import axios from 'axios';

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
import getErrorMessage from 'constants/notification/message';
import STATUS from 'constants/notification/status';
import TREE_DATA from 'constants/common/treeData';
import profile_avatar from 'assets/images/profile_avatar.png';
import { REGEX } from 'constants/validation/regex';
// -------------------------------------------------------------------------

// -------------- ANT DESIGN -----------------------------------------------
const { Option } = Select;
const { Column } = Table;
const FormItem = Form.Item;
const Search = Input.Search;
// -------------------------------------------------------------------------

// -------------- CUSTOM ---------------------------------------------------
const dateFormat = 'YYYY-MM-DD';
const DATA = {
  Account: {
    URL: 'account/filterSearchPage',
    KEY_VALUE: 'accountNumber',
  },
  Card: {
    URL: 'card/filterSearchPage',
    KEY_VALUE: 'cardNo',
  },
};
// -------------------------------------------------------------------------

class Data extends React.Component {
  constructor(props) {
    super(props);

    this._isMounted = false;
    this.treeData = TREE_DATA.CARD_STATUS;

    this.state = {
      // Card Registry Search From Inputs
      // --------------------------------
      searchText: '',
      searchColumn: 'accountNumber',
      searchAssignDate: ['', ''],
      searchCardStatus: [],
      // --------------------------------

      // Pagination
      // --------------------------------
      pageSize: 10,
      pageNumber: 1,
      totalRecord: 0,
      // --------------------------------

      // AutoComplete
      // --------------------------------
      isAutoCompleteLoading: false,
      autoCompleteAccountTimer: null,
      autoCompleteCardTimer: null,
      keywordAccount: '',
      keywordCard: '',
      listAccount: [],
      listCard: [],
      // --------------------------------

      // Model
      // --------------------------------
      modelVisible: false,
      modelType: undefined,
      selectedAccount: undefined,
      selectedCard: undefined,
      // --------------------------------

      // Custom
      // --------------------------------
      cardRegistryListTable: [],
      loadingTable: false,
      cardRegistryId: undefined,
      // --------------------------------
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    this.loadTable();
  }

  loadTable = () => {
    this._isMounted &&
      this.setState({
        loadingTable: true,
      });
    axios
      .post(environment.baseUrl + 'cardRegistry/filterSearchPage', this.getReqBody(true))
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const cardRegistryList = response.data.content.map(record => {
          record.key = record.id;
          return record;
        });
        this._isMounted &&
          this.setState({
            cardRegistryListTable: cardRegistryList,
            loadingTable: false,
            totalRecord: response.data.pagination.totalRecords,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
        this._isMounted &&
          this.setState({
            loadingTable: false,
          });
      });
  };

  // ------------   For loadTable   -----------------------------------
  getReqBody = isPagination => {
    let {
      searchText,
      searchColumn,
      searchAssignDate,
      searchCardStatus,
      pageSize,
      pageNumber,
    } = this.state;

    let reqBody = {
      columnName: searchColumn,
      keyword: searchText,
      startDate: searchAssignDate[0],
      endDate: searchAssignDate[1],
      cardStatus: searchCardStatus,
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

  searchTextColumnHandler = v => {
    if (this.state.searchText === '') {
      this.setState({
        searchColumn: v,
      });
    } else {
      this.setFilterValue('searchColumn', v);
    }
  };

  searchDateHandler = (date, dateString) => {
    this.setFilterValue('searchAssignDate', dateString);
  };

  searchCardStatusHandler = v => {
    this.setFilterValue('searchCardStatus', v.length === this.treeData.length ? [] : v);
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
  // ------------------------------------------------------------------

  // ------------   AutoCompleteOnChange   ----------------------------
  loadAutoComplete = (inputName, inputValue) => {
    clearInterval(this.state[`searchAutoComplete${inputName}Timer`]);
    let intervalId = setInterval(() => this.loadAutoCompleteData(inputName, inputValue), 2000);
    this._isMounted &&
      this.setState({
        [`searchAutoComplete${inputName}Timer`]: intervalId,
      });
  };

  loadAutoCompleteData = (inputName, inputValue) => {
    clearInterval(this.state[`searchAutoComplete${inputName}Timer`]);
    axios
      .post(environment.baseUrl + DATA[inputName].URL, this.getSearchReqBody(inputName, inputValue))
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const recordList = response.data.content.map(record => {
          record.key = record.id;
          return record;
        });
        this._isMounted &&
          this.setState({
            [`list${inputName}`]: recordList,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  // ------------   For loadAutoCompleteData   ------------------------
  getSearchReqBody = (inputName, inputValue) => {
    if (inputName === 'Account') {
      let columnName = 'holder';
      if (REGEX.NUMBERS_ONLY.test(inputValue)) {
        columnName = 'accountNumber';
      }
      return {
        columnName: columnName,
        keyword: inputValue,
        cardAssigned: '0',
        accountStatus: ['active'],
        pageNumber: 1,
        pageSize: 20,
      };
    } else {
      return {
        keyword: inputValue,
        cardBatchType: 'debit',
        cardStatus: ['inactive'],
        pageSize: 30,
      };
    }
  };

  // ------------   autoCompleteInputOnSelect   ----------------
  autoCompleteInputValidate = (inputName, inputValue) => {
    let selectedRecord = undefined;
    let key = DATA[inputName].KEY_VALUE;
    this.state[`list${inputName}`].map(record => {
      if (
        inputValue !== undefined &&
        (record.id.toUpperCase() === inputValue.toUpperCase() ||
          record[key].toUpperCase() === inputValue.toUpperCase())
      ) {
        selectedRecord = record;
      }
    });

    if (selectedRecord === undefined) {
      this.loadAutoCompleteData(inputName, '');
    }
    this._isMounted &&
      this.setState({
        [`selected${inputName}`]: selectedRecord,
      });
    this.props.form.setFieldsValue({
      [key]: selectedRecord === undefined ? '' : selectedRecord[key],
    });
  };

  // ------------   accountInputOnBlur   -----------------------
  autoCompleteInputOnBlur = (inputName, inputValue) => {
    if (
      this.state[`selected${inputName}`] === undefined ||
      (this.state[`selected${inputName}`].id !== inputValue &&
        this.state[`selected${inputName}`][DATA[inputName].KEY_VALUE] !== inputValue)
    ) {
      this.autoCompleteInputValidate(inputName, inputValue);
    }
  };

  // -----------------------------------------------------------

  handleStatus = (id, value) => {
    axios
      .put(environment.baseUrl + 'card/update', {
        id: id,
        status: value,
      })
      .then(response => {
        // console.log('------------------- response - ', response.data.content);
        this.loadTable();
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  // ------------   Card Re-Assign Handler   --------------------------
  handleUpdate = (id, selectedAccount) => {
    if (id) {
      this._isMounted &&
        this.setState(
          {
            cardRegistryId: id,
            selectedAccount: selectedAccount,
          },
          () => {
            this.showModel('RE_ASSIGN');
          }
        );
    }
  };

  showModel = type => {
    if (type === 'ASSIGN') {
      this.loadAutoCompleteData('Account', '');
    }
    this.loadAutoCompleteData('Card', '');
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

  // ------------   Assign or Re-Assign   -----------------------------
  handleSubmit = () => {
    const { selectedAccount, selectedCard, modelType, cardRegistryId } = this.state;

    if (
      modelType !== undefined &&
      selectedAccount !== undefined &&
      selectedCard !== undefined &&
      (modelType === 'ASSIGN' || (modelType === 'RE_ASSIGN' && cardRegistryId !== undefined))
    ) {
      axios({
        method: modelType === 'ASSIGN' ? 'post' : 'put',
        url:
          environment.baseUrl +
          (modelType === 'ASSIGN' ? 'cardRegistry' : 'cardRegistry/' + cardRegistryId + '/card'),
        data: {
          account: {
            id: selectedAccount.id,
          },
          card: {
            id: selectedCard.id,
          },
        },
      })
        .then(response => {
          message.success('Card successfully assigned to the account');
          console.log('------------------- response - ', response);
          this.loadTable();
          this.props.form.resetFields();
          this._isMounted &&
            this.setState({
              selectedAccount: undefined,
              selectedCard: undefined,
              modelType: undefined,
              modelVisible: false,
            });
        })
        .catch(error => {
          message.error(getErrorMessage(error, 'CARD_ASSIGN_ERROR'));
          console.log('------------------- error - ', error);
        });
    } else {
      message.error('Something wrong with card assign!');
    }
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
      return <Redirect to={UNAUTHORIZED_ACCESS_EXCEPTION_ROUTE} />;
    }
    // -------------------------------------------------------------------------------

    // -------------------------------------------------------------------------------
    const { getFieldDecorator } = this.props.form;
    const { treeData } = this;
    const {
      cardRegistryListTable,
      loadingTable,
      totalRecord,
      pageNumber,
      searchCardStatus,
      listCard,
      listAccount,
    } = this.state;

    const optionsCards = listCard.map(card => (
      <Option key={card.id} value={card.id}>
        {card.cardNo}
      </Option>
    ));

    const optionsAccounts = listAccount.map(account => (
      <Option key={account.id} value={account.id}>
        {`${account.accountNumber} - ${account.holder}`}
      </Option>
    ));

    const selectAfter = (
      <Select
        defaultValue="accountNumber"
        className="select-after"
        onChange={this.searchTextColumnHandler}
      >
        <Option value="accountNumber">Acc No</Option>
        <Option value="holder">Holder</Option>
        <Option value="cardNo">Card No</Option>
      </Select>
    );
    // -------------------------------------------------------------------------------

    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div key="1">
            <div className="box box-default">
              <div className="box-header custom_header">
                Card Management
                {checkAuthority(viewAuthorities, USER_AUTHORITY_CODE.CARD_ASSIGN_ASSIGN) && (
                  <Button
                    type="primary"
                    shape="round"
                    icon="plus"
                    onClick={() => this.showModel('ASSIGN')}
                    className="float-right ml-1 mt-2"
                  >
                    Assign
                  </Button>
                )}
                <Divider type="horizontal" className="custom_divider" />
              </div>
              <div className="box-body">
                <Form>
                  <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                    <Col xs={24} sm={12} md={12} lg={8}>
                      <FormItem label="Search">
                        <Search
                          placeholder="Search Here..."
                          onChange={this.searchTextHandler}
                          addonAfter={selectAfter}
                        />
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
                          value={searchCardStatus}
                          onChange={this.searchCardStatusHandler}
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
                  {/* ------------------------- Card Registry Table -------------------------------------- */}
                  <Table
                    dataSource={cardRegistryListTable}
                    loading={loadingTable}
                    scroll={{ x: 1100, y: 350 }}
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
                                    </>
                                  )}
                                {checkAuthority(
                                  viewAuthorities,
                                  USER_AUTHORITY_CODE.CARD_ASSIGN_CANCEL
                                ) && (
                                  <Popconfirm
                                    title="Are you sure you want to remove the assignment of account?"
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
                                  onClick={() => this.handleUpdate(record.id, record.account)}
                                  type="edit"
                                />
                              </Tooltip>
                            )}

                          {record.card.status &&
                            record.card.status === 'PENDING' &&
                            checkAuthority(
                              viewAuthorities,
                              USER_AUTHORITY_CODE.CARD_ASSIGN_ACTIVE
                            ) && (
                              <Popconfirm
                                title="Are you sure you want to Active this card?"
                                onConfirm={() => this.handleStatus(record.card.id, 'ACTIVE')}
                                okText="Yes"
                                cancelText="No"
                              >
                                <Tooltip title="Active Card">
                                  <Icon type="check-circle-o" />
                                </Tooltip>
                              </Popconfirm>
                            )}
                        </span>
                      )}
                    />
                  </Table>
                  {/* ------------------------------------------------------------------------------------ */}
                </article>
              </div>
            </div>
          </div>
        </QueueAnim>

        <div>
          <Modal
            title="Card Assign"
            width="350px"
            visible={this.state.modelVisible}
            onOk={this.handleSubmit}
            onCancel={this.handleModelCancel}
            footer={[
              <Button key="cancel" onClick={this.handleModelCancel}>
                Cancel
              </Button>,
              <Button
                key="submit"
                type="primary"
                disabled={this.state.selectedCard === undefined}
                onClick={this.handleSubmit}
              >
                Assign
              </Button>,
            ]}
          >
            {this.state.modelType == 'ASSIGN' && (
              <FormItem label="Search Account">
                {getFieldDecorator('accountNumber', {
                  rules: [
                    {
                      message: 'Please select an Account',
                    },
                  ],
                })(
                  <AutoComplete
                    allowClear
                    dataSource={optionsAccounts}
                    style={{ width: '100%' }}
                    onBlur={inputValue => {
                      this.autoCompleteInputOnBlur('Account', inputValue);
                    }}
                    onChange={inputValue => {
                      this.loadAutoComplete('Account', inputValue);
                    }}
                    onSelect={inputValue => {
                      this.autoCompleteInputValidate('Account', inputValue);
                    }}
                    placeholder="Search Account Number or Holder Name"
                  />
                )}
              </FormItem>
            )}

            {this.state.selectedAccount != undefined && (
              <>
                <article className="article">
                  <FormItem label="Account">
                    <article className="profile-card-v1">
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
                  </FormItem>
                </article>
                <FormItem label="Card">
                  {getFieldDecorator('cardNo', {
                    rules: [
                      {
                        message: 'Please select a Card',
                      },
                    ],
                  })(
                    <AutoComplete
                      allowClear
                      dataSource={optionsCards}
                      style={{ width: '100%' }}
                      onBlur={inputValue => {
                        this.autoCompleteInputOnBlur('Card', inputValue);
                      }}
                      onChange={inputValue => {
                        this.loadAutoComplete('Card', inputValue);
                      }}
                      onSelect={inputValue => {
                        this.autoCompleteInputValidate('Card', inputValue);
                      }}
                      placeholder="Card Number"
                    />
                  )}
                </FormItem>
              </>
            )}
          </Modal>
        </div>
      </div>
    );
  }
}
const WrappedData = Form.create()(Data);
const Assign = () => <WrappedData />;
export default Assign;
