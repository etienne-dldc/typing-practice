import React from "react";

type Props = {
  content: React.ReactNode;
};

export function Layout({ content }: Props) {
  return (
    <div className="Layout">
      <h1 className="Layout--title">Typing Practice</h1>
      <div style={{ height: "1rem" }} />
      {content}
    </div>
  );
}
