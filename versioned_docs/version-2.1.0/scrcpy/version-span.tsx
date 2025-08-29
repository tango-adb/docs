import React from "react";

export default function Version(props: {
    since?: string;
    until?: string;
    children: React.ReactNode
}) {
    return (
        <span
            style={{
                border: "1px solid var(--ifm-color-emphasis-300)",
                backgroundColor: "var(var(--prism-background-color))",
                borderRadius: 4,
                paddingTop: 0,
                paddingBottom: 4,
                paddingLeft: 2,
                paddingRight: 4,
            }}
        >
            {props.children}

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
