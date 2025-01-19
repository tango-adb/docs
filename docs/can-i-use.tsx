import Script from "./script";

export default function CanIUse(props: { feature: string }) {
    return (
        <>
            <p
                className="ciu_embed"
                style={{ marginBottom: 0 }}
                data-feature={props.feature}
                data-periods="future_1,current,past_1,past_2"
                data-accessible-colours="true"
            >
                <picture>
                    <source
                        type="image/webp"
                        srcSet={`https://caniuse.bitsofco.de/image/${props.feature}.webp`}
                    />
                    <source
                        type="image/png"
                        srcSet={`https://caniuse.bitsofco.de/image/${props.feature}.png`}
                    />
                    <img
                        src={`https://caniuse.bitsofco.de/image/${props.feature}.jpg`}
                        alt={`Data on support for the ${props.feature} feature across the major browsers from caniuse.com`}
                    />
                </picture>
            </p>

            <Script src="https://cdn.jsdelivr.net/gh/ireade/caniuse-embed@master/public/caniuse-embed.min.js" />
        </>
    );
}
