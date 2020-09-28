import React, { useEffect, useRef, useState, useCallback, RefObject } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { usePrevious, useScrolling } from 'react-use';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import { useInView } from 'react-intersection-observer';
import moment from 'moment';
import { useObserveScrollPosition, useAtTop, useAtBottom, Panel, Composer } from 'react-scroll-to-bottom';
import { scrollToBottom } from '../../../../../../utils/messages';
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

function Messages({ profileAvatar, showTimeStamp, loadMoreMessages, LoadingIcon }: Props) {
  const dispatch = useDispatch();
  const { messages, typing, showChat, badgeCount } = useSelector((state: GlobalState) => ({
    messages: state.messages.messages,
    badgeCount: state.messages.badgeCount,
    typing: state.behavior.messageLoader,
    showChat: state.behavior.showChat
  }));
  const prevMessages = usePrevious<(Message | Link | CustomCompMessage)[]>(messages);
  // tracking on which page we currently are
  const [atBottom, setAtBottom] = useState(true);
  const [scrollHeight, setScrollHeight] = useState(0);
  const loadingRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const [inViewRef, inView] = useInView({
    rootMargin: "0px",
    threshold: 1.0
  });
  const onBottom = () => {
    setAtBottom(true);
    if (showChat && badgeCount) {
      dispatch(markAllMessagesRead());
    }
  };
  const containerRef = useBottomScrollListener(onBottom) as RefObject<HTMLDivElement>;
  const scrolling = useScrolling(containerRef);
  const prevScrolling = usePrevious(scrolling);
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
  // Use `useCallback` so we don't recreate the function on each render - Could result in infinite loop
  const setRefs = useCallback(
    (node) => {
      // Ref's from useRef needs to have the node assigned to `current`
      loadingRef.current = node;
      // Callback refs, like the one from `useInView`, is a function that takes the node as an argument
      inViewRef(node);
    },
    [inViewRef],
  );
  // TODO: Fix this function or change to move the avatar to last message from response
  // const shouldRenderAvatar = (message: Message, index: number) => {
  //   const previousMessage = messages[index - 1];
  //   if (message.showAvatar && previousMessage.showAvatar) {
  //     dispatch(hideAvatar(index));
  //   }
  // }

  useEffect(() => {
    const handleAtBottom = () => {
      scrollToBottom(containerRef.current);
      if (showChat && badgeCount) {
        dispatch(markAllMessagesRead());
      } else dispatch(setBadgeCount(messages.filter((message) => message.unread).length));
    };

    if (messages?.length !== prevMessages?.length) {
      const latestMessage = messages[messages?.length - 1];
      const prevLatestMessage = (prevMessages || [])[(prevMessages || []).length - 1];
      const initialPrevMessage = (prevMessages || [])[0];

      if (initialPrevMessage && latestMessage?.customId === prevLatestMessage?.customId) {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: containerRef.current.scrollHeight - scrollHeight,
            behavior: 'auto'
          });
        }
      } else if (latestMessage?.customId !== prevLatestMessage?.customId && (latestMessage?.sender === MESSAGE_SENDER.CLIENT || !prevMessages?.length)) {
        handleAtBottom();
      }
    } else if (atBottom) {
      handleAtBottom();
    }
  }, [messages, badgeCount, showChat]);
  useEffect(() => {
    if (scrolling && atBottom) {
      setAtBottom(false);
    }
  }, [prevScrolling]);
  useEffect(() => {
    if (inView && !atBottom && loadMoreMessages) {
      loadMoreMessages();

      if (containerRef.current) {
        setScrollHeight(containerRef.current.scrollHeight);
      }
    }
  }, [inView]);

  return (
    <div id="messages" className="rcw-messages-container" ref={containerRef}>
      {LoadingIcon && (
        <div ref={setRefs}>
          <LoadingIcon />
        </div>
      )}
      {messages?.map((message, index) =>
        <div className="rcw-message" key={message.customId} id={message.customId}>
          {profileAvatar &&
            message.showAvatar &&
            <img src={profileAvatar} className="rcw-avatar" alt="profile" />
          }
          {getComponentToRender(message, index)}
        </div>
      )}
      <ReactTooltip id="global" />
      <Loader typing={typing} />
    </div>
  );
}

export default Messages;
