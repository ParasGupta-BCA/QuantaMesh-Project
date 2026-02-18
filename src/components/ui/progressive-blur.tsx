import type { CSSProperties } from "react";

type ProgressiveBlurProps = {
    className?: string;
    backgroundColor?: string;
    position?: "top" | "bottom" | "left" | "right";
    height?: string;
    width?: string;
    blurAmount?: string;
};

const ProgressiveBlur = ({
    className = "",
    backgroundColor = "transparent",
    position = "top",
    height = "150px",
    width = "150px",
    blurAmount = "4px",
}: ProgressiveBlurProps) => {
    const isTop = position === "top";
    const isBottom = position === "bottom";
    const isLeft = position === "left";
    const isRight = position === "right";

    const positionStyles: CSSProperties = {
        position: "absolute",
        ...(isTop && { top: 0, left: 0, right: 0, height }),
        ...(isBottom && { bottom: 0, left: 0, right: 0, height }),
        ...(isLeft && { left: 0, top: 0, bottom: 0, width }),
        ...(isRight && { right: 0, top: 0, bottom: 0, width }),
    };

    const gradientDirection = isTop
        ? "to top"
        : isBottom
            ? "to bottom"
            : isLeft
                ? "to left"
                : "to right";

    const maskDirection = isTop
        ? "to bottom"
        : isBottom
            ? "to top"
            : isLeft
                ? "to right"
                : "to left";

    return (
        <div
            className={`pointer-events-none select-none z-20 ${className}`}
            style={{
                ...positionStyles,
                background: `linear-gradient(${gradientDirection}, transparent, ${backgroundColor})`,
                maskImage: `linear-gradient(${maskDirection}, ${backgroundColor} 50%, transparent)`,
                WebkitMaskImage: `linear-gradient(${maskDirection}, ${backgroundColor} 50%, transparent)`,
                WebkitBackdropFilter: `blur(${blurAmount})`,
                backdropFilter: `blur(${blurAmount})`,
                WebkitUserSelect: "none",
                userSelect: "none",
            }}
        />
    );
};

export { ProgressiveBlur };
export type { ProgressiveBlurProps };
