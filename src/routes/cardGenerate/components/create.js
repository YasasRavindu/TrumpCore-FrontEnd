import React from 'react';
import { Input, Form, Col, InputNumber, Select, Button, Row } from 'antd';
import { environment, commonUrl } from '../../../environments';
import axios from 'axios';
const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

class CardGenerator extends React.Component {
  state = { count: '', type: '', effectivePeriod: '' };
  submit = e => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState(
          {
            count: values.count,
            type: values.type,
            effectivePeriod: values.effectivePeriod,
          },
          () => {
            // console.info('success', this.state);
            axios
              .post(environment.baseUrl + 'card/batch/generate', {
                count: this.state.count,
                type: this.state.type,
                effectivePeriod: this.state.effectivePeriod,
              })
              .then(response => {
                console.log('------------------- response - ', response);
                return response;
              })
              .catch(error => {
                console.log('------------------- error - ', error);
                return error;
              });
          }
        );
      }
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="box box-default mb-4">
        <div className="box-header">Generate Card Numbers</div>
        <div className="box-body">
          <Form>
            <Row gutter={24}>
              <Col span={6} order={4}>
                <FormItem {...formItemLayout} label="Card Count">
                  {getFieldDecorator('count', {
                    rules: [
                      {
                        type: 'integer',
                        required: true,
                        message: 'Please input your card count',
                      },
                    ],
                  })(<InputNumber min={1} />)}
                </FormItem>
              </Col>
              <Col span={6} order={4}>
                <FormItem {...formItemLayout} label="Card Type">
                  {getFieldDecorator('type', {
                    rules: [
                      {
                        required: true,
                        message: 'Please input your card type',
                      },
                    ],
                  })(
                    <Select style={{ width: 120 }}>
                      <Option value="CASH">Cash</Option>
                      <Option value="DEBIT">Debit</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={11} order={4}>
                <FormItem {...formItemLayout} label="Effective Period (Months)">
                  {getFieldDecorator('effectivePeriod', {
                    rules: [
                      {
                        required: true,
                        message: 'Please input months',
                      },
                    ],
                  })(<InputNumber min={1} />)}
                </FormItem>
              </Col>
              <Col span={1} order={4}>
                <Button type="primary" className="float-right" onClick={this.submit}>
                  Submit
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    );
  }
}

const create = Form.create()(CardGenerator);

export default create;