import React from "react";

export default function Version(props: {
    since?: string;
    until?: string;
    children: React.ReactNode;
}) {
    const isBlock = React.Children.toArray(props.children).some(
        (child) =>
            React.isValidElement(child) &&
            ["h1", "h2", "h3", "h4", "h5", "h6", "p", "div"].includes(
                child.type as string,
            ),
    );

    return (
        <span
            style={{
                display: isBlock ? "flex" : "inline",
                padding: isBlock ? '4px 8px' : '0 2px 4px 2px',
                alignItems: 'center',
                border: "1px solid var(--ifm-color-emphasis-300)",
                backgroundColor: "var(var(--prism-background-color))",
                borderRadius: 4,
            }}
        >

            {isBlock ? <div style={{ flexGrow: 1 }}>{props.children}</div> : props.children}

            <span
                style={{
                    fontSize: "0.8em",
                    marginLeft: 4,
                    color: "var(--ifm-breadcrumb-color-active)",
                }}
            >
                (
                {props.since && props.until
                    ? `between ${props.since} and ${props.until}`
                    : props.since
                        ? `since ${props.since}`
                        : props.until
                            ? `until ${props.until}`
                            : ""}
                )
            </span>
        </span>
    );
}
