import Script from "./script";

export default function CanIUse(props: { feature: string }) {
    return (
        <>
            <p
                className="ciu-embed"
                data-feature={props.feature}
                data-periods="future_1,current,past_1,past_2"
                data-accessible-colours="true"
            />

            <Script src="https://caniuse-embed.vercel.app/embed.js" />
        </>
    );
}
