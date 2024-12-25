import React from "react";

const QuestionContext = React.createContext<number>(1);

export interface AnswerProps {
    content: React.ReactNode;
    children?: React.FunctionComponentElement<QuestionProps> | React.ReactNode;
}

export function Answer(props: AnswerProps) {
    void props;
    return null;
}

export interface QuestionProps {
    content: React.ReactNode;
    children: React.FunctionComponentElement<AnswerProps>[];
}

export function Question(props: QuestionProps) {
    const index = React.useContext(QuestionContext);

    const [value, setValue] = React.useState<string | undefined>();

    const next = React.useMemo(
        () => value !== undefined && props.children[value as never as number],
        [props.children, value]
    );

    return (
        <>
            <div style={{ fontWeight: "bold", fontSize: '1.4em' }}>
                {index}. {props.content}
            </div>

            <div
                style={{
                    marginTop: "8px",
                    display: "flex",
                    flexDirection: "column",
                    rowGap: "8px",
                }}
            >
                <RadioGroup value={value} onChange={setValue}>
                    {props.children.map((answer, index) => (
                        <RadioItem value={index.toString()}>
                            {answer.props.content}
                        </RadioItem>
                    ))}
                </RadioGroup>
            </div>

            {next && (
                <QuestionContext.Provider key={value} value={index + 1}>
                    <div style={{ marginTop: '20px' }} />

                    {next.props.children}
                </QuestionContext.Provider>
            )}
        </>
    );
}

const RadioGroupContext = React.createContext<{
    name: string;
    value: string;
    onChange: (value: string) => void;
}>(undefined);

let id = 0;

function RadioGroup<T extends string>(props: {
    value: T;
    onChange: (value: T) => void;
    children: React.ReactNode;
}) {
    const name = React.useRef<string>();
    React.useEffect(() => {
        name.current = `radio-group-${id}`;
        id += 1;
    }, []);

    return (
        <RadioGroupContext.Provider
            value={{
                name: name.current,
                value: props.value,
                onChange: props.onChange,
            }}
        >
            {props.children}
        </RadioGroupContext.Provider>
    );
}

function RadioItem(props: {
    value: string | undefined;
    children: React.ReactNode;
}) {
    const context = React.useContext(RadioGroupContext);
    if (!context) {
        throw new Error("No RadioGroup");
    }

    return (
        <label
            style={{
                display: "flex",
                flexDirection: "row",
                columnGap: "4px",
                alignItems: "center",
            }}
        >
            <input
                type="radio"
                name={context.name}
                value={props.value}
                checked={props.value === context.value}
                onChange={() => context.onChange(props.value)}
            />
            {props.children}
        </label>
    );
}
