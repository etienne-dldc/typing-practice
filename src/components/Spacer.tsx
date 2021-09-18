import React, { memo } from "react";

type Props = {
  vertical?: number;
  horizontal?: number;
};

export const Spacer = memo<Props>(({ horizontal, vertical }) => {
  const style: React.CSSProperties = { flexShrink: 0 };
  if (horizontal) {
    style.width = horizontal;
  }
  if (vertical) {
    style.height = vertical;
  }
  return <div style={style} />;
});
