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
  Tabs,
  Checkbox,
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

const { TabPane } = Tabs;

const FormItem = Form.Item;
const { Option } = Select;
const { Column, ColumnGroup } = Table;

class Data extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      sections: [],
      activeTab: '0',
      currentRole: undefined,

      visible: false,
      userRole: [],

      checkedList: [],
      indeterminate: false,
      checkAll: false,
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    this.loadTable();
    axios
      .get(environment.baseUrl + 'authority')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        let index = '0';
        const sectionList = response.data.content.map(section => {
          section.key = `${index}`;
          index++;
          section.plainOptions = section.authorities.map(authority => {
            return authority.id;
          });
          section.checkedList = [];
          section.indeterminate = false;
          section.checkAll = false;
          return section;
        });
        this._isMounted &&
          this.setState({
            sections: sectionList,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  }

  loadTable = () => {
    axios
      .get(environment.baseUrl + 'role')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const userRole = response.data.content.map(role => {
          role.key = role.id;
          return role;
        });
        this._isMounted &&
          this.setState({
            userRole: userRole,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  getRoleView = id => {
    axios
      .get(environment.baseUrl + 'role/' + id)
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        let role = response.data.content;
        let sections = this.state.sections;
        let groupAuthorities = {};

        role.authorities.map(authority => {
          if (groupAuthorities[authority.section.id]) {
            groupAuthorities[authority.section.id].push(authority.id);
          } else {
            groupAuthorities[authority.section.id] = [authority.id];
          }
        });

        sections.map(section => {
          if (groupAuthorities[section.id]) {
            section.checkedList = groupAuthorities[section.id];
            section.indeterminate =
              !!groupAuthorities[section.id].length &&
              groupAuthorities[section.id].length < section.plainOptions.length;
            section.checkAll = groupAuthorities[section.id].length === section.plainOptions.length;
          }
        });

        this.props.form.setFieldsValue({
          roleName: role.name,
        });

        this._isMounted &&
          this.setState({
            sections: sections,
            currentRole: role,
            visible: true,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  toggleModal = id => {
    if (this.state.visible) {
      this.resetCheckedList();
    } else {
      if (id) {
        this.getRoleView(id);
      } else {
        this._isMounted &&
          this.setState({
            visible: true,
          });
      }
    }
  };

  onTabChange = key => {
    this._isMounted && this.setState({ activeTab: key });
  };

  onCheckAllChange = e => {
    let sections = this.state.sections;
    let checkedList = this.state.checkedList;
    let event = e.target;
    let tab = event.name;

    sections[tab].checkedList = event.checked ? sections[tab].plainOptions : [];
    sections[tab].indeterminate = false;
    sections[tab].checkAll = event.checked;

    this._isMounted &&
      this.setState({
        sections: sections,
      });
  };

  onChange = checkedValues => {
    let tab = this.state.activeTab;
    tab = tab === '' ? 0 : tab;
    let sections = this.state.sections;

    sections[tab].checkedList = checkedValues;
    sections[tab].indeterminate =
      !!checkedValues.length && checkedValues.length < sections[tab].plainOptions.length;
    sections[tab].checkAll = checkedValues.length === sections[tab].plainOptions.length;

    this._isMounted &&
      this.setState({
        sections: sections,
      });
  };

  getCheckedList = () => {
    let sections = this.state.sections;
    let checkedList = [];

    sections.map(section => {
      section.checkedList.map(id => {
        if (!checkedList.includes(id)) {
          checkedList.push({
            id: id,
          });
        }
      });
    });

    return checkedList;
  };

  resetCheckedList = () => {
    let sections = this.state.sections;

    sections.map(section => {
      section.checkedList = [];
      section.indeterminate = false;
      section.checkAll = false;

      // let displayAuthorities = [];
      // let commonAuthorities = [];

      // section.map(authority => {
      //   if (authority.type === 'DISPLAY') {
      //     displayAuthorities.push(authority);
      //   } else if (authority.type === 'COMMON') {
      //   }
      // });
    });

    this._isMounted &&
      this.setState({
        sections: sections,
        visible: false,
        activeTab: '0',
        currentRole: undefined,
      });
  };

  roleDelete = () => {};

  submit = e => {
    e.preventDefault();
    const checkedList = this.getCheckedList();
    if (checkedList.length > 0) {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          let role = this.state.currentRole;
          let url = this.state.currentRole ? `/${role.id}` : '';

          axios({
            method: role ? 'put' : 'post',
            url: environment.baseUrl + 'role' + url,
            data: {
              name: values.roleName,
              authorities: checkedList,
            },
          })
            .then(response => {
              message.success(
                role ? 'User Role Successfully Updated' : 'User Role Successfully Created'
              );
              console.log('------------------- response - ', response);
              this.toggleModal(undefined);
              this.loadTable();
              this.props.form.resetFields();
            })
            .catch(error => {
              this.errorHandler(error);
              console.log('------------------- error - ', error);
            });
        }
      });
    } else {
      message.error('There are no selected Authorities!');
    }
  };

  removeRole = id => {
    axios
      .delete(environment.baseUrl + 'role/' + id)
      .then(response => {
        message.success('Role successfully deleted!');
        // console.log('------------------- response - ', response.data.content);
        this.loadTable();
      })
      .catch(error => {
        this.errorHandler(error);
        console.log('------------------- error - ', error);
      });
  };

  errorHandler = error => {
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
      msg = CUSTOM_MESSAGE.USER_ROLE_ERROR[errorCode];
      if (msg === undefined) {
        msg = CUSTOM_MESSAGE.USER_ROLE_ERROR['defaultError'];
      }
    } else {
      msg = CUSTOM_MESSAGE.USER_ROLE_ERROR['defaultError'];
    }
    message.error(msg);
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    // -------------- GET ACTIVE AUTHORITIES -----------------------------------------
    const viewAuthorities = getActiveAuthorities(USER_AUTHORITY_CODE.USER_MANAGEMENT_ROLES);
    // -------------------------------------------------------------------------------

    // -------------- IF UNAUTHORIZED ------------------------------------------------
    if (viewAuthorities === 'UNAUTHORIZED') {
      return <Redirect to={DEFAULT_REDIRECT_ROUTE} />;
    }
    // -------------------------------------------------------------------------------

    const { getFieldDecorator } = this.props.form;
    const { userRole, sections, visible, activeTab, currentRole } = this.state;
    return (
      <>
        <Modal
          visible={visible}
          onCancel={() => this.toggleModal(undefined)}
          footer={null}
          className="custom-modal-v1"
        >
          <div className="box box-default">
            <div className="box-header">{currentRole ? `Update Role` : `Create Role`}</div>
            <div className="box-body">
              <Form>
                <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                  <Col span={6}>
                    <FormItem>
                      {getFieldDecorator('roleName', {
                        rules: [
                          {
                            required: true,
                            message: 'Please enter role name',
                          },
                        ],
                      })(<Input placeholder="Role Name" />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={24} order={4}>
                    <Tabs animated={true} onChange={this.onTabChange} activeKey={activeTab}>
                      {sections &&
                        sections.map(section => {
                          let displayAuthorities = [];
                          let commonAuthorities = [];
                          return (
                            <TabPane
                              key={section.key}
                              tab={
                                <span>
                                  {/* <Icon type="message" /> */}
                                  {section.name}
                                </span>
                              }
                            >
                              <Row>
                                <Col span={24}>
                                  <Checkbox
                                    name={section.key}
                                    indeterminate={section.indeterminate}
                                    onChange={this.onCheckAllChange}
                                    checked={section.checkAll}
                                  >
                                    Select All
                                  </Checkbox>
                                  <div className="divider my-3 divider-solid"></div>
                                </Col>
                              </Row>
                              <Row>
                                <Checkbox.Group
                                  name={section.key}
                                  style={{ width: '100%' }}
                                  defaultValue={section.checkedList}
                                  onChange={this.onChange}
                                  value={section.checkedList}
                                >
                                  <>
                                    {section.authorities.map(authority => {
                                      let authorityJSX = (
                                        <Col span={8} key={authority.id}>
                                          <Checkbox value={authority.id}>{authority.name}</Checkbox>
                                        </Col>
                                      );

                                      if (authority.type === 'DISPLAY') {
                                        displayAuthorities.push(authorityJSX);
                                      } else if (authority.type === 'COMMON') {
                                        commonAuthorities.push(authorityJSX);
                                      }
                                    })}
                                    {
                                      <>
                                        <Row>
                                          {displayAuthorities.length > 0 && (
                                            <>
                                              <h4 className="section-header">
                                                Display Authorities
                                              </h4>
                                              {displayAuthorities}
                                            </>
                                          )}
                                        </Row>
                                        <Row>
                                          {commonAuthorities.length > 0 && (
                                            <>
                                              <div className="divider my-3 divider-solid"></div>
                                              <h4 className="section-header">Common Authorities</h4>
                                              {commonAuthorities}
                                            </>
                                          )}
                                        </Row>
                                      </>
                                    }
                                  </>
                                  {/* <Row>
                                    {section.authorities.map(authority => {
                                      return (
                                        <Col span={8} key={authority.id}>
                                          <Checkbox value={authority.id}>{authority.name}</Checkbox>
                                        </Col>
                                      );
                                    })}
                                  </Row> */}
                                </Checkbox.Group>
                              </Row>
                            </TabPane>
                          );
                        })}
                    </Tabs>
                  </Col>
                </Row>
                <Row>
                  <Col span={24} order={4}>
                    <Button type="primary" className="float-right" onClick={this.submit}>
                      Submit
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
        </Modal>

        <div className="container-fluid no-breadcrumb container-mw chapter">
          <QueueAnim type="bottom" className="ui-animate">
            <div key="2">
              <div className="box box-default">
                {/* <div className="box-header">Role</div> */}
                <div className="box-header">
                  <Row className="mt-4">
                    <Col span={12}>
                      <h4>Role</h4>
                    </Col>
                    <Col span={12}>
                      {checkAuthority(
                        viewAuthorities,
                        USER_AUTHORITY_CODE.USER_MANAGEMENT_ROLES_CREATE
                      ) && (
                        <Button
                          onClick={() => this.toggleModal(undefined)}
                          style={{ float: 'right' }}
                        >
                          <Icon type="plus" />
                          New Role
                        </Button>
                      )}
                    </Col>
                  </Row>
                </div>
                <div className="box-body">
                  {/* <Form>
                  <Row gutter={24}>
                    <Col span={8} order={3}>
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
                </Form> */}

                  <article className="article mt-2">
                    <Table dataSource={userRole}>
                      <Column title="Role Name" dataIndex="name" key="roleName" />
                      <Column
                        title="Action"
                        key="action"
                        render={(text, record) => (
                          <span>
                            {checkAuthority(
                              viewAuthorities,
                              USER_AUTHORITY_CODE.USER_MANAGEMENT_ROLES_UPDATE
                            ) && (
                              <Tooltip title="Edit" className="mr-3">
                                <Icon onClick={() => this.toggleModal(record.id)} type="edit" />
                              </Tooltip>
                            )}
                            {checkAuthority(
                              viewAuthorities,
                              USER_AUTHORITY_CODE.USER_MANAGEMENT_ROLES_REMOVE
                            ) && (
                              <Popconfirm
                                title="Are you sure, you want delete this Role?"
                                onConfirm={() => this.removeRole(record.id)}
                                okText="Yes"
                                cancelText="No"
                              >
                                <Tooltip title="Delete">
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
      </>
    );
  }
}

const WrappedData = Form.create()(Data);

const roles = () => <WrappedData />;

export default roles;
