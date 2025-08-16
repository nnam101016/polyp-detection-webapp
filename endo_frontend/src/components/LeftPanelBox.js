const navItems = [
    { label: "step1", value: "1. Navigate to diagnosis page" },
    { label: "step2", value: "2. Upload applicable images" },
    { label: "step3", value: "3. Run the diagnosis" },
    { label: "step4", value: "4. Check the results and options" },
    {label: "step5", value: "5. Browse through saved results"},
];
// TODO: add pictures above the text
function LeftPanelBox({ onSelect, selected }) {
    return (
        <div className="bg-select-yellow shadow-md rounded-lg p-6 flex flex-col">
            <ul className="flex flex-col gap-4">
                {navItems.map((item) => (
                    <li key={item.value}>
                        <button
                            className={`w-full text-left px-4 py-2 rounded transition 
                                ${selected === item.label ? "bg-egypt-blue text-white" : "text-egypt-blue hover:bg-egypt-blue/10"}`}
                            onClick={() => onSelect(item.label)}
                        >
                            {item.value}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default LeftPanelBox;