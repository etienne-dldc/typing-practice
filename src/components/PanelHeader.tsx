import React from "react";
import { CaretLeft, CaretRight } from "phosphor-react";
import { useLayoutInfos } from "src/libs/panels";

type Props = {
  title: React.ReactNode;
};

export function PanelHeader({ title }: Props): JSX.Element | null {
  const layoutInfos = useLayoutInfos();

  const onBack = layoutInfos?.showParent ?? null;
  const onNext = layoutInfos?.showChildren ?? null;

  const hasSides = Boolean(onBack || onNext);

  return (
    <div className="flex flex-row items-center rounded-md">
      {hasSides && (
        <div className="w-6 h-6 flex items-center justify-center">
          {onBack && (
            <button
              onClick={onBack}
              className="border-0 flex items-center justify-center w-6 h-6 p-0"
            >
              <CaretLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
      <h2 className="flex-1 text-lg text-center">{title}</h2>
      {hasSides && (
        <div className="w-6 h-6 flex items-center justify-center">
          {onNext && (
            <button
              onClick={onNext}
              className="border-0 flex items-center justify-center w-6 h-6 p-0"
            >
              <CaretRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
