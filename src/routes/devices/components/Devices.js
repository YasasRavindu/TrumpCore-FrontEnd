import React from 'react';
import QueueAnim from 'rc-queue-anim';
import Data from './Data';

const Devices = () => {
  return (
    <div className="container-fluid no-breadcrumb container-mw-xl chapter">
      <QueueAnim type="bottom" className="ui-animate">
        <div key="1">
          <Data />
        </div>
      </QueueAnim>
    </div>
  );
};

export default Devices;
