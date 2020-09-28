import React, { useEffect } from 'react';
import moment from 'moment';
import markdownIt from 'markdown-it';
import markdownItSup from 'markdown-it-sup';
import markdownItSanitizer from 'markdown-it-sanitizer';
import markdownItClass from '@toycode/markdown-it-class';
import markdownItLinkAttributes from 'markdown-it-link-attributes';
import ReactTooltip from 'react-tooltip';

import { Message } from 'src/store/types';

import './styles.scss';
import { calendarStringsMessage, MESSAGE_SENDER } from '../../../../../../../../constants';

type Props = {
  message: Message;
  showTimeStamp: boolean;
  startsSequence: boolean;
  endsSequence: boolean;
}

function Message({ message, showTimeStamp, startsSequence, endsSequence }: Props) {
  const sanitizedHTML = markdownIt()
    .use(markdownItClass, {
      img: ['rcw-message-img']
    })
    .use(markdownItSup)
    .use(markdownItSanitizer)
    .use(markdownItLinkAttributes, { attrs: { target: '_blank', rel: 'noopener' } })
    .render(message.text);

  useEffect(() => {
    ReactTooltip.rebuild();
  }, []);
  return (
    <div className={`rcw-${message.sender} ${startsSequence ? 'start' : ''} ${endsSequence ? 'end' : ''}`}>
      {showTimeStamp && <span className="rcw-timestamp">{moment(message.timestamp).calendar(calendarStringsMessage)}</span>}
      <div className="rcw-message-text-wrapper">
        <div
          className="rcw-message-text"
          dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          data-tip={moment(message.timestamp).calendar(calendarStringsMessage)}
          data-place={message.sender === MESSAGE_SENDER.CLIENT ? 'right' : 'left'}
          data-for="global"
        />
      </div>
    </div>
  );
}

export default Message;
