import step1 from "../image/step1.png";
import step2 from "../image/step2.png";
import step3 from "../image/step3.png";
import step4 from "../image/step4.png";
import step5 from "../image/step5.png";

export const navItems = [
  { label: "step1", value: "1. Navigate to diagnosis page", img: step1 },
  { label: "step2", value: "2. Upload applicable images", img: step2 },
  { label: "step3", value: "3. Run the diagnosis", img: step3 },
  { label: "step4", value: "4. Check the results and options", img: step4 },
  { label: "step5", value: "5. Browse through saved results", img: step5 },
];

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