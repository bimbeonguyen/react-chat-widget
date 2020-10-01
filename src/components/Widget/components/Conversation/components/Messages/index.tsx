import React, { useEffect, useState, useCallback, useContext, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { usePrevious } from 'react-use';
import moment from 'moment';
import { Composer, Panel, useScrollTo, useAtTop, useAtBottom, useScrollToBottom, useScrollHeight, useScrollTarget } from '@bimbeo160/react-scroll-to-bottom';
import { Message, Link, CustomCompMessage, GlobalState } from '../../../../../../store/types';
import { setBadgeCount, markAllMessagesRead } from '@actions';

import Loader from './components/Loader';
import './styles.scss';
import { AnyFunction } from '../../../../../../utils/types';
import { MESSAGE_SENDER } from '../../../../../../constants';
import ReactTooltip from 'react-tooltip';

type Props = {
  showTimeStamp: boolean,
  profileAvatar?: string;
  loadMoreMessages?: AnyFunction;
  LoadingIcon?: React.ElementType;
}

type MessageListProps = {
  messages: any,
  profileAvatar?: string;
}

const MessageList = memo((props: MessageListProps) => {
  const { messages, profileAvatar } = props;
  // here we handle what happens when user scrolls to Load More div
  // in this case we just update page variable
  const getComponentToRender = (message: Message | Link | CustomCompMessage, index: number) => {
    const ComponentToRender = message.component;
    let showTime = true;
    let prevBySameAuthor = false;
    let nextBySameAuthor = false;
    let startsSequence = true;
    let endsSequence = true;

    if (messages[index - 1]) {
      const previousMoment = moment(messages[index - 1].timestamp);
      const previousDuration = moment.duration(moment(message.timestamp).diff(previousMoment));
      prevBySameAuthor = messages[index - 1].sender === message.sender;

      if (prevBySameAuthor && previousDuration.as('hours') < 1) {
        startsSequence = false;
      }
      if (previousDuration.as('hour') < 1) {
        showTime = false;
      }
    }
    if (messages[index + 1]) {
      const nextMoment = moment(messages[index + 1].timestamp);
      const nextDuration = moment.duration(moment(message.timestamp).diff(nextMoment));
      nextBySameAuthor = messages[index + 1].sender === message.sender;

      if (nextBySameAuthor && nextDuration.as('hours') < 1) {
        endsSequence = false;
      }
    }

    if (message.type === 'component') {
      return <ComponentToRender {...message.props} />;
    }
    return (
      <ComponentToRender
        message={message}
        showTimeStamp={showTime}
        startsSequence={startsSequence}
        endsSequence={endsSequence}
      />
    );
  };

  return messages?.map((message, index) =>
    <div className="rcw-message" key={message.customId} id={message.customId}>
      {profileAvatar &&
      message.showAvatar &&
      <img src={profileAvatar} className="rcw-avatar" alt="profile" />
      }
      {getComponentToRender(message, index)}
    </div>
  )
})

const Content = (props: Props) => {
  const dispatch = useDispatch();
  const { messages, typing, showChat, badgeCount } = useSelector((state: GlobalState) => ({
    messages: state.messages.messages,
    badgeCount: state.messages.badgeCount,
    typing: state.behavior.messageLoader,
    showChat: state.behavior.showChat
  }));
  const { LoadingIcon, profileAvatar, loadMoreMessages } = props;
  const [scrollHeight] = useScrollHeight();
  const [target] = useScrollTarget();
  const [atBottom] = useAtBottom();
  const [atTop] = useAtTop();
  const scrollTo = useScrollTo();
  const scrollToBottom = useScrollToBottom();
  const prevMessages = usePrevious<(Message | Link | CustomCompMessage)[]>(messages);
  const onBottom = () => {
    if (showChat && badgeCount) {
      dispatch(markAllMessagesRead());
    }
  };

  useEffect(() => {
    const handleAtBottom = () => {
      scrollToBottom({ behavior: 'smooth' });
      if (showChat && badgeCount) {
        dispatch(markAllMessagesRead());
      } else dispatch(setBadgeCount(messages.filter((message) => message.unread).length));
    };

    if (messages?.length !== prevMessages?.length) {
      const latestMessage = messages[messages?.length - 1];
      const prevLatestMessage = (prevMessages || [])[(prevMessages || []).length - 1];
      const initialPrevMessage = (prevMessages || [])[0];

      if (initialPrevMessage && latestMessage?.customId === prevLatestMessage?.customId && (target.scrollHeight !== scrollHeight)) {
        scrollTo(target.scrollHeight - scrollHeight, { behavior: 'auto' });
      } else if (latestMessage?.customId !== prevLatestMessage?.customId && (latestMessage?.sender === MESSAGE_SENDER.CLIENT || !prevMessages?.length)) {
        handleAtBottom();
      }
    } else if (atBottom) {
      handleAtBottom();
    }
  }, [messages, badgeCount, showChat]);
  useEffect(() => {
    if (atTop && loadMoreMessages) {
      loadMoreMessages();
    }
  }, [atTop]);
  useEffect(() => {
    if (atBottom) {
      onBottom();
    }
  }, [atBottom]);

  return (
    <>
      {LoadingIcon && (
        <div>
          <LoadingIcon />
        </div>
      )}
      <MessageList messages={messages} profileAvatar={profileAvatar} />
      <ReactTooltip id="global" />
      <Loader typing={typing} />
    </>
  );
};

function Messages({ profileAvatar, showTimeStamp, loadMoreMessages, LoadingIcon }: Props) {
  return (
    <Composer>
      <Panel className="rcw-messages-container">
        <Content
          LoadingIcon={LoadingIcon}
          profileAvatar={profileAvatar}
          showTimeStamp={showTimeStamp}
          loadMoreMessages={loadMoreMessages}
        />
      </Panel>
    </Composer>
  );
}

export default Messages;
