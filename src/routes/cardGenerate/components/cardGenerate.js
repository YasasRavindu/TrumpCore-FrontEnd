import React from 'react';
import Create from './create';
import CardTable from './cardTable';
import QueueAnim from 'rc-queue-anim';

const cardGenerate = () => (
  <div className="container-fluid no-breadcrumb container-mw-xl chapter">
    <QueueAnim type="bottom" className="ui-animate">
      <div key="1">
        <Create />
      </div>
      <div key="2">
        <CardTable />
      </div>
    </QueueAnim>
  </div>
);

export default cardGenerate;
