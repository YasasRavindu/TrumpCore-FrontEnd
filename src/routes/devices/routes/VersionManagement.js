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
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

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
import moment from 'moment';
import Password from 'antd/lib/input/Password';
import getErrorMessage from 'constants/notification/message';
import STATUS from 'constants/notification/status';

const FormItem = Form.Item;
const { Option } = Select;
const { Column, ColumnGroup } = Table;

function truncate(str) {
  return str !== undefined && str !== '' && str.length > 25 ? str.substring(0, 25) + '...' : str;
}

class Data extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      deviceVersionList: [],
      visible: false,
      currentRecord: undefined,
      selectedFile: '',
      loaderForm: false,
      fileUploadError: null,
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    this.loadTable();
  }

  loadTable = () => {
    axios
      .get(environment.baseUrl + 'versionManagement/all')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const deviceVersionList = response.data.content.filter(version => {
          version.key = version.id;
          return version;
        });
        this._isMounted &&
          this.setState({
            deviceVersionList: deviceVersionList,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  handleStatus = id => {
    axios
      .put(environment.baseUrl + 'versionManagement/' + id)
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        message.success('Device Version Status Successfully Changed.');
        this.loadTable();
      })
      .catch(error => {
        this.showErrorMsg(error);
        console.log('------------------- error - ', error);
      });
  };

  toggleModal = record => {
    if (record) {
      this._isMounted &&
        this.setState({
          currentRecord: record,
          visible: true,
        });
    } else {
      this._isMounted &&
        this.setState({
          visible: false,
          currentRecord: undefined,
        });
    }
  };

  handleFileUpload = info => {
    console.log(info);

    if (
      info.file.size > 0 &&
      info.file.name
        .split('.')
        .pop()
        .toLowerCase() === 'apk'
    ) {
      this._isMounted &&
        this.setState({
          selectedFile: info.file,
          fileUploadError: null,
        });
    } else {
      message.error('Invalid file format, file upload allow only .apk !');
    }
  };

  handleFileRemove = () => {
    this.setState({ selectedFile: '' });
  };

  submit = e => {
    e.preventDefault();

    if (this.state.selectedFile !== '') {
      this._isMounted &&
        this.setState({
          fileUploadError: null,
        });
    } else {
      this._isMounted &&
        this.setState({
          fileUploadError: 'Please upload version file.',
        });
    }

    this.props.form.validateFields(['versionNo', 'versionName'], (err, values) => {
      if (!err) {
        if (this.state.selectedFile !== '') {
          this._isMounted &&
            this.setState({
              loaderForm: true,
            });

          let formData = new FormData();
          formData.append('versionNo', values.versionNo);
          formData.append('versionName', values.versionName);
          formData.append('file', this.state.selectedFile);

          axios
            .post(environment.baseUrl + 'versionManagement', formData)
            .then(response => {
              message.success('Device Version Successfully Created.');
              console.log('------------------- response - ', response);
              this.loadTable();
              this._isMounted &&
                this.setState({
                  selectedFile: '',
                  loaderForm: false,
                });
              this.props.form.resetFields();
            })
            .catch(error => {
              this.showErrorMsg(error);
              this._isMounted &&
                this.setState({
                  loaderForm: false,
                });
              console.log('------------------- error - ', error);
            });
        }
      }
    });
  };

  showErrorMsg = error => {
    message.error(getErrorMessage(error, 'DEVICE_VERSION_MANAGEMENT_ERROR'));
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    // -------------- GET ACTIVE AUTHORITIES -----------------------------------------
    const viewAuthorities = getActiveAuthorities(USER_AUTHORITY_CODE.POS_DEVICE_VERSION_MANAGEMENT);
    // -------------------------------------------------------------------------------

    // -------------- IF UNAUTHORIZED ------------------------------------------------
    if (viewAuthorities === 'UNAUTHORIZED') {
      return <Redirect to={DEFAULT_EXCEPTION_ROUTE} />;
    }
    // -------------------------------------------------------------------------------

    const { getFieldDecorator } = this.props.form;
    const { visible, deviceVersionList, currentRecord, selectedFile, fileUploadError } = this.state;

    const uploadButton = (
      <Button
        // type="primary"
        // shape="round"
        icon="upload"
        className="float-right ml-1"
      >
        Upload
      </Button>
    );

    const fileNameTag = (
      <Tag closable onClose={() => this.handleFileRemove()} className="p-1">
        {truncate(selectedFile.name)}
      </Tag>
    );

    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          {checkAuthority(viewAuthorities, USER_AUTHORITY_CODE.USER_MANAGEMENT_USERS_CREATE) && (
            <div key="1">
              <div className="box box-default mb-4">
                <div className="box-header">Device Version Management</div>
                <div className="box-body">
                  <Spin spinning={this.state.loaderForm}>
                    <Form>
                      <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                        <Col span={6}>
                          <FormItem>
                            {getFieldDecorator('versionNo', {
                              rules: [
                                {
                                  required: true,
                                  message: 'Please enter version No',
                                },
                              ],
                            })(<Input placeholder="Version No" />)}
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          <FormItem>
                            {getFieldDecorator('versionName', {
                              rules: [
                                {
                                  required: true,
                                  message: 'Please enter version name.',
                                },
                                ,
                              ],
                            })(<Input placeholder="Version Name" />)}
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          <FormItem>
                            <Upload
                              multiple={false}
                              // listType="text"
                              showUploadList={false}
                              beforeUpload={() => false}
                              onChange={this.handleFileUpload}
                            >
                              {selectedFile === '' ? uploadButton : fileNameTag}
                            </Upload>

                            {fileUploadError && (
                              <h5 className="fileUploadError">{fileUploadError}</h5>
                            )}
                          </FormItem>
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
                  </Spin>
                </div>
              </div>
            </div>
          )}
          <div key="2">
            <div className="box box-default">
              <div className="box-body">
                <article className="article mt-2">
                  <Table dataSource={deviceVersionList}>
                    <Column title="Version No" dataIndex="versionNo" key="versionNo" />
                    <Column title="Version Name" dataIndex="versionName" key="versionName" />
                    <Column
                      title="Status"
                      dataIndex="status"
                      key="status"
                      render={status => (
                        <Tag color={STATUS.COMMON_STATUS_ACTIVE_INACTIVE[status].color}>
                          {STATUS.COMMON_STATUS_ACTIVE_INACTIVE[status].label}
                        </Tag>
                      )}
                    />
                    <Column
                      title="Release Date"
                      dataIndex="releaseDate"
                      key="releaseDate"
                      render={releaseDate => moment(releaseDate).format('MMMM Do YYYY, h:mm:ss a')}
                    />
                    <Column
                      title="Action"
                      key="action"
                      render={(text, record) => (
                        <span>
                          {record.status !== null && (
                            // checkAuthority(
                            //   viewAuthorities,
                            //   USER_AUTHORITY_CODE.USER_MANAGEMENT_USERS_INACTIVE
                            // ) && (
                            <Tooltip
                              title={STATUS.COMMON_STATUS_ACTIVE_INACTIVE[!record.status].label}
                              className="mr-3"
                            >
                              <Icon
                                onClick={() => this.handleStatus(record.id)}
                                type={record.status ? 'close-circle-o' : 'check-circle-o'}
                              />
                            </Tooltip>
                          )
                          // )
                          }

                          <Tooltip title="View Details" className="mr-3">
                            <Icon onClick={() => this.toggleModal(record)} type="menu-unfold" />
                          </Tooltip>
                        </span>
                      )}
                    />
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

const VersionManagement = () => <WrappedData />;

export default VersionManagement;
