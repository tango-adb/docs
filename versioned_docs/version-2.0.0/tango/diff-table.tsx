export default function DiffTable(props: {
    leftHeader: string;
    rightHeader: string;
    children: React.ReactNode;
}) {
    return (
        <table style={{ display: "table", width: "100%", tableLayout: "fixed" }}>
            <thead>
                <tr>
                    <td>{props.leftHeader}</td>
                    <td>{props.rightHeader}</td>
                </tr>
            </thead>
            <tbody>
                <tr>{props.children}</tr>
            </tbody>
        </table>
    );
}
