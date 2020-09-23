import React, { useEffect, useRef, useState, useCallback, RefObject } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import format from 'date-fns/format';
import { usePrevious, useScrolling } from 'react-use';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import { useInView } from 'react-intersection-observer';
import { scrollToBottom } from '../../../../../../utils/messages';
import { Message, Link, CustomCompMessage, GlobalState } from '../../../../../../store/types';
import { setBadgeCount, markAllMessagesRead } from '@actions';

import Loader from './components/Loader';
import './styles.scss';
import { AnyFunction } from '../../../../../../utils/types';
import { MESSAGE_SENDER } from '../../../../../../constants';

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
  const prevMessages = usePrevious(messages);
  // tracking on which page we currently are
  const [atBottom, setAtBottom] = useState(true);
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
  const getComponentToRender = (message: Message | Link | CustomCompMessage) => {
    const ComponentToRender = message.component;
    if (message.type === 'component') {
      return <ComponentToRender {...message.props} />;
    }
    return <ComponentToRender message={message} showTimeStamp={showTimeStamp} />;
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

    if ((messages || []).length !== (prevMessages || []).length) {
      const latestMessage = messages[(messages || []).length - 1];

      if (latestMessage && latestMessage.sender === MESSAGE_SENDER.CLIENT) {
        handleAtBottom();
      }
    } else if (atBottom) {
      handleAtBottom();
    }
  }, [messages, badgeCount, showChat]);
  useEffect(() => {
    console.log('here');
    if (scrolling && atBottom) {
      setAtBottom(false);
    }
  }, [prevScrolling]);
  useEffect(() => {
    if (inView && !atBottom && loadMoreMessages) {
      loadMoreMessages();
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
        <div className="rcw-message" key={`${index}-${format(message.timestamp, 'hh:mm')}`}>
          {profileAvatar &&
            message.showAvatar &&
            <img src={profileAvatar} className="rcw-avatar" alt="profile" />
          }
          {getComponentToRender(message)}
        </div>
      )}
      <Loader typing={typing} />
    </div>
  );
}

export default Messages;
