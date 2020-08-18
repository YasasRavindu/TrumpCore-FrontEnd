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
  Upload,
  Tooltip,
  Spin,
  Switch,
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

import { environment, commonUrl } from 'environments';
import axios from 'axios';
import moment from 'moment';
import Password from 'antd/lib/input/Password';
import getErrorMessage from 'constants/notification/message';
import STATUS from 'constants/notification/status';

const FormItem = Form.Item;
const { Option } = Select;
const { Column, ColumnGroup } = Table;
const confirm = Modal.confirm;

function truncate(str) {
  return str !== undefined && str !== '' && str.length > 25 ? str.substring(0, 25) + '...' : str;
}
const timeList = [
  { label: 'Minute', value: 'MIN' },
  { label: 'Hour', value: 'H' },
  { label: 'Day', value: 'D' },
];
const sizeList = [
  { label: 'MB', value: 'MB' },
  { label: 'GB', value: 'GB' },
];

class Data extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      mockPackList: [],
      visible: false,
      currentRecord: undefined,
      selectedFile: '',
      loaderForm: false,
      fileUploadError: null,
      isUpdate: false,
      myValidateHelp: '',
      myValidateStatus: '',
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    this.loadTable();
  }

  loadTable = () => {
    axios
      .get(environment.baseUrl + 'moaPack')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const mockPackList = response.data.content.filter(pack => {
          pack.key = pack.id;
          return pack;
        });
        this._isMounted &&
          this.setState({
            mockPackList: mockPackList,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };
  selectHandle = e => {
    console.log('--------done');
    this._isMounted &&
      this.setState({
        myValidateHelp: '',
        myValidateStatus: '',
      });
  };

  // toggleModal = record => {
  //   if (record) {
  //     this._isMounted &&
  //       this.setState({
  //         currentRecord: record,
  //         visible: true,
  //       });
  //   } else {
  //     this._isMounted &&
  //       this.setState({
  //         visible: false,
  //         currentRecord: undefined,
  //       });
  //   }
  // };

  // handleFileUpload = info => {
  //   console.log(info);
  //   if (
  //     info.file.size > 0 &&
  //     info.file.name
  //       .split('.')
  //       .pop()
  //       .toLowerCase() === 'apk'
  //   ) {
  //     this._isMounted &&
  //       this.setState({
  //         selectedFile: info.file,
  //         fileUploadError: null,
  //       });
  //   } else {
  //     message.error('Invalid file format, file upload allow only .apk !');
  //   }
  // };

  // handleFileRemove = () => {
  //   this.setState({ selectedFile: '' });
  // };

  submit = e => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        axios
          .post(environment.baseUrl + 'moaPack', {
            name: values.name,
            code: values.code,
            description: values.description,
            onNet: values.onNet,
            onNetType: values.onNetType,
            offNet: values.offNet,
            offNetType: values.offNetType,
            sms: values.sms,
            data: values.data,
            dataType: values.dataType,
            price: values.price,
            validPeriod: values.validPeriod,
            validPeriodType: values.validPeriodType,
            active: values.active,
          })
          .then(response => {
            console.log('------------------- response - ', response.data.content);
            message.success('Successfully submitted!');
            this.loadTable();
            this.clearFormValues();
            this._isMounted &&
              this.setState({
                myValidateHelp: '',
                myValidateStatus: '',
              });
          })
          .catch(error => {
            console.log('------------------- error - ', error);
            message.error('Something wrong!');
          });
      } else {
        console.log(err);
        if (err.onNet || err.offNet || err.validPeriod) {
          this._isMounted &&
            this.setState({
              myValidateHelp: 'Please enter values',
              myValidateStatus: 'error',
            });
        }
      }
    });
  };

  // setFormValues = record => {
  //   this.props.form.setFieldsValue({
  //     versionNo: record.versionNo,
  //     versionName: record.versionName,
  //   });
  //   this._isMounted &&
  //     this.setState({
  //       fileUploadError: null,
  //       isUpdate: true,
  //       currentRecord: record,
  //       selectedFile: { name: record.ftpPath.split('/').pop(), isDefaultValue: true },
  //     });
  // };

  clearFormValues = () => {
    this.props.form.resetFields();
  };

  // checkFormStatus = record => {
  //   let current = this;
  //   if (
  //     this.props.form.getFieldValue('versionNo') !== undefined ||
  //     this.props.form.getFieldValue('versionName') !== undefined ||
  //     this.state.selectedFile !== ''
  //   ) {
  //     confirm({
  //       title: 'Do you Want to continue?',
  //       content: 'Continuing this process will be lost your current form data.',
  //       onOk() {
  //         current.setFormValues(record);
  //       },
  //       onCancel() {},
  //     });
  //   } else {
  //     this.setFormValues(record);
  //   }
  // };

  // handleStatus = id => {
  //   axios
  //     .put(environment.baseUrl + 'versionManagement/status/' + id)
  //     .then(response => {
  //       console.log('------------------- response - ', response.data.content);
  //       message.success('Device Version Status Successfully Changed.');
  //       this.loadTable();
  //     })
  //     .catch(error => {
  //       this.showErrorMsg(error);
  //       console.log('------------------- error - ', error);
  //     });
  // };

  // showErrorMsg = error => {
  //   message.error(getErrorMessage(error, 'DEVICE_VERSION_MANAGEMENT_ERROR'));
  // };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    // -------------- GET ACTIVE AUTHORITIES -----------------------------------------
    const viewAuthorities = getActiveAuthorities(USER_AUTHORITY_CODE.POS_DEVICE_VERSION_MANAGEMENT);
    // -------------------------------------------------------------------------------

    // -------------- IF UNAUTHORIZED ------------------------------------------------
    if (viewAuthorities === 'UNAUTHORIZED') {
      return <Redirect to={UNAUTHORIZED_ACCESS_EXCEPTION_ROUTE} />;
    }
    // -------------------------------------------------------------------------------

    const { getFieldDecorator } = this.props.form;
    const {
      visible,
      mockPackList,
      currentRecord,
      selectedFile,
      myValidateHelp,
      myValidateStatus,
    } = this.state;

    // const uploadButton = (
    //   <Button
    //     // type="primary"
    //     // shape="round"
    //     icon="upload"
    //     className="float-right ml-1 mt-1"
    //   >
    //     Upload
    //   </Button>
    // );

    // const fileNameTag = (
    //   <Tag closable onClose={() => this.handleFileRemove()} className="p-1">
    //     {truncate(selectedFile.name)}
    //   </Tag>
    // );

    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div key="1">
            <div className="box box-default mb-4">
              <div className="box-header">Package Management</div>
              <div className="box-body">
                <Spin spinning={this.state.loaderForm}>
                  <Form>
                    <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                      <Col span={6}>
                        <FormItem>
                          {getFieldDecorator('name', {
                            rules: [
                              {
                                required: true,
                                message: 'Please enter package name',
                              },
                            ],
                          })(<Input placeholder="Package Name" />)}
                        </FormItem>
                      </Col>
                      <Col span={6}>
                        <FormItem>
                          {getFieldDecorator('code', {
                            rules: [
                              {
                                required: true,
                                message: 'Please enter Code.',
                              },
                              ,
                            ],
                          })(<Input placeholder="Package Code" />)}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem>
                          {getFieldDecorator('description', {
                            rules: [
                              {
                                required: true,
                                message: 'Please enter description.',
                              },
                              ,
                            ],
                          })(<Input placeholder="Package description" />)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                      <Col span={8}>
                        <FormItem help={myValidateHelp} validateStatus={myValidateStatus}>
                          <Input.Group compact>
                            {getFieldDecorator('onNet', {
                              rules: [
                                {
                                  required: true,
                                  message: 'Please enter on network amount.',
                                },
                              ],
                            })(
                              <InputNumber
                                min={1}
                                max={100000}
                                style={{ width: '60%' }}
                                placeholder="On network amount"
                              />
                            )}
                            {getFieldDecorator('onNetType', {
                              initialValue: 'H',
                              rules: [
                                {
                                  required: true,
                                  message: 'Please enter on network type.',
                                },
                              ],
                            })(
                              <Select style={{ width: '40%' }}>
                                {timeList &&
                                  timeList.map(col => {
                                    return (
                                      <Option key={col.value} value={col.value}>
                                        {col.label}
                                      </Option>
                                    );
                                  })}
                              </Select>
                            )}
                          </Input.Group>
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem help={myValidateHelp} validateStatus={myValidateStatus}>
                          {/* https://github.com/ant-design/ant-design/issues/5790 */}
                          <Input.Group compact>
                            {getFieldDecorator('offNet', {
                              rules: [
                                {
                                  required: true,
                                  message: 'Please enter off network amount.',
                                },
                              ],
                            })(
                              <InputNumber
                                min={1}
                                max={100000}
                                style={{ width: '60%' }}
                                placeholder="Off network amount"
                                onChange={this.selectHandle}
                              />
                            )}
                            {getFieldDecorator('offNetType', {
                              initialValue: 'H',
                              rules: [
                                {
                                  required: true,
                                  message: 'Please enter off network type.',
                                },
                              ],
                            })(
                              <Select style={{ width: '40%' }}>
                                {timeList &&
                                  timeList.map(col => {
                                    return (
                                      <Option key={col.value} value={col.value}>
                                        {col.label}
                                      </Option>
                                    );
                                  })}
                              </Select>
                            )}
                          </Input.Group>
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem>
                          {getFieldDecorator('sms', {
                            rules: [
                              {
                                required: true,
                                message: 'Please enter SMS Count.',
                              },
                            ],
                          })(
                            <InputNumber
                              placeholder="SMS Count"
                              style={{ width: '50%' }}
                              min={1}
                              max={100000}
                            />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                      <Col span={8}>
                        <FormItem help={myValidateHelp} validateStatus={myValidateStatus}>
                          <Input.Group compact>
                            {getFieldDecorator('data', {
                              rules: [
                                {
                                  required: true,
                                  message: 'Please enter on data amount.',
                                },
                              ],
                            })(
                              <InputNumber
                                min={1}
                                max={100000}
                                style={{ width: '60%' }}
                                placeholder="On Data amount"
                              />
                            )}
                            {getFieldDecorator('dataType', {
                              initialValue: 'MB',
                              rules: [
                                {
                                  required: true,
                                  message: 'Please enter data type.',
                                },
                              ],
                            })(
                              <Select style={{ width: '40%' }}>
                                {sizeList &&
                                  sizeList.map(col => {
                                    return (
                                      <Option key={col.value} value={col.value}>
                                        {col.label}
                                      </Option>
                                    );
                                  })}
                              </Select>
                            )}
                          </Input.Group>
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem help={myValidateHelp} validateStatus={myValidateStatus}>
                          {/* https://github.com/ant-design/ant-design/issues/5790 */}
                          <Input.Group compact>
                            {getFieldDecorator('validPeriod', {
                              rules: [
                                {
                                  required: true,
                                  message: 'Please enter valid period.',
                                },
                              ],
                            })(
                              <InputNumber
                                min={1}
                                max={100000}
                                style={{ width: '60%' }}
                                placeholder="Valid Period"
                              />
                            )}
                            {getFieldDecorator('validPeriodType', {
                              initialValue: 'H',
                              rules: [
                                {
                                  required: true,
                                  message: 'Please enter valid period type.',
                                },
                              ],
                            })(
                              <Select style={{ width: '40%' }}>
                                {timeList &&
                                  timeList.map(col => {
                                    return (
                                      <Option key={col.value} value={col.value}>
                                        {col.label}
                                      </Option>
                                    );
                                  })}
                              </Select>
                            )}
                          </Input.Group>
                        </FormItem>
                      </Col>
                      <Col span={4}>
                        <FormItem>
                          {getFieldDecorator('price', {
                            rules: [
                              {
                                required: true,
                                message: 'Please enter the price.',
                              },
                            ],
                          })(
                            <InputNumber
                              style={{ width: '100%' }}
                              placeholder="Price"
                              min={1}
                              max={100000}
                            />
                          )}
                        </FormItem>
                      </Col>
                      <Col span={4}>
                        <FormItem>
                          {getFieldDecorator('active', {
                            valuePropName: 'checked',
                            initialValue: true,
                          })(
                            <Switch
                              checkedChildren="Active"
                              unCheckedChildren="Inactive"
                              style={{ width: '120px' }}
                            />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24} order={4}>
                        {/* <Button type="primary" className="float-right" onClick={this.submit}>
                            {isUpdate ? 'Update' : 'Create'}
                          </Button>
                          {isUpdate && (
                            <Button
                              type=""
                              className="float-right mr-1"
                              onClick={this.clearFormValues}
                            >
                              Cancel
                            </Button>
                          )} */}
                        <Button type="primary" className="float-right" onClick={this.submit}>
                          Create
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Spin>
              </div>
            </div>
          </div>
          <div key="2">
            <div className="box box-default">
              <div className="box-body">
                <article className="article mt-2">
                  <Table dataSource={mockPackList} scroll={{ x: 1500, y: 400 }}>
                    <Column title="Package Name" dataIndex="name" key="name" />
                    <Column title="Package Code" dataIndex="code" key="code" />
                    <Column title="Package Description" dataIndex="description" key="description" />
                    <Column title="On Network time" dataIndex="onNet" key="onNet" />
                    <Column
                      title="On Network Type"
                      key="onNetType"
                      render={(text, record) => STATUS.PACKAGE_TIME[record.onNetType].label}
                    />
                    <Column title="Off Network time" dataIndex="offNet" key="offNet" />
                    <Column
                      title="Off Network Type"
                      key="offNetType"
                      render={(text, record) => STATUS.PACKAGE_TIME[record.offNetType].label}
                    />
                    <Column title="SMS" dataIndex="sms" key="sms" />
                    <Column title="Data" dataIndex="data" key="data" />
                    <Column
                      title="Data Type"
                      key="dataType"
                      render={(text, record) => STATUS.PACKAGE_SIZE[record.dataType].label}
                    />
                    <Column title="Price" dataIndex="price" key="price" />
                    <Column title="Valid Period" dataIndex="validPeriod" key="validPeriod" />
                    <Column
                      title="Valid Period Type"
                      key="validPeriodType"
                      render={(text, record) => STATUS.PACKAGE_TIME[record.validPeriodType].label}
                    />
                    <Column
                      title="Status"
                      key="active"
                      render={record => (
                        <Tag color={STATUS.PACKAGE_STATUS[record.active].color}>
                          {STATUS.PACKAGE_STATUS[record.active].label}
                        </Tag>
                      )}
                    />
                    {/* <Column
                      title="Action"
                      key="action"
                      render={(text, record) => (
                        <span>
                          {record.status !== null && (
                            <Tooltip
                              title={STATUS.COMMON_STATUS_ACTIVE_INACTIVE[!record.status].label}
                              className="mr-3"
                            >
                              <Icon
                                onClick={() => this.handleStatus(record.id)}
                                type={record.status ? 'close-circle-o' : 'check-circle-o'}
                              />
                            </Tooltip>
                          )}
                          <Tooltip title="Edit" className="mr-3">
                            <Icon onClick={() => this.checkFormStatus(record)} type="edit" />
                          </Tooltip>
                          <Tooltip title="View Details" className="mr-3">
                            <Icon onClick={() => this.toggleModal(record)} type="menu-unfold" />
                          </Tooltip>
                        </span>
                      )}
                    /> */}
                  </Table>
                </article>
              </div>
            </div>
          </div>
        </QueueAnim>

        {visible && currentRecord !== undefined && (
          <Modal
            title="Version Details"
            visible={this.state.visible}
            footer={null}
            onCancel={() => this.toggleModal(undefined)}
            width="400px"
          >
            <div>
              <div className="mb-2">
                <span>
                  <strong>Version No :</strong>{' '}
                </span>
                <span>{currentRecord.versionNo}</span>
              </div>
              <div className="mb-2">
                <span>
                  <strong>Version Name :</strong>{' '}
                </span>
                <span>{currentRecord.versionName}</span>
              </div>
              <div className="mb-2">
                <span>
                  <strong>Status :</strong>{' '}
                </span>
                <span>{STATUS.COMMON_STATUS_ACTIVE_INACTIVE[currentRecord.status].label}</span>
              </div>
              <div className="mb-2">
                <span>
                  <strong>Release Date :</strong>{' '}
                </span>
                <span>{moment(currentRecord.releaseDate).format('MMMM Do YYYY, h:mm:ss a')}</span>
              </div>
              <div className="mb-2">
                <span>
                  <strong>URL :</strong>{' '}
                </span>
                <span>{currentRecord.ftpPath}</span>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }
}

const WrappedData = Form.create()(Data);

const PackageManagement = () => <WrappedData />;

export default PackageManagement;
