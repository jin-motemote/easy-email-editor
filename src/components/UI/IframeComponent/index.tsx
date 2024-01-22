import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface Props
  extends React.DetailedHTMLProps<
  React.IframeHTMLAttributes<HTMLIFrameElement>,
  HTMLIFrameElement
  > {
  children: React.ReactNode;
  title?: string;
  windowRef?: (e: Window) => void;
}

export const IframeComponent = ({ children, title, windowRef, ...props }: Props) => {
  const [mountNode, setMountNode] = useState(null);

  const onLoad: React.ReactEventHandler<HTMLIFrameElement> = (evt) => {
    const contentWindow = (evt.target as any)?.contentWindow;
    if (!contentWindow) return;
    windowRef?.(contentWindow);
    const innerBody = contentWindow.document.body;
    innerBody.style.backgroundColor = 'transparent';
    setMountNode(innerBody);
  };

  return (
    <iframe
      title={title}
      srcDoc={
        '<!doctype html><div></div>'
      }
      {...(props as any)}
      onLoad={onLoad}
    >
      {mountNode && createPortal(children, mountNode)}
    </iframe>
  );
};
