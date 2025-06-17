import React from 'react';

export default function Script(props: React.JSX.IntrinsicElements["script"]) {
    React.useEffect(() => {
        const script = document.createElement("script");
        script.crossOrigin = props.crossOrigin;
        script.async = props.async;
        script.src = props.src;
        for (const key of Object.keys(props)) {
            if (key.startsWith('data-')) {
                script.setAttribute(key, props[key]);
            }
        }
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        }
    }, [props.src]);

    return null;
}
