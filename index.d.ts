// Type definitions for react-chat-widget v3.0.0
// Project: <https://github.com/Wolox/react-chat-widget>
// Definitions by: Martín Callegari <https://github.com/mcallegari10>

import { ElementType } from 'react';

declare module '@bimbeo160/react-scroll-to-bottom';
declare const Widget: ElementType;

export function addUserMessage(text: string): void;
export function addUserMessage(text: string, id: string): void;
export function addUserMessage(text: string, id: string, time: Date): void;

export function addResponseMessage(text: string): void;
export function addResponseMessage(text: string, id: string): void;
export function addResponseMessage(text: string, id: string, time: Date): void;

export function addLinkSnippet(link: { link: string, title: string, target?: string }): void;
export function addLinkSnippet(link: { link: string, title: string, target?: string }, id: string): void;
export function addLinkSnippet(link: { link: string, title: string, target?: string }, id: string, time: Date): void;

export function addOldUserMessage(text: string): void;
export function addOldUserMessage(text: string, id: string): void;
export function addOldUserMessage(text: string, id: string, time: Date): void;

export function addOldResponseMessage(text: string): void;
export function addOldResponseMessage(text: string, id: string): void;
export function addOldResponseMessage(text: string, id: string, time: Date): void;

export function addOldLinkSnippet(link: { link: string, title: string, target?: string }): void;
export function addOldLinkSnippet(link: { link: string, title: string, target?: string }, id: string): void;
export function addOldLinkSnippet(link: { link: string, title: string, target?: string }, id: string, time: Date): void;

export function renderCustomComponent(component: ElementType, props: any): void;
export function renderCustomComponent(component: ElementType, props: any, showAvatar: boolean): void;
export function renderCustomComponent(component: ElementType, props: any, showAvatar: boolean, id: string): void;

export function toggleMsgLoader(): void;
export function toggleWidget(): void;
export function toggleInputDisabled(): void;
export function dropMessages(): void;
export function isWidgetOpened(): boolean;
export function setQuickButtons(buttons: Array<{ label: string, value: string | number }>): void;

export function deleteMessages(count: number): void;
export function deleteMessages(count: number, id: string): void;

export function markAllAsRead(): void;
export function setBadgeCount(count: number): void;

export as namespace ReactChatWidget;
