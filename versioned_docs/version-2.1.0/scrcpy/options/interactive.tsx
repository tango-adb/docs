import React from "react";

interface Version {
    name: string;
    features: string[];
}

const VERSIONS: Version[] = [
    {
        name: "v1.15",
        features: [
            "clipboard",
            "serialize",
            "setListDisplays",
            "parseDisplay",
            "parseVideoStreamMetadata",
            "parseDeviceMessage",
            "createMediaStreamTransformer",
            "serializeInjectTouchControlMessage",
            "serializeBackOrScreenOnControlMessage",
            "serializeSetClipboardControlMessage",
            "createScrollController",
        ],
    },
    {
        name: "v1.17",
        features: ["setListEncoders", "parseEncoder"],
    },
    {
        name: "v1.18",
        features: ["parseEncoder", "serializeBackOrScreenOnControlMessage"],
    },
    {
        name: "v1.21",
        features: ["serialize", "serializeSetClipboardControlMessage"],
    },
    {
        name: "v1.22",
        features: ["parseVideoStreamMetadata", "createScrollController"],
    },
    {
        name: "v1.23",
        features: ["createMediaStreamTransformer"],
    },
    {
        name: "v1.25",
        features: ["createScrollController"],
    },
    {
        name: "v2.0",
        features: [
            "setListEncoders",
            "setListDisplays",
            "parseEncoder",
            "parseDisplay",
            "parseVideoStreamMetadata",
            "parseAudioStreamMetadata",
            "serializeInjectTouchControlMessage",
        ],
    },
    {
        name: "v2.1",
        features: ["parseDeviceMessage"],
    },
    {
        name: "v2.2",
        features: ["parseDisplay"],
    },
    {
        name: "v2.3",
        features: ["parseAudioStreamMetadata"],
    },
];

const ALL_FEATURES: string[] = [];
const FEATURE_ADDED = new Map<string, number>();
for (let i = 0; i < VERSIONS.length; i += 1) {
    for (let j = 0; j < VERSIONS[i].features.length; j++) {
        if (FEATURE_ADDED.has(VERSIONS[i].features[j])) {
            continue;
        }
        ALL_FEATURES.push(VERSIONS[i].features[j]);
        FEATURE_ADDED.set(VERSIONS[i].features[j], i);
    }
}

function buildFeatures(
    index: number,
    features: string[],
    overriddenFeatures: Set<string>,
    enableDim: boolean,
    enableOverride: boolean
) {
    let prevFeatureIndex = -1;
    const result = new Array<React.ReactNode>(ALL_FEATURES.length);

    features = features.slice();
    features.sort((a, b) => ALL_FEATURES.indexOf(a) - ALL_FEATURES.indexOf(b));

    for (const feature of features) {
        const featureIndex = ALL_FEATURES.indexOf(feature);

        let dim: boolean;
        if (enableOverride) {
            dim = overriddenFeatures.has(feature);
            if (!dim) {
                overriddenFeatures.add(feature);
            }
        } else {
            dim = enableDim;
        }

        for (let i = prevFeatureIndex + 1; i < featureIndex; i += 1) {
            result.push(
                <div
                    style={{
                        padding: "8px 0",
                        position: "relative",
                        fontSize: "0.9em",
                        fontFamily: "monospace",
                        color: "transparent",
                        userSelect: "none",
                    }}
                >
                    A
                    {overriddenFeatures.has(ALL_FEATURES[i]) && (
                        <div
                            style={{
                                position: "absolute",
                                left: -20,
                                right: -20,
                                top: "50%",
                                borderTop: "1px solid #999",
                            }}
                        />
                    )}
                </div>
            );
        }
        prevFeatureIndex = featureIndex;

        result.push(
            <div
                style={{
                    position: "relative",
                    padding: "8px 0",
                    display: "flex",
                    fontSize: "0.9em",
                    fontFamily: "monospace",
                    color: dim ? "#999" : "var(--ifm-font-color-base)",
                }}
            >
                {feature}
                {enableOverride && dim && (
                    <div
                        style={{
                            position: "absolute",
                            left: -4,
                            right: -20,
                            top: "50%",
                            borderTop: "1px solid #999",
                        }}
                    />
                )}
            </div>
        );
    }

    for (let i = prevFeatureIndex + 1; i < ALL_FEATURES.length; i += 1) {
        result.push(
            <div
                style={{
                    padding: "8px 0",
                    position: "relative",
                    fontSize: "0.9em",
                    fontFamily: "monospace",
                    color: "transparent",
                    userSelect: "none",
                }}
            >
                A
                {overriddenFeatures.has(ALL_FEATURES[i]) &&
                    FEATURE_ADDED.get(ALL_FEATURES[i]) < index && (
                        <div
                            style={{
                                position: "absolute",
                                left: -20,
                                right: -20,
                                top: "50%",
                                borderTop: "1px solid #999",
                            }}
                        />
                    )}
            </div>
        );
    }

    return result;
}

function buildVersions(hover: number, setHover: (value: number) => void) {
    const result = new Array<React.ReactNode>(VERSIONS.length);
    const overriddenFeatures = new Set<string>();

    for (let i = VERSIONS.length - 1; i >= 0; i--) {
        const version = VERSIONS[i];
        result[i] = (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid var(--ifm-font-color-base)",
                    borderLeft: "none",
                }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(-1)}
            >
                <div
                    style={{
                        padding: "12px",
                        borderBottom: "1px solid var(--ifm-font-color-base)",
                    }}
                >
                    {version.name}
                </div>

                <div
                    style={{
                        padding: "12px",
                    }}
                >
                    {buildFeatures(
                        i,
                        version.features,
                        overriddenFeatures,
                        hover !== -1,
                        i <= hover
                    )}
                </div>
            </div>
        );
    }
    return result;
}

export default function Interactive() {
    const [hover, setHover] = React.useState(-1);
    const [fullScreen, setFullScreen] = React.useState(false);

    return (
        <div
            style={{
                overflow: "auto",
                backgroundColor: "var(--ifm-background-color)",
                ...(fullScreen
                    ? {
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 300,
                    }
                    : {}),
            }}
        >
            <button onClick={() => setFullScreen((value) => !value)}>
                Toggle Size
            </button>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    borderLeft: "1px solid var(--ifm-font-color-base)",
                }}
            >
                {buildVersions(hover, setHover)}
            </div>
        </div>
    );
}
