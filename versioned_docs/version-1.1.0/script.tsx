import React from 'react';

export default function Script(props: JSX.IntrinsicElements["script"]) {
    React.useEffect(() => {
        const script = document.createElement("script");
        script.src = props.src;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        }
    }, [props.src]);

    return null;
}
