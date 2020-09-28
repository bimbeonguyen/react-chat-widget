import React from 'react';
import moment from 'moment';

import { Link } from 'src/store/types';

import './styles.scss';

type Props = {
  message: Link;
  showTimeStamp: boolean;
}

function Snippet({ message, showTimeStamp }: Props) {
  return (
    <div>
      <div className="rcw-snippet">
        <h5 className="rcw-snippet-title">{message.title}</h5>
        <div className="rcw-snippet-details">
          <a href={message.link} target={message.target} className="rcw-link">
            {message.link}
          </a>
        </div>
      </div>
      {showTimeStamp && <span className="rcw-timestamp">{moment(message.timestamp).format('LT')}</span>}
    </div>
  );
}

export default Snippet;
